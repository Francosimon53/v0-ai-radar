import { NextResponse } from "next/server"

function pickText(data: any): string {
  if (typeof data?.output_text === "string" && data.output_text.trim()) return data.output_text
  if (Array.isArray(data?.output)) {
    let t = ""
    for (const item of data.output) {
      if (Array.isArray(item?.content)) {
        for (const c of item.content) {
          if (typeof c?.text === "string") t += c.text
        }
      }
    }
    if (t.trim()) return t
  }
  return JSON.stringify(data, null, 2)
}

function buildPrompt(inputs: any) {
  const industry = inputs?.industry || "B2B SaaS / DTC Marketing & Growth (mid-market)"
  const companySize = inputs?.companySize || "50–500 employees"
  const region = inputs?.region || "United States / Global"
  const problem =
    inputs?.problem || "Brand and campaign decisions are made with fragmented, slow, subjective information"
  const goal = inputs?.goal || "Reduce time-to-insight by ≥60% and improve message consistency to impact CAC/CVR/ROAS"
  const timeframe = inputs?.timeframe || "30–90 days"
  const constraints = inputs?.constraints || "Lean team, executive-ready outputs required, basic compliance needs"
  const dataAvailable =
    inputs?.dataAvailable || "Brand inputs + competitors + internal notes (if missing, use plausible assumptions)"

  return `
You are a principal consultant at a top-tier strategy firm (McKinsey-style). Create a board-ready executive document to justify purchasing AI-Viber-Radar (an AI-powered brand + competitive intelligence app). The reader is a budget-owning decision-maker (CEO/CMO/VP Marketing/Head of Growth).

CONTEXT (use and respect these):
- Industry: ${industry}
- Company size: ${companySize}
- Region: ${region}
- Core problem: ${problem}
- Business goal: ${goal}
- Time horizon: ${timeframe}
- Constraints: ${constraints}
- Data available: ${dataAvailable}

NON-NEGOTIABLE QUALITY BAR:
- Output language: ENGLISH only.
- MECE, no fluff, insight-style headlines.
- Use numbers with clearly stated assumptions.
- Equivalent to 8–12 pages (demo), but still executive-grade.
- End EVERY section with: "What this means for the decision-maker" (2–4 bullets).
- Include trade-offs + CFO/COO objections and answers.
- Declare assumption confidence levels (High/Medium/Low).

REQUIRED STRUCTURE (exact order):
1) Cover page (value/ROI-based title)
2) Executive Summary (max 1 page) + "The decision we're asking for today"
3) Why now + cost of delay
4) Diagnosis (root causes)
5) What AI-Viber-Radar is / is not (anti-scope)
6) Use cases (minimum 6)
7) Quantified opportunity + ROI model (Conservative/Base/Optimistic)
8) Options: Status Quo vs Build vs Buy + weighted scorecard
9) Recommendation (main path + one secondary bet) + what we will NOT do
10) 30–60–90 day plan + RACI
11) Governance + metrics (North Star + 5 KPIs + cadence)
12) Risks + mitigations + kill criteria
13) Packaging (Starter/Pro/Enterprise) without exact pricing
14) Appendices (assumptions table, glossary, methodology, sample PDF index)

REQUIRED EXHIBITS (must include):
- Exhibit 1: ROI model (Conservative/Base/Optimistic)
- Exhibit 2: Build vs Buy vs Status Quo weighted scorecard
- Exhibit 3: 30–60–90 roadmap table
- Exhibit 4: Metrics dashboard fields (exact columns)
- Exhibit 5: Before vs After workflow

FINAL OUTPUT MUST INCLUDE:
A) Full document
B) One-page email-ready summary (<= 200 words)
C) 60-second talk track pitch

Now generate the complete document.
  `.trim()
}

export async function POST(req: Request) {
  try {
    const inputs = await req.json()

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ success: false, error: "Missing OPENAI_API_KEY in Vercel env vars" }, { status: 500 })
    }

    const model = process.env.OPENAI_MODEL || "gpt-5"
    const prompt = buildPrompt(inputs)

    const r = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model, input: prompt }),
    })

    if (!r.ok) {
      const err = await r.text().catch(() => "")
      return NextResponse.json({ success: false, error: err || `OpenAI error ${r.status}` }, { status: 500 })
    }

    const data = await r.json()
    return NextResponse.json({ success: true, text: pickText(data) })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || "Unknown server error" }, { status: 500 })
  }
}
