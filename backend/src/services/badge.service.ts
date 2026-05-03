import { query } from '../database/connection';
import { cacheGet, cacheSet, cacheDelete } from '../cache/redis';
import logger from '../utils/logger';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon_url: string;
  criteria: any;
  tier: 'beginner' | 'intermediate' | 'advanced' | 'special';
  created_at: Date;
}

export class BadgeService {
  /**
   * Initialize default badges
   */
  static async initializeDefaultBadges(): Promise<void> {
    const badges = [
      {
        name: 'First Meal',
        description: 'Complete your first donation or claim',
        tier: 'beginner',
        criteria: { type: 'first_action', count: 1 },
      },
      {
        name: 'Consistent Giver',
        description: 'Complete 10 donations',
        tier: 'beginner',
        criteria: { type: 'donation_count', count: 10 },
      },
      {
        name: 'Community Pillar',
        description: 'Complete 50 donations',
        tier: 'intermediate',
        criteria: { type: 'donation_count', count: 50 },
      },
      {
        name: 'Food Hero',
        description: 'Complete 200 donations',
        tier: 'advanced',
        criteria: { type: 'donation_count', count: 200 },
      },
      {
        name: 'Zero Waste Week',
        description: 'Donate every day for 7 consecutive days',
        tier: 'intermediate',
        criteria: { type: 'streak', days: 7 },
      },
      {
        name: 'Quick Responder',
        description: 'Accept 5 claims within 2 minutes',
        tier: 'intermediate',
        criteria: { type: 'quick_accept', count: 5, seconds: 120 },
      },
      {
        name: 'Weekend Warrior',
        description: 'Complete 10 volunteer deliveries on weekends',
        tier: 'intermediate',
        criteria: { type: 'weekend_delivery', count: 10 },
      },
      {
        name: 'Trusted Neighbour',
        description: 'Maintain 4.8+ rating for 3 months with 20+ ratings',
        tier: 'advanced',
        criteria: { type: 'rating', min_rating: 4.8, months: 3, min_count: 20 },
      },
      {
        name: 'Community Builder',
        description: 'Refer 5 users who complete at least one action',
        tier: 'special',
        criteria: { type: 'referral', count: 5 },
      },
      {
        name: 'Impact Champion',
        description: 'Save 1000 kg of food from waste',
        tier: 'special',
        criteria: { type: 'food_saved', kg: 1000 },
      },
    ];

    for (const badge of badges) {
      try {
        await query(
          `INSERT INTO badges (name, description, icon_url, criteria, tier)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (name) DO NOTHING`,
          [
            badge.name,
            badge.description,
            `/badges/${badge.name.toLowerCase().replace(/\s+/g, '-')}.png`,
            JSON.stringify(badge.criteria),
            badge.tier,
          ]
        );
      } catch (error) {
        logger.error(`Error creating badge ${badge.name}:`, error);
      }
    }

    logger.info('Default badges initialized');
  }

  /**
   * Check and award badges for a user
   */
  static async checkAndAwardBadges(userId: string): Promise<Badge[]> {
    const awardedBadges: Badge[] = [];

    // Get all badges
    const badges = await query(`SELECT * FROM badges`);

    for (const badge of badges) {
      // Check if user already has this badge
      const existing = await query(
        `SELECT id FROM user_badges WHERE user_id = $1 AND badge_id = $2`,
        [userId, badge.id]
      );

      if (existing.length > 0) {
        continue; // Already has this badge
      }

      // Check if user meets criteria
      const meetsCriteria = await this.checkBadgeCriteria(userId, badge.criteria);

      if (meetsCriteria) {
        // Award badge
        await query(
          `INSERT INTO user_badges (user_id, badge_id) VALUES ($1, $2)`,
          [userId, badge.id]
        );

        awardedBadges.push(badge);

        // Invalidate cache
        await cacheDelete(`user:badges:${userId}`);

        logger.info(`Awarded badge "${badge.name}" to user ${userId}`);
      }
    }

    return awardedBadges;
  }

  /**
   * Check if user meets badge criteria
   */
  private static async checkBadgeCriteria(userId: string, criteria: any): Promise<boolean> {
    const { type } = criteria;

    switch (type) {
      case 'first_action':
        return await this.checkFirstAction(userId);

      case 'donation_count':
        return await this.checkDonationCount(userId, criteria.count);

      case 'streak':
        return await this.checkStreak(userId, criteria.days);

      case 'quick_accept':
        return await this.checkQuickAccept(userId, criteria.count, criteria.seconds);

      case 'weekend_delivery':
        return await this.checkWeekendDelivery(userId, criteria.count);

      case 'rating':
        return await this.checkRating(userId, criteria.min_rating, criteria.months, criteria.min_count);

      case 'referral':
        return await this.checkReferral(userId, criteria.count);

      case 'food_saved':
        return await this.checkFoodSaved(userId, criteria.kg);

      default:
        return false;
    }
  }

  private static async checkFirstAction(userId: string): Promise<boolean> {
    const result = await query(
      `SELECT COUNT(*) as count FROM karma_transactions WHERE user_id = $1`,
      [userId]
    );
    return parseInt(result[0].count) >= 1;
  }

  private static async checkDonationCount(userId: string, count: number): Promise<boolean> {
    const result = await query(
      `SELECT COUNT(*) as count FROM food_listings 
       WHERE donor_id = $1 AND status = 'completed'`,
      [userId]
    );
    return parseInt(result[0].count) >= count;
  }

  private static async checkStreak(userId: string, days: number): Promise<boolean> {
    const result = await query(
      `SELECT current_streak FROM users WHERE id = $1`,
      [userId]
    );
    return result[0]?.current_streak >= days;
  }

  private static async checkQuickAccept(userId: string, count: number, seconds: number): Promise<boolean> {
    const result = await query(
      `SELECT COUNT(*) as count FROM claims 
       WHERE receiver_id = $1 
       AND status = 'accepted'
       AND EXTRACT(EPOCH FROM (accepted_at - created_at)) <= $2`,
      [userId, seconds]
    );
    return parseInt(result[0].count) >= count;
  }

  private static async checkWeekendDelivery(userId: string, count: number): Promise<boolean> {
    const result = await query(
      `SELECT COUNT(*) as count FROM claims 
       WHERE volunteer_id = $1 
       AND status = 'completed'
       AND EXTRACT(DOW FROM completed_at) IN (0, 6)`,
      [userId]
    );
    return parseInt(result[0].count) >= count;
  }

  private static async checkRating(
    userId: string,
    minRating: number,
    months: number,
    minCount: number
  ): Promise<boolean> {
    const result = await query(
      `SELECT AVG(rating) as avg_rating, COUNT(*) as count 
       FROM ratings 
       WHERE ratee_id = $1 
       AND created_at >= NOW() - INTERVAL '${months} months'`,
      [userId]
    );
    return result[0]?.avg_rating >= minRating && parseInt(result[0].count) >= minCount;
  }

  private static async checkReferral(userId: string, count: number): Promise<boolean> {
    const result = await query(
      `SELECT COUNT(*) as count FROM users 
       WHERE referred_by = $1 
       AND karma_points > 0`,
      [userId]
    );
    return parseInt(result[0].count) >= count;
  }

  private static async checkFoodSaved(userId: string, kg: number): Promise<boolean> {
    const result = await query(
      `SELECT COALESCE(SUM(quantity_kg), 0) as total_kg FROM food_listings 
       WHERE donor_id = $1 AND status = 'completed'`,
      [userId]
    );
    return parseFloat(result[0].total_kg) >= kg;
  }

  /**
   * Get user's badges
   */
  static async getUserBadges(userId: string): Promise<Badge[]> {
    const cacheKey = `user:badges:${userId}`;
    
    // Check cache
    const cached = await cacheGet<Badge[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const result = await query(
      `SELECT b.*, ub.awarded_at 
       FROM badges b
       JOIN user_badges ub ON b.id = ub.badge_id
       WHERE ub.user_id = $1
       ORDER BY ub.awarded_at DESC`,
      [userId]
    );

    // Cache for 1 hour
    await cacheSet(cacheKey, result, 3600);

    return result;
  }

  /**
   * Get all available badges with user progress
   */
  static async getBadgesWithProgress(userId: string): Promise<any[]> {
    const allBadges = await query(`SELECT * FROM badges ORDER BY tier, name`);
    const userBadges = await this.getUserBadges(userId);
    const userBadgeIds = new Set(userBadges.map(b => b.id));

    return allBadges.map(badge => ({
      ...badge,
      earned: userBadgeIds.has(badge.id),
      earned_at: userBadges.find(b => b.id === badge.id)?.created_at || null,
    }));
  }
}
