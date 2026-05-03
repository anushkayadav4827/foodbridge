import jwt from 'jsonwebtoken';
import { query, transaction } from '../database/connection';
import { cacheSet, cacheGet, cacheDelete } from '../cache/redis';
import { sendOTP } from './sms.service';
import logger from '../utils/logger';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '7d';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
const JWT_REFRESH_EXPIRES_IN: string = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

const OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES || '10');
const OTP_MAX_ATTEMPTS = parseInt(process.env.OTP_MAX_ATTEMPTS || '3');
const OTP_LOCKOUT_MINUTES = parseInt(process.env.OTP_LOCKOUT_MINUTES || '10');

interface TokenPayload {
  userId: string;
  phoneNumber: string;
  roles: string[];
}

export class AuthService {
  /**
   * Generate and send OTP to phone number
   */
  static async sendOTP(phoneNumber: string, countryCode: string = '+91'): Promise<void> {
    const fullPhone = `${countryCode}${phoneNumber}`;
    
    logger.info(`🔵 [AUTH SERVICE] Generating OTP for ${fullPhone}`);
    
    // Check if phone is locked out
    const lockoutKey = `otp:lockout:${fullPhone}`;
    const isLockedOut = await cacheGet(lockoutKey);
    
    if (isLockedOut) {
      logger.warn(`⚠️ [AUTH SERVICE] Phone ${fullPhone} is locked out`);
      throw new Error('Too many attempts. Please try again later.');
    }
    
    // Generate 6-digit OTP (use fixed OTP in development for testing)
    const otpCode = process.env.NODE_ENV === 'development' 
      ? '123456' 
      : Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
    
    logger.info(`🔑 [AUTH SERVICE] OTP generated:`, {
      fullPhone,
      otpCode,
      expiresAt: expiresAt.toISOString(),
      isDevelopment: process.env.NODE_ENV === 'development',
    });
    
    // Store OTP in database
    try {
      await query(
        `INSERT INTO otp_verifications (phone_number, otp_code, expires_at)
         VALUES ($1, $2, $3)`,
        [fullPhone, otpCode, expiresAt]
      );
      logger.info(`✅ [AUTH SERVICE] OTP stored in database for ${fullPhone}`);
    } catch (dbError) {
      logger.error(`❌ [AUTH SERVICE] Failed to store OTP in database:`, dbError);
      throw new Error('Failed to store OTP');
    }
    
    // Cache OTP for quick verification
    try {
      await cacheSet(`otp:${fullPhone}`, {
        code: otpCode,
        attempts: 0,
        expiresAt: expiresAt.toISOString(),
      }, OTP_EXPIRY_MINUTES * 60);
      logger.info(`✅ [AUTH SERVICE] OTP cached in Redis for ${fullPhone}`);
    } catch (cacheError) {
      logger.warn(`⚠️ [AUTH SERVICE] Failed to cache OTP (Redis unavailable):`, cacheError);
    }
    
    // Send OTP via SMS
    try {
      await sendOTP(fullPhone, otpCode);
      logger.info(`✅ [AUTH SERVICE] OTP sent via SMS to ${fullPhone}`);
    } catch (smsError) {
      logger.warn(`⚠️ [AUTH SERVICE] Failed to send SMS (continuing anyway):`, smsError);
    }
    
    logger.info(`✅ [AUTH SERVICE] OTP process completed for ${fullPhone}: ${otpCode}`);
  }
  
  /**
   * Verify OTP and return user or create new user
   */
  static async verifyOTP(
    phoneNumber: string,
    otpCode: string,
    countryCode: string = '+91'
  ): Promise<{ user: any; isNewUser: boolean; token: string; refreshToken: string }> {
    const fullPhone = `${countryCode}${phoneNumber}`;
    const cacheKey = `otp:${fullPhone}`;
    
    logger.info(`🔵 [AUTH SERVICE] Verifying OTP for ${fullPhone}`, {
      phoneNumber,
      otpCode,
      countryCode,
      fullPhone,
      cacheKey,
    });
    
    // Try to get OTP from cache first
    let cachedOTP = await cacheGet<{ code: string; attempts: number; expiresAt: string }>(cacheKey);
    
    logger.info(`🔍 [AUTH SERVICE] Cache lookup result:`, {
      found: !!cachedOTP,
      cachedOTP: cachedOTP ? { ...cachedOTP, code: '***' } : null,
    });
    
    // If not in cache, try database (fallback when Redis is not available)
    if (!cachedOTP) {
      logger.info(`🔍 [AUTH SERVICE] OTP not in cache, checking database...`);
      
      const otpRecords = await query(
        `SELECT * FROM otp_verifications 
         WHERE phone_number = $1 
         AND is_verified = false 
         AND expires_at > NOW()
         ORDER BY created_at DESC 
         LIMIT 1`,
        [fullPhone]
      );
      
      logger.info(`🔍 [AUTH SERVICE] Database lookup result:`, {
        found: otpRecords.length > 0,
        phoneNumber: fullPhone,
        recordCount: otpRecords.length,
      });
      
      if (!otpRecords[0]) {
        logger.error(`❌ [AUTH SERVICE] No valid OTP found in database for ${fullPhone}`);
        throw new Error('OTP expired or not found. Please request a new one.');
      }
      
      const dbOTP = otpRecords[0];
      
      logger.info(`🔍 [AUTH SERVICE] Comparing OTPs:`, {
        provided: otpCode,
        stored: dbOTP.otp_code,
        match: dbOTP.otp_code === otpCode,
      });
      
      // Verify OTP from database
      if (dbOTP.otp_code !== otpCode) {
        logger.error(`❌ [AUTH SERVICE] OTP mismatch for ${fullPhone}`);
        throw new Error('Invalid OTP. Please try again.');
      }
      
      // Mark as verified in database
      await query(
        `UPDATE otp_verifications 
         SET is_verified = true, verified_at = NOW()
         WHERE id = $1`,
        [dbOTP.id]
      );
      
      logger.info(`✅ [AUTH SERVICE] OTP verified from database for ${fullPhone}`);
    } else {
      logger.info(`🔍 [AUTH SERVICE] Verifying OTP from cache...`);
      
      // Verify OTP from cache
      
      // Check expiry
      if (new Date(cachedOTP.expiresAt) < new Date()) {
        await cacheDelete(cacheKey);
        logger.error(`❌ [AUTH SERVICE] OTP expired for ${fullPhone}`);
        throw new Error('OTP has expired. Please request a new one.');
      }
      
      // Check attempts
      if (cachedOTP.attempts >= OTP_MAX_ATTEMPTS) {
        await cacheDelete(cacheKey);
        await cacheSet(`otp:lockout:${fullPhone}`, true, OTP_LOCKOUT_MINUTES * 60);
        logger.error(`❌ [AUTH SERVICE] Max attempts exceeded for ${fullPhone}`);
        throw new Error('Maximum OTP attempts exceeded. Please try again later.');
      }
      
      logger.info(`🔍 [AUTH SERVICE] Comparing OTPs:`, {
        provided: otpCode,
        stored: cachedOTP.code,
        match: cachedOTP.code === otpCode,
        attempts: cachedOTP.attempts,
      });
      
      // Verify OTP
      if (cachedOTP.code !== otpCode) {
        cachedOTP.attempts += 1;
        await cacheSet(cacheKey, cachedOTP, OTP_EXPIRY_MINUTES * 60);
        logger.error(`❌ [AUTH SERVICE] OTP mismatch for ${fullPhone}, attempts: ${cachedOTP.attempts}`);
        throw new Error(`Invalid OTP. ${OTP_MAX_ATTEMPTS - cachedOTP.attempts} attempts remaining.`);
      }
      
      // OTP is valid - clear cache
      await cacheDelete(cacheKey);
      
      // Update OTP verification in database
      await query(
        `UPDATE otp_verifications 
         SET is_verified = true, verified_at = NOW()
         WHERE phone_number = $1 AND otp_code = $2`,
        [fullPhone, otpCode]
      );
      
      logger.info(`✅ [AUTH SERVICE] OTP verified from cache for ${fullPhone}`);
    }
    
    // Check if user exists
    logger.info(`🔍 [AUTH SERVICE] Looking up user with phone ${fullPhone}`);
    
    let users = await query(
      `SELECT * FROM users WHERE phone_number = $1 AND deleted_at IS NULL`,
      [fullPhone]
    );
    
    let user = users[0];
    let isNewUser = false;
    
    if (!user) {
      // Create new user
      isNewUser = true;
      logger.info(`🆕 [AUTH SERVICE] Creating new user for ${fullPhone}`);
      
      const newUsers = await query(
        `INSERT INTO users (phone_number, phone_country_code, is_phone_verified, verification_tier)
         VALUES ($1, $2, true, 'tier0_phone')
         RETURNING *`,
        [fullPhone, countryCode]
      );
      user = newUsers[0];
      
      logger.info(`✅ [AUTH SERVICE] New user created: ${user.id}`);
    } else {
      logger.info(`✅ [AUTH SERVICE] Existing user found: ${user.id}`);
      
      // Update phone verification status
      await query(
        `UPDATE users SET is_phone_verified = true, last_active_at = NOW()
         WHERE id = $1`,
        [user.id]
      );
    }
    
    // Generate tokens
    const token = this.generateToken(user);
    const refreshToken = this.generateRefreshToken(user);
    
    // Cache user session
    await cacheSet(`session:${user.id}`, {
      userId: user.id,
      phoneNumber: user.phone_number,
      roles: user.roles,
    }, 7 * 24 * 60 * 60); // 7 days
    
    logger.info(`✅ [AUTH SERVICE] OTP verification complete for ${fullPhone}`, {
      userId: user.id,
      isNewUser,
    });
    
    return { user, isNewUser, token, refreshToken };
  }
  
  /**
   * Complete user onboarding
   */
  static async completeOnboarding(
    userId: string,
    data: {
      fullName: string;
      role: string;
      profilePhoto?: string;
      donorData?: any;
      receiverData?: any;
      volunteerData?: any;
    }
  ): Promise<any> {
    return await transaction(async (client) => {
      // Update user
      await client.query(
        `UPDATE users 
         SET full_name = $1, 
             profile_photo_url = $2,
             roles = ARRAY[$3]::user_role[],
             active_role = $3::user_role,
             updated_at = NOW()
         WHERE id = $4`,
        [data.fullName, data.profilePhoto || null, data.role, userId]
      );
      
      // Create role-specific profile
      if (data.role === 'donor' && data.donorData) {
        await client.query(
          `INSERT INTO donor_profiles (
            user_id, donor_type, business_name, address, location,
            landmark, floor_number, gate_instructions, typical_food_types,
            donation_schedule
          ) VALUES ($1, $2, $3, $4, ST_SetSRID(ST_MakePoint($5, $6), 4326)::geography, $7, $8, $9, $10, $11)`,
          [
            userId,
            data.donorData.donorType,
            data.donorData.businessName || null,
            data.donorData.address,
            data.donorData.longitude,
            data.donorData.latitude,
            data.donorData.landmark || null,
            data.donorData.floorNumber || null,
            data.donorData.gateInstructions || null,
            data.donorData.typicalFoodTypes || [],
            data.donorData.donationSchedule || null,
          ]
        );
      }
      
      if (data.role === 'receiver' && data.receiverData) {
        await client.query(
          `INSERT INTO receiver_profiles (
            user_id, receiver_type, organization_name, address, location,
            preferred_radius_km, dietary_restrictions, allergen_restrictions,
            preferred_food_types, daily_capacity
          ) VALUES ($1, $2, $3, $4, ST_SetSRID(ST_MakePoint($5, $6), 4326)::geography, $7, $8, $9, $10, $11)`,
          [
            userId,
            data.receiverData.receiverType,
            data.receiverData.organizationName || null,
            data.receiverData.address,
            data.receiverData.longitude,
            data.receiverData.latitude,
            data.receiverData.preferredRadiusKm || 5,
            data.receiverData.dietaryRestrictions || [],
            data.receiverData.allergenRestrictions || [],
            data.receiverData.preferredFoodTypes || [],
            data.receiverData.dailyCapacity || null,
          ]
        );
      }
      
      if (data.role === 'volunteer' && data.volunteerData) {
        await client.query(
          `INSERT INTO volunteer_profiles (
            user_id, vehicle_type, max_delivery_distance_km, availability_schedule
          ) VALUES ($1, $2, $3, $4)`,
          [
            userId,
            data.volunteerData.vehicleType,
            data.volunteerData.maxDeliveryDistanceKm || 10,
            data.volunteerData.availabilitySchedule || null,
          ]
        );
      }
      
      // Get updated user
      const result = await client.query(
        `SELECT * FROM users WHERE id = $1`,
        [userId]
      );
      
      return result.rows[0];
    });
  }
  
  /**
   * Generate JWT access token
   */
  static generateToken(user: any): string {
    const payload: TokenPayload = {
      userId: user.id,
      phoneNumber: user.phone_number,
      roles: user.roles,
    };
    
    return jwt.sign(payload, JWT_SECRET as string, { expiresIn: JWT_EXPIRES_IN } as any);
  }
  
  /**
   * Generate JWT refresh token
   */
  static generateRefreshToken(user: any): string {
    const payload: TokenPayload = {
      userId: user.id,
      phoneNumber: user.phone_number,
      roles: user.roles,
    };
    
    return jwt.sign(payload, JWT_REFRESH_SECRET as string, { expiresIn: JWT_REFRESH_EXPIRES_IN } as any);
  }
  
  /**
   * Verify JWT token
   */
  static verifyToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }
  
  /**
   * Verify refresh token and generate new access token
   */
  static async refreshAccessToken(refreshToken: string): Promise<string> {
    try {
      const payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as TokenPayload;
      
      // Get user from database
      const users = await query(
        `SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL`,
        [payload.userId]
      );
      
      if (!users[0]) {
        throw new Error('User not found');
      }
      
      return this.generateToken(users[0]);
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }
  
  /**
   * Logout user
   */
  static async logout(userId: string): Promise<void> {
    await cacheDelete(`session:${userId}`);
    logger.info(`User logged out: ${userId}`);
  }
}
