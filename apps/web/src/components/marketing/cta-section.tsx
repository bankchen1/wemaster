import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, CheckCircle2 } from 'lucide-react'

const benefits = [
  '免费试听课程',
  '专业导师一对一指导',
  '灵活的学习时间',
  '定制化学习计划',
  '终身学习社区',
  '30天无理由退款'
]

export function CTASection() {
  return (
    <section className="container py-24">
      <div className="relative isolate overflow-hidden bg-primary rounded-3xl px-6 py-24 shadow-2xl sm:px-24 xl:py-32">
        {/* 背景装饰 */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-foreground/10 to-transparent" />
          <div className="absolute left-1/2 top-0 -z-10 -translate-x-1/2 blur-3xl xl:-top-6">
            <div
              className="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-primary-foreground/50 to-primary-foreground/30 opacity-30"
              style={{
                clipPath:
                  'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
              }}
            />
          </div>
        </div>

        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
            开启你的学习之旅
          </h2>
          <p className="mt-6 text-lg leading-8 text-primary-foreground/80">
            立即注册，享受专业的一对一在线辅导。我们提供多样化的课程选择，
            帮助你实现学习目标。
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6">
            <Button
              size="lg"
              variant="secondary"
              className="text-primary"
              asChild
            >
              <Link href="/signup">
                免费注册
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-primary-foreground border-primary-foreground/20 hover:bg-primary-foreground/10"
              asChild
            >
              <Link href="/courses">浏览课程</Link>
            </Button>
          </div>
        </div>

        {/* 优势列表 */}
        <div className="mx-auto max-w-4xl mt-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {benefits.map((benefit) => (
              <div
                key={benefit}
                className="flex items-center gap-2 text-primary-foreground/90"
              >
                <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
