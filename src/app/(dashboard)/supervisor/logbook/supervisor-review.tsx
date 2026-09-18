"use client"

import { useState } from "react"
import { approveLogbookSupervisor } from "@/lib/actions/logbook"
import { StatusBadge } from "@/components/common/status-badge"
import { formatDate } from "@/lib/utils"
import { BookOpen, CheckCircle, MessageSquare, ShieldCheck } from "lucide-react"

export function SupervisorLogbookReview({ entries }: { entries: any[] }) {
  const [activeEntry, setActiveEntry] = useState<any | null>(entries.length > 0 ? entries[0] : null)
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleApprove() {
    if (!activeEntry) return
    setLoading(true)
    try {
      await approveLogbookSupervisor(activeEntry.id, comment)
      setSuccess(true)
      activeEntry.supervisorApproved = true
      activeEntry.supervisorComment = comment
      setTimeout(() => setSuccess(false), 3000)
    } finally {
      setLoading(false)
    }
  }

  if (entries.length === 0) {
    return (
      <div className="bg-card rounded-xl border p-12 text-center max-w-md mx-auto space-y-3">
        <BookOpen size={32} className="mx-auto text-muted-foreground" />
        <p className="font-medium">No Logbook Entries Awaiting Approval</p>
        <p className="text-xs text-muted-foreground">
          Entries submitted by your interns will appear here weekly for verification.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Sidebar List */}
      <div className="lg:col-span-1 space-y-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Intern Entries ({entries.length})
        </h3>
        <div className="space-y-2">
          {entries.map((entry) => {
            const isSelected = activeEntry?.id === entry.id
            return (
              <button
                key={entry.id}
                onClick={() => {
                  setActiveEntry(entry)
                  setComment(entry.supervisorComment || "")
                }}
                className={`w-full p-4 rounded-xl border text-left transition space-y-2 ${
                  isSelected ? "bg-card border-primary ring-2 ring-primary/20 shadow-sm" : "bg-card hover:bg-muted/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-foreground">
                    {entry.placement.student.user.name}
                  </span>
                  <StatusBadge status={entry.status} />
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Week {entry.week} Logbook</span>
                  <span>{formatDate(entry.weekEndingDate)}</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Detail */}
      <div className="lg:col-span-2 space-y-6">
        {activeEntry && (
          <div className="bg-card rounded-xl border p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h2 className="text-xl font-bold">
                  {activeEntry.placement.student.user.name} - Week {activeEntry.week}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {activeEntry.placement.student.regNumber} • {activeEntry.placement.student.programme.name}
                </p>
              </div>
              <StatusBadge status={activeEntry.status} />
            </div>

            {/* Entry Content */}
            <div className="space-y-4 text-sm">
              <div className="p-4 rounded-lg bg-muted/40 border space-y-1">
                <span className="font-semibold text-xs text-primary block">Planned Learning Objectives:</span>
                <p className="text-foreground">{activeEntry.objectives}</p>
              </div>

              <div className="p-4 rounded-lg bg-muted/40 border space-y-1">
                <span className="font-semibold text-xs text-primary block">Actual Workplace Tasks Completed:</span>
                <p className="text-foreground whitespace-pre-wrap">{activeEntry.actualTasks}</p>
              </div>

              <div className="p-4 rounded-lg bg-muted/40 border space-y-1">
                <span className="font-semibold text-xs text-primary block">Intern Reflection & Self-Evaluation:</span>
                <p className="text-foreground italic">{activeEntry.reflection}</p>
              </div>
            </div>

            {/* Review form */}
            <div className="border-t pt-5 space-y-4">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <ShieldCheck size={16} className="text-primary" />
                <span>Workplace Supervisor Verification & Remarks</span>
              </h4>

              {success && (
                <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-400 rounded-lg text-xs flex items-center gap-2">
                  <CheckCircle size={14} />
                  <span>Logbook verified and signed off successfully!</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Supervisor Feedback on Performance & Conduct
                </label>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Record comments on punctuality, quality of work, teamwork, or technical growth..."
                  className="w-full p-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="flex items-center justify-end">
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleApprove}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition shadow disabled:opacity-50"
                >
                  <CheckCircle size={16} />
                  <span>{loading ? "Verifying..." : "Verify & Sign Off Week"}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}