import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { SocialProof } from "@/components/social-proof"
import { ProblemSection } from "@/components/problem-section"
import { HowItWorks } from "@/components/how-it-works"
import { FeaturesSection } from "@/components/features-section"
import { SampleReport } from "@/components/sample-report"
import { PricingSection } from "@/components/pricing-section"
import { FaqSection } from "@/components/faq-section"
import { FinalCta } from "@/components/final-cta"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <SocialProof />
      <ProblemSection />
      <HowItWorks />
      <FeaturesSection />
      <SampleReport />
      <PricingSection />
      <FaqSection />
      <FinalCta />
      <Footer />
    </main>
  )
}
