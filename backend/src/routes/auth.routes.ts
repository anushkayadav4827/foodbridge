import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { 
  sendOTPSchema, 
  verifyOTPSchema, 
  completeOnboardingSchema,
  refreshTokenSchema 
} from '../validators/auth.validator';

const router = Router();

// Send OTP
router.post('/send-otp', validateRequest(sendOTPSchema), AuthController.sendOTP);

// Verify OTP and login/register
router.post('/verify-otp', validateRequest(verifyOTPSchema), AuthController.verifyOTP);

// Complete onboarding (after OTP verification)
router.post('/onboarding', authenticate, validateRequest(completeOnboardingSchema), AuthController.completeOnboarding);

// Refresh access token
router.post('/refresh', validateRequest(refreshTokenSchema), AuthController.refreshToken);

// Logout
router.post('/logout', authenticate, AuthController.logout);

// Get current user
router.get('/me', authenticate, AuthController.getCurrentUser);

export default router;
