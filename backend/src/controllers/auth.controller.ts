import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { AuthService } from '../services/auth.service';
import logger from '../utils/logger';

export class AuthController {
  /**
   * Send OTP to phone number
   */
  static async sendOTP(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { phoneNumber, countryCode } = req.body;
      
      logger.info(`🔵 [BACKEND] Send OTP request received:`, {
        phoneNumber,
        countryCode: countryCode || '+91',
        fullPhone: `${countryCode || '+91'}${phoneNumber}`,
      });
      
      await AuthService.sendOTP(phoneNumber, countryCode || '+91');
      
      logger.info(`✅ [BACKEND] OTP sent successfully to ${countryCode || '+91'}${phoneNumber}`);
      
      res.json({
        success: true,
        message: 'OTP sent successfully',
        expiresIn: parseInt(process.env.OTP_EXPIRY_MINUTES || '10'),
      });
    } catch (error: any) {
      logger.error('❌ [BACKEND] Send OTP error:', error);
      res.status(400).json({ error: error.message || 'Failed to send OTP' });
    }
  }
  
  /**
   * Verify OTP and login/register user
   */
  static async verifyOTP(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { phoneNumber, otpCode, countryCode } = req.body;
      
      logger.info(`🔵 [BACKEND] Verify OTP request received:`, {
        phoneNumber,
        otpCode,
        countryCode: countryCode || '+91',
        fullPhone: `${countryCode || '+91'}${phoneNumber}`,
      });
      
      const result = await AuthService.verifyOTP(phoneNumber, otpCode, countryCode || '+91');
      
      logger.info(`✅ [BACKEND] OTP verified successfully for ${countryCode || '+91'}${phoneNumber}`, {
        userId: result.user.id,
        isNewUser: result.isNewUser,
      });
      
      res.json({
        success: true,
        isNewUser: result.isNewUser,
        user: {
          id: result.user.id,
          phoneNumber: result.user.phone_number,
          fullName: result.user.full_name,
          profilePhoto: result.user.profile_photo_url,
          roles: result.user.roles,
          activeRole: result.user.active_role,
          verificationTier: result.user.verification_tier,
        },
        token: result.token,
        refreshToken: result.refreshToken,
        message: result.isNewUser 
          ? 'Account created successfully. Please complete onboarding.' 
          : 'Login successful',
      });
    } catch (error: any) {
      logger.error('❌ [BACKEND] Verify OTP error:', {
        error: error.message,
        phoneNumber: req.body.phoneNumber,
        otpCode: req.body.otpCode,
      });
      res.status(400).json({ error: error.message || 'Failed to verify OTP' });
    }
  }
  
  /**
   * Complete user onboarding
   */
  static async completeOnboarding(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const data = req.body;
      
      const user = await AuthService.completeOnboarding(userId, data);
      
      res.json({
        success: true,
        message: 'Onboarding completed successfully',
        user: {
          id: user.id,
          phoneNumber: user.phone_number,
          fullName: user.full_name,
          profilePhoto: user.profile_photo_url,
          roles: user.roles,
          activeRole: user.active_role,
          verificationTier: user.verification_tier,
        },
      });
    } catch (error: any) {
      logger.error('Complete onboarding error:', error);
      res.status(400).json({ error: error.message || 'Failed to complete onboarding' });
    }
  }
  
  /**
   * Refresh access token
   */
  static async refreshToken(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;
      
      const newAccessToken = await AuthService.refreshAccessToken(refreshToken);
      
      res.json({
        success: true,
        token: newAccessToken,
      });
    } catch (error: any) {
      logger.error('Refresh token error:', error);
      res.status(401).json({ error: error.message || 'Failed to refresh token' });
    }
  }
  
  /**
   * Logout user
   */
  static async logout(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      
      await AuthService.logout(userId);
      
      res.json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error: any) {
      logger.error('Logout error:', error);
      res.status(400).json({ error: error.message || 'Failed to logout' });
    }
  }
  
  /**
   * Get current authenticated user
   */
  static async getCurrentUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = req.user!;
      
      res.json({
        success: true,
        user: {
          id: user.id,
          phoneNumber: user.phone_number,
          email: user.email,
          fullName: user.full_name,
          profilePhoto: user.profile_photo_url,
          roles: user.roles,
          activeRole: user.active_role,
          verificationTier: user.verification_tier,
          preferredLanguage: user.preferred_language,
          trustScore: parseFloat(user.trust_score),
          isSuspended: user.is_suspended,
          createdAt: user.created_at,
          lastActiveAt: user.last_active_at,
        },
      });
    } catch (error: any) {
      logger.error('Get current user error:', error);
      res.status(400).json({ error: error.message || 'Failed to get user' });
    }
  }
}
