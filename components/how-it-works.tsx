import { Settings, BarChart3, FileText } from "lucide-react"

export function HowItWorks() {
  const steps = [
    {
      icon: Settings,
      title: "Configure Once",
      description: "Add your brand, competitors, and industry. Takes 2 minutes.",
      step: "01",
    },
    {
      icon: BarChart3,
      title: "We Analyze Weekly",
      description: "Our engine queries 7 AI models with 100+ prompts automatically.",
      step: "02",
    },
    {
      icon: FileText,
      title: "Get Executive Reports",
      description: "Receive PDF reports with scores, threats, opportunities, and action plans.",
      step: "03",
    },
  ]

  return (
    <section id="how-it-works" className="py-20 bg-card/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4 text-balance">
          From Blind Spot to Strategic Advantage
        </h2>
        <p className="text-center text-muted-foreground mb-12">in 3 Simple Steps</p>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="absolute -top-4 -left-4 text-6xl font-bold text-primary/10">{step.step}</div>
              <div className="relative bg-background border border-border rounded-xl p-8 h-full">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10 mb-6">
                  <step.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
