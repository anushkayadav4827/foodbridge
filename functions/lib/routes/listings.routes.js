"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin = __importStar(require("firebase-admin"));
const jwt = __importStar(require("jsonwebtoken"));
const router = (0, express_1.Router)();
const db = admin.database();
const JWT_SECRET = process.env.JWT_SECRET || 'foodbridge-secret-key-12345';
// Middleware to verify JWT token
const authMiddleware = (req, res, next) => {
    var _a;
    try {
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
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
            .equalTo(status)
            .limitToLast(Number(limit))
            .once('value');
        const listings = [];
        snapshot.forEach((childSnapshot) => {
            listings.push(childSnapshot.val());
        });
        res.json({
            success: true,
            listings: listings.reverse() // Newest first
        });
    }
    catch (error) {
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
    }
    catch (error) {
        console.error('Error getting listing:', error);
        res.status(500).json({ error: 'Failed to get listing' });
    }
});
/**
 * POST /listings
 * Create a new listing
 */
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { userId } = req.user;
        const listingData = req.body;
        const listingId = db.ref().push().key;
        const now = Date.now();
        const listing = Object.assign(Object.assign({ id: listingId, donorId: userId }, listingData), { status: 'available', createdAt: now, updatedAt: now });
        await db.ref(`listings/${listingId}`).set(listing);
        res.json({
            success: true,
            message: 'Listing created successfully',
            listing
        });
    }
    catch (error) {
        console.error('Error creating listing:', error);
        res.status(500).json({ error: 'Failed to create listing' });
    }
});
/**
 * PATCH /listings/:id
 * Update a listing
 */
router.patch('/:id', authMiddleware, async (req, res) => {
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
        await db.ref(`listings/${id}`).update(Object.assign(Object.assign({}, updates), { updatedAt: Date.now() }));
        res.json({
            success: true,
            message: 'Listing updated successfully'
        });
    }
    catch (error) {
        console.error('Error updating listing:', error);
        res.status(500).json({ error: 'Failed to update listing' });
    }
});
/**
 * DELETE /listings/:id
 * Delete a listing
 */
router.delete('/:id', authMiddleware, async (req, res) => {
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
    }
    catch (error) {
        console.error('Error deleting listing:', error);
        res.status(500).json({ error: 'Failed to delete listing' });
    }
});
/**
 * GET /listings/my/all
 * Get current user's listings
 */
router.get('/my/all', authMiddleware, async (req, res) => {
    try {
        const { userId } = req.user;
        const snapshot = await db.ref('listings')
            .orderByChild('donorId')
            .equalTo(userId)
            .once('value');
        const listings = [];
        snapshot.forEach((childSnapshot) => {
            listings.push(childSnapshot.val());
        });
        res.json({
            success: true,
            listings: listings.reverse()
        });
    }
    catch (error) {
        console.error('Error getting user listings:', error);
        res.status(500).json({ error: 'Failed to get listings' });
    }
});
exports.default = router;
//# sourceMappingURL=listings.routes.js.map