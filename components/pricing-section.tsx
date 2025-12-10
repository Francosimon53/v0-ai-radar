"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"
import Link from "next/link"

export function PricingSection() {
  const [isYearly, setIsYearly] = useState(false)

  const plans = [
    {
      name: "Free",
      price: { monthly: 0, yearly: 0 },
      description: "Get started with basic insights",
      features: ["1 brand, 2 competitors", "Monthly analysis", "Basic dashboard", "Email support"],
      cta: "Start Free",
      popular: false,
    },
    {
      name: "Starter",
      price: { monthly: 49, yearly: 39 },
      description: "For growing brands",
      features: ["1 brand, 5 competitors", "Weekly analysis", "Full PDF reports", "Email alerts", "Priority support"],
      cta: "Start 14-Day Trial",
      popular: true,
    },
    {
      name: "Professional",
      price: { monthly: 199, yearly: 159 },
      description: "For enterprise teams",
      features: [
        "5 brands, 15 competitors",
        "Daily analysis",
        "Full PDF reports",
        "Custom alerts",
        "API access",
        "Dedicated support",
      ],
      cta: "Start 14-Day Trial",
      popular: false,
    },
  ]

  return (
    <section id="pricing" className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4 text-balance">Simple Pricing, Massive ROI</h2>
        <p className="text-center text-muted-foreground mb-8">Choose the plan that fits your needs</p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <span className={`text-sm ${!isYearly ? "text-foreground" : "text-muted-foreground"}`}>Monthly</span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isYearly ? "bg-primary" : "bg-secondary"
            }`}
            aria-label="Toggle billing period"
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isYearly ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
          <span className={`text-sm ${isYearly ? "text-foreground" : "text-muted-foreground"}`}>Yearly</span>
          <Badge variant="secondary" className="ml-2">
            Save 20%
          </Badge>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-card border rounded-xl p-8 ${
                plan.popular ? "border-primary shadow-lg shadow-primary/10" : "border-border"
              }`}
            >
              {plan.popular && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Most Popular</Badge>}

              <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
              <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>

              <div className="mb-6">
                <span className="text-4xl font-bold">${isYearly ? plan.price.yearly : plan.price.monthly}</span>
                <span className="text-muted-foreground">/month</span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-primary" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button className="w-full" variant={plan.popular ? "default" : "outline"} asChild>
                <Link href="/signup">{plan.cta}</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
