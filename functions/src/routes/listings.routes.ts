import { Router } from 'express';
import * as admin from 'firebase-admin';
import * as jwt from 'jsonwebtoken';

const router = Router();
const db = admin.database();
const JWT_SECRET = process.env.JWT_SECRET || 'foodbridge-secret-key-12345';

// Middleware to verify JWT token
const authMiddleware = (req: any, res: any, next: any) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded: any = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

/**
 * GET /listings
 * Get all available listings
 */
router.get('/', async (req, res) => {
  try {
    const { status = 'available', limit = 50 } = req.query;

    const snapshot = await db.ref('listings')
      .orderByChild('status')
      .equalTo(status as string)
      .limitToLast(Number(limit))
      .once('value');

    const listings: any[] = [];
    snapshot.forEach((childSnapshot) => {
      listings.push(childSnapshot.val());
    });

    res.json({
      success: true,
      listings: listings.reverse() // Newest first
    });
  } catch (error) {
    console.error('Error getting listings:', error);
    res.status(500).json({ error: 'Failed to get listings' });
  }
});

/**
 * GET /listings/:id
 * Get a single listing
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const snapshot = await db.ref(`listings/${id}`).once('value');
    const listing = snapshot.val();

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    res.json({
      success: true,
      listing
    });
  } catch (error) {
    console.error('Error getting listing:', error);
    res.status(500).json({ error: 'Failed to get listing' });
  }
});

/**
 * POST /listings
 * Create a new listing
 */
router.post('/', authMiddleware, async (req: any, res: any) => {
  try {
    const { userId } = req.user;
    const listingData = req.body;

    const listingId = db.ref().push().key!;
    const now = Date.now();

    const listing = {
      id: listingId,
      donorId: userId,
      ...listingData,
      status: 'available',
      createdAt: now,
      updatedAt: now
    };

    await db.ref(`listings/${listingId}`).set(listing);

    res.json({
      success: true,
      message: 'Listing created successfully',
      listing
    });
  } catch (error) {
    console.error('Error creating listing:', error);
    res.status(500).json({ error: 'Failed to create listing' });
  }
});

/**
 * PATCH /listings/:id
 * Update a listing
 */
router.patch('/:id', authMiddleware, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;
    const updates = req.body;

    // Check if listing exists and belongs to user
    const snapshot = await db.ref(`listings/${id}`).once('value');
    const listing = snapshot.val();

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    if (listing.donorId !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this listing' });
    }

    await db.ref(`listings/${id}`).update({
      ...updates,
      updatedAt: Date.now()
    });

    res.json({
      success: true,
      message: 'Listing updated successfully'
    });
  } catch (error) {
    console.error('Error updating listing:', error);
    res.status(500).json({ error: 'Failed to update listing' });
  }
});

/**
 * DELETE /listings/:id
 * Delete a listing
 */
router.delete('/:id', authMiddleware, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;

    // Check if listing exists and belongs to user
    const snapshot = await db.ref(`listings/${id}`).once('value');
    const listing = snapshot.val();

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    if (listing.donorId !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this listing' });
    }

    await db.ref(`listings/${id}`).remove();

    res.json({
      success: true,
      message: 'Listing deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting listing:', error);
    res.status(500).json({ error: 'Failed to delete listing' });
  }
});

/**
 * GET /listings/my/all
 * Get current user's listings
 */
router.get('/my/all', authMiddleware, async (req: any, res: any) => {
  try {
    const { userId } = req.user;

    const snapshot = await db.ref('listings')
      .orderByChild('donorId')
      .equalTo(userId)
      .once('value');

    const listings: any[] = [];
    snapshot.forEach((childSnapshot) => {
      listings.push(childSnapshot.val());
    });

    res.json({
      success: true,
      listings: listings.reverse()
    });
  } catch (error) {
    console.error('Error getting user listings:', error);
    res.status(500).json({ error: 'Failed to get listings' });
  }
});

export default router;
