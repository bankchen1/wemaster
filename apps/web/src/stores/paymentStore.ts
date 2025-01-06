import { create } from 'zustand';
import { api } from '../lib/api';

interface PaymentStore {
  loading: boolean;
  error: string | null;
  currentOrder: any | null;
  paymentHistory: any[];
  createOrder: (orderData: any) => Promise<void>;
  processPayment: (paymentMethod: string) => Promise<void>;
  fetchPaymentHistory: () => Promise<any[]>;
  downloadInvoice: (recordId: string) => Promise<void>;
}

export const usePaymentStore = create<PaymentStore>((set, get) => ({
  loading: false,
  error: null,
  currentOrder: null,
  paymentHistory: [],

  createOrder: async (orderData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/orders', orderData);
      set({ currentOrder: response.data });
    } catch (error) {
      set({ error: '创建订单失败' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  processPayment: async (paymentMethod) => {
    const { currentOrder } = get();
    if (!currentOrder) {
      throw new Error('No current order');
    }

    set({ loading: true, error: null });
    try {
      const response = await api.post('/payments', {
        orderId: currentOrder.id,
        paymentMethod,
      });

      if (response.data.redirectUrl) {
        window.location.href = response.data.redirectUrl;
      }
    } catch (error) {
      set({ error: '支付处理失败' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  fetchPaymentHistory: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/payments/history');
      set({ paymentHistory: response.data });
      return response.data;
    } catch (error) {
      set({ error: '获取支付记录失败' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  downloadInvoice: async (recordId) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/payments/${recordId}/invoice`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${recordId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      set({ error: '下载发票失败' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
