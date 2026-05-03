import { query } from '../database/connection';
import { KarmaService, KarmaAction } from './karma.service';
import logger from '../utils/logger';

const GRACE_PERIOD_HOURS = 36;

export class StreakService {
  /**
   * Update user streak after an action
   */
  static async updateStreak(userId: string): Promise<{ currentStreak: number; longestStreak: number; bonusAwarded: boolean }> {
    try {
      // Get user's current streak data
      const result = await query(
        `SELECT current_streak, longest_streak, last_active_date FROM users WHERE id = $1`,
        [userId]
      );

      const user = result[0];
      if (!user) {
        throw new Error('User not found');
      }

      const now = new Date();
      const lastActive = user.last_active_date ? new Date(user.last_active_date) : null;

      let currentStreak = user.current_streak || 0;
      let longestStreak = user.longest_streak || 0;
      let bonusAwarded = false;

      if (!lastActive) {
        // First activity ever
        currentStreak = 1;
      } else {
        const hoursSinceLastActive = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60);
        Math.floor(hoursSinceLastActive / 24);

        // Check if it's a new day
        const lastActiveDay = new Date(lastActive).setHours(0, 0, 0, 0);
        const currentDay = new Date(now).setHours(0, 0, 0, 0);

        if (lastActiveDay === currentDay) {
          // Same day, no streak update needed
          return { currentStreak, longestStreak, bonusAwarded: false };
        }

        if (hoursSinceLastActive <= GRACE_PERIOD_HOURS) {
          // Within grace period, increment streak
          currentStreak += 1;

          // Award bonus for 7-day and 30-day streaks
          if (currentStreak === 7 || currentStreak === 30) {
            await KarmaService.awardPoints(
              userId,
              KarmaAction.STREAK_BONUS,
              `${currentStreak}-day streak bonus`
            );
            bonusAwarded = true;
          }
        } else {
          // Grace period expired, reset streak
          currentStreak = 1;
        }
      }

      // Update longest streak if current is higher
      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
      }

      // Update user record
      await query(
        `UPDATE users 
         SET current_streak = $1, 
             longest_streak = $2, 
             last_active_date = $3 
         WHERE id = $4`,
        [currentStreak, longestStreak, now, userId]
      );

      logger.info(`Updated streak for user ${userId}: ${currentStreak} days`);

      return { currentStreak, longestStreak, bonusAwarded };
    } catch (error) {
      logger.error('Error updating streak:', error);
      throw error;
    }
  }

  /**
   * Get user's streak information
   */
  static async getUserStreak(userId: string): Promise<{
    currentStreak: number;
    longestStreak: number;
    lastActiveDate: Date | null;
    atRisk: boolean;
  }> {
    const result = await query(
      `SELECT current_streak, longest_streak, last_active_date FROM users WHERE id = $1`,
      [userId]
    );

    const user = result[0];
    if (!user) {
      return { currentStreak: 0, longestStreak: 0, lastActiveDate: null, atRisk: false };
    }

    const lastActive = user.last_active_date ? new Date(user.last_active_date) : null;
    let atRisk = false;

    if (lastActive) {
      const hoursSinceLastActive = (new Date().getTime() - lastActive.getTime()) / (1000 * 60 * 60);
      // At risk if 23+ hours since last activity
      atRisk = hoursSinceLastActive >= 23 && hoursSinceLastActive < GRACE_PERIOD_HOURS;
    }

    return {
      currentStreak: user.current_streak || 0,
      longestStreak: user.longest_streak || 0,
      lastActiveDate: lastActive,
      atRisk,
    };
  }

  /**
   * Get users at risk of losing their streak (for notifications)
   */
  static async getUsersAtRisk(): Promise<string[]> {
    const result = await query(
      `SELECT id FROM users 
       WHERE current_streak > 0 
       AND last_active_date IS NOT NULL
       AND last_active_date < NOW() - INTERVAL '23 hours'
       AND last_active_date > NOW() - INTERVAL '${GRACE_PERIOD_HOURS} hours'
       AND deleted_at IS NULL`
    );

    return result.map(r => r.id);
  }
}
