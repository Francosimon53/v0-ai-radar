export type ExecDocInputs = {
  industry?: string
  companySize?: string
  region?: string
  problem?: string
  goal?: string
  timeframe?: string
  constraints?: string
  dataAvailable?: string
}

export function buildExecDocPrompt(input: ExecDocInputs) {
  const {
    industry = "B2B SaaS / DTC Marketing & Growth (mid-market)",
    companySize = "50–500 employees",
    region = "United States / Global",
    problem = "Brand and campaign decisions are made with fragmented, slow, subjective information",
    goal = "Reduce time-to-insight by ≥60% and improve message consistency to impact CAC/CVR/ROAS",
    timeframe = "30–90 days",
    constraints = "Lean team, executive-ready outputs required, basic compliance needs",
    dataAvailable = "Brand inputs + competitors + internal notes (if missing, use plausible assumptions)",
  } = input

  return `
Eres un consultor principal de una firma de estrategia top-tier. Crea un documento ejecutivo de alto impacto para justificar la compra de AI-Viber-Radar. El lector es un decisor con presupuesto (CEO/CMO/VP Marketing/Head of Growth).

CONTEXTO:
- Industria: ${industry}
- Tamaño empresa: ${companySize}
- Región: ${region}
- Problema: ${problem}
- Objetivo: ${goal}
- Horizonte: ${timeframe}
- Restricciones: ${constraints}
- Datos disponibles: ${dataAvailable}

REGLAS:
- Español ejecutivo. MECE. Cero relleno. Usa números y supuestos (decláralos).
- Longitud: 12–18 páginas equivalentes.
- Cada sección termina con: "Qué significa para el decisor" (2–4 bullets).
- Incluye supuestos + certeza (Alta/Media/Baja), trade-offs y objeciones CFO/COO.

ESTRUCTURA EXACTA:
1) Portada (título orientado a ROI)
2) Executive Summary (1 página) + "La decisión que pedimos hoy"
3) Por qué ahora + cost of delay
4) Diagnóstico (causa raíz)
5) Qué es / Qué NO es (anti-scope)
6) Casos de uso (mínimo 6)
7) Oportunidad cuantificada + modelo ROI simple
8) Opciones: Status Quo vs Build vs Buy + scorecard ponderado
9) Recomendación (principal + secundaria) + qué NO haremos
10) Plan 30–60–90 + RACI
11) Gobernanza + métricas (North Star + 5 KPIs + cadencia)
12) Riesgos + mitigaciones + kill criteria
13) Paquetes (Starter/Pro/Enterprise) sin precios
14) Apéndices

EXHIBITS OBLIGATORIOS:
1) ROI (Conservador/Base/Optimista)
2) Scorecard Build vs Buy vs Status Quo
3) Roadmap 30-60-90
4) Dashboard de métricas (campos exactos)
5) Antes vs Después (workflow)

SALIDA FINAL:
A) Documento completo
B) One-pager (<=200 palabras)
C) Talk track (60 segundos)

Ahora genera el documento.
  `.trim()
}
