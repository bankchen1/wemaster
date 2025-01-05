import { Hero } from '@/components/marketing/hero'
import { Features } from '@/components/marketing/features'
import { Testimonials } from '@/components/marketing/testimonials'
import { CTASection } from '@/components/marketing/cta-section'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <Hero />
      <Features />
      <Testimonials />
      <CTASection />
    </main>
  )
}
