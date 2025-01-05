import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Globe, Users, Calendar, Award } from 'lucide-react'

export function Hero() {
  return (
    <div className="relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/5 opacity-20 blur-[100px]"></div>
      </div>

      <div className="container relative">
        <div className="grid lg:grid-cols-2 gap-8 items-center pt-24 pb-12">
          {/* 左侧文本区域 */}
          <div className="flex flex-col gap-8">
            <div className="inline-flex items-center rounded-lg bg-muted px-3 py-1 text-sm font-medium">
              🎉 WeMaster全新上线
              <span className="ml-2 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                Beta
              </span>
            </div>
            
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
                全球化在线教育平台
                <span className="text-primary">尽在掌握</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                连接全球优质导师，打造个性化学习体验。随时随地，开启你的学习之旅。
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild>
                <Link href="/signup">
                  开始学习
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/tutors">成为导师</Link>
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span>全球化教学</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>一对一辅导</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>灵活排课</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                <span>专业认证</span>
              </div>
            </div>
          </div>

          {/* 右侧图片区域 */}
          <div className="relative lg:ml-auto">
            <div className="relative aspect-square w-full max-w-[600px] lg:aspect-[4/3]">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/20 to-primary/0">
                <Image
                  src="/images/hero-classroom.jpg"
                  alt="在线课堂"
                  fill
                  className="rounded-xl object-cover"
                  priority
                />
              </div>
            </div>

            {/* 浮动卡片 */}
            <div className="absolute -bottom-4 -left-4 rounded-lg bg-background p-4 shadow-xl">
              <div className="flex items-center gap-4">
                <div className="relative h-12 w-12 rounded-full">
                  <Image
                    src="/images/tutor-avatar.jpg"
                    alt="导师头像"
                    fill
                    className="rounded-full object-cover"
                  />
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-500 ring-2 ring-background" />
                </div>
                <div>
                  <p className="text-sm font-medium">正在授课</p>
                  <p className="text-xs text-muted-foreground">高级数学 · John</p>
                </div>
              </div>
            </div>

            {/* 统计卡片 */}
            <div className="absolute -right-4 top-4 rounded-lg bg-background p-4 shadow-xl">
              <div className="space-y-2">
                <p className="text-sm font-medium">平台数据</p>
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-2xl font-bold">1000+</p>
                    <p className="text-xs text-muted-foreground">认证导师</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">50000+</p>
                    <p className="text-xs text-muted-foreground">学员</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 品牌展示 */}
        <div className="my-8 border-t pt-8">
          <p className="text-center text-sm text-muted-foreground mb-6">
            值得信赖的教育伙伴
          </p>
          <div className="flex flex-wrap justify-center gap-8 grayscale opacity-70">
            <Image
              src="/images/brands/harvard.svg"
              alt="Harvard"
              width={120}
              height={40}
              className="h-8 object-contain"
            />
            <Image
              src="/images/brands/mit.svg"
              alt="MIT"
              width={120}
              height={40}
              className="h-8 object-contain"
            />
            <Image
              src="/images/brands/stanford.svg"
              alt="Stanford"
              width={120}
              height={40}
              className="h-8 object-contain"
            />
            <Image
              src="/images/brands/oxford.svg"
              alt="Oxford"
              width={120}
              height={40}
              className="h-8 object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
