import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { FileUpload } from '@/components/common/FileUpload';
import { updateTutorProfile } from '@/lib/api/tutor';
import { SUBJECTS, LANGUAGES, TEACHING_LEVELS } from '@/lib/constants';

const profileSchema = z.object({
  // 基本信息
  displayName: z.string().min(2).max(50),
  title: z.string().min(2).max(50),
  bio: z.string().min(50).max(1000),
  avatarUrl: z.string().url().optional(),
  videoIntro: z.string().url().optional(),
  
  // 教学信息
  subjects: z.array(z.string()).min(1),
  levels: z.array(z.string()).min(1),
  languages: z.array(z.string()).min(1),
  teachingStyle: z.string().min(50).max(500),
  
  // 价格设置
  pricing: z.object({
    hourlyRate: z.number().min(0),
    trialRate: z.number().min(0),
    groupRate: z.number().min(0),
    groupSize: z.number().min(2).max(10),
  }),
  
  // 时间安排
  availability: z.object({
    weekdays: z.array(z.number()),
    timeSlots: z.array(z.object({
      start: z.string(),
      end: z.string(),
    })),
    timezone: z.string(),
  }),
  
  // 其他设置
  preferences: z.object({
    instantBooking: z.boolean(),
    minimumNotice: z.number().min(1),
    cancellationPolicy: z.string(),
  }),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function TutorProfileForm({ initialData }: { initialData?: Partial<ProfileFormData> }) {
  const [activeTab, setActiveTab] = useState('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      ...initialData,
      pricing: {
        hourlyRate: 0,
        trialRate: 0,
        groupRate: 0,
        groupSize: 2,
        ...initialData?.pricing,
      },
      preferences: {
        instantBooking: false,
        minimumNotice: 24,
        cancellationPolicy: '24小时内取消课程将收取50%费用',
        ...initialData?.preferences,
      },
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setIsSubmitting(true);
      await updateTutorProfile(data);
      
      toast({
        title: '保存成功',
        description: '您的导师资料已更新',
      });
      
      router.push('/tutor/dashboard');
    } catch (error) {
      toast({
        title: '保存失败',
        description: '请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic">基本信息</TabsTrigger>
            <TabsTrigger value="teaching">教学信息</TabsTrigger>
            <TabsTrigger value="pricing">价格设置</TabsTrigger>
            <TabsTrigger value="schedule">时间安排</TabsTrigger>
            <TabsTrigger value="preferences">其他设置</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="displayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>显示名称</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          这是学生看到的您的名字
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>头衔</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          例如：资深英语教师、数学家等
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>个人简介</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          className="min-h-[200px]"
                        />
                      </FormControl>
                      <FormDescription>
                        详细介绍您的教学经验、风格和特点
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="avatarUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>头像</FormLabel>
                      <FormControl>
                        <FileUpload
                          value={field.value}
                          onChange={field.onChange}
                          accept="image/*"
                          maxSize={5 * 1024 * 1024}
                          folder="avatars"
                        />
                      </FormControl>
                      <FormDescription>
                        建议使用正面清晰的照片，大小不超过5MB
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="videoIntro"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>视频介绍</FormLabel>
                      <FormControl>
                        <FileUpload
                          value={field.value}
                          onChange={field.onChange}
                          accept="video/*"
                          maxSize={100 * 1024 * 1024}
                          folder="videos"
                        />
                      </FormControl>
                      <FormDescription>
                        上传一段简短的自我介绍视频，让学生更了解您
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="teaching" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <FormField
                  control={form.control}
                  name="subjects"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>教学科目</FormLabel>
                      <FormControl>
                        <Select
                          multiple
                          value={field.value}
                          onChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="选择科目" />
                          </SelectTrigger>
                          <SelectContent>
                            {SUBJECTS.map((subject) => (
                              <SelectItem key={subject.value} value={subject.value}>
                                {subject.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="levels"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>教学层次</FormLabel>
                      <FormControl>
                        <Select
                          multiple
                          value={field.value}
                          onChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="选择教学层次" />
                          </SelectTrigger>
                          <SelectContent>
                            {TEACHING_LEVELS.map((level) => (
                              <SelectItem key={level.value} value={level.value}>
                                {level.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="languages"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>教学语言</FormLabel>
                      <FormControl>
                        <Select
                          multiple
                          value={field.value}
                          onChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="选择语言" />
                          </SelectTrigger>
                          <SelectContent>
                            {LANGUAGES.map((language) => (
                              <SelectItem key={language.value} value={language.value}>
                                {language.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="teachingStyle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>教学风格</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          className="min-h-[150px]"
                        />
                      </FormControl>
                      <FormDescription>
                        描述您的教学方法和特色
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="pricing.hourlyRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>常规课时费（元/小时）</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="pricing.trialRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>试听课时费（元/小时）</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="pricing.groupRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>小组课时费（元/小时/人）</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="pricing.groupSize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>小组课最大人数</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <FormField
                  control={form.control}
                  name="availability.weekdays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>可教学时间</FormLabel>
                      <FormControl>
                        <div className="grid grid-cols-7 gap-2">
                          {['周日', '周一', '周二', '周三', '周四', '周五', '周六'].map((day, index) => (
                            <Button
                              key={index}
                              type="button"
                              variant={field.value?.includes(index) ? 'default' : 'outline'}
                              onClick={() => {
                                const newValue = field.value?.includes(index)
                                  ? field.value.filter((d) => d !== index)
                                  : [...(field.value || []), index];
                                field.onChange(newValue);
                              }}
                            >
                              {day}
                            </Button>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="availability.timeSlots"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>时间段</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          {field.value?.map((slot, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <Input
                                type="time"
                                value={slot.start}
                                onChange={(e) => {
                                  const newSlots = [...field.value];
                                  newSlots[index] = {
                                    ...slot,
                                    start: e.target.value,
                                  };
                                  field.onChange(newSlots);
                                }}
                              />
                              <span>至</span>
                              <Input
                                type="time"
                                value={slot.end}
                                onChange={(e) => {
                                  const newSlots = [...field.value];
                                  newSlots[index] = {
                                    ...slot,
                                    end: e.target.value,
                                  };
                                  field.onChange(newSlots);
                                }}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                onClick={() => {
                                  const newSlots = field.value.filter((_, i) => i !== index);
                                  field.onChange(newSlots);
                                }}
                              >
                                删除
                              </Button>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              field.onChange([
                                ...(field.value || []),
                                { start: '09:00', end: '18:00' },
                              ]);
                            }}
                          >
                            添加时间段
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="availability.timezone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>时区</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="选择时区" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Asia/Shanghai">中国标准时间 (UTC+8)</SelectItem>
                            <SelectItem value="America/Los_Angeles">太平洋时间 (UTC-8)</SelectItem>
                            <SelectItem value="America/New_York">东部时间 (UTC-5)</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <FormField
                  control={form.control}
                  name="preferences.instantBooking"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          即时预约
                        </FormLabel>
                        <FormDescription>
                          允许学生直接预约课程，无需您的确认
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="preferences.minimumNotice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>最短预约时间（小时）</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        学生需要提前多少小时预约课程
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="preferences.cancellationPolicy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>取消政策</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          className="min-h-[100px]"
                        />
                      </FormControl>
                      <FormDescription>
                        描述您的课程取消和退款政策
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              const currentIndex = ['basic', 'teaching', 'pricing', 'schedule', 'preferences'].indexOf(activeTab);
              if (currentIndex > 0) {
                setActiveTab(['basic', 'teaching', 'pricing', 'schedule', 'preferences'][currentIndex - 1]);
              }
            }}
            disabled={activeTab === 'basic'}
          >
            上一步
          </Button>

          <div className="space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              取消
            </Button>
            
            {activeTab === 'preferences' ? (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? '保存中...' : '保存'}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={() => {
                  const currentIndex = ['basic', 'teaching', 'pricing', 'schedule', 'preferences'].indexOf(activeTab);
                  if (currentIndex < 4) {
                    setActiveTab(['basic', 'teaching', 'pricing', 'schedule', 'preferences'][currentIndex + 1]);
                  }
                }}
              >
                下一步
              </Button>
            )}
          </div>
        </div>
      </form>
    </Form>
  );
}
