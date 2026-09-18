"use client"

import { useState } from "react"
import { uploadSubmission } from "@/lib/actions/submissions"
import { Upload, X, Check, AlertCircle } from "lucide-react"

export function SubmissionUploadModal({
  submissionId,
  title,
  currentUrl,
}: {
  submissionId: string
  title: string
  currentUrl: string
}) {
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState(currentUrl)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave() {
    if (!url.trim()) return
    setLoading(true)
    setError(null)
    try {
      await uploadSubmission(submissionId, url.trim())
      setOpen(false)
    } catch (err: any) {
      setError(err.message || "Failed to submit document link.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-lg hover:bg-primary/90 transition shadow-sm"
      >
        <Upload size={13} />
        <span>{currentUrl ? "Update Document" : "Submit File Link"}</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border rounded-xl shadow-xl w-full max-w-md p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-base">Submit: {title}</h3>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-xs text-destructive flex items-center gap-2">
                <AlertCircle size={14} />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Document URL / Cloudinary / Google Drive link
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://drive.google.com/... or https://res.cloudinary.com/..."
                className="w-full px-3.5 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <p className="text-[11px] text-muted-foreground">
                Provide a shareable URL to your PDF report, presentation slides, or portfolio.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-4 py-2 border rounded-lg text-xs font-medium hover:bg-accent transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading || !url.trim()}
                onClick={handleSave}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 transition shadow disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Save Submission"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}