import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { createTutorApplication } from '@/lib/api/tutors';

const basicInfoSchema = z.object({
  name: z.string().min(2, '姓名至少2个字符'),
  title: z.string().min(2, '职称至少2个字符'),
  introduction: z.string().min(50, '自我介绍至少50个字符'),
  languages: z.array(z.string()).min(1, '至少选择一种语言'),
});

const educationSchema = z.object({
  education: z.array(z.object({
    degree: z.string(),
    school: z.string(),
    major: z.string(),
    graduationYear: z.number(),
  })).min(1, '至少添加一条教育经历'),
});

const certificatesSchema = z.object({
  certificates: z.array(z.object({
    name: z.string(),
    issuer: z.string(),
    date: z.date(),
    file: z.string(),
  })),
});

const experienceSchema = z.object({
  experience: z.array(z.object({
    title: z.string(),
    company: z.string(),
    startDate: z.date(),
    endDate: z.date().optional(),
    description: z.string(),
  })).min(1, '至少添加一条工作经历'),
});

const pricingSchema = z.object({
  pricing: z.object({
    regular: z.object({
      price: z.number().min(0),
      duration: z.number().min(30),
    }),
    trial: z.object({
      price: z.number().min(0),
      duration: z.number().min(30),
    }),
    group: z.object({
      price: z.number().min(0),
      duration: z.number().min(30),
      minStudents: z.number().min(2),
      maxStudents: z.number().min(2),
    }),
  }),
});

const availabilitySchema = z.object({
  availability: z.object({
    workingDays: z.array(z.number()).min(1, '至少选择一个工作日'),
    workingHours: z.object({
      start: z.string(),
      end: z.string(),
    }),
  }),
});

const formSchema = z.object({
  ...basicInfoSchema.shape,
  ...educationSchema.shape,
  ...certificatesSchema.shape,
  ...experienceSchema.shape,
  ...pricingSchema.shape,
  ...availabilitySchema.shape,
});

type FormValues = z.infer<typeof formSchema>;

const STEPS = [
  { id: 'basic', label: '基本信息' },
  { id: 'education', label: '教育背景' },
  { id: 'certificates', label: '证书资质' },
  { id: 'experience', label: '工作经历' },
  { id: 'pricing', label: '课程定价' },
  { id: 'availability', label: '时间安排' },
];

export function OnboardingForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const { toast } = useToast();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      languages: [],
      education: [{ degree: '', school: '', major: '', graduationYear: 0 }],
      certificates: [],
      experience: [{ title: '', company: '', description: '', startDate: new Date() }],
      pricing: {
        regular: { price: 0, duration: 60 },
        trial: { price: 0, duration: 30 },
        group: { price: 0, duration: 60, minStudents: 2, maxStudents: 6 },
      },
      availability: {
        workingDays: [],
        workingHours: { start: '09:00', end: '18:00' },
      },
    },
  });

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const onSubmit = async (data: FormValues) => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      return;
    }

    try {
      await createTutorApplication(data);
      toast({
        title: '申请提交成功',
        description: '我们会尽快审核您的申请，请留意邮件通知',
      });
    } catch (error) {
      console.error('Failed to submit application:', error);
      toast({
        title: '提交失败',
        description: '请稍后重试',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">成为导师</h1>
        <p className="text-gray-500">
          请填写以下信息，完成导师入驻申请
        </p>
      </div>

      <div className="mb-8">
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between mt-2 text-sm text-gray-500">
          <span>当前步骤: {STEPS[currentStep].label}</span>
          <span>{currentStep + 1} / {STEPS.length}</span>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Tabs value={STEPS[currentStep].id} className="space-y-8">
            <TabsContent value="basic">
              <Card className="p-6">
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>姓名</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>职称</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="introduction"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>自我介绍</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </Card>
            </TabsContent>

            {/* 其他步骤的表单内容... */}
          </Tabs>

          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
            >
              上一步
            </Button>
            <Button type="submit">
              {currentStep === STEPS.length - 1 ? '提交申请' : '下一步'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
