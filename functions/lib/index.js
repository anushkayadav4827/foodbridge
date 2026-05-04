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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupExpiredOTPs = exports.autoRejectExpiredClaims = exports.api = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
// Import routes
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const listings_routes_1 = __importDefault(require("./routes/listings.routes"));
const claims_routes_1 = __importDefault(require("./routes/claims.routes"));
// Initialize Firebase Admin
admin.initializeApp();
// Create Express app
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)({ origin: true })); // Allow all origins for Cloud Functions
app.use((0, helmet_1.default)());
app.use((0, compression_1.default)());
app.use((0, morgan_1.default)('combined'));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
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
app.use('/auth', auth_routes_1.default);
app.use('/listings', listings_routes_1.default);
app.use('/claims', claims_routes_1.default);
// Export the Express app as a Cloud Function
exports.api = functions.https.onRequest(app);
// Scheduled function to auto-reject expired claims (runs every minute)
exports.autoRejectExpiredClaims = functions.pubsub
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
        const updates = {};
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
    }
    catch (error) {
        console.error('Error auto-rejecting claims:', error);
        return null;
    }
});
// Cleanup expired OTPs (runs every 5 minutes)
exports.cleanupExpiredOTPs = functions.pubsub
    .schedule('every 5 minutes')
    .onRun(async (context) => {
    const db = admin.database();
    const otpsRef = db.ref('otps');
    try {
        const snapshot = await otpsRef.once('value');
        const now = Date.now();
        let deletedCount = 0;
        const deletePromises = [];
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
    }
    catch (error) {
        console.error('Error cleaning up OTPs:', error);
        return null;
    }
});
//# sourceMappingURL=index.js.map