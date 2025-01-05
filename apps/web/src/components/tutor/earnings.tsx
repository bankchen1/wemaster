import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { DollarSign, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react'

export function TutorEarnings({ tutorId }: { tutorId: string }) {
  const [timeRange, setTimeRange] = useState('month')

  // TODO: 从API获取收益数据
  const earnings = {
    summary: {
      total: 12800,
      pending: 2400,
      available: 10400,
      lastMonth: 8600,
      growth: 48.84,
      teachingHours: 64
    },
    chart: {
      month: [
        { date: '12-01', amount: 400 },
        { date: '12-05', amount: 800 },
        { date: '12-10', amount: 1200 },
        { date: '12-15', amount: 2000 },
        { date: '12-20', amount: 2800 },
        { date: '12-25', amount: 3200 },
        { date: '12-31', amount: 3600 }
      ]
    },
    transactions: [
      {
        id: '1',
        date: '2025-01-03',
        student: '张同学',
        course: '商务英语口语',
        amount: 200,
        status: 'completed'
      },
      {
        id: '2',
        date: '2025-01-02',
        student: '李同学',
        course: '雅思备考',
        amount: 250,
        status: 'pending'
      }
    ]
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">收益统计</h2>
        <Select
          value={timeRange}
          onValueChange={(value) => setTimeRange(value)}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="选择时间范围" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">本周</SelectItem>
            <SelectItem value="month">本月</SelectItem>
            <SelectItem value="year">今年</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 收益概览 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">总收益</p>
              <h3 className="text-2xl font-bold mt-1">¥{earnings.summary.total}</h3>
            </div>
            <div
              className={cn(
                'flex items-center text-sm',
                earnings.summary.growth > 0
                  ? 'text-green-500'
                  : 'text-red-500'
              )}
            >
              {earnings.summary.growth > 0 ? (
                <ArrowUpRight className="h-4 w-4" />
              ) : (
                <ArrowDownRight className="h-4 w-4" />
              )}
              {Math.abs(earnings.summary.growth)}%
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            共{earnings.summary.teachingHours}课时
          </div>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-muted-foreground">待结算</p>
          <h3 className="text-2xl font-bold mt-1">¥{earnings.summary.pending}</h3>
          <p className="text-sm text-muted-foreground mt-4">
            完课后7天自动结算
          </p>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-muted-foreground">可提现</p>
          <h3 className="text-2xl font-bold mt-1">¥{earnings.summary.available}</h3>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full mt-4" size="sm">
                申请提现
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>申请提现</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">可提现金额</p>
                  <p className="text-2xl font-bold">¥{earnings.summary.available}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">提现金额</label>
                  <Input
                    type="number"
                    placeholder="输入提现金额"
                    max={earnings.summary.available}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">提现方式</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="选择提现方式" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alipay">支付宝</SelectItem>
                      <SelectItem value="wechat">微信</SelectItem>
                      <SelectItem value="bank">银行卡</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full">确认提现</Button>
              </div>
            </DialogContent>
          </Dialog>
        </Card>
      </div>

      {/* 收益趋势图 */}
      <Card className="p-4 mb-8">
        <h3 className="font-medium mb-4">收益趋势</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={earnings.chart[timeRange]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#2563eb"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* 交易记录 */}
      <div>
        <h3 className="font-medium mb-4">交易记录</h3>
        <div className="space-y-4">
          {earnings.transactions.map((transaction) => (
            <Card key={transaction.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{transaction.student}</span>
                    <span className="text-sm text-muted-foreground">
                      {transaction.course}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {transaction.date}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">¥{transaction.amount}</p>
                  <p
                    className={cn(
                      'text-sm',
                      transaction.status === 'completed'
                        ? 'text-green-500'
                        : 'text-amber-500'
                    )}
                  >
                    {transaction.status === 'completed' ? '已结算' : '待结算'}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Card>
  )
}
