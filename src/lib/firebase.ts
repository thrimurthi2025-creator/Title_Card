import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    if (result.user.email !== 'akdiljith7@gmail.com') {
      await signOut(auth);
      console.error("Access Denied: Only the administrator (akdiljith7@gmail.com) can log in.");
      return null;
    }
    return result.user;
  } catch (error: any) {
    if (error.code === 'auth/unauthorized-domain') {
      console.error("Firebase Error: This domain is not authorized. Please add your Vercel URL to the 'Authorized domains' list in the Firebase Console.");
    } else {
      console.error("Error signing in with Google:", error.message);
    }
    return null;
  }
};

export const logOut = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out", error);
  }
};
