import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WithdrawalForm } from './WithdrawalForm';
import { usePaymentStore } from '../../stores/usePaymentStore';

describe('WithdrawalForm', () => {
  beforeEach(() => {
    usePaymentStore.getState().reset();
    usePaymentStore.setState({
      stats: {
        totalEarnings: 100000,
        totalWithdrawn: 50000,
        balance: 50000,
        paymentsCount: 10,
        withdrawalsCount: 5,
      },
    });
  });

  it('should show account setup button for unverified users', async () => {
    render(<WithdrawalForm />);

    expect(
      screen.getByRole('button', { name: /设置提现账户/i }),
    ).toBeInTheDocument();

    const setupButton = screen.getByRole('button', { name: /设置提现账户/i });
    await userEvent.click(setupButton);

    await waitFor(() => {
      expect(window.location.href).toContain('connect.stripe.com');
    });
  });

  it('should show withdrawal form for verified users', async () => {
    usePaymentStore.setState({
      account: {
        stripeAccountId: 'acct_123',
        status: 'verified',
      },
    });

    render(<WithdrawalForm />);

    expect(screen.getByText(/可提现余额/i)).toBeInTheDocument();
    expect(screen.getByText(/¥500.00/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /提现/i })).toBeInTheDocument();
  });

  it('should handle successful withdrawal', async () => {
    usePaymentStore.setState({
      account: {
        stripeAccountId: 'acct_123',
        status: 'verified',
      },
    });

    render(<WithdrawalForm />);

    const amountInput = screen.getByLabelText(/提现金额/i);
    await userEvent.type(amountInput, '100');

    const submitButton = screen.getByRole('button', { name: /提现/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/提现申请已提交/i)).toBeInTheDocument();
    });
  });

  it('should show error for invalid amount', async () => {
    usePaymentStore.setState({
      account: {
        stripeAccountId: 'acct_123',
        status: 'verified',
      },
    });

    render(<WithdrawalForm />);

    const amountInput = screen.getByLabelText(/提现金额/i);
    await userEvent.type(amountInput, '1000000');

    const submitButton = screen.getByRole('button', { name: /提现/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/余额不足/i)).toBeInTheDocument();
    });
  });

  it('should disable submit button while processing', async () => {
    usePaymentStore.setState({
      account: {
        stripeAccountId: 'acct_123',
        status: 'verified',
      },
    });

    render(<WithdrawalForm />);

    const amountInput = screen.getByLabelText(/提现金额/i);
    await userEvent.type(amountInput, '100');

    const submitButton = screen.getByRole('button', { name: /提现/i });
    await userEvent.click(submitButton);

    expect(submitButton).toBeDisabled();
    expect(screen.getByText(/处理中/i)).toBeInTheDocument();
  });

  it('should show withdrawal history', async () => {
    usePaymentStore.setState({
      account: {
        stripeAccountId: 'acct_123',
        status: 'verified',
      },
      withdrawals: [
        {
          id: 'withdrawal-1',
          amount: 10000,
          status: 'completed',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'withdrawal-2',
          amount: 20000,
          status: 'pending',
          createdAt: new Date().toISOString(),
        },
      ],
    });

    render(<WithdrawalForm />);

    expect(screen.getByText(/提现记录/i)).toBeInTheDocument();
    expect(screen.getByText(/¥100.00/)).toBeInTheDocument();
    expect(screen.getByText(/¥200.00/)).toBeInTheDocument();
    expect(screen.getByText(/已完成/i)).toBeInTheDocument();
    expect(screen.getByText(/处理中/i)).toBeInTheDocument();
  });
});
