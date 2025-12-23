"use client"

import { useState } from "react"

export default function ExecDocPage() {
  const [industry, setIndustry] = useState("B2B SaaS / DTC Marketing & Growth (mid-market)")
  const [companySize, setCompanySize] = useState("50–500 employees")
  const [region, setRegion] = useState("United States / Global")
  const [problem, setProblem] = useState(
    "Brand and campaign decisions are made with fragmented, slow, subjective information",
  )
  const [goal, setGoal] = useState(
    "Reduce time-to-insight by ≥60% and improve message consistency to impact CAC/CVR/ROAS",
  )
  const [timeframe, setTimeframe] = useState("30–90 days")
  const [constraints, setConstraints] = useState("Lean team, executive-ready outputs required, basic compliance needs")
  const [dataAvailable, setDataAvailable] = useState(
    "Brand inputs + competitors + internal notes (if missing, use plausible assumptions)",
  )

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [text, setText] = useState("")

  async function generate() {
    setLoading(true)
    setError(null)
    setText("")
    try {
      const res = await fetch("/api/exec-doc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ industry, companySize, region, problem, goal, timeframe, constraints, dataAvailable }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error || "Generation failed")
      setText(json.text || "")
    } catch (e: any) {
      setError(e?.message || "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Exec Doc Generator</h1>
        <p className="text-sm text-muted-foreground">
          Safe add-on page. Calls /api/exec-doc (server) → your MCP (Railway).
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Industry" value={industry} onChange={setIndustry} />
        <Field label="Company Size" value={companySize} onChange={setCompanySize} />
        <Field label="Region" value={region} onChange={setRegion} />
        <Field label="Timeframe" value={timeframe} onChange={setTimeframe} />
        <Field label="Problem" value={problem} onChange={setProblem} textarea />
        <Field label="Goal" value={goal} onChange={setGoal} textarea />
        <Field label="Constraints" value={constraints} onChange={setConstraints} textarea />
        <Field label="Data available" value={dataAvailable} onChange={setDataAvailable} textarea />
      </div>

      <div className="flex items-center gap-3">
        <button
          className="px-4 py-2 rounded-md bg-black text-white disabled:opacity-50"
          onClick={generate}
          disabled={loading || problem.trim().length < 8 || goal.trim().length < 8}
        >
          {loading ? "Generating..." : "Generate"}
        </button>

        {text ? (
          <button className="px-4 py-2 rounded-md border" onClick={() => navigator.clipboard.writeText(text)}>
            Copy
          </button>
        ) : null}
      </div>

      {error ? (
        <div className="p-3 rounded-md border border-red-300 bg-red-50 text-sm text-red-800">{error}</div>
      ) : null}

      {text ? (
        <pre className="whitespace-pre-wrap break-words p-4 rounded-md border bg-muted/30 text-sm">{text}</pre>
      ) : (
        <div className="text-sm text-muted-foreground">No output yet.</div>
      )}
    </div>
  )
}

function Field(props: { label: string; value: string; onChange: (v: string) => void; textarea?: boolean }) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">{props.label}</label>
      {props.textarea ? (
        <textarea
          className="w-full min-h-[90px] p-2 rounded-md border"
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
        />
      ) : (
        <input
          className="w-full p-2 rounded-md border"
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
        />
      )}
    </div>
  )
}
