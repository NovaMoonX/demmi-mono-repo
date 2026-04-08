import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AgentMemory } from '@lib/memory';
import {
  fetchMemories,
  createMemoryAsync,
  updateMemoryAsync,
  deleteMemoryAsync,
} from '@store/actions/memoryActions';

interface MemoryState {
  items: AgentMemory[];
}

const initialState: MemoryState = {
  items: [],
};

const memorySlice = createSlice({
  name: 'memory',
  initialState,
  reducers: {
    setMemories: (state, action: PayloadAction<AgentMemory[]>) => {
      state.items = action.payload;
    },
    addMemory: (state, action: PayloadAction<AgentMemory>) => {
      state.items.push(action.payload);
    },
    updateMemory: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<Omit<AgentMemory, 'id'>> }>,
    ) => {
      const index = state.items.findIndex((m) => m.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...action.payload.updates };
      }
    },
    deleteMemory: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((m) => m.id !== action.payload);
    },
    resetMemories: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMemories.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(createMemoryAsync.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateMemoryAsync.fulfilled, (state, action) => {
        const index = state.items.findIndex((m) => m.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteMemoryAsync.fulfilled, (state, action) => {
        state.items = state.items.filter((m) => m.id !== action.payload);
      });
  },
});

export const { setMemories, addMemory, updateMemory, deleteMemory, resetMemories } =
  memorySlice.actions;

export default memorySlice.reducer;
