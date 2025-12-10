export function SocialProof() {
  const logos = ["Acme Corp", "Globex", "Initech", "Umbrella", "Stark Ind"]

  return (
    <section className="py-12 border-y border-border/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-muted-foreground mb-8">Trusted by brand leaders at</p>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
          {logos.map((logo) => (
            <div key={logo} className="h-8 px-6 bg-muted/30 rounded flex items-center justify-center">
              <span className="text-sm font-medium text-muted-foreground">{logo}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
