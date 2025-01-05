import { useState } from 'react';
import { useRouter } from 'next/router';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { reviewTutorApplication } from '@/lib/api/admin';
import { ApplicationStatus } from '@/types/tutor';

interface ApplicationReviewProps {
  application: any;
  onReviewComplete?: () => void;
}

export function ApplicationReview({ application, onReviewComplete }: ApplicationReviewProps) {
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<ApplicationStatus>(ApplicationStatus.PENDING);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleReview = async () => {
    try {
      setIsSubmitting(true);
      await reviewTutorApplication(application.id, {
        status: reviewStatus,
        notes: reviewNotes,
      });

      toast({
        title: '审核完成',
        description: reviewStatus === ApplicationStatus.APPROVED ? '申请已通过' : '申请已拒绝',
      });

      setIsReviewDialogOpen(false);
      onReviewComplete?.();
    } catch (error) {
      toast({
        title: '审核失败',
        description: '请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    const variants = {
      [ApplicationStatus.PENDING]: 'default',
      [ApplicationStatus.APPROVED]: 'success',
      [ApplicationStatus.REJECTED]: 'destructive',
    };

    const labels = {
      [ApplicationStatus.PENDING]: '待审核',
      [ApplicationStatus.APPROVED]: '已通过',
      [ApplicationStatus.REJECTED]: '已拒绝',
    };

    return (
      <Badge variant={variants[status] as any}>
        {labels[status]}
      </Badge>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{application.name}</CardTitle>
            <CardDescription>申请时间：{format(new Date(application.createdAt), 'yyyy-MM-dd HH:mm')}</CardDescription>
          </div>
          {getStatusBadge(application.status)}
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">基本信息</TabsTrigger>
            <TabsTrigger value="education">教育背景</TabsTrigger>
            <TabsTrigger value="experience">工作经验</TabsTrigger>
            <TabsTrigger value="other">其他信息</TabsTrigger>
          </TabsList>

          <TabsContent value="basic">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">自我介绍</h4>
                <p className="text-gray-600">{application.introduction}</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">语言能力</h4>
                <div className="flex gap-2">
                  {application.languages.map((lang: string) => (
                    <Badge key={lang} variant="secondary">{lang}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">教学科目</h4>
                <div className="flex gap-2">
                  {application.subjects.map((subject: string) => (
                    <Badge key={subject} variant="secondary">{subject}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="education">
            <ScrollArea className="h-[400px] pr-4">
              {application.education.map((edu: any, index: number) => (
                <Card key={index} className="mb-4">
                  <CardHeader>
                    <CardTitle>{edu.degree}</CardTitle>
                    <CardDescription>{edu.school}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p><strong>专业：</strong>{edu.major}</p>
                    <p><strong>毕业年份：</strong>{edu.graduationYear}</p>
                  </CardContent>
                </Card>
              ))}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="experience">
            <ScrollArea className="h-[400px] pr-4">
              {application.experience.map((exp: any, index: number) => (
                <Card key={index} className="mb-4">
                  <CardHeader>
                    <CardTitle>{exp.title}</CardTitle>
                    <CardDescription>{exp.company}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p><strong>时间：</strong>{format(new Date(exp.startDate), 'yyyy-MM')} - 
                      {exp.endDate ? format(new Date(exp.endDate), 'yyyy-MM') : '至今'}</p>
                    <p className="mt-2">{exp.description}</p>
                  </CardContent>
                </Card>
              ))}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="other">
            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-2">课程定价</h4>
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>常规课程</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>¥{application.pricing.regular.price}/课时</p>
                      <p className="text-sm text-gray-500">{application.pricing.regular.duration}分钟</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>试听课程</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>¥{application.pricing.trial.price}/课时</p>
                      <p className="text-sm text-gray-500">{application.pricing.trial.duration}分钟</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>小组课程</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>¥{application.pricing.group.price}/课时</p>
                      <p className="text-sm text-gray-500">{application.pricing.group.duration}分钟</p>
                      <p className="text-sm text-gray-500">{application.pricing.group.minStudents}-{application.pricing.group.maxStudents}人</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">教学时间</h4>
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>工作日</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        {application.availability.workingDays.map((day: number) => (
                          <Badge key={day} variant="secondary">
                            {['周日', '周一', '周二', '周三', '周四', '周五', '周六'][day]}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>工作时间</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{application.availability.workingHours.start} - {application.availability.workingHours.end}</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {application.certificates.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">证书资质</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {application.certificates.map((cert: any, index: number) => (
                      <Card key={index}>
                        <CardHeader>
                          <CardTitle>{cert.name}</CardTitle>
                          <CardDescription>{cert.issuer}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p>发证日期：{format(new Date(cert.date), 'yyyy-MM-dd')}</p>
                          <Button
                            variant="link"
                            className="px-0"
                            onClick={() => window.open(cert.file, '_blank')}
                          >
                            查看证书
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter className="flex justify-end space-x-4">
        {application.status === ApplicationStatus.PENDING && (
          <>
            <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" onClick={() => {
                  setReviewStatus(ApplicationStatus.REJECTED);
                  setReviewNotes('');
                }}>
                  拒绝
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>审核意见</DialogTitle>
                  <DialogDescription>
                    请填写审核意见，说明通过或拒绝的原因
                  </DialogDescription>
                </DialogHeader>
                <Textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="请输入审核意见..."
                  className="min-h-[100px]"
                />
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsReviewDialogOpen(false)}
                  >
                    取消
                  </Button>
                  <Button
                    onClick={handleReview}
                    disabled={isSubmitting || !reviewNotes}
                  >
                    确认
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setReviewStatus(ApplicationStatus.APPROVED);
                  setReviewNotes('');
                }}>
                  通过
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>审核意见</DialogTitle>
                  <DialogDescription>
                    请填写审核意见，说明通过或拒绝的原因
                  </DialogDescription>
                </DialogHeader>
                <Textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="请输入审核意见..."
                  className="min-h-[100px]"
                />
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsReviewDialogOpen(false)}
                  >
                    取消
                  </Button>
                  <Button
                    onClick={handleReview}
                    disabled={isSubmitting || !reviewNotes}
                  >
                    确认
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
