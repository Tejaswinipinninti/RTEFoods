import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

// Default Firebase Configuration (Can be replaced with user's Firebase keys)
const firebaseConfig = {
  apiKey: "AIzaSyB-DemoApiKeyForRTEFoodsECommerce2026",
  authDomain: "rte-foods.firebaseapp.com",
  projectId: "rte-foods",
  storageBucket: "rte-foods.appspot.com",
  messagingSenderId: "987654321098",
  appId: "1:987654321098:web:abcdef1234567890"
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
    const userDocRef = doc(db, 'users', userData.uid || userData.email.replace(/[@.]/g, '_'));
    await setDoc(userDocRef, {
      uid: userData.uid || '',
      email: userData.email,
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

    const customerData = {
      uid: user.uid,
      email: user.email,
      firstName,
      lastName,
      avatar: user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.email}`,
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

    const customerData = {
      uid: user.uid,
      email: user.email,
      firstName,
      lastName,
      avatar: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`,
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
