import * as admin from 'firebase-admin';
import * as path from 'path';

// Initialize Firebase Admin SDK
const serviceAccount = require(path.join(__dirname, '../../serviceAccountKey.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://foodbridge-app-51332-default-rtdb.asia-southeast1.firebasedatabase.app',
  storageBucket: 'foodbridge-app-51332.appspot.com'
});

// Get database reference
export const db = admin.database();

// Get storage reference
export const storage = admin.storage();

// Get auth reference
export const auth = admin.auth();

// Export admin for other uses
export default admin;

// Helper function to generate unique IDs
export const generateId = (): string => {
  return db.ref().push().key || Date.now().toString();
};

// Helper function to get current timestamp
export const timestamp = (): number => {
  return admin.database.ServerValue.TIMESTAMP as any;
};

// Database helper functions
export const dbHelpers = {
  // Get a single document
  async get(path: string): Promise<any> {
    const snapshot = await db.ref(path).once('value');
    return snapshot.val();
  },

  // Set/create a document
  async set(path: string, data: any): Promise<void> {
    await db.ref(path).set(data);
  },

  // Update a document
  async update(path: string, data: any): Promise<void> {
    await db.ref(path).update(data);
  },

  // Delete a document
  async delete(path: string): Promise<void> {
    await db.ref(path).remove();
  },

  // Query with filters
  async query(path: string, filters?: {
    orderBy?: string;
    equalTo?: any;
    startAt?: any;
    endAt?: any;
    limitToFirst?: number;
    limitToLast?: number;
  }): Promise<any[]> {
    let ref: any = db.ref(path);

    if (filters) {
      if (filters.orderBy) {
        ref = ref.orderByChild(filters.orderBy);
      }
      if (filters.equalTo !== undefined) {
        ref = ref.equalTo(filters.equalTo);
      }
      if (filters.startAt !== undefined) {
        ref = ref.startAt(filters.startAt);
      }
      if (filters.endAt !== undefined) {
        ref = ref.endAt(filters.endAt);
      }
      if (filters.limitToFirst) {
        ref = ref.limitToFirst(filters.limitToFirst);
      }
      if (filters.limitToLast) {
        ref = ref.limitToLast(filters.limitToLast);
      }
    }

    const snapshot = await ref.once('value');
    const results: any[] = [];
    
    snapshot.forEach((childSnapshot: any) => {
      results.push({
        id: childSnapshot.key,
        ...childSnapshot.val()
      });
    });

    return results;
  },

  // Push (create with auto-generated ID)
  async push(path: string, data: any): Promise<string> {
    const ref = await db.ref(path).push(data);
    return ref.key!;
  }
};
