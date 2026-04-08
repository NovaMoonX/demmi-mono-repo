import { AgentMemory } from '@lib/memory';
import { DEMO_USER_ID } from '@lib/app';
import { db } from '@lib/firebase/firebase.config';
import { generatedId } from '@utils/generatedId';
import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  collection,
  doc,
  getDocs,
  query,
  QueryDocumentSnapshot,
  runTransaction,
  setDoc,
  Transaction,
  where,
} from 'firebase/firestore';
import { RootState } from '..';

function isDemoActive(getState: () => unknown): boolean {
  const state = getState() as RootState;
  return state.demo.isActive;
}

/**
 * Fetch all agent memories belonging to the current user from Firestore.
 * No-ops silently when demo mode is active.
 */
export const fetchMemories = createAsyncThunk(
  'memory/fetchMemories',
  async (_, { getState }) => {
    const state = getState() as RootState;
    try {
      const userId = state.user.user?.uid;
      if (!userId) throw new Error('You must be signed in to fetch memories.');

      const q = query(
        collection(db, 'agentMemories'),
        where('userId', '==', userId),
      );
      const snapshot = await getDocs(q);
      const memories: AgentMemory[] = snapshot.docs.map(
        (d: QueryDocumentSnapshot) => d.data() as AgentMemory,
      );
      return memories;
    } catch (err) {
      console.error('Error fetching memories:', err);
      throw err;
    }
  },
  { condition: (_, { getState }) => !isDemoActive(getState) },
);

/**
 * Create a new agent memory. In demo mode, persists to local Redux state only.
 * In normal mode, persists to Firestore.
 */
export const createMemoryAsync = createAsyncThunk(
  'memory/createMemoryAsync',
  async (params: Omit<AgentMemory, 'id' | 'userId'>, { getState }) => {
    const state = getState() as RootState;
    const memoryId = generatedId('memory');

    if (isDemoActive(getState)) {
      const newMemory: AgentMemory = { ...params, id: memoryId, userId: DEMO_USER_ID };
      return newMemory;
    }

    try {
      const userId = state.user.user?.uid;
      if (!userId) throw new Error('You must be signed in to create a memory.');

      const memoryDocRef = doc(db, 'agentMemories', memoryId);
      const newMemory: AgentMemory = { ...params, id: memoryId, userId };
      await setDoc(memoryDocRef, newMemory);
      return newMemory;
    } catch (err) {
      console.error('Error creating memory:', err);
      throw err;
    }
  },
);

/**
 * Update an existing agent memory. In demo mode, updates local Redux state only.
 * In normal mode, updates Firestore.
 */
export const updateMemoryAsync = createAsyncThunk(
  'memory/updateMemoryAsync',
  async (memory: AgentMemory, { getState }) => {
    if (isDemoActive(getState)) {
      return memory;
    }

    const state = getState() as RootState;
    try {
      const userId = state.user.user?.uid;
      if (!userId) throw new Error('You must be signed in to update a memory.');

      const memoryDocRef = doc(db, 'agentMemories', memory.id);

      await runTransaction(db, async (tx: Transaction) => {
        const memorySnap = await tx.get(memoryDocRef);
        if (!memorySnap.exists()) throw new Error('Memory not found.');

        const existing = memorySnap.data() as AgentMemory;
        if (existing.userId !== userId)
          throw new Error('You can only update your own memories.');

        const { id: _id, userId: _userId, ...updatableFields } = memory;
        tx.update(memoryDocRef, updatableFields);
      });

      return memory;
    } catch (err) {
      console.error('Error updating memory:', err);
      throw err;
    }
  },
);

/**
 * Delete an agent memory. In demo mode, removes from local Redux state only.
 * In normal mode, deletes from Firestore.
 */
export const deleteMemoryAsync = createAsyncThunk(
  'memory/deleteMemoryAsync',
  async (memoryId: string, { getState }) => {
    if (isDemoActive(getState)) {
      return memoryId;
    }

    const state = getState() as RootState;
    try {
      const userId = state.user.user?.uid;
      if (!userId) throw new Error('You must be signed in to delete a memory.');

      const memoryDocRef = doc(db, 'agentMemories', memoryId);

      await runTransaction(db, async (tx: Transaction) => {
        const memorySnap = await tx.get(memoryDocRef);
        if (!memorySnap.exists()) throw new Error('Memory not found.');

        const memory = memorySnap.data() as AgentMemory;
        if (memory.userId !== userId)
          throw new Error('You can only delete your own memories.');

        tx.delete(memoryDocRef);
      });

      return memoryId;
    } catch (err) {
      console.error('Error deleting memory:', err);
      throw err;
    }
  },
);
