import { PieChart, MessageSquareText, Radar, Lightbulb, BarChart3, ClipboardList } from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: PieChart,
      title: "AI Share of Voice™",
      description: "See what % of AI recommendations include your brand vs competitors.",
    },
    {
      icon: MessageSquareText,
      title: "Narrative Analysis",
      description: "Discover the exact words AI uses to describe you - positive and negative.",
    },
    {
      icon: Radar,
      title: "Competitive Threat Radar",
      description: "Know which competitor is gaining ground and where they'll attack.",
    },
    {
      icon: Lightbulb,
      title: "Opportunity Windows",
      description: "Find narratives you can own before competitors consolidate them.",
    },
    {
      icon: BarChart3,
      title: "8-Dimension Scoring",
      description: "Track innovation, value, trust, sustainability, and 4 more dimensions.",
    },
    {
      icon: ClipboardList,
      title: "Executive Action Plans",
      description: "Get specific recommendations with timelines, costs, and expected impact.",
    },
  ]

  return (
    <section id="features" className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4 text-balance">
          Intelligence That Doesn't Exist Anywhere Else
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Proprietary insights into how AI models perceive and recommend your brand
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-card border border-border rounded-xl p-6 hover:border-primary/50 hover:bg-card/80 transition-all"
            >
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10 mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
