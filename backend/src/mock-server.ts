import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3005;

// Middleware
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// In-memory storage for demo
const otpStore = new Map<string, { code: string; expiresAt: number }>();
const users = new Map<string, any>();
const sessions = new Map<string, any>();

// Generate mock JWT token
function generateMockToken(userId: string): string {
  return `mock-token-${userId}-${Date.now()}`;
}

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    message: 'Mock server running - No database required!',
  });
});

// Send OTP
app.post('/api/v1/auth/send-otp', (req: Request, res: Response): void => {
  const { phoneNumber, countryCode = '+91' } = req.body;
  
  if (!phoneNumber) {
    res.status(400).json({ error: 'Phone number is required' });
    return;
  }

  const fullPhone = `${countryCode}${phoneNumber}`;
  
  // Generate mock OTP (always 123456 for demo)
  const otpCode = '123456';
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  otpStore.set(fullPhone, { code: otpCode, expiresAt });
  
  console.log(`📱 OTP sent to ${fullPhone}: ${otpCode}`);
  
  res.json({
    message: 'OTP sent successfully',
    // In demo mode, we'll show the OTP in the response
    demo: {
      otp: otpCode,
      note: 'In production, this would be sent via SMS',
    },
  });
});

// Verify OTP
app.post('/api/v1/auth/verify-otp', (req: Request, res: Response): void => {
  const { phoneNumber, otpCode, countryCode = '+91' } = req.body;
  
  if (!phoneNumber || !otpCode) {
    res.status(400).json({ error: 'Phone number and OTP are required' });
    return;
  }

  const fullPhone = `${countryCode}${phoneNumber}`;
  const storedOTP = otpStore.get(fullPhone);
  
  if (!storedOTP) {
    res.status(400).json({ error: 'OTP not found. Please request a new one.' });
    return;
  }
  
  if (Date.now() > storedOTP.expiresAt) {
    otpStore.delete(fullPhone);
    res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    return;
  }
  
  if (storedOTP.code !== otpCode) {
    res.status(400).json({ error: 'Invalid OTP. Please try again.' });
    return;
  }
  
  // OTP is valid - clear it
  otpStore.delete(fullPhone);
  
  // Check if user exists
  let user = users.get(fullPhone);
  let isNewUser = false;
  
  if (!user) {
    // Create new user
    isNewUser = true;
    user = {
      id: `user-${Date.now()}`,
      phoneNumber: fullPhone,
      phoneCountryCode: countryCode,
      isPhoneVerified: true,
      fullName: null,
      roles: [],
      activeRole: null,
      createdAt: new Date().toISOString(),
    };
    users.set(fullPhone, user);
    console.log(`✅ New user created: ${user.id}`);
  } else {
    console.log(`✅ Existing user logged in: ${user.id}`);
  }
  
  // Generate tokens
  const token = generateMockToken(user.id);
  const refreshToken = generateMockToken(user.id);
  
  // Store session
  sessions.set(user.id, {
    userId: user.id,
    phoneNumber: user.phoneNumber,
    token,
    refreshToken,
    createdAt: Date.now(),
  });
  
  console.log(`✅ Session created for user: ${user.id}`);
  
  res.json({
    success: true,
    user,
    token,
    refreshToken,
    isNewUser,
    message: isNewUser ? 'Account created successfully' : 'Login successful',
  });
});

// Complete onboarding
app.post('/api/v1/auth/complete-onboarding', (req: Request, res: Response): void => {
  const authHeader = req.headers.authorization;
  
  console.log('📝 POST /api/v1/auth/complete-onboarding');
  console.log('Auth header:', authHeader);
  
  if (!authHeader) {
    console.log('❌ No authorization header');
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  
  const { fullName, role } = req.body;
  console.log(`Completing onboarding for: ${fullName} as ${role}`);
  
  // Find user by token (simplified - in real app, decode JWT)
  const token = authHeader.replace('Bearer ', '');
  let foundUser: any = null;
  
  for (const [_phone, user] of users.entries()) {
    const session = sessions.get(user.id);
    if (session && session.token === token) {
      foundUser = user;
      break;
    }
  }
  
  if (!foundUser) {
    console.log('❌ User not found for token');
    res.status(404).json({ error: 'User not found' });
    return;
  }
  
  // Update user
  foundUser.fullName = fullName;
  foundUser.roles = [role];
  foundUser.activeRole = role;
  foundUser.profilePhotoUrl = req.body.profilePhoto || null;
  foundUser.updatedAt = new Date().toISOString();
  
  console.log(`✅ User onboarding completed: ${foundUser.id} (${foundUser.fullName}) as ${role}`);
  
  res.json({
    success: true,
    user: foundUser,
    message: 'Onboarding completed successfully',
  });
});

// Get current user
app.get('/api/v1/auth/me', (req: Request, res: Response): void => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  
  // Find user by token (simplified)
  let foundUser: any = null;
  for (const [_phone, user] of users.entries()) {
    if (sessions.has(user.id)) {
      foundUser = user;
      break;
    }
  }
  
  if (!foundUser) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  
  res.json({ user: foundUser });
});

// Mock endpoints for other features
app.get('/api/v1/listings', (_req: Request, res: Response) => {
  console.log('📋 GET /api/v1/listings - Fetching listings');
  res.json({
    listings: [],
    total: 0,
    page: 1,
    limit: 10,
  });
});

app.post('/api/v1/listings', (req: Request, res: Response) => {
  console.log('📝 POST /api/v1/listings - Creating listing');
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    console.log('❌ No authorization header');
    res.status(401).json({ error: 'Unauthorized - Please login first' });
    return;
  }
  
  // Find user by token (simplified)
  let foundUser: any = null;
  for (const [_phone, user] of users.entries()) {
    if (sessions.has(user.id)) {
      foundUser = user;
      break;
    }
  }
  
  if (!foundUser) {
    console.log('❌ User not found');
    res.status(401).json({ error: 'User not found - Please login again' });
    return;
  }
  
  const listing = {
    id: `listing-${Date.now()}`,
    donorId: foundUser.id,
    donorName: foundUser.fullName,
    ...req.body,
    status: 'available',
    createdAt: new Date().toISOString(),
  };
  
  console.log(`✅ Listing created: ${listing.id} by ${foundUser.fullName}`);
  
  res.status(201).json({
    success: true,
    message: 'Listing created successfully',
    listing,
  });
});

app.get('/api/v1/notifications', (_req: Request, res: Response) => {
  res.json({
    notifications: [],
    unreadCount: 0,
  });
});

// Catch-all for unimplemented endpoints
app.all('*', (req: Request, res: Response) => {
  res.status(501).json({
    error: 'Not implemented yet',
    endpoint: req.path,
    method: req.method,
  });
});

// Start server
app.listen(PORT, () => {
  console.log('');
  console.log('🎉 ========================================');
  console.log('🚀 FoodBridge Mock Server Started!');
  console.log('🎉 ========================================');
  console.log('');
  console.log(`📍 Server running on: http://localhost:${PORT}`);
  console.log(`🌐 API endpoint: http://localhost:${PORT}/api/v1`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
  console.log('');
  console.log('✨ Features:');
  console.log('   ✅ OTP Authentication (use code: 123456)');
  console.log('   ✅ User Registration & Login');
  console.log('   ✅ No database required!');
  console.log('   ✅ No Redis required!');
  console.log('');
  console.log('📝 Note: This is a mock server for demo purposes.');
  console.log('   All data is stored in memory and will be lost on restart.');
  console.log('');
  console.log('🎯 Ready to accept requests!');
  console.log('========================================');
  console.log('');
});

export default app;
