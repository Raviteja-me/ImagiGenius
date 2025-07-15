import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, type User } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc, increment, deleteDoc } from 'firebase/firestore';

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
  } catch (error: any) {
    console.error('Error signing in with Google:', error);
    
    // Handle specific error cases
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Sign-in was cancelled. Please try again.');
    } else if (error.code === 'auth/popup-blocked') {
      throw new Error('Pop-up was blocked. Please allow pop-ups for this site and try again.');
    } else if (error.code === 'auth/network-request-failed') {
      throw new Error('Network error. Please check your connection and try again.');
    } else {
      throw new Error('Sign-in failed. Please try again.');
    }
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
  lastUsageDate?: string; // Store date as string for easy comparison
}

export const createOrUpdateUser = async (user: User) => {
  try {
    const userRef = doc(db, 'ImagiGenius', user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      // User exists, update lastUpdated and other fields
      await updateDoc(userRef, {
        lastUpdated: new Date(),
        displayName: user.displayName || '',
        photoURL: user.photoURL || null,
        email: user.email || '',
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
        lastUsageDate: new Date().toDateString(), // Initialize with today's date
      };
      await setDoc(userRef, userData);
    }
  } catch (error) {
    console.error('Error creating/updating user:', error);
    throw error;
  }
};

// Check if user can generate (5 per day limit)
export const canUserGenerate = async (uid: string): Promise<{ canGenerate: boolean; remaining: number; message?: string }> => {
  try {
    const userRef = doc(db, 'ImagiGenius', uid);
    const userSnap = await getDoc(userRef);
    
    // If user document doesn't exist, they can generate (new user)
    if (!userSnap.exists()) {
      return { canGenerate: true, remaining: 5 };
    }
    
    const userData = userSnap.data() as UserData;
    const today = new Date().toDateString();
    const lastUsageDate = userData.lastUsageDate || today;
    
    // If it's a new day, reset usage
    if (lastUsageDate !== today) {
      return { canGenerate: true, remaining: 5 };
    }
    
    // Check if user has reached daily limit
    if (userData.usageNumber >= 5) {
      return { 
        canGenerate: false, 
        remaining: 0, 
        message: "Daily limit reached! You can generate 5 images per day. Come back tomorrow for more generations." 
      };
    }
    
    const remaining = 5 - userData.usageNumber;
    return { canGenerate: true, remaining };
  } catch (error) {
    console.error('Error checking user generation limit:', error);
    // If there's an error, allow generation but log it
    return { canGenerate: true, remaining: 5 };
  }
};

export const incrementUsageNumber = async (uid: string) => {
  try {
    const userRef = doc(db, 'ImagiGenius', uid);
    const userSnap = await getDoc(userRef);
    const today = new Date().toDateString();
    
    if (userSnap.exists()) {
      const userData = userSnap.data() as UserData;
      const lastUsageDate = userData.lastUsageDate || today;
      
      // If it's a new day, reset usage to 1, otherwise increment
      if (lastUsageDate !== today) {
        await updateDoc(userRef, {
          usageNumber: 1,
          lastUpdated: new Date(),
          lastUsageDate: today,
        });
      } else {
        await updateDoc(userRef, {
          usageNumber: increment(1),
          lastUpdated: new Date(),
          lastUsageDate: today,
        });
      }
    } else {
      // Document doesn't exist, create it with usageNumber = 1
      // This should not happen if createOrUpdateUser was called properly
      // But we'll handle it gracefully
      const userData: UserData = {
        uid: uid,
        email: '', // Will be updated when user data is properly created
        displayName: '',
        photoURL: null,
        createdAt: new Date(),
        usageNumber: 1,
        lastUpdated: new Date(),
        lastUsageDate: today,
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

 