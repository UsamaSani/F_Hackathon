import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import api from '../api';

export interface FamilyMember {
  _id: string;
  name: string;
  relation: string;
  color: string;
  userId: string;
}

interface FamilyState {
  members: FamilyMember[];
  loading: boolean;
  error: string | null;
}

const initialState: FamilyState = {
  members: [],
  loading: false,
  error: null,
};

export const fetchFamilyMembers = createAsyncThunk(
  'family/fetchMembers',
  async () => {
    const response = await api.family.list();
    return response.data || [];
  }
);

export const createFamilyMember = createAsyncThunk(
  'family/createMember',
  async (data: { name: string; relation: string; color: string }) => {
    const response = await api.family.create(data);
    return response.data;
  }
);

export const updateFamilyMember = createAsyncThunk(
  'family/updateMember',
  async ({ id, data }: { id: string; data: Partial<FamilyMember> }) => {
    const response = await api.family.update(id, data);
    return response.data;
  }
);

export const deleteFamilyMember = createAsyncThunk(
  'family/deleteMember',
  async (id: string) => {
    await api.family.delete(id);
    return id;
  }
);

const familySlice = createSlice({
  name: 'family',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFamilyMembers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFamilyMembers.fulfilled, (state, action: PayloadAction<FamilyMember[]>) => {
        state.loading = false;
        state.members = action.payload;
      })
      .addCase(fetchFamilyMembers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch family members';
      })
      .addCase(createFamilyMember.fulfilled, (state, action: PayloadAction<FamilyMember>) => {
        state.members.unshift(action.payload);
      })
      .addCase(updateFamilyMember.fulfilled, (state, action: PayloadAction<FamilyMember>) => {
        const index = state.members.findIndex(m => m._id === action.payload._id);
        if (index !== -1) {
          state.members[index] = action.payload;
        }
      })
      .addCase(deleteFamilyMember.fulfilled, (state, action: PayloadAction<string>) => {
        state.members = state.members.filter(m => m._id !== action.payload);
      });
  },
});

export default familySlice.reducer;