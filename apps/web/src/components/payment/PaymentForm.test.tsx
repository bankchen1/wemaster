import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PaymentForm } from './PaymentForm';
import { usePaymentStore } from '../../stores/usePaymentStore';

// Mock Stripe Elements
jest.mock('@stripe/stripe-js', () => ({
  loadStripe: jest.fn(() => Promise.resolve({})),
}));

jest.mock('@stripe/react-stripe-js', () => ({
  Elements: ({ children }: { children: React.ReactNode }) => children,
  CardElement: () => null,
  useStripe: () => ({
    confirmCardPayment: jest.fn(() => Promise.resolve({ paymentIntent: { status: 'succeeded' } })),
  }),
  useElements: () => ({
    getElement: jest.fn(),
  }),
}));

describe('PaymentForm', () => {
  const mockBooking = {
    id: 'booking-123',
    price: 10000,
    tutorId: 'tutor-123',
    studentId: 'student-123',
  };

  beforeEach(() => {
    usePaymentStore.getState().reset();
  });

  it('should create payment intent and show card form', async () => {
    render(<PaymentForm booking={mockBooking} />);

    await waitFor(() => {
      const clientSecret = usePaymentStore.getState().clientSecret;
      expect(clientSecret).toBe('pi_123_secret_456');
    });

    expect(screen.getByText(/¥100.00/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /支付/i })).toBeInTheDocument();
  });

  it('should handle successful payment', async () => {
    const onSuccess = jest.fn();
    render(<PaymentForm booking={mockBooking} onSuccess={onSuccess} />);

    const submitButton = await screen.findByRole('button', { name: /支付/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('should show error message on payment failure', async () => {
    // Mock Stripe error
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const mockStripe = {
      confirmCardPayment: jest.fn(() =>
        Promise.reject(new Error('Your card was declined')),
      ),
    };
    jest
      .spyOn(require('@stripe/react-stripe-js'), 'useStripe')
      .mockImplementation(() => mockStripe);

    render(<PaymentForm booking={mockBooking} />);

    const submitButton = await screen.findByRole('button', { name: /支付/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/支付失败/i)).toBeInTheDocument();
    });
  });

  it('should disable submit button while processing', async () => {
    render(<PaymentForm booking={mockBooking} />);

    const submitButton = await screen.findByRole('button', { name: /支付/i });
    await userEvent.click(submitButton);

    expect(submitButton).toBeDisabled();
    expect(screen.getByText(/处理中/i)).toBeInTheDocument();
  });
});
