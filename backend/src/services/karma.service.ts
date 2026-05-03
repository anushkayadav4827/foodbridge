import { query } from '../database/connection';
import { cacheGet, cacheSet, cacheDelete } from '../cache/redis';
import logger from '../utils/logger';

export enum KarmaAction {
  CREATE_LISTING = 'create_listing',
  COMPLETE_DONATION = 'complete_donation',
  CLAIM_FOOD = 'claim_food',
  RECEIVE_FOOD = 'receive_food',
  VOLUNTEER_DELIVERY = 'volunteer_delivery',
  SUBMIT_RATING = 'submit_rating',
  URGENT_LISTING = 'urgent_listing',
  FIRST_TIME_ACTION = 'first_time_action',
  REFERRAL_SUCCESS = 'referral_success',
  STREAK_BONUS = 'streak_bonus',
  SOCIAL_SHARE = 'social_share',
}

const KARMA_POINTS: Record<KarmaAction, number> = {
  [KarmaAction.CREATE_LISTING]: 10,
  [KarmaAction.COMPLETE_DONATION]: 20,
  [KarmaAction.CLAIM_FOOD]: 15,
  [KarmaAction.RECEIVE_FOOD]: 15,
  [KarmaAction.VOLUNTEER_DELIVERY]: 25,
  [KarmaAction.SUBMIT_RATING]: 5,
  [KarmaAction.URGENT_LISTING]: 30,
  [KarmaAction.FIRST_TIME_ACTION]: 50,
  [KarmaAction.REFERRAL_SUCCESS]: 100,
  [KarmaAction.STREAK_BONUS]: 20,
  [KarmaAction.SOCIAL_SHARE]: 10,
};

export class KarmaService {
  /**
   * Award karma points to a user
   */
  static async awardPoints(
    userId: string,
    action: KarmaAction,
    description: string,
    relatedId?: string
  ): Promise<number> {
    const points = KARMA_POINTS[action];

    try {
      // Create karma transaction
      await query(
        `INSERT INTO karma_transactions (user_id, transaction_type, points, description, related_listing_id, related_claim_id)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [userId, action, points, description, relatedId, relatedId]
      );

      // Update user's total karma points
      await query(
        `UPDATE users SET karma_points = karma_points + $1 WHERE id = $2`,
        [points, userId]
      );

      // Invalidate cache
      await cacheDelete(`user:karma:${userId}`);

      logger.info(`Awarded ${points} karma points to user ${userId} for ${action}`);

      return points;
    } catch (error) {
      logger.error('Error awarding karma points:', error);
      throw error;
    }
  }

  /**
   * Get user's total karma points
   */
  static async getUserKarma(userId: string): Promise<number> {
    const cacheKey = `user:karma:${userId}`;
    
    // Check cache
    const cached = await cacheGet<number>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    // Get from database
    const result = await query(
      `SELECT karma_points FROM users WHERE id = $1`,
      [userId]
    );

    const karma = result[0]?.karma_points || 0;

    // Cache for 1 hour
    await cacheSet(cacheKey, karma, 3600);

    return karma;
  }

  /**
   * Get user's karma transaction history
   */
  static async getKarmaHistory(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<any[]> {
    const result = await query(
      `SELECT * FROM karma_transactions 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    return result;
  }

  /**
   * Get karma leaderboard
   */
  static async getLeaderboard(
    timeframe: 'weekly' | 'monthly' | 'all_time',
    city?: string,
    role?: string,
    limit: number = 100
  ): Promise<any[]> {
    const cacheKey = `leaderboard:${timeframe}:${city || 'global'}:${role || 'all'}`;
    
    // Check cache (5 minutes TTL)
    const cached = await cacheGet<any[]>(cacheKey);
    if (cached) {
      return cached;
    }

    let timeCondition = '';
    if (timeframe === 'weekly') {
      timeCondition = `AND kt.created_at >= NOW() - INTERVAL '7 days'`;
    } else if (timeframe === 'monthly') {
      timeCondition = `AND kt.created_at >= NOW() - INTERVAL '30 days'`;
    }

    let cityCondition = '';
    if (city) {
      cityCondition = `AND u.city = '${city}'`;
    }

    let roleCondition = '';
    if (role) {
      roleCondition = `AND '${role}' = ANY(u.roles)`;
    }

    const result = await query(
      `SELECT 
         u.id,
         u.full_name,
         u.profile_photo_url,
         u.city,
         SUM(kt.points) as total_points,
         COUNT(kt.id) as transaction_count,
         RANK() OVER (ORDER BY SUM(kt.points) DESC) as rank
       FROM users u
       LEFT JOIN karma_transactions kt ON u.id = kt.user_id
       WHERE u.deleted_at IS NULL 
         AND u.leaderboard_visible = true
         ${timeCondition}
         ${cityCondition}
         ${roleCondition}
       GROUP BY u.id, u.full_name, u.profile_photo_url, u.city
       ORDER BY total_points DESC
       LIMIT $1`,
      [limit]
    );

    // Cache for 5 minutes
    await cacheSet(cacheKey, result, 300);

    return result;
  }

  /**
   * Get user's rank on leaderboard
   */
  static async getUserRank(
    userId: string,
    timeframe: 'weekly' | 'monthly' | 'all_time',
    city?: string,
    role?: string
  ): Promise<{ rank: number; totalPoints: number }> {
    let timeCondition = '';
    if (timeframe === 'weekly') {
      timeCondition = `AND kt.created_at >= NOW() - INTERVAL '7 days'`;
    } else if (timeframe === 'monthly') {
      timeCondition = `AND kt.created_at >= NOW() - INTERVAL '30 days'`;
    }

    let cityCondition = '';
    if (city) {
      cityCondition = `AND u.city = '${city}'`;
    }

    let roleCondition = '';
    if (role) {
      roleCondition = `AND '${role}' = ANY(u.roles)`;
    }

    const result = await query(
      `WITH ranked_users AS (
         SELECT 
           u.id,
           SUM(kt.points) as total_points,
           RANK() OVER (ORDER BY SUM(kt.points) DESC) as rank
         FROM users u
         LEFT JOIN karma_transactions kt ON u.id = kt.user_id
         WHERE u.deleted_at IS NULL 
           ${timeCondition}
           ${cityCondition}
           ${roleCondition}
         GROUP BY u.id
       )
       SELECT rank, total_points FROM ranked_users WHERE id = $1`,
      [userId]
    );

    return result[0] || { rank: 0, totalPoints: 0 };
  }
}
