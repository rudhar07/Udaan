import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';

/**
 * Firebase configuration for the Udaan application
 */
const firebaseConfig = {
  apiKey: "AIzaSyASrISGTm29uihYuUMA1Mr4xgJ2ZUm5yB8",
  authDomain: "udaan-e8409.firebaseapp.com",
  projectId: "udaan-e8409",
  storageBucket: "udaan-e8409.firebasestorage.app",
  messagingSenderId: "189617797837",
  appId: "1:189617797837:web:f28f730a04962f5aa88784",
  measurementId: "G-D9S3869FY2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

/**
 * Sign in with Google authentication
 * @returns {Promise<Object>} User credentials
 */
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

/**
 * Sign out the current user
 */
export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

/**
 * Subscribe to authentication state changes
 * @param {Function} callback - Function to call when auth state changes
 * @returns {Function} Unsubscribe function
 */
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Get current authenticated user
 * @returns {Object|null} Current user or null if not authenticated
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};

/**
 * Get user's favorite flights
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of favorite flights
 */
export const getFavoriteFlights = async (userId) => {
  if (!userId) return [];
  
  try {
    const favoritesRef = collection(db, 'users', userId, 'favorites');
    const querySnapshot = await getDocs(favoritesRef);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting favorite flights:', error);
    throw error;
  }
};

/**
 * Add a flight to favorites
 * @param {string} userId - User ID
 * @param {Object} flight - Flight data
 * @returns {Promise<string>} ID of the favorite document
 */
export const addFavoriteFlight = async (userId, flight) => {
  if (!userId) throw new Error('User not authenticated');
  
  try {
    const favoritesRef = collection(db, 'users', userId, 'favorites');
    
    // Use the flight's ID as the document ID to prevent duplicates
    const flightDoc = doc(favoritesRef, flight.id);
    
    await setDoc(flightDoc, {
      ...flight,
      createdAt: serverTimestamp()
    });
    
    return flight.id;
  } catch (error) {
    console.error('Error adding favorite flight:', error);
    throw error;
  }
};

/**
 * Remove a flight from favorites
 * @param {string} userId - User ID
 * @param {string} flightId - Flight ID to remove
 * @returns {Promise<void>}
 */
export const removeFavoriteFlight = async (userId, flightId) => {
  if (!userId) throw new Error('User not authenticated');
  
  try {
    const flightDoc = doc(db, 'users', userId, 'favorites', flightId);
    await deleteDoc(flightDoc);
  } catch (error) {
    console.error('Error removing favorite flight:', error);
    throw error;
  }
};

export default {
  signInWithGoogle,
  signOutUser,
  onAuthChange,
  getCurrentUser,
  getFavoriteFlights,
  addFavoriteFlight,
  removeFavoriteFlight
}; 