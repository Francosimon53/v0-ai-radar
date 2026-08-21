# AI Radar

**Multi-model AI brand-intelligence prototype built with Next.js, TypeScript, OpenAI/Anthropic model calls, Supabase, and structured analysis workflows.**

AI Radar explores how multiple LLM outputs can be collected, normalized, aggregated, stored, and turned into comparative reports. The repository includes authenticated analysis APIs, scheduled analysis, competitor tracking, alerts, reporting, chat, and a multi-model analysis engine.

> **Portfolio scope:** this is an experimental AI application, not an independently validated market-research instrument. Model-derived perception scores are heuristic outputs. Any metric that is not directly measured should be treated as prototype data rather than ground truth.

## Technical focus

The current analysis engine:

1. builds one structured evaluation prompt,
2. queries OpenAI and Anthropic models in parallel,
3. requires JSON-shaped responses,
4. handles model/API failure independently,
5. discards unsuccessful responses,
6. aggregates numeric and categorical outputs,
7. records per-model results and report metadata,
8. persists completed reports in Supabase.

```text
Brand + competitors + industry
            ↓
      Structured prompt
            ↓
   OpenAI      Anthropic
       \          /
        \        /
       Parse / validate
             ↓
       Aggregate results
             ↓
   Strategy / report layer
             ↓
          Supabase
```

## Why it is relevant to AI evaluation

The repository exposes practical evaluation problems that arise when multiple models answer the same task:

- responses may fail JSON parsing,
- one provider may succeed while another fails,
- models can disagree on scores or sentiment,
- free-form insights require normalization before comparison,
- aggregate results can conceal model disagreement,
- model-generated scores are not automatically factual measurements,
- fallback behavior must distinguish “no evidence” from a neutral result.

These are useful examples of the difference between **collecting model outputs** and **validating what those outputs actually mean**.

## Current model workflow

The simplified engine currently queries:

- OpenAI (`gpt-4o-mini` through the AI SDK provider interface)
- Anthropic (`claude-sonnet-4-20250514` in the current implementation)

Queries run in parallel and are processed independently. If every model call fails, the engine returns an explicit error/default state rather than fabricating a successful analysis.

## Known prototype limitation

One field in the current per-model breakdown, `mentions`, is explicitly **simulated** in `lib/analysis/simple-engine.ts` using a random value. It is not a measured LLM mention count and should not be interpreted as one.

That limitation is intentionally called out here because evaluation systems should distinguish:

- measured data,
- model-inferred data,
- derived aggregates,
- simulated/demo data.

Replacing the simulated field with a deterministic, evidence-backed metric is tracked as technical debt before this project should be presented as a measurement system.

## Stack

- **Framework:** Next.js 16
- **Language:** TypeScript
- **AI:** Vercel AI SDK, OpenAI/Anthropic integrations, MCP SDK
- **Data/Auth:** Supabase
- **UI:** React 19, Radix UI, Tailwind CSS
- **Validation:** Zod
- **Reporting:** React PDF, jsPDF
- **Email:** Resend
- **Deployment:** Vercel

## Application surface

The repository includes API routes for:

- analysis execution,
- brand analysis,
- chat,
- competitors,
- reports,
- analytics,
- alerts and alert settings,
- scheduled/cron analysis,
- dashboard data,
- executive-document generation.

## Evaluation lessons from the prototype

AI Radar is most useful as a portfolio example when viewed critically. It demonstrates both implementation and the need for stronger evaluation discipline:

- structured output is easier to compare than unconstrained prose,
- successful JSON parsing does not prove factual accuracy,
- averaging model scores does not establish truth,
- simulated values must be labeled as such,
- cross-model agreement can increase consistency without guaranteeing correctness,
- evaluation systems need provenance for every reported metric.

Those lessons directly inform my work on more verification-focused projects such as Verification Layer and FPI Skills.

## Development

```bash
npm install
npm run dev
npm run lint
npm run build
```

## Repository name

The `v0-` prefix is historical and reflects the initial UI workflow. The current repository contains application logic, API routes, persistence, model orchestration, analysis aggregation, and reporting beyond the original scaffold.
