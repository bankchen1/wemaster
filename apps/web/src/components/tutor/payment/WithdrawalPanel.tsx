import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { getAccountBalance, createWithdrawal } from '@/lib/api/tutor';

export function WithdrawalPanel() {
  const { toast } = useToast();
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [confirmDialog, setConfirmDialog] = useState(false);

  // 获取账户余额
  const { data: balance, isLoading: isLoadingBalance } = useQuery(
    ['tutorBalance'],
    getAccountBalance,
    {
      refetchInterval: 30000, // 每30秒刷新一次
    }
  );

  // 提现操作
  const withdrawalMutation = useMutation(createWithdrawal, {
    onSuccess: () => {
      toast({
        title: '提现申请已提交',
        description: '资金将在1-3个工作日内到账',
      });
      setConfirmDialog(false);
      setWithdrawalAmount('');
    },
    onError: (error: Error) => {
      toast({
        title: '提现失败',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawalAmount) * 100; // 转换为分
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: '无效金额',
        description: '请输入有效的提现金额',
        variant: 'destructive',
      });
      return;
    }

    if (amount > (balance?.available?.[0]?.amount || 0)) {
      toast({
        title: '余额不足',
        description: '提现金额不能超过可用余额',
        variant: 'destructive',
      });
      return;
    }

    withdrawalMutation.mutate({ amount });
  };

  if (isLoadingBalance) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 余额卡片 */}
      <Card className="p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">账户余额</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">可用余额</div>
              <div className="text-2xl font-bold">
                {((balance?.available?.[0]?.amount || 0) / 100).toFixed(2)}{' '}
                {balance?.available?.[0]?.currency.toUpperCase()}
              </div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground">待结算</div>
              <div className="text-2xl font-bold">
                {((balance?.pending?.[0]?.amount || 0) / 100).toFixed(2)}{' '}
                {balance?.pending?.[0]?.currency.toUpperCase()}
              </div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground">已提现总额</div>
              <div className="text-2xl font-bold">
                {((balance?.withdrawals_total || 0) / 100).toFixed(2)}{' '}
                {balance?.available?.[0]?.currency.toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 提现操作 */}
      <Card className="p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">申请提现</h3>
          
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">提现金额</div>
            <div className="flex space-x-4">
              <Input
                type="number"
                value={withdrawalAmount}
                onChange={(e) => setWithdrawalAmount(e.target.value)}
                placeholder="输入提现金额"
                className="w-48"
              />
              <Button
                onClick={() => setConfirmDialog(true)}
                disabled={!withdrawalAmount || withdrawalMutation.isLoading}
              >
                {withdrawalMutation.isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    处理中
                  </>
                ) : (
                  '申请提现'
                )}
              </Button>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            <ul className="list-disc list-inside space-y-1">
              <li>最低提现金额：50.00 USD</li>
              <li>提现将在1-3个工作日内到账</li>
              <li>请确保您的银行账户信息正确</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* 确认对话框 */}
      <Dialog open={confirmDialog} onOpenChange={setConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认提现</DialogTitle>
            <DialogDescription>
              请确认以下提现信息
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex justify-between">
              <span>提现金额</span>
              <span className="font-medium">
                {withdrawalAmount} {balance?.available?.[0]?.currency.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between">
              <span>手续费</span>
              <span className="font-medium">0.00 USD</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span>实际到账</span>
              <span className="font-medium">
                {withdrawalAmount} {balance?.available?.[0]?.currency.toUpperCase()}
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDialog(false)}
            >
              取消
            </Button>
            <Button onClick={handleWithdraw}>
              确认提现
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
