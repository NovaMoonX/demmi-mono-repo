import { UserProfile } from '@lib/userProfile';
import { db } from '@lib/firebase/firebase.config';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { RootState } from '..';

function isDemoActive(getState: () => unknown): boolean {
  const state = getState() as RootState;
  return state.demo.isActive;
}

/**
 * Fetch the user profile document from Firestore.
 * No-ops silently when demo mode is active.
 */
export const fetchUserProfile = createAsyncThunk(
  'userProfile/fetchUserProfile',
  async (_, { getState }) => {
    const state = getState() as RootState;
    try {
      const userId = state.user.user?.uid;
      if (!userId) throw new Error('You must be signed in to fetch your profile.');

      const profileRef = doc(db, 'userProfiles', userId);
      const snapshot = await getDoc(profileRef);
      const profile = snapshot.exists() ? (snapshot.data() as UserProfile) : null;

      return profile;
    } catch (err) {
      console.error('Error fetching user profile:', err);
      throw err;
    }
  },
  { condition: (_, { getState }) => !isDemoActive(getState) },
);

/**
 * Upsert (merge) the user profile document in Firestore.
 * Always stamps `updatedAt` with the current timestamp.
 * No-ops silently when demo mode is active.
 */
export const saveUserProfile = createAsyncThunk(
  'userProfile/saveUserProfile',
  async (partial: Partial<UserProfile>, { getState }) => {
    const state = getState() as RootState;
    try {
      const userId = state.user.user?.uid;
      if (!userId) throw new Error('You must be signed in to save your profile.');

      const profileRef = doc(db, 'userProfiles', userId);
      const now = Date.now();

      const updates: Partial<UserProfile> = {
        ...partial,
        userId,
        updatedAt: now,
      };

      await setDoc(profileRef, updates, { merge: true });

      const snapshot = await getDoc(profileRef);
      const savedProfile = snapshot.data() as UserProfile;

      return savedProfile;
    } catch (err) {
      console.error('Error saving user profile:', err);
      throw err;
    }
  },
  { condition: (_, { getState }) => !isDemoActive(getState) },
);
