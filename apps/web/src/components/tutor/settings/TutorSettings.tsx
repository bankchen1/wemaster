import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { TutorProfileForm } from '../onboarding/TutorOnboardingForm';
import { ScheduleEditor } from '../schedule/ScheduleEditor';
import { updateTutorProfile } from '@/lib/api/tutor';

export function TutorSettings() {
  const [activeTab, setActiveTab] = useState('profile');
  const { toast } = useToast();

  const handleProfileUpdate = async (data: any) => {
    try {
      await updateTutorProfile(data);
      toast({
        title: '更新成功',
        description: '您的导师资料已更新',
      });
    } catch (error) {
      toast({
        title: '更新失败',
        description: '请稍后重试',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">导师设置</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="profile">基本资料</TabsTrigger>
          <TabsTrigger value="schedule">时间设置</TabsTrigger>
          <TabsTrigger value="pricing">价格设置</TabsTrigger>
          <TabsTrigger value="notifications">通知设置</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="profile">
            <Card className="p-6">
              <TutorProfileForm
                mode="edit"
                onSubmit={handleProfileUpdate}
              />
            </Card>
          </TabsContent>

          <TabsContent value="schedule">
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">可用时间设置</h2>
                  <Button variant="outline" onClick={() => {}}>
                    批量设置
                  </Button>
                </div>

                <ScheduleEditor
                  onChange={(schedule) => {
                    handleProfileUpdate({ availability: schedule });
                  }}
                />

                <div className="text-sm text-muted-foreground">
                  <h3 className="font-medium mb-2">说明：</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>点击时间格子可以设置或取消可用时间</li>
                    <li>绿色表示可预约时间段</li>
                    <li>学生预约后对应时间段将被锁定</li>
                    <li>建议提前至少一周设置可用时间</li>
                  </ul>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="pricing">
            <Card className="p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">价格设置</h2>
                </div>

                <div className="space-y-4">
                  {/* 试课设置 */}
                  <div>
                    <h3 className="text-md font-medium mb-2">试课设置</h3>
                    {/* 试课表单组件 */}
                  </div>

                  {/* 基础课程价格 */}
                  <div>
                    <h3 className="text-md font-medium mb-2">基础课程价格</h3>
                    {/* 基础课程价格表单组件 */}
                  </div>

                  {/* 套餐折扣 */}
                  <div>
                    <h3 className="text-md font-medium mb-2">套餐折扣</h3>
                    {/* 套餐折扣表单组件 */}
                  </div>
                </div>

                <Button onClick={() => {}}>保存价格设置</Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card className="p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">通知设置</h2>
                </div>

                {/* 通知设置选项 */}
                <div className="space-y-4">
                  {/* 预约通知 */}
                  <div>
                    <h3 className="text-md font-medium mb-2">预约通知</h3>
                    {/* 预约通知设置 */}
                  </div>

                  {/* 课程提醒 */}
                  <div>
                    <h3 className="text-md font-medium mb-2">课程提醒</h3>
                    {/* 课程提醒设置 */}
                  </div>

                  {/* 系统通知 */}
                  <div>
                    <h3 className="text-md font-medium mb-2">系统通知</h3>
                    {/* 系统通知设置 */}
                  </div>
                </div>

                <Button onClick={() => {}}>保存通知设置</Button>
              </div>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
