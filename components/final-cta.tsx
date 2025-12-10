import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export function FinalCta() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-primary/10 border border-primary/20 p-12 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />

          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-balance">
              Your Competitors Might Already Know How AI Sees Them.
              <span className="text-primary"> Do You?</span>
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Start your free analysis in 2 minutes. No credit card required.
            </p>
            <Button size="lg" className="text-base px-8" asChild>
              <Link href="/signup">
                Analyze My Brand Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
