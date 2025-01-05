import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileUploader } from '@/components/shared/file-uploader'
import { Progress } from '@/components/ui/progress'
import { CheckCircle2, AlertCircle } from 'lucide-react'

const applicationSchema = z.object({
  // 基本信息
  fullName: z.string().min(2, '姓名至少2个字符'),
  email: z.string().email('请输入有效的邮箱地址'),
  phone: z.string().min(6, '请输入有效的电话号码'),
  country: z.string().min(1, '请选择国家/地区'),
  languages: z.array(z.string()).min(1, '请至少选择一种语言'),
  
  // 教学信息
  subjects: z.array(z.string()).min(1, '请至少选择一个教学科目'),
  teachingExperience: z.string().min(50, '请详细描述您的教学经验'),
  education: z.object({
    degree: z.string(),
    school: z.string(),
    major: z.string(),
    graduationYear: z.number()
  }),
  
  // 课程设置
  hourlyRate: z.object({
    regular: z.number().min(1, '请设置常规课时费'),
    trial: z.number().min(0, '试课费用不能为负')
  }),
  trialDuration: z.number().min(15, '试课时长最少15分钟'),
  availability: z.array(z.object({
    day: z.string(),
    timeSlots: z.array(z.object({
      start: z.string(),
      end: z.string()
    }))
  })),
  
  // 资质认证
  certificates: z.array(z.object({
    name: z.string(),
    issuer: z.string(),
    date: z.string(),
    file: z.string() // 文件URL
  })),
  
  // 展示资料
  avatar: z.string(),
  introVideo: z.string(),
  galleryImages: z.array(z.string()),
  introduction: z.string().min(100, '请详细介绍自己'),
  teachingStyle: z.string().min(50, '请描述您的教学风格'),
  
  // 协议同意
  agreementAccepted: z.boolean().refine(val => val === true, '请阅读并同意协议')
})

const steps = [
  { id: 'basic', title: '基本信息' },
  { id: 'teaching', title: '教学信息' },
  { id: 'course', title: '课程设置' },
  { id: 'certificates', title: '资质认证' },
  { id: 'profile', title: '展示资料' },
  { id: 'agreement', title: '协议确认' }
]

export function TutorApplicationForm() {
  const [currentStep, setCurrentStep] = useState('basic')
  const [progress, setProgress] = useState(0)
  
  const form = useForm({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      hourlyRate: {
        regular: 0,
        trial: 0
      },
      trialDuration: 30,
      agreementAccepted: false
    }
  })

  const onSubmit = async (data: z.infer<typeof applicationSchema>) => {
    try {
      // TODO: 提交申请数据到后端
      console.log(data)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="space-y-8">
      {/* 进度指示器 */}
      <div className="space-y-2">
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between text-sm text-muted-foreground">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center gap-1 ${
                progress >= ((index + 1) / steps.length) * 100
                  ? 'text-primary'
                  : ''
              }`}
            >
              {progress >= ((index + 1) / steps.length) * 100 ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <div className="h-4 w-4 rounded-full border" />
              )}
              <span>{step.title}</span>
            </div>
          ))}
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Tabs value={currentStep} onValueChange={setCurrentStep}>
            <TabsList className="grid grid-cols-6">
              {steps.map(step => (
                <TabsTrigger key={step.id} value={step.id}>
                  {step.title}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* 基本信息 */}
            <TabsContent value="basic">
              <Card className="p-6">
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>姓名</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="请输入您的真实姓名" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>邮箱</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" placeholder="your@email.com" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>电话</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="+86 123456789" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <Button
                    type="button"
                    onClick={() => {
                      setCurrentStep('teaching')
                      setProgress(20)
                    }}
                  >
                    下一步
                  </Button>
                </div>
              </Card>
            </TabsContent>

            {/* 教学信息 */}
            <TabsContent value="teaching">
              <Card className="p-6">
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="teachingExperience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>教学经验</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="请详细描述您的教学经验，包括教学年限、教授课程、学生人数等"
                            className="min-h-[150px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="mt-6 flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setCurrentStep('basic')
                      setProgress(0)
                    }}
                  >
                    上一步
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setCurrentStep('course')
                      setProgress(40)
                    }}
                  >
                    下一步
                  </Button>
                </div>
              </Card>
            </TabsContent>

            {/* 课程设置 */}
            <TabsContent value="course">
              <Card className="p-6">
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="hourlyRate.regular"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>常规课时费（元/小时）</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" min="0" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="hourlyRate.trial"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>试课费用（元/课时）</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" min="0" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="trialDuration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>试课时长（分钟）</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value.toString()}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="选择试课时长" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="15">15分钟</SelectItem>
                            <SelectItem value="30">30分钟</SelectItem>
                            <SelectItem value="45">45分钟</SelectItem>
                            <SelectItem value="60">60分钟</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="mt-6 flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setCurrentStep('teaching')
                      setProgress(20)
                    }}
                  >
                    上一步
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setCurrentStep('certificates')
                      setProgress(60)
                    }}
                  >
                    下一步
                  </Button>
                </div>
              </Card>
            </TabsContent>

            {/* 资质认证 */}
            <TabsContent value="certificates">
              <Card className="p-6">
                <div className="space-y-6">
                  <div className="border-2 border-dashed rounded-lg p-6">
                    <FileUploader
                      accept=".pdf,.jpg,.png"
                      maxSize={5242880} // 5MB
                      onUpload={(files) => {
                        // TODO: 处理文件上传
                        console.log(files)
                      }}
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      支持 PDF、JPG、PNG 格式，单个文件不超过5MB
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setCurrentStep('course')
                      setProgress(40)
                    }}
                  >
                    上一步
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setCurrentStep('profile')
                      setProgress(80)
                    }}
                  >
                    下一步
                  </Button>
                </div>
              </Card>
            </TabsContent>

            {/* 展示资料 */}
            <TabsContent value="profile">
              <Card className="p-6">
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <FormLabel>头像上传</FormLabel>
                      <div className="mt-2 border-2 border-dashed rounded-lg p-4">
                        <FileUploader
                          accept="image/*"
                          maxSize={2097152} // 2MB
                          onUpload={(files) => {
                            // TODO: 处理头像上传
                            console.log(files)
                          }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <FormLabel>介绍视频</FormLabel>
                      <div className="mt-2 border-2 border-dashed rounded-lg p-4">
                        <FileUploader
                          accept="video/*"
                          maxSize={104857600} // 100MB
                          onUpload={(files) => {
                            // TODO: 处理视频上传
                            console.log(files)
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="introduction"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>个人介绍</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="请详细介绍您的教学理念、特色和优势"
                            className="min-h-[150px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="mt-6 flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setCurrentStep('certificates')
                      setProgress(60)
                    }}
                  >
                    上一步
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setCurrentStep('agreement')
                      setProgress(100)
                    }}
                  >
                    下一步
                  </Button>
                </div>
              </Card>
            </TabsContent>

            {/* 协议确认 */}
            <TabsContent value="agreement">
              <Card className="p-6">
                <div className="space-y-6">
                  <div className="prose max-w-none">
                    <h3>导师服务协议</h3>
                    <div className="bg-muted p-4 rounded-lg text-sm">
                      <h4>收益分成说明</h4>
                      <ul>
                        <li>平台基础分成比例为15%-25%</li>
                        <li>根据课程评分、学生好评率等指标动态调整</li>
                        <li>设有额外的奖励激励机制</li>
                      </ul>
                      
                      <h4 className="mt-4">课程要求</h4>
                      <ul>
                        <li>保证授课质量和准时率</li>
                        <li>合理设置课程价格和试课政策</li>
                        <li>积极响应学生需求和平台反馈</li>
                      </ul>

                      <h4 className="mt-4">申诉机制</h4>
                      <ul>
                        <li>课程评价申诉渠道畅通</li>
                        <li>48小时内响应申诉请求</li>
                        <li>公平公正处理争议问题</li>
                      </ul>
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="agreementAccepted"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="!mt-0">
                          我已阅读并同意上述协议内容
                        </FormLabel>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="mt-6 flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setCurrentStep('profile')
                      setProgress(80)
                    }}
                  >
                    上一步
                  </Button>
                  <Button type="submit">
                    提交申请
                  </Button>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </Form>
    </div>
  )
}
