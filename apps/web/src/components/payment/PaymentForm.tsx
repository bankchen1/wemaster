import { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

interface PaymentFormProps {
  amount: number;
  currency: string;
  onSuccess: (paymentIntent: any) => void;
  onError: (error: Error) => void;
}

export function PaymentForm({
  amount,
  currency,
  onSuccess,
  onError,
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        toast({
          title: '支付失败',
          description: error.message,
          variant: 'destructive',
        });
        onError(error);
      } else if (paymentIntent) {
        toast({
          title: '支付成功',
          description: '您的预约已确认',
        });
        onSuccess(paymentIntent);
      }
    } catch (error) {
      toast({
        title: '支付失败',
        description: '请稍后重试',
        variant: 'destructive',
      });
      onError(error as Error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="text-lg font-medium">支付详情</div>
        <div className="text-sm text-muted-foreground">
          金额：{(amount / 100).toFixed(2)} {currency.toUpperCase()}
        </div>
      </div>

      <PaymentElement />

      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            处理中...
          </>
        ) : (
          `支付 ${(amount / 100).toFixed(2)} ${currency.toUpperCase()}`
        )}
      </Button>
    </form>
  );
}
