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
 * POST /claims
 * Create a new claim
 */
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { userId } = req.user;
        const { listingId, message } = req.body;
        if (!listingId) {
            return res.status(400).json({ error: 'Listing ID is required' });
        }
        // Get listing
        const listingSnapshot = await db.ref(`listings/${listingId}`).once('value');
        const listing = listingSnapshot.val();
        if (!listing) {
            return res.status(404).json({ error: 'Listing not found' });
        }
        if (listing.status !== 'available') {
            return res.status(400).json({ error: 'Listing is not available' });
        }
        if (listing.donorId === userId) {
            return res.status(400).json({ error: 'Cannot claim your own listing' });
        }
        // Check if user already claimed this listing
        const existingClaimsSnapshot = await db.ref('claims')
            .orderByChild('recipientId')
            .equalTo(userId)
            .once('value');
        let alreadyClaimed = false;
        existingClaimsSnapshot.forEach((childSnapshot) => {
            const claim = childSnapshot.val();
            if (claim.listingId === listingId &&
                claim.status !== 'rejected' &&
                claim.status !== 'cancelled') {
                alreadyClaimed = true;
                return true;
            }
        });
        if (alreadyClaimed) {
            return res.status(400).json({ error: 'You have already claimed this listing' });
        }
        // Create claim
        const claimId = db.ref().push().key;
        const now = Date.now();
        const claim = {
            id: claimId,
            listingId,
            recipientId: userId,
            donorId: listing.donorId,
            status: 'pending',
            message: message || '',
            createdAt: now
        };
        await db.ref(`claims/${claimId}`).set(claim);
        // Update listing status
        await db.ref(`listings/${listingId}`).update({
            status: 'claimed',
            updatedAt: now
        });
        res.json({
            success: true,
            message: 'Claim created successfully',
            claim
        });
    }
    catch (error) {
        console.error('Error creating claim:', error);
        res.status(500).json({ error: 'Failed to create claim' });
    }
});
/**
 * GET /claims/:id
 * Get a single claim
 */
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const snapshot = await db.ref(`claims/${id}`).once('value');
        const claim = snapshot.val();
        if (!claim) {
            return res.status(404).json({ error: 'Claim not found' });
        }
        res.json({
            success: true,
            claim
        });
    }
    catch (error) {
        console.error('Error getting claim:', error);
        res.status(500).json({ error: 'Failed to get claim' });
    }
});
/**
 * PATCH /claims/:id/accept
 * Accept a claim
 */
router.patch('/:id/accept', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.user;
        const snapshot = await db.ref(`claims/${id}`).once('value');
        const claim = snapshot.val();
        if (!claim) {
            return res.status(404).json({ error: 'Claim not found' });
        }
        if (claim.donorId !== userId) {
            return res.status(403).json({ error: 'Not authorized to accept this claim' });
        }
        if (claim.status !== 'pending') {
            return res.status(400).json({ error: 'Claim is not pending' });
        }
        // Generate pickup code
        const pickupCode = Math.floor(1000 + Math.random() * 9000).toString();
        await db.ref(`claims/${id}`).update({
            status: 'accepted',
            pickupCode,
            respondedAt: Date.now()
        });
        res.json({
            success: true,
            message: 'Claim accepted successfully',
            pickupCode
        });
    }
    catch (error) {
        console.error('Error accepting claim:', error);
        res.status(500).json({ error: 'Failed to accept claim' });
    }
});
/**
 * PATCH /claims/:id/reject
 * Reject a claim
 */
router.patch('/:id/reject', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.user;
        const snapshot = await db.ref(`claims/${id}`).once('value');
        const claim = snapshot.val();
        if (!claim) {
            return res.status(404).json({ error: 'Claim not found' });
        }
        if (claim.donorId !== userId) {
            return res.status(403).json({ error: 'Not authorized to reject this claim' });
        }
        if (claim.status !== 'pending') {
            return res.status(400).json({ error: 'Claim is not pending' });
        }
        await db.ref(`claims/${id}`).update({
            status: 'rejected',
            respondedAt: Date.now()
        });
        // Update listing back to available
        await db.ref(`listings/${claim.listingId}`).update({
            status: 'available',
            updatedAt: Date.now()
        });
        res.json({
            success: true,
            message: 'Claim rejected successfully'
        });
    }
    catch (error) {
        console.error('Error rejecting claim:', error);
        res.status(500).json({ error: 'Failed to reject claim' });
    }
});
/**
 * PATCH /claims/:id/complete
 * Complete a claim
 */
router.patch('/:id/complete', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.user;
        const snapshot = await db.ref(`claims/${id}`).once('value');
        const claim = snapshot.val();
        if (!claim) {
            return res.status(404).json({ error: 'Claim not found' });
        }
        if (claim.donorId !== userId) {
            return res.status(403).json({ error: 'Not authorized to complete this claim' });
        }
        if (claim.status !== 'accepted') {
            return res.status(400).json({ error: 'Claim is not accepted' });
        }
        await db.ref(`claims/${id}`).update({
            status: 'completed',
            completedAt: Date.now()
        });
        // Update listing to completed
        await db.ref(`listings/${claim.listingId}`).update({
            status: 'completed',
            updatedAt: Date.now()
        });
        res.json({
            success: true,
            message: 'Claim completed successfully'
        });
    }
    catch (error) {
        console.error('Error completing claim:', error);
        res.status(500).json({ error: 'Failed to complete claim' });
    }
});
/**
 * GET /claims/my/all
 * Get current user's claims
 */
router.get('/my/all', authMiddleware, async (req, res) => {
    try {
        const { userId } = req.user;
        const snapshot = await db.ref('claims')
            .orderByChild('recipientId')
            .equalTo(userId)
            .once('value');
        const claims = [];
        snapshot.forEach((childSnapshot) => {
            claims.push(childSnapshot.val());
        });
        res.json({
            success: true,
            claims: claims.reverse()
        });
    }
    catch (error) {
        console.error('Error getting user claims:', error);
        res.status(500).json({ error: 'Failed to get claims' });
    }
});
exports.default = router;
//# sourceMappingURL=claims.routes.js.map