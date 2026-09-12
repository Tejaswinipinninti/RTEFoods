import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, startAfter, serverTimestamp,
  onSnapshot, writeBatch, increment, arrayUnion, arrayRemove
} from 'firebase/firestore';
import { db } from './config';

const COLLECTIONS = {
  USERS: 'users',
  CATEGORIES: 'categories',
  SUBCATEGORIES: 'subcategories',
  PRODUCTS: 'products',
  ORDERS: 'orders',
  CART: 'carts',
  WISHLIST: 'wishlists',
  COUPONS: 'coupons',
  REVIEWS: 'reviews',
  BANNERS: 'banners',
  OFFERS: 'offers',
  BLOGS: 'blogs',
  FAQS: 'faqs',
  NEWSLETTER: 'newsletter',
  CONTACTS: 'contacts',
  SETTINGS: 'settings',
  NOTIFICATIONS: 'notifications',
  INVENTORY: 'inventory',
  PINCODES: 'pincodes',
};

export const firestoreService = {
  // Generic CRUD
  async getAll(collectionName, filters = [], sortBy = null, limitCount = null) {
    try {
      let q = collection(db, collectionName);
      const constraints = [];

      filters.forEach(({ field, operator, value }) => {
        constraints.push(where(field, operator, value));
      });

      if (sortBy) {
        constraints.push(orderBy(sortBy.field, sortBy.direction || 'desc'));
      }
      if (limitCount) {
        constraints.push(limit(limitCount));
      }

      if (constraints.length > 0) {
        q = query(q, ...constraints);
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error(`Error getting ${collectionName}:`, error);
      throw error;
    }
  },

  async getById(collectionName, id) {
    try {
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error(`Error getting ${collectionName} doc:`, error);
      throw error;
    }
  },

  async create(collectionName, data) {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { id: docRef.id, ...data };
    } catch (error) {
      console.error(`Error creating ${collectionName} doc:`, error);
      throw error;
    }
  },

  async update(collectionName, id, data) {
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
      return { id, ...data };
    } catch (error) {
      console.error(`Error updating ${collectionName} doc:`, error);
      throw error;
    }
  },

  async remove(collectionName, id) {
    try {
      await deleteDoc(doc(db, collectionName, id));
      return true;
    } catch (error) {
      console.error(`Error deleting ${collectionName} doc:`, error);
      throw error;
    }
  },

  async bulkDelete(collectionName, ids) {
    try {
      const batch = writeBatch(db);
      ids.forEach(id => {
        batch.delete(doc(db, collectionName, id));
      });
      await batch.commit();
      return true;
    } catch (error) {
      console.error(`Error bulk deleting ${collectionName}:`, error);
      throw error;
    }
  },

  // Search
  async search(collectionName, field, searchText, limitCount = 20) {
    try {
      const q = query(
        collection(db, collectionName),
        where(field, '>=', searchText),
        where(field, '<=', searchText + '\uf8ff'),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error(`Error searching ${collectionName}:`, error);
      throw error;
    }
  },

  // Paginated query
  async getPaginated(collectionName, pageSize = 12, filters = [], sortBy = null, lastDoc = null) {
    try {
      let q = collection(db, collectionName);
      const constraints = [];

      filters.forEach(({ field, operator, value }) => {
        constraints.push(where(field, operator, value));
      });

      if (sortBy) {
        constraints.push(orderBy(sortBy.field, sortBy.direction || 'desc'));
      }

      constraints.push(limit(pageSize + 1));

      if (lastDoc) {
        constraints.push(startAfter(lastDoc));
      }

      q = query(q, ...constraints);
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const hasMore = docs.length > pageSize;
      return { data: docs.slice(0, pageSize), hasMore, lastDoc: snapshot.docs[snapshot.docs.length - 1] };
    } catch (error) {
      console.error(`Error getting paginated ${collectionName}:`, error);
      throw error;
    }
  },

  // Real-time listener
  subscribe(collectionName, callback, filters = []) {
    let q = collection(db, collectionName);
    const constraints = [];

    filters.forEach(({ field, operator, value }) => {
      constraints.push(where(field, operator, value));
    });

    if (constraints.length > 0) {
      q = query(q, ...constraints);
    }

    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(data);
    });
  },

  // Increment field
  async incrementField(collectionName, id, fieldName, amount = 1) {
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, {
        [fieldName]: increment(amount),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error(`Error incrementing ${collectionName}:`, error);
      throw error;
    }
  },

  // Array operations
  async addToArray(collectionName, id, fieldName, value) {
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, {
        [fieldName]: arrayUnion(value),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error(`Error adding to array:`, error);
      throw error;
    }
  },

  async removeFromArray(collectionName, id, fieldName, value) {
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, {
        [fieldName]: arrayRemove(value),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error(`Error removing from array:`, error);
      throw error;
    }
  }
};

export { COLLECTIONS };
export default firestoreService;
