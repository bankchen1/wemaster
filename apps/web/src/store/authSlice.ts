import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from './store';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'tutor';
  avatar?: string;
  bio?: string;
  subjects?: string[];
  hourlyRate?: number;
  rating?: number;
  totalLessons?: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
};

// Mock authentication
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock response
    return {
      user: {
        id: '1',
        email: credentials.email,
        name: 'Demo User',
        role: 'student' as const,
        avatar: 'https://ui-avatars.com/api/?name=Demo+User',
      },
      token: 'mock_token',
    };
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (data: { email: string; password: string; name: string; role: 'student' | 'tutor' }) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock response
    return {
      user: {
        id: '1',
        email: data.email,
        name: data.name,
        role: data.role,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}`,
      },
      token: 'mock_token',
    };
  }
);

export const becomeTutor = createAsyncThunk(
  'auth/becomeTutor',
  async (data: {
    subjects: string[];
    bio: string;
    hourlyRate: number;
    education: string[];
    experience: string[];
  }) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      ...data,
      role: 'tutor' as const,
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
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Login failed';
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Registration failed';
      })
      // Become Tutor
      .addCase(becomeTutor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(becomeTutor.fulfilled, (state, action) => {
        state.loading = false;
        if (state.user) {
          state.user = {
            ...state.user,
            ...action.payload,
          };
        }
      })
      .addCase(becomeTutor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to become a tutor';
      });
  },
});

export const { logout, clearError } = authSlice.actions;

// Selectors
export const selectUser = (state: RootState) => state.auth.user;
export const selectToken = (state: RootState) => state.auth.token;
export const selectAuthLoading = (state: RootState) => state.auth.loading;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectIsAuthenticated = (state: RootState) => !!state.auth.token;
export const selectIsTutor = (state: RootState) => state.auth.user?.role === 'tutor';

export default authSlice.reducer;
