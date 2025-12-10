import { MessageSquare, HelpCircle, TrendingDown } from "lucide-react"

export function ProblemSection() {
  const problems = [
    {
      icon: MessageSquare,
      stat: "200M+",
      description: "people ask AI for recommendations daily",
    },
    {
      icon: HelpCircle,
      stat: "Invisible",
      description: "If AI doesn't recommend you, you're invisible",
    },
    {
      icon: TrendingDown,
      stat: "Behind",
      description: "Your competitors are already optimizing for AI",
    },
  ]

  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4 text-balance">
          The New Battle for Brand Perception
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          AI is reshaping how customers discover and choose brands. Are you ready?
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {problems.map((problem, index) => (
            <div
              key={index}
              className="bg-card border border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors"
            >
              <div className="inline-flex items-center justify-center h-14 w-14 rounded-xl bg-primary/10 mb-6">
                <problem.icon className="h-7 w-7 text-primary" />
              </div>
              <p className="text-3xl font-bold mb-2">{problem.stat}</p>
              <p className="text-muted-foreground">{problem.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
