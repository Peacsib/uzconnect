"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { submitPlacementApplication } from "@/lib/actions/placement"
import { Building2, User, Mail, Phone, Calendar, MapPin, Briefcase, CheckCircle2, AlertCircle } from "lucide-react"

export function SubmitPlacementForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    try {
      await submitPlacementApplication(formData)
      setSuccess(true)
      setTimeout(() => {
        router.push("/student/placement")
      }, 2000)
    } catch (err: any) {
      setError(err.message || "Failed to submit placement application.")
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="bg-card rounded-xl border p-8 text-center space-y-4 shadow-sm animate-in fade-in-50">
        <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 size={28} />
        </div>
        <h3 className="text-lg font-bold">Placement Successfully Submitted!</h3>
        <p className="text-sm text-muted-foreground">
          Your details have been forwarded to the WRL Department Coordinator for review and lecturer assignment.
        </p>
        <p className="text-xs text-muted-foreground">Redirecting to your placement overview...</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card rounded-xl border p-6 shadow-sm space-y-6">
      {error && (
        <div className="p-3.5 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-3 text-sm text-destructive">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Company section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 font-semibold text-sm text-primary pb-2 border-b">
          <Building2 size={18} />
          <span>Company / Host Organization</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Company Name *</label>
            <input
              type="text"
              name="companyName"
              required
              placeholder="e.g. Econet Wireless Zimbabwe"
              className="w-full px-3.5 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Physical Address *</label>
            <input
              type="text"
              name="companyAddress"
              required
              placeholder="e.g. 1906 Borrowdale Road"
              className="w-full px-3.5 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">City / Town *</label>
            <input
              type="text"
              name="companyCity"
              required
              placeholder="e.g. Harare"
              className="w-full px-3.5 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </div>

      {/* Supervisor section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 font-semibold text-sm text-primary pb-2 border-b">
          <User size={18} />
          <span>Industry Supervisor / Mentor Details</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Supervisor Full Name *</label>
            <input
              type="text"
              name="supervisorName"
              required
              placeholder="e.g. Eng. Tendai Moyo"
              className="w-full px-3.5 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Supervisor Job Title</label>
            <input
              type="text"
              name="position"
              placeholder="e.g. Principal Software Engineer"
              className="w-full px-3.5 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Supervisor Email *</label>
            <input
              type="email"
              name="supervisorEmail"
              required
              placeholder="supervisor@company.co.zw"
              className="w-full px-3.5 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Supervisor Phone *</label>
            <input
              type="tel"
              name="supervisorPhone"
              required
              placeholder="+263 77 123 4567"
              className="w-full px-3.5 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </div>

      {/* Dates section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 font-semibold text-sm text-primary pb-2 border-b">
          <Calendar size={18} />
          <span>Placement Duration</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Expected Start Date</label>
            <input
              type="date"
              name="startDate"
              className="w-full px-3.5 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Expected End Date</label>
            <input
              type="date"
              name="endDate"
              className="w-full px-3.5 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </div>

      <div className="pt-4 border-t flex items-center justify-end gap-3">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 transition shadow"
        >
          {loading ? "Submitting..." : "Submit Placement for Approval"}
        </button>
      </div>
    </form>
  )
}