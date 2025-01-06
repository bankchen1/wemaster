import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from './store';

interface DownloadStats {
  ios: number;
  android: number;
  total: number;
  lastUpdated: string;
}

interface AppAnalyticsState {
  downloadStats: DownloadStats;
  loading: boolean;
  error: string | null;
}

const initialState: AppAnalyticsState = {
  downloadStats: {
    ios: 0,
    android: 0,
    total: 0,
    lastUpdated: new Date().toISOString(),
  },
  loading: false,
  error: null,
};

export const trackDownload = createAsyncThunk(
  'appAnalytics/trackDownload',
  async (platform: 'ios' | 'android', { rejectWithValue }) => {
    try {
      const response = await fetch('/api/analytics/app-download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ platform }),
      });
      return await response.json();
    } catch (error) {
      return rejectWithValue('Failed to track download');
    }
  }
);

export const fetchDownloadStats = createAsyncThunk(
  'appAnalytics/fetchDownloadStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/analytics/download-stats');
      return await response.json();
    } catch (error) {
      return rejectWithValue('Failed to fetch download statistics');
    }
  }
);

const appAnalyticsSlice = createSlice({
  name: 'appAnalytics',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Track download
      .addCase(trackDownload.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(trackDownload.fulfilled, (state, action) => {
        state.loading = false;
        state.downloadStats = action.payload;
      })
      .addCase(trackDownload.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch download stats
      .addCase(fetchDownloadStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDownloadStats.fulfilled, (state, action) => {
        state.loading = false;
        state.downloadStats = action.payload;
      })
      .addCase(fetchDownloadStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Selectors
export const selectDownloadStats = (state: RootState) => state.appAnalytics.downloadStats;
export const selectAppAnalyticsLoading = (state: RootState) => state.appAnalytics.loading;
export const selectAppAnalyticsError = (state: RootState) => state.appAnalytics.error;

export default appAnalyticsSlice.reducer;
