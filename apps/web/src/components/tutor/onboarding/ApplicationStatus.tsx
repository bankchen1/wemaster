import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import ConfettiExplosion from 'react-confetti-explosion';
import { AnimatedBackground } from '@/components/common/AnimatedBackground';

interface ApplicationStatusProps {
  status: 'pending' | 'rejected';
  applicationDate: Date;
  rejectionReason?: string;
}

export function ApplicationStatus({
  status,
  applicationDate,
  rejectionReason,
}: ApplicationStatusProps) {
  const router = useRouter();

  if (status === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/50">
        <AnimatedBackground />
        <Card className="max-w-2xl w-full p-8 space-y-8 relative z-10">
          <div className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-3xl font-bold">感谢您提交申请！</h1>
              <p className="text-muted-foreground">
                申请日期：{format(applicationDate, 'yyyy年MM月dd日', { locale: zhCN })}
              </p>
            </motion.div>

            <div className="space-y-8 mt-8">
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold">接下来的流程</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      1
                    </div>
                    <div>
                      <h3 className="font-medium">资料审核</h3>
                      <p className="text-sm text-muted-foreground">
                        我们的团队正在审核您的申请，确保所有信息准确完整。
                        这个过程通常需要3-5个工作日。
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      2
                    </div>
                    <div>
                      <h3 className="font-medium">背景核实</h3>
                      <p className="text-sm text-muted-foreground">
                        如有必要，我们可能会进行背景调查和身份验证。
                        如需要额外文件，我们会及时通知您。
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      3
                    </div>
                    <div>
                      <h3 className="font-medium">审核结果通知</h3>
                      <p className="text-sm text-muted-foreground">
                        审核完成后，您将收到邮件通知。
                        如果通过，您就可以访问WeMaster导师账户并开始提供服务。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/50">
      <AnimatedBackground />
      <Card className="max-w-2xl w-full p-8 space-y-8 relative z-10">
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold">抱歉！</h1>
            <h2 className="text-xl text-muted-foreground">
              您的申请未通过审核
            </h2>
          </motion.div>

          <div className="py-8">
            <motion.img
              src="/images/rejection-robot.svg"
              alt="Rejection"
              className="w-48 h-48 mx-auto"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            />
          </div>

          {rejectionReason && (
            <div className="bg-muted p-4 rounded-lg text-left">
              <h3 className="font-medium mb-2">未通过原因：</h3>
              <p className="text-sm text-muted-foreground">{rejectionReason}</p>
            </div>
          )}

          <div className="pt-6">
            <Button
              size="lg"
              onClick={() => router.push('/tutor/onboarding')}
            >
              重新申请
            </Button>
          </div>

          <p className="text-sm text-muted-foreground pt-4">
            如有疑问，请联系我们的客服团队获取帮助
          </p>
        </div>
      </Card>
    </div>
  );
}
