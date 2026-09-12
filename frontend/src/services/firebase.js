import { getApps, getApp, initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const facebookProvider = new FacebookAuthProvider();

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
  } catch (error) {
    console.warn('Firestore write skipped:', error.message);
  }
}

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

    await saveUserToFirestore(customerData);
    return customerData;
  } catch (error) {
    throw error;
  }
}

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

    await saveUserToFirestore(customerData);
    return customerData;
  } catch (error) {
    throw error;
  }
}
