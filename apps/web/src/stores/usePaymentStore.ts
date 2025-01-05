import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { devtools } from 'zustand/middleware';

interface Payment {
  id: string;
  amount: number;
  status: 'pending' | 'succeeded' | 'failed';
  createdAt: Date;
}

interface Withdrawal {
  id: string;
  amount: number;
  status: 'pending' | 'succeeded' | 'failed';
  createdAt: Date;
}

interface PaymentStats {
  totalEarnings: number;
  totalWithdrawn: number;
  balance: number;
  paymentsCount: number;
  withdrawalsCount: number;
}

interface PaymentState {
  payments: Payment[];
  withdrawals: Withdrawal[];
  stats: PaymentStats | null;
  stripeAccountStatus: {
    status: 'pending_verification' | 'verified' | 'rejected';
    payoutSchedule: 'daily' | 'weekly' | 'monthly';
    requirements: any;
    payoutsEnabled: boolean;
  } | null;
  loading: boolean;
  error: Error | null;
}

interface PaymentActions {
  setPayments: (payments: Payment[]) => void;
  addPayment: (payment: Payment) => void;
  updatePayment: (id: string, update: Partial<Payment>) => void;
  setWithdrawals: (withdrawals: Withdrawal[]) => void;
  addWithdrawal: (withdrawal: Withdrawal) => void;
  updateWithdrawal: (id: string, update: Partial<Withdrawal>) => void;
  setStats: (stats: PaymentStats) => void;
  setStripeAccountStatus: (status: PaymentState['stripeAccountStatus']) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
  reset: () => void;
}

const initialState: PaymentState = {
  payments: [],
  withdrawals: [],
  stats: null,
  stripeAccountStatus: null,
  loading: false,
  error: null,
};

export const usePaymentStore = create<PaymentState & PaymentActions>()(
  devtools(
    immer((set) => ({
      ...initialState,

      setPayments: (payments) =>
        set((state) => {
          state.payments = payments;
        }),

      addPayment: (payment) =>
        set((state) => {
          state.payments.unshift(payment);
        }),

      updatePayment: (id, update) =>
        set((state) => {
          const index = state.payments.findIndex((p) => p.id === id);
          if (index !== -1) {
            state.payments[index] = { ...state.payments[index], ...update };
          }
        }),

      setWithdrawals: (withdrawals) =>
        set((state) => {
          state.withdrawals = withdrawals;
        }),

      addWithdrawal: (withdrawal) =>
        set((state) => {
          state.withdrawals.unshift(withdrawal);
        }),

      updateWithdrawal: (id, update) =>
        set((state) => {
          const index = state.withdrawals.findIndex((w) => w.id === id);
          if (index !== -1) {
            state.withdrawals[index] = { ...state.withdrawals[index], ...update };
          }
        }),

      setStats: (stats) =>
        set((state) => {
          state.stats = stats;
        }),

      setStripeAccountStatus: (status) =>
        set((state) => {
          state.stripeAccountStatus = status;
        }),

      setLoading: (loading) =>
        set((state) => {
          state.loading = loading;
        }),

      setError: (error) =>
        set((state) => {
          state.error = error;
        }),

      reset: () => set(initialState),
    })),
  ),
);
