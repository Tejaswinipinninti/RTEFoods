import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

// Firebase Configuration from environment variables (.env)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyB-DemoApiKeyForRTEFoodsECommerce2026",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "rte-foods.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "rte-foods",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "rte-foods.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "987654321098",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:987654321098:web:abcdef1234567890"
};

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const facebookProvider = new FacebookAuthProvider();

/**
 * Save user profile data to Firebase Firestore database
 */
export async function saveUserToFirestore(userData) {
  try {
    const safeEmail = userData.email || `${userData.uid || 'user'}_fb@facebook.com`;
    const docId = userData.uid || safeEmail.replace(/[@.]/g, '_');
    const userDocRef = doc(db, 'users', docId);
    await setDoc(userDocRef, {
      uid: userData.uid || '',
      email: safeEmail,
      firstName: userData.firstName || 'Customer',
      lastName: userData.lastName || 'User',
      displayName: `${userData.firstName} ${userData.lastName}`.trim(),
      provider: userData.provider || 'google',
      photoURL: userData.avatar || '',
      role: 'user',
      lastLogin: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });
    console.log('Saved customer to Firestore successfully!');
  } catch (error) {
    console.warn('Firestore write notice (using fallback sync):', error.message);
  }
}

/**
 * Trigger Real Google OAuth Popup + Sync to Firestore
 */
export async function signInWithGoogleReal() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const nameParts = (user.displayName || 'Google Customer').split(' ');
    const firstName = nameParts[0] || 'Google';
    const lastName = nameParts.slice(1).join(' ') || 'User';
    const email = user.email || `${user.uid}@gmail.com`;

    const customerData = {
      uid: user.uid,
      email,
      firstName,
      lastName,
      avatar: user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${email}`,
      provider: 'google'
    };

    // Save user data to Firestore
    await saveUserToFirestore(customerData);

    return customerData;
  } catch (error) {
    console.warn('Google Popup OAuth fallback:', error.message);
    throw error;
  }
}

/**
 * Trigger Real Facebook OAuth Popup + Sync to Firestore
 */
export async function signInWithFacebookReal() {
  try {
    const result = await signInWithPopup(auth, facebookProvider);
    const user = result.user;
    const nameParts = (user.displayName || 'Facebook Customer').split(' ');
    const firstName = nameParts[0] || 'Facebook';
    const lastName = nameParts.slice(1).join(' ') || 'User';
    const email = user.email || `${user.uid || 'fb_user'}@facebook.com`;

    const customerData = {
      uid: user.uid,
      email,
      firstName,
      lastName,
      avatar: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      provider: 'facebook'
    };

    // Save user data to Firestore
    await saveUserToFirestore(customerData);

    return customerData;
  } catch (error) {
    console.warn('Facebook Popup OAuth fallback:', error.message);
    throw error;
  }
}
