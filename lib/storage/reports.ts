import { createServiceClient } from "@/lib/supabase/server"

const BUCKET_NAME = "reports"

/**
 * Upload a PDF report to Supabase storage
 * Returns the storage path
 */
export async function uploadReport(pdf: Buffer, userId: string, analysisId: string): Promise<string> {
  const supabase = createServiceClient()

  const filename = `${analysisId}.pdf`
  const path = `${userId}/${filename}`

  const { error } = await supabase.storage.from(BUCKET_NAME).upload(path, pdf, {
    contentType: "application/pdf",
    upsert: true,
  })

  if (error) {
    console.error("[Storage] Upload error:", error)
    throw new Error(`Failed to upload report: ${error.message}`)
  }

  return path
}

/**
 * Get a signed URL for a report (valid for 1 hour)
 */
export async function getReportUrl(path: string): Promise<string> {
  const supabase = createServiceClient()

  const { data, error } = await supabase.storage.from(BUCKET_NAME).createSignedUrl(path, 3600) // 1 hour expiry

  if (error) {
    console.error("[Storage] Signed URL error:", error)
    throw new Error(`Failed to get report URL: ${error.message}`)
  }

  return data.signedUrl
}

/**
 * Delete a report from storage
 */
export async function deleteReport(path: string): Promise<void> {
  const supabase = createServiceClient()

  const { error } = await supabase.storage.from(BUCKET_NAME).remove([path])

  if (error) {
    console.error("[Storage] Delete error:", error)
    throw new Error(`Failed to delete report: ${error.message}`)
  }
}

/**
 * List all reports for a user
 */
export async function listUserReports(userId: string): Promise<string[]> {
  const supabase = createServiceClient()

  const { data, error } = await supabase.storage.from(BUCKET_NAME).list(userId)

  if (error) {
    console.error("[Storage] List error:", error)
    return []
  }

  return data.map((file) => `${userId}/${file.name}`)
}
