import { db } from '../../database/firebase';
import { FirebaseOTP, CreateFirebaseOTP, DB_PATHS } from '../../types/firebase.types';

export class FirebaseOTPService {
  private otpsRef = db.ref(DB_PATHS.OTPS);
  private OTP_EXPIRY_MINUTES = 10;
  private MAX_ATTEMPTS = 3;

  /**
   * Generate a 6-digit OTP code
   */
  private generateOTPCode(): string {
    // In development, always return 123456
    if (process.env.NODE_ENV === 'development') {
      return '123456';
    }
    
    // In production, generate random 6-digit code
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Store OTP for a phone number
   */
  async storeOTP(phone: string): Promise<string> {
    const code = this.generateOTPCode();
    const now = Date.now();
    const expiresAt = now + (this.OTP_EXPIRY_MINUTES * 60 * 1000);

    const otp: FirebaseOTP = {
      phone,
      code,
      expiresAt,
      attempts: 0,
      createdAt: now
    };

    // Use phone number as key (sanitized)
    const sanitizedPhone = phone.replace(/[^0-9]/g, '');
    await this.otpsRef.child(sanitizedPhone).set(otp);

    return code;
  }

  /**
   * Get OTP for a phone number
   */
  async getOTP(phone: string): Promise<FirebaseOTP | null> {
    const sanitizedPhone = phone.replace(/[^0-9]/g, '');
    const snapshot = await this.otpsRef.child(sanitizedPhone).once('value');
    return snapshot.val();
  }

  /**
   * Verify OTP
   */
  async verifyOTP(phone: string, code: string): Promise<{
    valid: boolean;
    message: string;
  }> {
    const otp = await this.getOTP(phone);

    if (!otp) {
      return {
        valid: false,
        message: 'OTP not found. Please request a new OTP.'
      };
    }

    // Check if OTP has expired
    if (Date.now() > otp.expiresAt) {
      await this.deleteOTP(phone);
      return {
        valid: false,
        message: 'OTP has expired. Please request a new OTP.'
      };
    }

    // Check if max attempts exceeded
    if (otp.attempts >= this.MAX_ATTEMPTS) {
      await this.deleteOTP(phone);
      return {
        valid: false,
        message: 'Maximum verification attempts exceeded. Please request a new OTP.'
      };
    }

    // Verify code
    if (otp.code !== code) {
      // Increment attempts
      await this.incrementAttempts(phone);
      return {
        valid: false,
        message: `Invalid OTP. ${this.MAX_ATTEMPTS - otp.attempts - 1} attempts remaining.`
      };
    }

    // OTP is valid - delete it
    await this.deleteOTP(phone);
    return {
      valid: true,
      message: 'OTP verified successfully.'
    };
  }

  /**
   * Increment verification attempts
   */
  private async incrementAttempts(phone: string): Promise<void> {
    const sanitizedPhone = phone.replace(/[^0-9]/g, '');
    const otp = await this.getOTP(phone);
    
    if (otp) {
      await this.otpsRef.child(sanitizedPhone).update({
        attempts: otp.attempts + 1
      });
    }
  }

  /**
   * Delete OTP
   */
  async deleteOTP(phone: string): Promise<void> {
    const sanitizedPhone = phone.replace(/[^0-9]/g, '');
    await this.otpsRef.child(sanitizedPhone).remove();
  }

  /**
   * Clean up expired OTPs (should be run periodically)
   */
  async cleanupExpiredOTPs(): Promise<number> {
    const snapshot = await this.otpsRef.once('value');
    const now = Date.now();
    let deletedCount = 0;

    const deletePromises: Promise<void>[] = [];

    snapshot.forEach((childSnapshot) => {
      const otp = childSnapshot.val() as FirebaseOTP;
      if (otp.expiresAt < now) {
        deletePromises.push(childSnapshot.ref.remove());
        deletedCount++;
      }
    });

    await Promise.all(deletePromises);
    return deletedCount;
  }

  /**
   * Check if OTP exists and is valid
   */
  async isOTPValid(phone: string): Promise<boolean> {
    const otp = await this.getOTP(phone);
    
    if (!otp) {
      return false;
    }

    if (Date.now() > otp.expiresAt) {
      await this.deleteOTP(phone);
      return false;
    }

    if (otp.attempts >= this.MAX_ATTEMPTS) {
      await this.deleteOTP(phone);
      return false;
    }

    return true;
  }

  /**
   * Get remaining attempts
   */
  async getRemainingAttempts(phone: string): Promise<number> {
    const otp = await this.getOTP(phone);
    
    if (!otp) {
      return 0;
    }

    return Math.max(0, this.MAX_ATTEMPTS - otp.attempts);
  }

  /**
   * Get OTP expiry time
   */
  async getOTPExpiryTime(phone: string): Promise<number | null> {
    const otp = await this.getOTP(phone);
    return otp ? otp.expiresAt : null;
  }
}

// Export singleton instance
export const firebaseOTPService = new FirebaseOTPService();
