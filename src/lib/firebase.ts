import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, type User } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc, increment } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCyWuTbjmIgO9E1DdriiU7sNNw5xGvslQ4",
  authDomain: "mydatabase-10917.firebaseapp.com",
  databaseURL: "https://mydatabase-10917-default-rtdb.firebaseio.com",
  projectId: "mydatabase-10917",
  storageBucket: "mydatabase-10917.firebasestorage.app",
  messagingSenderId: "239566975934",
  appId: "1:239566975934:web:df3b94181f7e843224ffef",
  measurementId: "G-H8H0FJDFDQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const db = getFirestore(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Authentication functions
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// User data management
export interface UserData {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string | null;
  createdAt: Date;
  usageNumber: number;
  lastUpdated: Date;
}

export const createOrUpdateUser = async (user: User) => {
  try {
    const userRef = doc(db, 'ImagiGenius', user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      // User exists, update lastUpdated
      await updateDoc(userRef, {
        lastUpdated: new Date(),
        displayName: user.displayName || '',
        photoURL: user.photoURL || null,
      });
    } else {
      // New user, create document
      const userData: UserData = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || '',
        photoURL: user.photoURL || null,
        createdAt: new Date(),
        usageNumber: 0,
        lastUpdated: new Date(),
      };
      await setDoc(userRef, userData);
    }
  } catch (error) {
    console.error('Error creating/updating user:', error);
    throw error;
  }
};

export const incrementUsageNumber = async (uid: string) => {
  try {
    const userRef = doc(db, 'ImagiGenius', uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      // Document exists, increment usage
      await updateDoc(userRef, {
        usageNumber: increment(1),
        lastUpdated: new Date(),
      });
    } else {
      // Document doesn't exist, create it with usageNumber = 1
      const userData: UserData = {
        uid: uid,
        email: '', // Will be updated when user data is properly created
        displayName: '',
        photoURL: null,
        createdAt: new Date(),
        usageNumber: 1,
        lastUpdated: new Date(),
      };
      await setDoc(userRef, userData);
    }
  } catch (error) {
    console.error('Error incrementing usage number:', error);
    throw error;
  }
};

export const getUserData = async (uid: string): Promise<UserData | null> => {
  try {
    const userRef = doc(db, 'ImagiGenius', uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data() as UserData;
    }
    return null;
  } catch (error) {
    console.error('Error getting user data:', error);
    throw error;
  }
}; 