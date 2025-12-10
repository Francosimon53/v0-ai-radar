"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  Building2,
  ShoppingCart,
  Landmark,
  Heart,
  Coffee,
  Car,
  Shirt,
  Plane,
  TrendingDown,
  TrendingUp,
  Mail,
  Check,
  X,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Cpu,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

const STORAGE_KEY = "ai-vibes-setup-wizard"

interface WizardData {
  brand: string
  competitors: string[]
  industry: string
  customIndustry: string
  alerts: {
    scoreDropEnabled: boolean
    scoreDropThreshold: string
    competitorEnabled: boolean
    competitorThreshold: string
    weeklyDigestEnabled: boolean
  }
}

const defaultData: WizardData = {
  brand: "",
  competitors: [],
  industry: "",
  customIndustry: "",
  alerts: {
    scoreDropEnabled: true,
    scoreDropThreshold: "5",
    competitorEnabled: true,
    competitorThreshold: "3",
    weeklyDigestEnabled: true,
  },
}

const popularBrands = ["Nike", "Apple", "Tesla", "Coca-Cola", "Amazon", "Netflix"]

const industries = [
  { id: "technology", name: "Technology", icon: Cpu },
  { id: "retail", name: "Retail & E-commerce", icon: ShoppingCart },
  { id: "finance", name: "Finance & Banking", icon: Landmark },
  { id: "healthcare", name: "Healthcare", icon: Heart },
  { id: "food", name: "Food & Beverage", icon: Coffee },
  { id: "automotive", name: "Automotive", icon: Car },
  { id: "fashion", name: "Fashion & Apparel", icon: Shirt },
  { id: "travel", name: "Travel & Hospitality", icon: Plane },
  { id: "other", name: "Other", icon: Building2 },
]

const competitorSuggestions: Record<string, string[]> = {
  Nike: ["Adidas", "Under Armour", "Puma", "New Balance", "Reebok"],
  Apple: ["Samsung", "Google", "Microsoft", "Huawei", "Sony"],
  Tesla: ["Ford", "GM", "Rivian", "Lucid", "BMW"],
  "Coca-Cola": ["Pepsi", "Dr Pepper", "Sprite", "Fanta", "Red Bull"],
  Amazon: ["Walmart", "eBay", "Target", "Alibaba", "Shopify"],
  Netflix: ["Disney+", "Hulu", "HBO Max", "Amazon Prime", "Apple TV+"],
}

export default function SetupClient() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [data, setData] = useState<WizardData>(defaultData)
  const [newCompetitor, setNewCompetitor] = useState("")
  const [isComplete, setIsComplete] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  // Load saved data on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setData(parsed.data || defaultData)
        setCurrentStep(parsed.step || 1)
      } catch {
        // Ignore parse errors
      }
    }
  }, [])

  // Save data on changes
  const saveProgress = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ data, step: currentStep }))
  }, [data, currentStep])

  useEffect(() => {
    if (!isComplete) {
      saveProgress()
    }
  }, [data, currentStep, isComplete, saveProgress])

  const steps = [
    { number: 1, title: "Your Brand" },
    { number: 2, title: "Competitors" },
    { number: 3, title: "Industry" },
    { number: 4, title: "Alerts" },
  ]

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return data.brand.trim().length > 0
      case 2:
        return data.competitors.length > 0
      case 3:
        return data.industry.length > 0 && (data.industry !== "other" || data.customIndustry.trim().length > 0)
      case 4:
        return true
      default:
        return false
    }
  }

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    localStorage.removeItem(STORAGE_KEY)
    setIsComplete(true)
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 3000)
  }

  const addCompetitor = (comp: string) => {
    if (comp && !data.competitors.includes(comp)) {
      setData({ ...data, competitors: [...data.competitors, comp] })
    }
    setNewCompetitor("")
  }

  const removeCompetitor = (comp: string) => {
    setData({ ...data, competitors: data.competitors.filter((c) => c !== comp) })
  }

  const getSuggestedCompetitors = () => {
    return competitorSuggestions[data.brand] || []
  }

  // Confetti animation
  const Confetti = () => (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-confetti"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
            backgroundColor: ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6"][Math.floor(Math.random() * 5)],
            width: "10px",
            height: "10px",
            borderRadius: Math.random() > 0.5 ? "50%" : "0",
          }}
        />
      ))}
      <style jsx>{`
        @keyframes confetti {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti 3s ease-in-out forwards;
        }
      `}</style>
    </div>
  )

  if (isComplete) {
    return (
      <>
        {showConfetti && <Confetti />}
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center space-y-6 max-w-md">
            <div className="h-20 w-20 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
              <Check className="h-10 w-10 text-green-400" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">You&apos;re All Set!</h1>
            <p className="text-muted-foreground">
              Your brand monitoring is now configured. We&apos;ll start analyzing {data.brand}&apos;s perception across
              AI models right away.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => router.push("/dashboard")}>
                <Sparkles className="h-4 w-4 mr-2" />
                View Dashboard
              </Button>
              <Button
                variant="outline"
                className="border-border bg-transparent"
                onClick={() => router.push("/dashboard/reports")}
              >
                View Reports
              </Button>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Progress Indicator */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300",
                  currentStep > step.number
                    ? "bg-green-500 text-white"
                    : currentStep === step.number
                      ? "bg-blue-600 text-white ring-4 ring-blue-600/30"
                      : "bg-slate-800 text-muted-foreground",
                )}
              >
                {currentStep > step.number ? <Check className="h-5 w-5" /> : step.number}
              </div>
              <span
                className={cn(
                  "text-xs mt-2 hidden sm:block",
                  currentStep >= step.number ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {step.title}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "h-1 w-16 sm:w-24 mx-2 rounded transition-all duration-300",
                  currentStep > step.number ? "bg-green-500" : "bg-slate-800",
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="bg-card border border-border rounded-xl p-6 sm:p-8">
        {/* Step 1: Brand */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">What brand do you want to track?</h2>
              <p className="text-muted-foreground">
                Enter your brand name to start monitoring how AI models perceive it.
              </p>
            </div>

            <div className="space-y-2">
              <Input
                placeholder="Enter your brand name"
                value={data.brand}
                onChange={(e) => setData({ ...data, brand: e.target.value })}
                className="bg-background border-border text-lg py-6"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Popular brands:</p>
              <div className="flex flex-wrap gap-2">
                {popularBrands.map((brand) => (
                  <button
                    key={brand}
                    onClick={() => setData({ ...data, brand })}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm transition-all",
                      data.brand === brand
                        ? "bg-blue-600 text-white"
                        : "bg-slate-800 text-foreground hover:bg-slate-700",
                    )}
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Competitors */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Who are your competitors?</h2>
              <p className="text-muted-foreground">Add competitors to compare your brand perception against.</p>
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Add a competitor"
                value={newCompetitor}
                onChange={(e) => setNewCompetitor(e.target.value)}
                className="bg-background border-border"
                onKeyDown={(e) => e.key === "Enter" && addCompetitor(newCompetitor)}
              />
              <Button
                variant="outline"
                className="border-border bg-transparent"
                onClick={() => addCompetitor(newCompetitor)}
                disabled={!newCompetitor}
              >
                Add
              </Button>
            </div>

            {data.competitors.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {data.competitors.map((comp) => (
                  <Badge key={comp} variant="secondary" className="bg-blue-500/20 text-blue-400 px-3 py-1.5">
                    {comp}
                    <button onClick={() => removeCompetitor(comp)} className="ml-2 hover:text-red-400">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {getSuggestedCompetitors().length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Suggested for {data.brand}:</p>
                <div className="flex flex-wrap gap-2">
                  {getSuggestedCompetitors()
                    .filter((c) => !data.competitors.includes(c))
                    .map((comp) => (
                      <button
                        key={comp}
                        onClick={() => addCompetitor(comp)}
                        className="px-3 py-1.5 rounded-lg text-sm bg-slate-800 text-foreground hover:bg-slate-700 transition-colors"
                      >
                        + {comp}
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Industry */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">What industry are you in?</h2>
              <p className="text-muted-foreground">This helps us tailor analysis to your market.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {industries.map((industry) => (
                <button
                  key={industry.id}
                  onClick={() => setData({ ...data, industry: industry.id })}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-xl transition-all",
                    data.industry === industry.id
                      ? "bg-blue-600 text-white ring-2 ring-blue-400"
                      : "bg-slate-800 text-foreground hover:bg-slate-700",
                  )}
                >
                  <industry.icon className="h-6 w-6" />
                  <span className="text-sm text-center">{industry.name}</span>
                </button>
              ))}
            </div>

            {data.industry === "other" && (
              <Input
                placeholder="Enter your industry"
                value={data.customIndustry}
                onChange={(e) => setData({ ...data, customIndustry: e.target.value })}
                className="bg-background border-border"
                autoFocus
              />
            )}
          </div>
        )}

        {/* Step 4: Alerts */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Set up your alerts</h2>
              <p className="text-muted-foreground">Choose how you want to be notified about brand changes.</p>
            </div>

            <div className="space-y-4">
              {/* Score Drop Alert */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                    <TrendingDown className="h-5 w-5 text-red-400" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Score Drop Alerts</p>
                    <p className="text-sm text-muted-foreground">When your brand score drops</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Select
                    value={data.alerts.scoreDropThreshold}
                    onValueChange={(v) => setData({ ...data, alerts: { ...data.alerts, scoreDropThreshold: v } })}
                    disabled={!data.alerts.scoreDropEnabled}
                  >
                    <SelectTrigger className="w-24 bg-background border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3+ pts</SelectItem>
                      <SelectItem value="5">5+ pts</SelectItem>
                      <SelectItem value="10">10+ pts</SelectItem>
                    </SelectContent>
                  </Select>
                  <Switch
                    checked={data.alerts.scoreDropEnabled}
                    onCheckedChange={(v) => setData({ ...data, alerts: { ...data.alerts, scoreDropEnabled: v } })}
                  />
                </div>
              </div>

              {/* Competitor Alert */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Competitor Alerts</p>
                    <p className="text-sm text-muted-foreground">When competitors gain ground</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Select
                    value={data.alerts.competitorThreshold}
                    onValueChange={(v) => setData({ ...data, alerts: { ...data.alerts, competitorThreshold: v } })}
                    disabled={!data.alerts.competitorEnabled}
                  >
                    <SelectTrigger className="w-24 bg-background border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3+ pts</SelectItem>
                      <SelectItem value="5">5+ pts</SelectItem>
                      <SelectItem value="10">10+ pts</SelectItem>
                    </SelectContent>
                  </Select>
                  <Switch
                    checked={data.alerts.competitorEnabled}
                    onCheckedChange={(v) => setData({ ...data, alerts: { ...data.alerts, competitorEnabled: v } })}
                  />
                </div>
              </div>

              {/* Weekly Digest */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Weekly Digest</p>
                    <p className="text-sm text-muted-foreground">Summary email every Monday</p>
                  </div>
                </div>
                <Switch
                  checked={data.alerts.weeklyDigestEnabled}
                  onCheckedChange={(v) => setData({ ...data, alerts: { ...data.alerts, weeklyDigestEnabled: v } })}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          className="border-border bg-transparent"
          onClick={handleBack}
          disabled={currentStep === 1}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleNext} disabled={!canProceed()}>
          {currentStep === 4 ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin hidden" />
              Complete Setup
            </>
          ) : (
            <>
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
