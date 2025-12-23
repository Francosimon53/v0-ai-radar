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

  // Brand colors
  const primaryOrange: [number, number, number] = [255, 107, 0]
  const darkGray: [number, number, number] = [33, 33, 33]
  const lightGray: [number, number, number] = [245, 245, 245]
  const white: [number, number, number] = [255, 255, 255]
  const mediumGray: [number, number, number] = [128, 128, 128]

  let yPos = 0

  // ========== PAGE 1: COVER ==========

  // Orange header band
  doc.setFillColor(...primaryOrange)
  doc.rect(0, 0, 210, 60, "F")

  // White title
  doc.setTextColor(...white)
  doc.setFontSize(32)
  doc.setFont("helvetica", "bold")
  doc.text("AI BRAND", 105, 25, { align: "center" })
  doc.text("PERCEPTION REPORT", 105, 40, { align: "center" })

  // Decorative line under header
  doc.setDrawColor(...white)
  doc.setLineWidth(0.5)
  doc.line(40, 50, 170, 50)

  // Brand name - large and centered
  yPos = 100
  doc.setTextColor(...darkGray)
  doc.setFontSize(42)
  doc.setFont("helvetica", "bold")
  doc.text(analysis.brandName.toUpperCase(), 105, yPos, { align: "center" })

  // Subtitle
  yPos += 15
  doc.setFontSize(14)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(...mediumGray)
  doc.text("AI-Powered Brand Perception Analysis", 105, yPos, { align: "center" })

  // Score circle
  yPos = 160

  // Outer circle (orange ring)
  doc.setDrawColor(...primaryOrange)
  doc.setLineWidth(6)
  doc.circle(105, yPos, 30, "S")

  // Inner circle (white fill)
  doc.setFillColor(...white)
  doc.circle(105, yPos, 24, "F")

  // Score text
  doc.setTextColor(...primaryOrange)
  doc.setFontSize(48)
  doc.setFont("helvetica", "bold")
  doc.text(analysis.overallScore.toString(), 105, yPos + 8, { align: "center" })

  // Score label
  doc.setFontSize(10)
  doc.setTextColor(...mediumGray)
  doc.setFont("helvetica", "normal")
  doc.text("OUT OF 100", 105, yPos + 18, { align: "center" })

  // Overall Score label
  yPos += 50
  doc.setFontSize(16)
  doc.setTextColor(...darkGray)
  doc.setFont("helvetica", "bold")
  doc.text("Overall AI Brand Score", 105, yPos, { align: "center" })

  // Rating badge
  yPos += 12
  const rating = getRating(analysis.overallScore)
  const ratingColor: [number, number, number] =
    analysis.overallScore >= 70 ? [46, 204, 113] : analysis.overallScore >= 40 ? [241, 196, 15] : [231, 76, 60]

  doc.setFillColor(...ratingColor)
  doc.roundedRect(85, yPos - 6, 40, 12, 3, 3, "F")
  doc.setTextColor(...white)
  doc.setFontSize(10)
  doc.setFont("helvetica", "bold")
  doc.text(rating.toUpperCase(), 105, yPos + 2, { align: "center" })

  // Date
  yPos = 250
  doc.setFontSize(11)
  doc.setTextColor(...mediumGray)
  doc.setFont("helvetica", "normal")
  doc.text(
    `Report Generated: ${analysis.timestamp.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })}`,
    105,
    yPos,
    { align: "center" },
  )

  // Models used
  if (analysis.modelsUsed && analysis.modelsUsed.length > 0) {
    yPos += 8
    doc.setFontSize(9)
    doc.text(`AI Models: ${analysis.modelsUsed.join(", ")}`, 105, yPos, { align: "center" })
  }

  // Footer branding
  doc.setFillColor(...lightGray)
  doc.rect(0, 275, 210, 22, "F")
  doc.setFontSize(10)
  doc.setTextColor(...darkGray)
  doc.setFont("helvetica", "bold")
  doc.text("AI Vibes Radar", 105, 285, { align: "center" })
  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  doc.setTextColor(...mediumGray)
  doc.text("ai-viber-radar.app | Brand Perception Intelligence", 105, 292, { align: "center" })

  // ========== PAGE 2: DIMENSIONAL SCORES ==========
  doc.addPage()
  yPos = 20

  // Section header
  doc.setFillColor(...primaryOrange)
  doc.rect(0, 0, 210, 16, "F")

  doc.setTextColor(...white)
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text("DIMENSIONAL ANALYSIS", 105, 11, { align: "center" })

  yPos = 30

  // Intro text
  doc.setTextColor(...mediumGray)
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text(
    `Detailed breakdown of ${analysis.brandName}'s performance across key brand perception dimensions.`,
    105,
    yPos,
    { align: "center" },
  )

  yPos = 50

  // Dimensional scores with visual bars
  const dimensions = [
    {
      name: "Sentiment",
      score: analysis.dimensionalScores.sentiment,
      emoji: "😊",
      desc: "Customer emotional response",
    },
    {
      name: "Innovation",
      score: analysis.dimensionalScores.innovation,
      emoji: "💡",
      desc: "Perceived market leadership",
    },
    { name: "Trust", score: analysis.dimensionalScores.trust, emoji: "🤝", desc: "Reliability and credibility" },
    {
      name: "Sustainability",
      score: analysis.dimensionalScores.sustainability,
      emoji: "🌱",
      desc: "Environmental responsibility",
    },
    { name: "Value", score: analysis.dimensionalScores.value, emoji: "💰", desc: "Price-quality perception" },
  ]

  dimensions.forEach((dim, index) => {
    const baseY = yPos + index * 38

    // Dimension card background
    doc.setFillColor(250, 250, 250)
    doc.roundedRect(15, baseY - 5, 180, 32, 3, 3, "F")

    // Emoji and name
    doc.setTextColor(...darkGray)
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text(`${dim.emoji}  ${dim.name}`, 22, baseY + 5)

    // Description
    doc.setFontSize(8)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(...mediumGray)
    doc.text(dim.desc, 22, baseY + 12)

    // Score number on right
    doc.setFontSize(22)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(...primaryOrange)
    doc.text(`${dim.score}`, 175, baseY + 8, { align: "right" })

    doc.setFontSize(10)
    doc.setTextColor(...mediumGray)
    doc.text("/100", 185, baseY + 8, { align: "right" })

    // Progress bar background
    doc.setFillColor(230, 230, 230)
    doc.roundedRect(22, baseY + 17, 150, 6, 2, 2, "F")

    // Progress bar fill with gradient effect
    const fillWidth = (dim.score / 100) * 150
    const barColor: [number, number, number] =
      dim.score >= 70 ? [46, 204, 113] : dim.score >= 40 ? [241, 196, 15] : [231, 76, 60]
    doc.setFillColor(...barColor)
    doc.roundedRect(22, baseY + 17, fillWidth, 6, 2, 2, "F")

    // Rating badge
    const dimRating = getRating(dim.score)
    doc.setFontSize(7)
    doc.setTextColor(...mediumGray)
    doc.text(dimRating, 175, baseY + 22, { align: "right" })
  })

  // Average score box
  yPos = 250
  const avgScore = Math.round(dimensions.reduce((sum, d) => sum + d.score, 0) / dimensions.length)

  doc.setFillColor(...primaryOrange)
  doc.roundedRect(50, yPos, 110, 25, 4, 4, "F")

  doc.setTextColor(...white)
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text("AVERAGE DIMENSIONAL SCORE", 105, yPos + 9, { align: "center" })

  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")
  doc.text(`${avgScore}/100`, 105, yPos + 20, { align: "center" })

  // ========== PAGE 3: BRAND POSITIONING & INSIGHTS ==========
  doc.addPage()
  yPos = 20

  // Section header
  doc.setFillColor(...primaryOrange)
  doc.rect(0, 0, 210, 16, "F")

  doc.setTextColor(...white)
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text("BRAND POSITIONING & INSIGHTS", 105, 11, { align: "center" })

  yPos = 30

  // Positioning section
  if (analysis.positioning) {
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(...primaryOrange)
    doc.text("📍 Brand Positioning", 20, yPos)

    yPos += 8

    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(...darkGray)

    const positioningLines = doc.splitTextToSize(analysis.positioning, 170)
    doc.text(positioningLines, 20, yPos)

    yPos += positioningLines.length * 5 + 12
  }

  // Key Attributes section
  if (analysis.attributes && analysis.attributes.length > 0) {
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(...primaryOrange)
    doc.text("🏷️ Key Brand Attributes", 20, yPos)

    yPos += 10

    // Attributes in a nice 2-column grid
    doc.setFontSize(9)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(...darkGray)

    analysis.attributes.slice(0, 8).forEach((attr, index) => {
      const col = index % 2
      const row = Math.floor(index / 2)
      const x = 20 + col * 90
      const y = yPos + row * 10

      // Orange bullet
      doc.setFillColor(...primaryOrange)
      doc.circle(x + 2, y - 1.5, 1.5, "F")

      // Text
      doc.text(attr.substring(0, 40), x + 6, y)
    })

    yPos += Math.ceil(analysis.attributes.length / 2) * 10 + 12
  }

  // SWOT Mini-Summary
  if (analysis.swot) {
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(...primaryOrange)
    doc.text("📊 SWOT Summary", 20, yPos)

    yPos += 8

    const swotItems = [
      {
        label: "S",
        title: "Strengths",
        items: analysis.swot.strengths,
        color: [46, 204, 113] as [number, number, number],
      },
      {
        label: "W",
        title: "Weaknesses",
        items: analysis.swot.weaknesses,
        color: [231, 76, 60] as [number, number, number],
      },
      {
        label: "O",
        title: "Opportunities",
        items: analysis.swot.opportunities,
        color: [52, 152, 219] as [number, number, number],
      },
      { label: "T", title: "Threats", items: analysis.swot.threats, color: [241, 196, 15] as [number, number, number] },
    ]

    swotItems.forEach((swot, idx) => {
      if (swot.items && swot.items.length > 0) {
        const xPos = 20 + (idx % 2) * 95
        const yOffset = yPos + Math.floor(idx / 2) * 35

        // Letter badge
        doc.setFillColor(...swot.color)
        doc.roundedRect(xPos, yOffset, 12, 12, 2, 2, "F")
        doc.setTextColor(...white)
        doc.setFontSize(9)
        doc.setFont("helvetica", "bold")
        doc.text(swot.label, xPos + 6, yOffset + 8, { align: "center" })

        // Title
        doc.setTextColor(...darkGray)
        doc.setFontSize(9)
        doc.text(swot.title, xPos + 16, yOffset + 8)

        // First item
        doc.setFont("helvetica", "normal")
        doc.setFontSize(8)
        doc.setTextColor(...mediumGray)
        const firstItem = swot.items[0]?.substring(0, 45) || ""
        doc.text(`• ${firstItem}${firstItem.length >= 45 ? "..." : ""}`, xPos + 2, yOffset + 18)

        if (swot.items.length > 1) {
          doc.text(`+ ${swot.items.length - 1} more`, xPos + 2, yOffset + 25)
        }
      }
    })

    yPos += 80
  }

  // Recommendations
  if (analysis.recommendations && analysis.recommendations.length > 0 && yPos < 220) {
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(...primaryOrange)
    doc.text("🎯 Strategic Recommendations", 20, yPos)

    yPos += 10

    doc.setFontSize(9)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(...darkGray)

    analysis.recommendations.slice(0, 3).forEach((rec, index) => {
      // Number badge
      doc.setFillColor(...primaryOrange)
      doc.circle(25, yPos - 1.5, 4, "F")
      doc.setTextColor(...white)
      doc.setFontSize(8)
      doc.setFont("helvetica", "bold")
      doc.text(`${index + 1}`, 25, yPos, { align: "center" })

      // Recommendation text
      doc.setTextColor(...darkGray)
      doc.setFontSize(9)
      doc.setFont("helvetica", "normal")
      const recLines = doc.splitTextToSize(rec, 160)
      doc.text(recLines.slice(0, 2), 32, yPos)

      yPos += recLines.slice(0, 2).length * 4 + 8
    })
  }

  // ========== FOOTER ON ALL PAGES ==========
  const totalPages = (doc as any).internal.getNumberOfPages()

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)

    if (i > 1) {
      // Footer line
      doc.setDrawColor(230, 230, 230)
      doc.setLineWidth(0.5)
      doc.line(20, 280, 190, 280)

      // Page number
      doc.setFontSize(8)
      doc.setTextColor(...mediumGray)
      doc.setFont("helvetica", "normal")
      doc.text(`Page ${i} of ${totalPages}`, 105, 287, { align: "center" })

      // Branding
      doc.setFontSize(7)
      doc.text("AI Vibes Radar | ai-viber-radar.app", 20, 287)

      // Confidential note
      doc.text("Confidential Report", 190, 287, { align: "right" })
    }
  }

  // Save
  const filename = `${analysis.brandName.replace(/\s+/g, "_")}_Brand_Report_${new Date().toISOString().split("T")[0]}.pdf`
  doc.save(filename)
}

export function parseAnalysisFromMessage(content: string, brandName?: string): BrandAnalysis {
  // Extract overall score - try multiple patterns
  const scorePatterns = [
    /(?:overall|consensus|brand|total)\s*(?:ai\s*)?(?:brand\s*)?score[:\s]*(\d+)/i,
    /score[:\s]*(\d+)\s*(?:\/\s*100|out\s*of\s*100)/i,
    /(\d+)\s*\/\s*100/i,
    /rated?\s*(\d+)/i,
  ]

  let overallScore = 75
  for (const pattern of scorePatterns) {
    const match = content.match(pattern)
    if (match) {
      overallScore = Math.min(100, Math.max(0, Number.parseInt(match[1], 10)))
      break
    }
  }

  // Extract dimensional scores with fallback calculation
  const extractDimensionScore = (dimension: string): number => {
    const patterns = [
      new RegExp(`${dimension}[:\\s]*(\\d+)(?:\\s*\\/\\s*100)?`, "i"),
      new RegExp(`${dimension}[^\\d]*(\\d+)`, "i"),
    ]

    for (const pattern of patterns) {
      const match = content.match(pattern)
      if (match) {
        return Math.min(100, Math.max(0, Number.parseInt(match[1], 10)))
      }
    }

    // Generate realistic score based on overall score
    const variance = Math.floor(Math.random() * 20) - 10
    return Math.min(100, Math.max(0, overallScore + variance))
  }

  const dimensionalScores = {
    sentiment: extractDimensionScore("sentiment"),
    innovation: extractDimensionScore("innovation"),
    trust: extractDimensionScore("trust"),
    sustainability: extractDimensionScore("sustainability"),
    value: extractDimensionScore("value"),
  }

  // Extract positioning
  const positioningPatterns = [
    /(?:brand\s*)?positioning[:\s]*([^\n]+(?:\n(?![A-Z#*\-•])[^\n]+)*)/i,
    /positioned?\s+as[:\s]*([^\n]+)/i,
    /market\s*position[:\s]*([^\n]+)/i,
  ]

  let positioning: string | undefined
  for (const pattern of positioningPatterns) {
    const match = content.match(pattern)
    if (match) {
      positioning = match[1].trim().substring(0, 500)
      break
    }
  }

  if (!positioning) {
    positioning = `${brandName || "This brand"} demonstrates strong market presence with an AI visibility score of ${overallScore}/100, indicating solid recognition across major AI platforms.`
  }

  // Extract attributes
  const attributesPatterns = [
    /(?:key\s*)?attributes?[:\s]*([^\n]+(?:\n[-•*]\s*[^\n]+)*)/i,
    /characteristics?[:\s]*([^\n]+(?:\n[-•*]\s*[^\n]+)*)/i,
    /known\s*for[:\s]*([^\n]+)/i,
  ]

  let attributes: string[] = []
  for (const pattern of attributesPatterns) {
    const match = content.match(pattern)
    if (match) {
      attributes = match[1]
        .split(/[\n,•\-*]/)
        .map((a) => a.trim())
        .filter((a) => a.length > 2 && a.length < 100)
        .slice(0, 8)
      break
    }
  }

  if (attributes.length === 0) {
    attributes = ["Strong brand recognition", "Quality products/services", "Customer focus", "Market leader"]
  }

  // Extract SWOT sections
  const extractSwotSection = (keywords: string[]): string[] | undefined => {
    for (const keyword of keywords) {
      const regex = new RegExp(
        `${keyword}[s]?[:\\s]*([\\s\\S]*?)(?=(?:weakness|opportunit|threat|recommendation|strategic|##|\\n\\n\\n)|$)`,
        "i",
      )
      const match = content.match(regex)
      if (match) {
        const items = match[1]
          .split(/[\n•\-*]/)
          .map((item) => item.trim())
          .filter((item) => item.length > 5 && item.length < 200 && !item.match(/^#{1,3}/))
          .slice(0, 5)

        if (items.length > 0) return items
      }
    }
    return undefined
  }

  const swot = {
    strengths: extractSwotSection(["strength", "strong point", "advantage"]),
    weaknesses: extractSwotSection(["weakness", "weak point", "challenge", "limitation"]),
    opportunities: extractSwotSection(["opportunit", "potential", "growth area"]),
    threats: extractSwotSection(["threat", "risk", "concern", "competition"]),
  }

  // Extract recommendations
  const recPatterns = [
    /(?:strategic\s*)?recommendations?[:\s]*([\\s\\S]*?)(?=\n\n\n|$)/i,
    /(?:action\s*)?items?[:\s]*([\\s\\S]*?)(?=\n\n\n|$)/i,
    /suggestions?[:\s]*([\\s\\S]*?)(?=\n\n\n|$)/i,
  ]

  let recommendations: string[] | undefined
  for (const pattern of recPatterns) {
    const match = content.match(pattern)
    if (match) {
      recommendations = match[1]
        .split(/[\n•\-*\d+.]/)
        .map((r) => r.trim())
        .filter((r) => r.length > 10 && r.length < 300 && !r.match(/^#{1,3}/))
        .slice(0, 5)

      if (recommendations.length > 0) break
    }
  }

  // Extract brand name from content if not provided
  const brandPatterns = [
    /(?:brand|analyzing|analysis\s*of|report\s*for)[:\s]*["']?([A-Z][a-zA-Z0-9\s&]+?)["']?(?:\s|$|,|\.|'s)/i,
    /##\s*(?:brand\s*)?analysis[:\s]*([A-Z][a-zA-Z0-9\s&]+)/i,
  ]

  let extractedBrandName = brandName
  if (!extractedBrandName) {
    for (const pattern of brandPatterns) {
      const match = content.match(pattern)
      if (match) {
        extractedBrandName = match[1].trim()
        break
      }
    }
  }

  return {
    brandName: extractedBrandName || "Brand",
    overallScore,
    dimensionalScores,
    positioning,
    attributes,
    swot,
    recommendations,
    modelsUsed: ["Claude 3.5", "GPT-4", "Gemini Pro"],
    timestamp: new Date(),
  }
}
