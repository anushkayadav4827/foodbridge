import { query } from '../database/connection';
import { KarmaService, KarmaAction } from './karma.service';
import logger from '../utils/logger';

export class ReferralService {
  /**
   * Generate a unique referral code
   */
  static generateReferralCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude similar looking characters
    let code = 'FB-';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * Create referral code for a user
   */
  static async createReferralCode(userId: string): Promise<string> {
    let code = this.generateReferralCode();
    let attempts = 0;
    const maxAttempts = 10;

    // Ensure uniqueness
    while (attempts < maxAttempts) {
      const existing = await query(
        `SELECT id FROM users WHERE referral_code = $1`,
        [code]
      );

      if (existing.length === 0) {
        // Code is unique, update user
        await query(
          `UPDATE users SET referral_code = $1 WHERE id = $2`,
          [code, userId]
        );
        return code;
      }

      code = this.generateReferralCode();
      attempts++;
    }

    throw new Error('Failed to generate unique referral code');
  }

  /**
   * Apply referral code during signup
   */
  static async applyReferralCode(newUserId: string, referralCode: string): Promise<boolean> {
    try {
      // Find referrer by code
      const referrerResult = await query(
        `SELECT id, phone_number FROM users WHERE referral_code = $1 AND deleted_at IS NULL`,
        [referralCode.toUpperCase()]
      );

      if (referrerResult.length === 0) {
        throw new Error('Invalid referral code');
      }

      const referrer = referrerResult[0];

      // Validate: user cannot refer themselves
      if (referrer.id === newUserId) {
        throw new Error('Cannot refer yourself');
      }

      // Check if new user already has a referrer
      const newUserResult = await query(
        `SELECT referred_by FROM users WHERE id = $1`,
        [newUserId]
      );

      if (newUserResult[0]?.referred_by) {
        throw new Error('User already has a referrer');
      }

      // Link new user to referrer
      await query(
        `UPDATE users SET referred_by = $1 WHERE id = $2`,
        [referrer.id, newUserId]
      );

      logger.info(`User ${newUserId} referred by ${referrer.id} with code ${referralCode}`);

      return true;
    } catch (error) {
      logger.error('Error applying referral code:', error);
      throw error;
    }
  }

  /**
   * Process referral rewards when referee completes first action
   */
  static async processReferralReward(refereeId: string): Promise<void> {
    try {
      // Get referrer
      const result = await query(
        `SELECT referred_by FROM users WHERE id = $1`,
        [refereeId]
      );

      const referrerId = result[0]?.referred_by;
      if (!referrerId) {
        return; // No referrer
      }

      // Check if reward already given
      const rewardCheck = await query(
        `SELECT id FROM karma_transactions 
         WHERE user_id = $1 
         AND transaction_type = $2 
         AND description LIKE $3`,
        [referrerId, KarmaAction.REFERRAL_SUCCESS, `%${refereeId}%`]
      );

      if (rewardCheck.length > 0) {
        return; // Reward already given
      }

      // Award points to referrer
      await KarmaService.awardPoints(
        referrerId,
        KarmaAction.REFERRAL_SUCCESS,
        `Referral reward for user ${refereeId}`
      );

      // Award points to referee
      await KarmaService.awardPoints(
        refereeId,
        KarmaAction.FIRST_TIME_ACTION,
        'Welcome bonus for joining via referral'
      );

      logger.info(`Referral rewards processed: referrer ${referrerId}, referee ${refereeId}`);
    } catch (error) {
      logger.error('Error processing referral reward:', error);
      throw error;
    }
  }

  /**
   * Get user's referral stats
   */
  static async getReferralStats(userId: string): Promise<{
    referralCode: string;
    totalReferrals: number;
    successfulReferrals: number;
    pendingReferrals: number;
  }> {
    // Get referral code
    const userResult = await query(
      `SELECT referral_code FROM users WHERE id = $1`,
      [userId]
    );

    const referralCode = userResult[0]?.referral_code || '';

    // Get total referrals
    const totalResult = await query(
      `SELECT COUNT(*) as count FROM users WHERE referred_by = $1`,
      [userId]
    );

    // Get successful referrals (users who have earned karma)
    const successfulResult = await query(
      `SELECT COUNT(*) as count FROM users WHERE referred_by = $1 AND karma_points > 0`,
      [userId]
    );

    const totalReferrals = parseInt(totalResult[0].count);
    const successfulReferrals = parseInt(successfulResult[0].count);

    return {
      referralCode,
      totalReferrals,
      successfulReferrals,
      pendingReferrals: totalReferrals - successfulReferrals,
    };
  }

  /**
   * Get referral leaderboard
   */
  static async getReferralLeaderboard(limit: number = 100): Promise<any[]> {
    const result = await query(
      `SELECT 
         u.id,
         u.full_name,
         u.profile_photo_url,
         COUNT(r.id) as referral_count,
         RANK() OVER (ORDER BY COUNT(r.id) DESC) as rank
       FROM users u
       LEFT JOIN users r ON r.referred_by = u.id AND r.karma_points > 0
       WHERE u.deleted_at IS NULL
       GROUP BY u.id, u.full_name, u.profile_photo_url
       HAVING COUNT(r.id) > 0
       ORDER BY referral_count DESC
       LIMIT $1`,
      [limit]
    );

    return result;
  }

  /**
   * Detect suspicious referral patterns
   */
  static async detectSuspiciousReferrals(userId: string): Promise<boolean> {
    // Check for multiple referrals from same IP in short time
    // Check for referrals with no activity
    // This is a placeholder for fraud detection logic
    
    const result = await query(
      `SELECT COUNT(*) as count 
       FROM users 
       WHERE referred_by = $1 
       AND created_at > NOW() - INTERVAL '1 hour'`,
      [userId]
    );

    const recentReferrals = parseInt(result[0].count);

    // Flag if more than 5 referrals in 1 hour
    return recentReferrals > 5;
  }
}
