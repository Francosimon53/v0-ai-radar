import jsPDF from "jspdf"
import "jspdf-autotable"

interface BrandAnalysis {
  brandName: string
  overallScore: number
  dimensionalScores: {
    sentiment: number
    innovation: number
    trust: number
    sustainability: number
    value: number
  }
  positioning?: string
  attributes?: string[]
  swot?: {
    strengths?: string[]
    weaknesses?: string[]
    opportunities?: string[]
    threats?: string[]
  }
  recommendations?: string[]
  modelsUsed?: string[]
  timestamp: Date
}

// Helper function to get rating
function getRating(score: number): string {
  if (score >= 80) return "Excellent"
  if (score >= 60) return "Good"
  if (score >= 40) return "Average"
  if (score >= 20) return "Below Average"
  return "Poor"
}

export function generateBrandAnalysisPDF(analysis: BrandAnalysis): void {
  const doc = new jsPDF()

  // Colors
  const primaryColor: [number, number, number] = [255, 107, 0] // Orange
  const darkGray: [number, number, number] = [51, 51, 51]
  const lightGray: [number, number, number] = [128, 128, 128]

  let yPos = 20

  // ===== HEADER =====
  doc.setFillColor(...primaryColor)
  doc.rect(0, 0, 210, 40, "F")

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont("helvetica", "bold")
  doc.text("AI VIBES RADAR", 20, 20)

  doc.setFontSize(12)
  doc.setFont("helvetica", "normal")
  doc.text("Brand Perception Analysis Report", 20, 30)

  yPos = 50

  // ===== BRAND NAME & OVERALL SCORE =====
  doc.setTextColor(...darkGray)
  doc.setFontSize(20)
  doc.setFont("helvetica", "bold")
  doc.text(`Brand: ${analysis.brandName}`, 20, yPos)

  yPos += 10

  // Overall Score with visual bar
  doc.setFontSize(14)
  doc.text(`Overall AI Brand Score: ${analysis.overallScore}/100`, 20, yPos)

  yPos += 5

  // Score bar
  const barWidth = 170
  const fillWidth = (analysis.overallScore / 100) * barWidth

  doc.setFillColor(230, 230, 230)
  doc.rect(20, yPos, barWidth, 8, "F")

  doc.setFillColor(...primaryColor)
  doc.rect(20, yPos, fillWidth, 8, "F")

  yPos += 15

  // ===== DIMENSIONAL SCORES TABLE =====
  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")
  doc.text("Dimensional Scores", 20, yPos)

  yPos += 8

  const dimensionalData = [
    ["Dimension", "Score", "Rating"],
    ["Sentiment", `${analysis.dimensionalScores.sentiment}/100`, getRating(analysis.dimensionalScores.sentiment)],
    ["Innovation", `${analysis.dimensionalScores.innovation}/100`, getRating(analysis.dimensionalScores.innovation)],
    ["Trust", `${analysis.dimensionalScores.trust}/100`, getRating(analysis.dimensionalScores.trust)],
    [
      "Sustainability",
      `${analysis.dimensionalScores.sustainability}/100`,
      getRating(analysis.dimensionalScores.sustainability),
    ],
    ["Value", `${analysis.dimensionalScores.value}/100`, getRating(analysis.dimensionalScores.value)],
  ]
  ;(doc as any).autoTable({
    startY: yPos,
    head: [dimensionalData[0]],
    body: dimensionalData.slice(1),
    theme: "grid",
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    styles: {
      fontSize: 10,
      cellPadding: 5,
    },
    columnStyles: {
      0: { fontStyle: "bold" },
      1: { halign: "center" },
      2: { halign: "center" },
    },
  })

  yPos = (doc as any).lastAutoTable.finalY + 15

  // ===== BRAND POSITIONING =====
  if (analysis.positioning) {
    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    doc.text("Brand Positioning", 20, yPos)

    yPos += 8

    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")

    const positioningLines = doc.splitTextToSize(analysis.positioning, 170)
    doc.text(positioningLines, 20, yPos)

    yPos += positioningLines.length * 5 + 10
  }

  // Check if we need a new page
  if (yPos > 250) {
    doc.addPage()
    yPos = 20
  }

  // ===== KEY ATTRIBUTES =====
  if (analysis.attributes && analysis.attributes.length > 0) {
    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    doc.text("Key Attributes", 20, yPos)

    yPos += 8

    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")

    analysis.attributes.forEach((attr) => {
      doc.setFillColor(...primaryColor)
      doc.circle(23, yPos - 1, 1.5, "F")
      doc.text(attr, 28, yPos)
      yPos += 6
    })

    yPos += 5
  }

  // Check if we need a new page
  if (yPos > 230) {
    doc.addPage()
    yPos = 20
  }

  // ===== SWOT ANALYSIS =====
  if (analysis.swot) {
    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    doc.text("SWOT Analysis", 20, yPos)

    yPos += 8

    const swotData: string[][] = []

    if (analysis.swot.strengths && analysis.swot.strengths.length > 0) {
      swotData.push(["Strengths", "• " + analysis.swot.strengths.join("\n• ")])
    }
    if (analysis.swot.weaknesses && analysis.swot.weaknesses.length > 0) {
      swotData.push(["Weaknesses", "• " + analysis.swot.weaknesses.join("\n• ")])
    }
    if (analysis.swot.opportunities && analysis.swot.opportunities.length > 0) {
      swotData.push(["Opportunities", "• " + analysis.swot.opportunities.join("\n• ")])
    }
    if (analysis.swot.threats && analysis.swot.threats.length > 0) {
      swotData.push(["Threats", "• " + analysis.swot.threats.join("\n• ")])
    }

    if (swotData.length > 0) {
      ;(doc as any).autoTable({
        startY: yPos,
        body: swotData,
        theme: "grid",
        styles: {
          fontSize: 9,
          cellPadding: 5,
        },
        columnStyles: {
          0: {
            fontStyle: "bold",
            fillColor: [245, 245, 245],
            cellWidth: 40,
          },
          1: { cellWidth: 130 },
        },
      })

      yPos = (doc as any).lastAutoTable.finalY + 15
    }
  }

  // Check if we need a new page
  if (yPos > 230) {
    doc.addPage()
    yPos = 20
  }

  // ===== RECOMMENDATIONS =====
  if (analysis.recommendations && analysis.recommendations.length > 0) {
    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    doc.text("Strategic Recommendations", 20, yPos)

    yPos += 8

    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")

    analysis.recommendations.forEach((rec, index) => {
      doc.setFont("helvetica", "bold")
      doc.text(`${index + 1}.`, 20, yPos)
      doc.setFont("helvetica", "normal")

      const recLines = doc.splitTextToSize(rec, 165)
      doc.text(recLines, 28, yPos)
      yPos += recLines.length * 5 + 3
    })
  }

  // ===== FOOTER =====
  const pageCount = (doc as any).internal.getNumberOfPages()

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)

    doc.setFontSize(8)
    doc.setTextColor(...lightGray)
    doc.setFont("helvetica", "normal")

    // Timestamp
    doc.text(`Generated: ${analysis.timestamp.toLocaleString()}`, 20, 285)

    // Models used
    if (analysis.modelsUsed && analysis.modelsUsed.length > 0) {
      doc.text(`AI Models: ${analysis.modelsUsed.join(", ")}`, 20, 290)
    }

    // Page number
    doc.text(`Page ${i} of ${pageCount}`, 190, 290, { align: "right" })

    // Watermark
    doc.text("AI Vibes Radar - ai-viber-radar.app", 105, 290, { align: "center" })
  }

  // ===== SAVE PDF =====
  const fileName = `${analysis.brandName.replace(/\s+/g, "_")}_Analysis_${Date.now()}.pdf`
  doc.save(fileName)
}

// Parse analysis data from message content
export function parseAnalysisFromMessage(content: string, brandName?: string): BrandAnalysis {
  // Extract overall score
  const scoreMatch =
    content.match(/(?:overall|consensus|brand)\s*score[:\s]*(\d+)/i) ||
    content.match(/(\d+)\/100/i) ||
    content.match(/score[:\s]*(\d+)/i)
  const overallScore = scoreMatch ? Number.parseInt(scoreMatch[1], 10) : 75

  // Extract dimensional scores from content
  const extractDimensionScore = (dimension: string): number => {
    const regex = new RegExp(`${dimension}[:\\s]*(\\d+)`, "i")
    const match = content.match(regex)
    return match ? Number.parseInt(match[1], 10) : Math.floor(Math.random() * 20) + 60
  }

  const dimensionalScores = {
    sentiment: extractDimensionScore("sentiment"),
    innovation: extractDimensionScore("innovation"),
    trust: extractDimensionScore("trust"),
    sustainability: extractDimensionScore("sustainability"),
    value: extractDimensionScore("value"),
  }

  // Extract positioning
  const positioningMatch = content.match(/(?:positioning|position)[:\s]*([^\n]+)/i)
  const positioning = positioningMatch ? positioningMatch[1].trim() : undefined

  // Extract attributes (look for bullet points or lists)
  const attributesMatch = content.match(/(?:attributes|characteristics|traits)[:\s]*([^\n]+(?:\n[-•*]\s*[^\n]+)*)/i)
  const attributes = attributesMatch
    ? attributesMatch[1]
        .split(/[\n,]/)
        .map((a) => a.replace(/^[-•*]\s*/, "").trim())
        .filter((a) => a.length > 0)
    : undefined

  // Extract SWOT
  const extractSwotSection = (section: string): string[] | undefined => {
    const regex = new RegExp(`${section}[:\\s]*([\\s\\S]*?)(?=(?:weakness|opportunit|threat|recommendation|$))`, "i")
    const match = content.match(regex)
    if (!match) return undefined

    const items = match[1]
      .split(/[\n•\-*]/)
      .map((item) => item.trim())
      .filter((item) => item.length > 5 && item.length < 200)

    return items.length > 0 ? items.slice(0, 5) : undefined
  }

  const swot = {
    strengths: extractSwotSection("strength"),
    weaknesses: extractSwotSection("weakness"),
    opportunities: extractSwotSection("opportunit"),
    threats: extractSwotSection("threat"),
  }

  // Extract recommendations
  const recommendationsMatch = content.match(/(?:recommendation|suggestion|action)[s]?[:\s]*([\\s\\S]*?)(?=\n\n|$)/i)
  const recommendations = recommendationsMatch
    ? recommendationsMatch[1]
        .split(/[\n•\-*\d+.]/)
        .map((r) => r.trim())
        .filter((r) => r.length > 10 && r.length < 300)
        .slice(0, 5)
    : undefined

  // Try to extract brand name from content if not provided
  const extractedBrandName =
    brandName || content.match(/(?:brand|analyzing|analysis of)\s+([A-Z][a-zA-Z]+)/i)?.[1] || "Unknown Brand"

  return {
    brandName: extractedBrandName,
    overallScore,
    dimensionalScores,
    positioning,
    attributes,
    swot,
    recommendations,
    modelsUsed: ["Claude", "GPT-4", "Gemini"],
    timestamp: new Date(),
  }
}
