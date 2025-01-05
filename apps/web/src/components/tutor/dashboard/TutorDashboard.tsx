import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { getTutorDashboardStats } from '@/lib/api/tutor';

const COLORS = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444'];

export function TutorDashboard() {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('week');

  const { data: stats, isLoading } = useQuery(
    ['tutorStats', period],
    () => getTutorDashboardStats(period),
    {
      refetchInterval: 5 * 60 * 1000, // 每5分钟刷新一次
    }
  );

  if (isLoading || !stats) {
    return <div>加载中...</div>;
  }

  return (
    <div className="space-y-6">
      {/* 时间范围选择 */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">数据统计</h2>
        <Select value={period} onValueChange={(value: any) => setPeriod(value)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">本周</SelectItem>
            <SelectItem value="month">本月</SelectItem>
            <SelectItem value="year">本年</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 核心数据卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">总收入</div>
          <div className="text-2xl font-bold">¥{stats.income.total.toFixed(2)}</div>
          <div className="text-sm text-muted-foreground">
            平均每课时 ¥{stats.income.average.toFixed(2)}
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-sm text-muted-foreground">课程数据</div>
          <div className="text-2xl font-bold">{stats.bookings.completed}</div>
          <div className="text-sm text-muted-foreground">
            完课率 {stats.bookings.completionRate.toFixed(1)}%
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-sm text-muted-foreground">学生数量</div>
          <div className="text-2xl font-bold">{stats.students.total}</div>
          <div className="text-sm text-muted-foreground">
            新增 {stats.students.new} 人
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-sm text-muted-foreground">评价</div>
          <div className="text-2xl font-bold">
            {stats.reviews.averageRating.toFixed(1)}
          </div>
          <div className="text-sm text-muted-foreground">
            共 {stats.reviews.total} 条评价
          </div>
        </Card>
      </div>

      {/* 详细数据分析 */}
      <Tabs defaultValue="time">
        <TabsList>
          <TabsTrigger value="time">时段分布</TabsTrigger>
          <TabsTrigger value="subjects">热门科目</TabsTrigger>
          <TabsTrigger value="performance">教学表现</TabsTrigger>
        </TabsList>

        <TabsContent value="time" className="mt-4">
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">课程时段分布</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.timeDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#4f46e5" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="subjects" className="mt-4">
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">热门科目分布</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.popularSubjects}
                    dataKey="count"
                    nameKey="subject"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {stats.popularSubjects.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="mt-4">
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">教学表现指标</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">响应时间</div>
                  <div className="text-xl font-semibold">
                    {stats.performance.responseTime.toFixed(1)} 分钟
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">响应率</div>
                  <div className="text-xl font-semibold">
                    {stats.performance.responseRate.toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">预约转化率</div>
                  <div className="text-xl font-semibold">
                    {stats.performance.bookingRate.toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">学生复购率</div>
                  <div className="text-xl font-semibold">
                    {((stats.students.returning / stats.students.total) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 数据说明 */}
      <Card className="p-4 bg-muted/50">
        <h4 className="font-semibold mb-2">数据说明</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• 收入数据为实际到账金额，已扣除平台服务费</li>
          <li>• 响应时间统计仅计算工作时间内的响应</li>
          <li>• 学生数量统计为有过上课记录的真实学生数</li>
          <li>• 时段分布基于北京时间统计</li>
        </ul>
      </Card>
    </div>
  );
}
