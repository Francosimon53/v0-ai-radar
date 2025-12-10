import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react"
import Link from "next/link"

export function SampleReport() {
  return (
    <section id="sample-report" className="py-20 bg-card/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4 text-balance">
          See What Your Report Looks Like
        </h2>
        <p className="text-center text-muted-foreground mb-12">Comprehensive insights delivered every week</p>

        <div className="max-w-4xl mx-auto">
          <div className="bg-background border border-border rounded-xl overflow-hidden shadow-2xl">
            {/* Report Header */}
            <div className="bg-primary/10 p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Weekly Executive Report</p>
                  <h3 className="text-xl font-semibold">Brand Intelligence Summary</h3>
                </div>
                <Badge variant="secondary">PDF Export Available</Badge>
              </div>
            </div>

            {/* Report Content */}
            <div className="p-6 space-y-6">
              {/* Score Section */}
              <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-card rounded-xl border border-border">
                <div className="relative">
                  <svg className="w-32 h-32" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      className="text-secondary"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      strokeDasharray={`${84 * 2.51} 251`}
                      strokeLinecap="round"
                      className="text-primary -rotate-90 origin-center"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold">84</span>
                  </div>
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-sm text-muted-foreground">Brand Strength Index</p>
                  <p className="text-2xl font-bold">Excellent Performance</p>
                  <div className="flex items-center gap-2 mt-2 text-green-400">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm">+12 from last month</span>
                  </div>
                </div>
              </div>

              {/* Share of Voice */}
              <div className="space-y-4">
                <h4 className="font-semibold">AI Share of Voice</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <span className="text-sm w-24">Your Brand</span>
                    <div className="flex-1 h-3 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full w-[42%] bg-primary rounded-full" />
                    </div>
                    <span className="text-sm font-medium w-12">42%</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm w-24 text-muted-foreground">Competitor A</span>
                    <div className="flex-1 h-3 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full w-[28%] bg-muted-foreground/50 rounded-full" />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground w-12">28%</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm w-24 text-muted-foreground">Competitor B</span>
                    <div className="flex-1 h-3 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full w-[18%] bg-muted-foreground/50 rounded-full" />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground w-12">18%</span>
                  </div>
                </div>
              </div>

              {/* Key Insights */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                  <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-400">Opportunity</p>
                    <p className="text-sm text-muted-foreground">
                      Strong association with "innovation" across all models
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
                  <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-400">Watch</p>
                    <p className="text-sm text-muted-foreground">Competitor B gaining ground in "sustainability"</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <Button size="lg" asChild>
              <Link href="/signup">
                Get Your Free Analysis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
