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
// JWT secret (should be in environment variables in production)
const JWT_SECRET = process.env.JWT_SECRET || 'foodbridge-secret-key-12345';
const JWT_EXPIRES_IN = '7d';
/**
 * POST /auth/send-otp
 * Send OTP to phone number
 */
router.post('/send-otp', async (req, res) => {
    try {
        const { phone } = req.body;
        if (!phone) {
            return res.status(400).json({ error: 'Phone number is required' });
        }
        // Generate OTP (always 123456 in development)
        const code = process.env.NODE_ENV === 'production'
            ? Math.floor(100000 + Math.random() * 900000).toString()
            : '123456';
        const now = Date.now();
        const expiresAt = now + (10 * 60 * 1000); // 10 minutes
        // Store OTP in database
        const sanitizedPhone = phone.replace(/[^0-9]/g, '');
        await db.ref(`otps/${sanitizedPhone}`).set({
            phone,
            code,
            expiresAt,
            attempts: 0,
            createdAt: now
        });
        return res.json(Object.assign({ success: true, message: 'OTP sent successfully' }, (process.env.NODE_ENV !== 'production' && { otp: code })));
    }
    catch (error) {
        console.error('Error sending OTP:', error);
        return res.status(500).json({ error: 'Failed to send OTP' });
    }
});
/**
 * POST /auth/verify-otp
 * Verify OTP and login/register user
 */
router.post('/verify-otp', async (req, res) => {
    try {
        const { phone, otp } = req.body;
        if (!phone || !otp) {
            return res.status(400).json({ error: 'Phone and OTP are required' });
        }
        // Get OTP from database
        const sanitizedPhone = phone.replace(/[^0-9]/g, '');
        const otpSnapshot = await db.ref(`otps/${sanitizedPhone}`).once('value');
        const otpData = otpSnapshot.val();
        if (!otpData) {
            return res.status(400).json({ error: 'OTP not found. Please request a new OTP.' });
        }
        // Check if expired
        if (Date.now() > otpData.expiresAt) {
            await db.ref(`otps/${sanitizedPhone}`).remove();
            return res.status(400).json({ error: 'OTP has expired. Please request a new OTP.' });
        }
        // Check attempts
        if (otpData.attempts >= 3) {
            await db.ref(`otps/${sanitizedPhone}`).remove();
            return res.status(400).json({ error: 'Maximum attempts exceeded. Please request a new OTP.' });
        }
        // Verify OTP
        if (otpData.code !== otp) {
            await db.ref(`otps/${sanitizedPhone}`).update({
                attempts: otpData.attempts + 1
            });
            return res.status(400).json({
                error: `Invalid OTP. ${2 - otpData.attempts} attempts remaining.`
            });
        }
        // OTP is valid - delete it
        await db.ref(`otps/${sanitizedPhone}`).remove();
        // Check if user exists
        const usersSnapshot = await db.ref('users')
            .orderByChild('phone')
            .equalTo(phone)
            .once('value');
        let user = null;
        let userId = '';
        if (usersSnapshot.exists()) {
            // User exists - get first match
            usersSnapshot.forEach((childSnapshot) => {
                user = childSnapshot.val();
                userId = childSnapshot.key;
                return true;
            });
            // Update last active
            await db.ref(`users/${userId}`).update({
                lastActiveAt: Date.now()
            });
        }
        else {
            // Create new user
            userId = db.ref().push().key;
            const now = Date.now();
            user = {
                id: userId,
                phone,
                role: 'donor',
                createdAt: now,
                updatedAt: now,
                karma: 0,
                streak: 0,
                lastActiveAt: now
            };
            await db.ref(`users/${userId}`).set(user);
        }
        // Generate JWT token
        const token = jwt.sign({ userId, phone, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        return res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: userId,
                phone: user.phone,
                name: user.name,
                email: user.email,
                role: user.role,
                karma: user.karma || 0,
                streak: user.streak || 0
            }
        });
    }
    catch (error) {
        console.error('Error verifying OTP:', error);
        return res.status(500).json({ error: 'Failed to verify OTP' });
    }
});
/**
 * GET /auth/me
 * Get current user info
 */
router.get('/me', async (req, res) => {
    var _a;
    try {
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.userId;
        const userSnapshot = await db.ref(`users/${userId}`).once('value');
        const user = userSnapshot.val();
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        return res.json({
            success: true,
            user: {
                id: userId,
                phone: user.phone,
                name: user.name,
                email: user.email,
                role: user.role,
                karma: user.karma || 0,
                streak: user.streak || 0
            }
        });
    }
    catch (error) {
        console.error('Error getting user:', error);
        return res.status(401).json({ error: 'Invalid token' });
    }
});
exports.default = router;
//# sourceMappingURL=auth.routes.js.map