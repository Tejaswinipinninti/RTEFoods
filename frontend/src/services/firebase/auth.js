import {
  getAuth,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import app from './config';

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    return {
      uid: user.uid,
      email: user.email,
      firstName: user.displayName?.split(' ')[0] || '',
      lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
      avatar: user.photoURL || '',
      provider: 'google'
    };
  } catch (error) {
    if (error.code === 'auth/popup-closed-by-user' || error.code === 'cancelled-popup-request') {
      throw new Error('Login cancelled');
    }
    console.error('Google login error:', error.code, error.message);
    throw new Error(error.message || 'Google login failed. Make sure Google sign-in is enabled in your Firebase console.');
  }
};

export const signInWithFacebook = async () => {
  try {
    const result = await signInWithPopup(auth, facebookProvider);
    const user = result.user;
    return {
      uid: user.uid,
      email: user.email,
      firstName: user.displayName?.split(' ')[0] || '',
      lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
      avatar: user.photoURL || '',
      provider: 'facebook'
    };
  } catch (error) {
    if (error.code === 'auth/popup-closed-by-user' || error.code === 'cancelled-popup-request') {
      throw new Error('Login cancelled');
    }
    console.error('Facebook login error:', error.code, error.message);
    throw new Error(error.message || 'Facebook login failed. Make sure Facebook sign-in is enabled in your Firebase console.');
  }
};

export const firebaseSignOut = async () => {
  await signOut(auth);
};

export { auth };
export default { signInWithGoogle, signInWithFacebook, firebaseSignOut };
