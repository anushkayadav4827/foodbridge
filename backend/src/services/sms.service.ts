import twilio from 'twilio';
import logger from '../utils/logger';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

let twilioClient: twilio.Twilio | null = null;

if (accountSid && authToken) {
  twilioClient = twilio(accountSid, authToken);
}

/**
 * Send OTP via SMS
 */
export async function sendOTP(phoneNumber: string, otpCode: string): Promise<void> {
  if (!twilioClient) {
    // In development, log OTP instead of sending
    if (process.env.NODE_ENV === 'development') {
      logger.info(`[DEV MODE] OTP for ${phoneNumber}: ${otpCode}`);
      return;
    }
    throw new Error('Twilio client not configured');
  }
  
  try {
    const message = `Your FoodBridge verification code is: ${otpCode}. Valid for 10 minutes. Do not share this code.`;
    
    await twilioClient.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: phoneNumber,
    });
    
    logger.info(`OTP SMS sent to ${phoneNumber}`);
  } catch (error) {
    logger.error('Failed to send OTP SMS:', error);
    throw new Error('Failed to send OTP. Please try again.');
  }
}

/**
 * Send notification SMS
 */
export async function sendNotificationSMS(
  phoneNumber: string,
  message: string
): Promise<void> {
  if (!twilioClient) {
    if (process.env.NODE_ENV === 'development') {
      logger.info(`[DEV MODE] SMS to ${phoneNumber}: ${message}`);
      return;
    }
    throw new Error('Twilio client not configured');
  }
  
  try {
    await twilioClient.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: phoneNumber,
    });
    
    logger.info(`Notification SMS sent to ${phoneNumber}`);
  } catch (error) {
    logger.error('Failed to send notification SMS:', error);
    // Don't throw - SMS failures shouldn't break the flow
  }
}
