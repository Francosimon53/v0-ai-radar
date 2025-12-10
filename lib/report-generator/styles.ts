import { StyleSheet } from "@react-pdf/renderer"

// Color palette
export const colors = {
  primary: "#3b82f6",
  primaryDark: "#2563eb",
  slate: "#1e293b",
  slateLight: "#334155",
  slateText: "#64748b",
  danger: "#ef4444",
  dangerLight: "#fef2f2",
  success: "#22c55e",
  successLight: "#f0fdf4",
  warning: "#f59e0b",
  warningLight: "#fffbeb",
  white: "#ffffff",
  gray: "#f1f5f9",
  grayDark: "#94a3b8",
}

export const styles = StyleSheet.create({
  // Page styles
  page: {
    backgroundColor: colors.white,
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: colors.slate,
  },
  pageWithWatermark: {
    position: "relative",
  },
  watermark: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%) rotate(-45deg)",
    fontSize: 60,
    color: "#e2e8f0",
    opacity: 0.3,
    fontFamily: "Helvetica-Bold",
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: colors.slateText,
  },

  // Typography
  title: {
    fontSize: 28,
    fontFamily: "Helvetica-Bold",
    color: colors.slate,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.slateText,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: colors.slate,
    marginBottom: 12,
    marginTop: 8,
  },
  heading: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: colors.slate,
    marginBottom: 8,
  },
  body: {
    fontSize: 10,
    lineHeight: 1.5,
    color: colors.slate,
  },
  bodySmall: {
    fontSize: 9,
    lineHeight: 1.4,
    color: colors.slateText,
  },
  label: {
    fontSize: 8,
    color: colors.slateText,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },

  // Score display
  scoreHuge: {
    fontSize: 72,
    fontFamily: "Helvetica-Bold",
    color: colors.primary,
  },
  scoreLarge: {
    fontSize: 36,
    fontFamily: "Helvetica-Bold",
    color: colors.primary,
  },
  scoreMedium: {
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
  },
  scoreLabel: {
    fontSize: 12,
    color: colors.slateText,
  },

  // Cards
  card: {
    backgroundColor: colors.gray,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  cardWhite: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    border: `1px solid ${colors.gray}`,
  },
  cardDanger: {
    backgroundColor: colors.dangerLight,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeft: `4px solid ${colors.danger}`,
  },
  cardSuccess: {
    backgroundColor: colors.successLight,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeft: `4px solid ${colors.success}`,
  },
  cardWarning: {
    backgroundColor: colors.warningLight,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeft: `4px solid ${colors.warning}`,
  },
  cardPrimary: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },

  // Tables
  table: {
    width: "100%",
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: colors.slate,
    padding: 8,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  tableHeaderCell: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: colors.white,
    flex: 1,
  },
  tableRow: {
    flexDirection: "row",
    padding: 8,
    borderBottom: `1px solid ${colors.gray}`,
  },
  tableRowHighlight: {
    flexDirection: "row",
    padding: 8,
    backgroundColor: "#eff6ff",
    borderBottom: `1px solid ${colors.gray}`,
  },
  tableCell: {
    fontSize: 9,
    flex: 1,
    color: colors.slate,
  },

  // Flexbox layouts
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  column: {
    flexDirection: "column",
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
  gap4: {
    gap: 4,
  },
  gap8: {
    gap: 8,
  },
  gap12: {
    gap: 12,
  },

  // Spacing
  mb4: { marginBottom: 4 },
  mb8: { marginBottom: 8 },
  mb12: { marginBottom: 12 },
  mb16: { marginBottom: 16 },
  mb24: { marginBottom: 24 },
  mt8: { marginTop: 8 },
  mt16: { marginTop: 16 },

  // Progress bar
  progressBar: {
    height: 8,
    backgroundColor: colors.gray,
    borderRadius: 4,
    overflow: "hidden",
    marginTop: 4,
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 4,
  },

  // Badges
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
  },
  badgeSuccess: {
    backgroundColor: colors.successLight,
    color: colors.success,
  },
  badgeDanger: {
    backgroundColor: colors.dangerLight,
    color: colors.danger,
  },
  badgeWarning: {
    backgroundColor: colors.warningLight,
    color: colors.warning,
  },

  // Bullet points
  bulletItem: {
    flexDirection: "row",
    marginBottom: 6,
  },
  bullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
    marginRight: 8,
    marginTop: 4,
  },
  bulletText: {
    flex: 1,
    fontSize: 10,
    lineHeight: 1.4,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: colors.gray,
    marginVertical: 16,
  },
})
