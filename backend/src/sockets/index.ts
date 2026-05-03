import { Server as SocketIOServer, Socket } from 'socket.io';
import { AuthService } from '../services/auth.service';
import logger from '../utils/logger';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  user?: any;
}

export function initializeSocketIO(io: SocketIOServer): void {
  // Authentication middleware for Socket.IO
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication required'));
      }
      
      const payload = AuthService.verifyToken(token);
      socket.userId = payload.userId;
      socket.user = payload;
      
      logger.info(`Socket authenticated: ${socket.userId}`);
      next();
    } catch (error) {
      logger.error('Socket authentication error:', error);
      next(new Error('Invalid token'));
    }
  });
  
  io.on('connection', (socket: AuthenticatedSocket) => {
    logger.info(`Client connected: ${socket.id}, User: ${socket.userId}`);
    
    // Join user's personal room
    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
    }
    
    // Handle location updates (for live tracking)
    socket.on('location:update', async (data: { claimId: string; latitude: number; longitude: number }) => {
      try {
        // Broadcast location to donor and receiver
        io.to(`claim:${data.claimId}`).emit('location:updated', {
          volunteerId: socket.userId,
          latitude: data.latitude,
          longitude: data.longitude,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        logger.error('Location update error:', error);
      }
    });
    
    // Join claim room (for real-time coordination)
    socket.on('claim:join', (claimId: string) => {
      socket.join(`claim:${claimId}`);
      logger.info(`User ${socket.userId} joined claim room: ${claimId}`);
    });
    
    // Leave claim room
    socket.on('claim:leave', (claimId: string) => {
      socket.leave(`claim:${claimId}`);
      logger.info(`User ${socket.userId} left claim room: ${claimId}`);
    });
    
    // Handle messages
    socket.on('message:send', async (data: { claimId: string; message: string }) => {
      try {
        // Broadcast message to claim room
        io.to(`claim:${data.claimId}`).emit('message:received', {
          senderId: socket.userId,
          message: data.message,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        logger.error('Message send error:', error);
      }
    });
    
    // Handle typing indicators
    socket.on('typing:start', (claimId: string) => {
      socket.to(`claim:${claimId}`).emit('typing:started', {
        userId: socket.userId,
      });
    });
    
    socket.on('typing:stop', (claimId: string) => {
      socket.to(`claim:${claimId}`).emit('typing:stopped', {
        userId: socket.userId,
      });
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id}, User: ${socket.userId}`);
    });
  });
  
  logger.info('Socket.IO event handlers registered');
}

// Helper function to emit to specific user
export function emitToUser(io: SocketIOServer, userId: string, event: string, data: any): void {
  io.to(`user:${userId}`).emit(event, data);
}

// Helper function to emit to claim room
export function emitToClaim(io: SocketIOServer, claimId: string, event: string, data: any): void {
  io.to(`claim:${claimId}`).emit(event, data);
}
