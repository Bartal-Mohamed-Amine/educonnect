import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

interface User {
  id: string;
  email: string;
  name: string;
  university?: string;
  fieldOfStudy?: string;
  yearOfStudy?: number;
  isStudent: boolean;
  preferences: {
    notifications: boolean;
    locationServices: boolean;
    categories: string[];
  };
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
};

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }) => {
    // Simulated API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      user: {
        id: '1',
        email: credentials.email,
        name: 'Marie Dupont',
        university: 'Sorbonne Université',
        fieldOfStudy: 'Informatique',
        yearOfStudy: 2,
        isStudent: true,
        preferences: {
          notifications: true,
          locationServices: true,
          categories: ['technology', 'courses', 'grants'],
        },
      },
      token: 'mock-jwt-token',
    };
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    updatePreferences: (state, action) => {
      if (state.user) {
        state.user.preferences = { ...state.user.preferences, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Login failed';
      });
  },
});

export const { logout, clearError, updatePreferences } = authSlice.actions;
export default authSlice.reducer;