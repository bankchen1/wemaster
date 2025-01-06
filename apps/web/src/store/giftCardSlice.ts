import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';

interface GiftCard {
  id: string;
  code: string;
  amount: number;
  balance: number;
  expiryDate: string;
  isActive: boolean;
  recipientEmail?: string;
  senderEmail?: string;
  message?: string;
  purchaseDate: string;
  activationDate?: string;
}

interface TransferRequest {
  cardId: string;
  recipientEmail: string;
  message?: string;
}

interface GiftCardState {
  cards: GiftCard[];
  loading: boolean;
  error: string | null;
  selectedCard: GiftCard | null;
}

const initialState: GiftCardState = {
  cards: [],
  loading: false,
  error: null,
  selectedCard: null,
};

// Async thunks
export const fetchUserGiftCards = createAsyncThunk(
  'giftCard/fetchUserGiftCards',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/gift-cards');
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue('Failed to fetch gift cards');
    }
  }
);

export const purchaseGiftCard = createAsyncThunk(
  'giftCard/purchaseGiftCard',
  async (data: { amount: number; recipientEmail?: string; message?: string }, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/gift-cards/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      return rejectWithValue('Failed to purchase gift card');
    }
  }
);

export const transferGiftCard = createAsyncThunk(
  'giftCard/transferGiftCard',
  async (data: TransferRequest, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/gift-cards/${data.cardId}/transfer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientEmail: data.recipientEmail,
          message: data.message,
        }),
      });
      return await response.json();
    } catch (error) {
      return rejectWithValue('Failed to transfer gift card');
    }
  }
);

export const activateGiftCard = createAsyncThunk(
  'giftCard/activateGiftCard',
  async (code: string, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/gift-cards/activate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });
      return await response.json();
    } catch (error) {
      return rejectWithValue('Failed to activate gift card');
    }
  }
);

const giftCardSlice = createSlice({
  name: 'giftCard',
  initialState,
  reducers: {
    selectCard: (state, action: PayloadAction<string>) => {
      state.selectedCard = state.cards.find(card => card.id === action.payload) || null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch gift cards
      .addCase(fetchUserGiftCards.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserGiftCards.fulfilled, (state, action) => {
        state.loading = false;
        state.cards = action.payload;
      })
      .addCase(fetchUserGiftCards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Purchase gift card
      .addCase(purchaseGiftCard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(purchaseGiftCard.fulfilled, (state, action) => {
        state.loading = false;
        state.cards.push(action.payload);
      })
      .addCase(purchaseGiftCard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Transfer gift card
      .addCase(transferGiftCard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(transferGiftCard.fulfilled, (state, action) => {
        state.loading = false;
        state.cards = state.cards.filter(card => card.id !== action.payload.id);
      })
      .addCase(transferGiftCard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Activate gift card
      .addCase(activateGiftCard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(activateGiftCard.fulfilled, (state, action) => {
        state.loading = false;
        state.cards.push(action.payload);
      })
      .addCase(activateGiftCard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { selectCard, clearError } = giftCardSlice.actions;

// Selectors
export const selectGiftCards = (state: RootState) => state.giftCard.cards;
export const selectGiftCardLoading = (state: RootState) => state.giftCard.loading;
export const selectGiftCardError = (state: RootState) => state.giftCard.error;
export const selectSelectedGiftCard = (state: RootState) => state.giftCard.selectedCard;

export default giftCardSlice.reducer;
