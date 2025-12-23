import { NextResponse } from "next/server"
import { buildExecDocPrompt } from "@/lib/prompts/execDocPrompt"

function pickText(payload: any): string {
  if (typeof payload?.text === "string" && payload.text.trim()) return payload.text
  if (typeof payload?.data?.text === "string" && payload.data.text.trim()) return payload.data.text
  if (typeof payload?.data?.output_text === "string" && payload.data.output_text.trim()) return payload.data.output_text
  if (typeof payload?.data?.result === "string" && payload.data.result.trim()) return payload.data.result
  return JSON.stringify(payload, null, 2)
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const prompt = buildExecDocPrompt({
      industry: body.industry,
      companySize: body.companySize,
      region: body.region,
      problem: body.problem,
      goal: body.goal,
      timeframe: body.timeframe,
      constraints: body.constraints,
      dataAvailable: body.dataAvailable,
    })

    const mcpUrl = process.env.MCP_URL
    if (!mcpUrl) {
      return NextResponse.json({ success: false, error: "Missing MCP_URL." }, { status: 500 })
    }

    // IMPORTANT: set this to your real MCP path (defaults to /analyze)
    const path = process.env.MCP_EXEC_DOC_PATH || "/analyze"
    const token = process.env.MCP_TOKEN

    const r = await fetch(`${mcpUrl}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        // SAFE: doesn't change your MCP if it ignores extra fields
        prompt,
        meta: { output: "exec_doc", product: "AI-Viber-Radar" },
        inputs: body,
      }),
    })

    if (!r.ok) {
      const err = await r.text().catch(() => "")
      return NextResponse.json({ success: false, error: err || `MCP failed (${r.status})` }, { status: 500 })
    }

    const data = await r.json()
    return NextResponse.json({ success: true, text: pickText(data) })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || "Unknown server error" }, { status: 500 })
  }
}
