import { renderHook, act } from '@testing-library/react';
import { usePaymentStore } from './usePaymentStore';

describe('usePaymentStore', () => {
  beforeEach(() => {
    act(() => {
      usePaymentStore.getState().reset();
    });
  });

  describe('payment management', () => {
    const mockPayment = {
      id: 'payment-1',
      amount: 10000,
      status: 'pending' as const,
      createdAt: new Date(),
    };

    it('should set payments', () => {
      const { result } = renderHook(() => usePaymentStore());

      act(() => {
        result.current.setPayments([mockPayment]);
      });

      expect(result.current.payments).toHaveLength(1);
      expect(result.current.payments[0]).toEqual(mockPayment);
    });

    it('should add payment', () => {
      const { result } = renderHook(() => usePaymentStore());

      act(() => {
        result.current.addPayment(mockPayment);
      });

      expect(result.current.payments).toHaveLength(1);
      expect(result.current.payments[0]).toEqual(mockPayment);
    });

    it('should update payment', () => {
      const { result } = renderHook(() => usePaymentStore());

      act(() => {
        result.current.addPayment(mockPayment);
        result.current.updatePayment('payment-1', { status: 'succeeded' });
      });

      expect(result.current.payments[0].status).toBe('succeeded');
    });
  });

  describe('withdrawal management', () => {
    const mockWithdrawal = {
      id: 'withdrawal-1',
      amount: 5000,
      status: 'pending' as const,
      createdAt: new Date(),
    };

    it('should set withdrawals', () => {
      const { result } = renderHook(() => usePaymentStore());

      act(() => {
        result.current.setWithdrawals([mockWithdrawal]);
      });

      expect(result.current.withdrawals).toHaveLength(1);
      expect(result.current.withdrawals[0]).toEqual(mockWithdrawal);
    });

    it('should add withdrawal', () => {
      const { result } = renderHook(() => usePaymentStore());

      act(() => {
        result.current.addWithdrawal(mockWithdrawal);
      });

      expect(result.current.withdrawals).toHaveLength(1);
      expect(result.current.withdrawals[0]).toEqual(mockWithdrawal);
    });

    it('should update withdrawal', () => {
      const { result } = renderHook(() => usePaymentStore());

      act(() => {
        result.current.addWithdrawal(mockWithdrawal);
        result.current.updateWithdrawal('withdrawal-1', { status: 'succeeded' });
      });

      expect(result.current.withdrawals[0].status).toBe('succeeded');
    });
  });

  describe('stats management', () => {
    const mockStats = {
      totalEarnings: 50000,
      totalWithdrawn: 20000,
      balance: 30000,
      paymentsCount: 5,
      withdrawalsCount: 2,
    };

    it('should set stats', () => {
      const { result } = renderHook(() => usePaymentStore());

      act(() => {
        result.current.setStats(mockStats);
      });

      expect(result.current.stats).toEqual(mockStats);
    });
  });

  describe('Stripe account status management', () => {
    const mockStatus = {
      status: 'verified' as const,
      payoutSchedule: 'weekly' as const,
      requirements: {},
      payoutsEnabled: true,
    };

    it('should set Stripe account status', () => {
      const { result } = renderHook(() => usePaymentStore());

      act(() => {
        result.current.setStripeAccountStatus(mockStatus);
      });

      expect(result.current.stripeAccountStatus).toEqual(mockStatus);
    });
  });

  describe('loading and error states', () => {
    it('should set loading state', () => {
      const { result } = renderHook(() => usePaymentStore());

      act(() => {
        result.current.setLoading(true);
      });

      expect(result.current.loading).toBe(true);
    });

    it('should set error state', () => {
      const { result } = renderHook(() => usePaymentStore());
      const error = new Error('Test error');

      act(() => {
        result.current.setError(error);
      });

      expect(result.current.error).toBe(error);
    });
  });

  describe('store reset', () => {
    it('should reset store to initial state', () => {
      const { result } = renderHook(() => usePaymentStore());

      act(() => {
        result.current.addPayment({
          id: 'payment-1',
          amount: 10000,
          status: 'pending',
          createdAt: new Date(),
        });
        result.current.setLoading(true);
        result.current.setError(new Error('Test error'));
        result.current.reset();
      });

      expect(result.current.payments).toHaveLength(0);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });
});
