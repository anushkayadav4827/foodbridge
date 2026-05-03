import cron from 'node-cron';
import { claimService } from '../services/claim.service';
import logger from '../utils/logger';

/**
 * Auto-reject expired claims cron job
 * Runs every 1 minute to check for claims older than 15 minutes
 * Requirements: US-4.4.1, US-4.4.2, US-4.4.3
 */
export function startAutoRejectClaimsJob(): void {
  // Run every 1 minute
  cron.schedule('* * * * *', async () => {
    try {
      logger.info('Running auto-reject claims job');

      const result = await claimService.autoRejectExpiredClaims();

      if (result.rejectedCount > 0) {
        logger.info('Auto-rejected expired claims', {
          count: result.rejectedCount,
          claimIds: result.rejectedClaimIds,
        });

        // TODO: Send notifications to affected receivers and donors
        // This will be implemented in Task 12 (Notification Service)
      } else {
        logger.debug('No expired claims to auto-reject');
      }
    } catch (error) {
      logger.error('Error in auto-reject claims job:', error);
    }
  });

  logger.info('Auto-reject claims job scheduled (runs every 1 minute)');
}

/**
 * Stop the auto-reject claims job
 * (For testing purposes)
 */
export function stopAutoRejectClaimsJob(): void {
  cron.getTasks().forEach((task) => {
    task.stop();
  });
  logger.info('Auto-reject claims job stopped');
}
