import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';

// Import routes
import authRoutes from './routes/auth.routes';
import listingsRoutes from './routes/listings.routes';
import claimsRoutes from './routes/claims.routes';

// Initialize Firebase Admin
admin.initializeApp();

// Create Express app
const app = express();

// Middleware
app.use(cors({ origin: true })); // Allow all origins for Cloud Functions
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'FoodBridge API',
    version: '2.0.0-firebase'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'FoodBridge API - Firebase Cloud Functions',
    version: '2.0.0',
    endpoints: {
      health: '/health',
      auth: '/auth/*',
      listings: '/listings/*',
      claims: '/claims/*'
    }
  });
});

// API routes
app.use('/auth', authRoutes);
app.use('/listings', listingsRoutes);
app.use('/claims', claimsRoutes);

// Export the Express app as a Cloud Function
export const api = functions.https.onRequest(app);

// Scheduled function to auto-reject expired claims (runs every minute)
export const autoRejectExpiredClaims = functions.pubsub
  .schedule('every 1 minutes')
  .onRun(async (context) => {
    const db = admin.database();
    const claimsRef = db.ref('claims');
    
    try {
      const snapshot = await claimsRef
        .orderByChild('status')
        .equalTo('pending')
        .once('value');

      const now = Date.now();
      const timeoutMs = 15 * 60 * 1000; // 15 minutes
      let expiredCount = 0;

      const updates: { [key: string]: any } = {};

      snapshot.forEach((childSnapshot) => {
        const claim = childSnapshot.val();
        const claimAge = now - claim.createdAt;

        if (claimAge > timeoutMs) {
          updates[`${childSnapshot.key}/status`] = 'expired';
          expiredCount++;
        }
      });

      if (Object.keys(updates).length > 0) {
        await claimsRef.update(updates);
      }

      console.log(`Auto-rejected ${expiredCount} expired claims`);
      return null;
    } catch (error) {
      console.error('Error auto-rejecting claims:', error);
      return null;
    }
  });

// Cleanup expired OTPs (runs every 5 minutes)
export const cleanupExpiredOTPs = functions.pubsub
  .schedule('every 5 minutes')
  .onRun(async (context) => {
    const db = admin.database();
    const otpsRef = db.ref('otps');
    
    try {
      const snapshot = await otpsRef.once('value');
      const now = Date.now();
      let deletedCount = 0;

      const deletePromises: Promise<void>[] = [];

      snapshot.forEach((childSnapshot) => {
        const otp = childSnapshot.val();
        if (otp.expiresAt < now) {
          deletePromises.push(childSnapshot.ref.remove());
          deletedCount++;
        }
      });

      await Promise.all(deletePromises);
      console.log(`Cleaned up ${deletedCount} expired OTPs`);
      return null;
    } catch (error) {
      console.error('Error cleaning up OTPs:', error);
      return null;
    }
  });
