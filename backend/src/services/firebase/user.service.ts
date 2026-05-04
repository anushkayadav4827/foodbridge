import { db, generateId, timestamp } from '../../database/firebase';
import { FirebaseUser, CreateFirebaseUser, DB_PATHS } from '../../types/firebase.types';

export class FirebaseUserService {
  private usersRef = db.ref(DB_PATHS.USERS);

  /**
   * Create a new user
   */
  async createUser(userData: CreateFirebaseUser): Promise<FirebaseUser> {
    const userId = generateId();
    const now = Date.now();

    const user: FirebaseUser = {
      id: userId,
      ...userData,
      createdAt: now,
      updatedAt: now,
      karma: userData.karma || 0,
      streak: userData.streak || 0,
      lastActiveAt: now
    };

    await this.usersRef.child(userId).set(user);
    return user;
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<FirebaseUser | null> {
    const snapshot = await this.usersRef.child(userId).once('value');
    return snapshot.val();
  }

  /**
   * Get user by phone number
   */
  async getUserByPhone(phone: string): Promise<FirebaseUser | null> {
    const snapshot = await this.usersRef
      .orderByChild('phone')
      .equalTo(phone)
      .once('value');

    let user: FirebaseUser | null = null;
    snapshot.forEach((childSnapshot) => {
      user = childSnapshot.val();
      return true; // Stop iteration after first match
    });

    return user;
  }

  /**
   * Update user
   */
  async updateUser(userId: string, updates: Partial<FirebaseUser>): Promise<void> {
    const updateData = {
      ...updates,
      updatedAt: Date.now()
    };

    await this.usersRef.child(userId).update(updateData);
  }

  /**
   * Delete user
   */
  async deleteUser(userId: string): Promise<void> {
    await this.usersRef.child(userId).remove();
  }

  /**
   * Update user's last active timestamp
   */
  async updateLastActive(userId: string): Promise<void> {
    await this.usersRef.child(userId).update({
      lastActiveAt: Date.now()
    });
  }

  /**
   * Update user karma
   */
  async updateKarma(userId: string, karmaChange: number): Promise<number> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const newKarma = (user.karma || 0) + karmaChange;
    await this.updateUser(userId, { karma: newKarma });
    return newKarma;
  }

  /**
   * Update user streak
   */
  async updateStreak(userId: string, newStreak: number): Promise<void> {
    await this.updateUser(userId, { streak: newStreak });
  }

  /**
   * Get all users (admin only - use with caution)
   */
  async getAllUsers(limit?: number): Promise<FirebaseUser[]> {
    let query = this.usersRef.orderByChild('createdAt');
    
    if (limit) {
      query = query.limitToLast(limit) as any;
    }

    const snapshot = await query.once('value');
    const users: FirebaseUser[] = [];

    snapshot.forEach((childSnapshot) => {
      users.push(childSnapshot.val());
    });

    return users.reverse(); // Reverse to get newest first
  }

  /**
   * Get users by role
   */
  async getUsersByRole(role: 'donor' | 'recipient' | 'admin'): Promise<FirebaseUser[]> {
    const snapshot = await this.usersRef
      .orderByChild('role')
      .equalTo(role)
      .once('value');

    const users: FirebaseUser[] = [];
    snapshot.forEach((childSnapshot) => {
      users.push(childSnapshot.val());
    });

    return users;
  }

  /**
   * Check if user exists
   */
  async userExists(userId: string): Promise<boolean> {
    const snapshot = await this.usersRef.child(userId).once('value');
    return snapshot.exists();
  }

  /**
   * Check if phone number is already registered
   */
  async phoneExists(phone: string): Promise<boolean> {
    const user = await this.getUserByPhone(phone);
    return user !== null;
  }
}

// Export singleton instance
export const firebaseUserService = new FirebaseUserService();
