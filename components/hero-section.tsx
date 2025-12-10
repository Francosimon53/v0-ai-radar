import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-left">
            <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm">
              <Sparkles className="mr-2 h-4 w-4" />
              Now tracking 500+ brands
            </Badge>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-balance">
              Know How AI Sees
              <span className="text-primary"> Your Brand</span>
            </h1>

            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto lg:mx-0 text-pretty">
              Discover what ChatGPT, Claude, Gemini and 4 other AIs say when customers ask about your brand vs
              competitors. Get weekly executive reports with strategic recommendations.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Button size="lg" className="w-full sm:w-auto text-base px-8" asChild>
                <Link href="/signup">
                  Start Free Analysis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-8 bg-transparent" asChild>
                <Link href="#sample-report">See Sample Report</Link>
              </Button>
            </div>

            <p className="mt-6 text-sm text-muted-foreground">No credit card required • 14-day free trial</p>
          </div>

          {/* Hero Visual - Report Mockup */}
          <div className="flex-1 w-full max-w-xl">
            <div className="relative">
              <div className="absolute -inset-4 bg-primary/10 blur-3xl rounded-full" />
              <div className="relative bg-card border border-border rounded-xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-sm font-medium text-muted-foreground">Executive Report</span>
                  <Badge>Live</Badge>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-xl bg-primary/20 flex items-center justify-center">
                      <span className="text-2xl font-bold text-primary">84</span>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Brand Strength Index</p>
                      <p className="text-xl font-semibold">Excellent</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">AI Share of Voice</span>
                      <span className="font-medium">67%</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full w-[67%] bg-primary rounded-full" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-secondary/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">Sentiment</p>
                      <p className="text-lg font-semibold text-green-400">+24%</p>
                    </div>
                    <div className="bg-secondary/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">Mentions</p>
                      <p className="text-lg font-semibold">1.2K</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
