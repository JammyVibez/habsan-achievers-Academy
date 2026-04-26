import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { HeroSection } from "@/components/home/hero-section"
import { FeaturesSection } from "@/components/home/features-section"
import { PrincipalMessageSection } from "@/components/home/principal-message-section"
import { StatsSection } from "@/components/home/stats-section"
import { CTASection } from "@/components/home/cta-section"
import { TestimonialsSection } from "@/components/home/testimonials-section"
import { LatestNewsSection } from "@/components/home/latest-news-section"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <StatsSection />
        <PrincipalMessageSection />
        <TestimonialsSection />
        <LatestNewsSection />
        <CTASection />
      </main>
      <SiteFooter />
    </div>
  )
}
