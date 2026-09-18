"use client"

import { useState } from "react"
import { saveLogbookEntry } from "@/lib/actions/logbook"
import { StatusBadge } from "@/components/common/status-badge"
import { formatDate } from "@/lib/utils"
import { BookOpen, CheckCircle, Clock, MessageSquare, AlertCircle, Save, Send } from "lucide-react"

interface LogbookViewProps {
  placementId: string
  entries: any[]
  deadlines: any[]
}

export function LogbookView({ placementId, entries, deadlines }: LogbookViewProps) {
  const [selectedWeek, setSelectedWeek] = useState(1)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const currentEntry = entries.find((e) => e.week === selectedWeek)
  const currentDeadline = deadlines.find((d) => d.week === selectedWeek)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>, action: "draft" | "submit") {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const form = e.currentTarget
    const formData = new FormData(form)
    formData.set("week", selectedWeek.toString())
    formData.set("action", action)

    try {
      await saveLogbookEntry(formData)
      setMessage({
        type: "success",
        text: action === "submit" ? "Week logbook submitted for supervisor approval!" : "Draft saved successfully!",
      })
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to save entry." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Weeks list navigation */}
      <div className="lg:col-span-1 space-y-3">
        <div className="bg-card rounded-xl border p-4 shadow-sm">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Placement Weeks (1 - 12)
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-1 gap-1.5">
            {Array.from({ length: 12 }, (_, i) => i + 1).map((w) => {
              const entry = entries.find((e) => e.week === w)
              const isSelected = selectedWeek === w
              return (
                <button
                  key={w}
                  onClick={() => {
                    setSelectedWeek(w)
                    setMessage(null)
                  }}
                  className={`flex items-center justify-between p-2.5 rounded-lg text-xs font-medium transition text-left ${
                    isSelected
                      ? "bg-primary text-primary-foreground shadow"
                      : "hover:bg-accent text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <BookOpen size={14} />
                    <span>Week {w}</span>
                  </div>
                  {entry && (
                    <span
                      className={`w-2 h-2 rounded-full ${
                        entry.status === "APPROVED"
                          ? "bg-green-500"
                          : entry.status === "SUBMITTED"
                          ? "bg-amber-500"
                          : "bg-muted-foreground/40"
                      }`}
                    />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Deadline alert */}
        {currentDeadline && (
          <div className="p-3.5 rounded-xl border bg-muted/30 text-xs space-y-1">
            <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
              <Clock size={13} />
              Week {selectedWeek} Deadline
            </span>
            <p className="font-semibold text-foreground">{formatDate(currentDeadline.dueDate)}</p>
          </div>
        )}
      </div>

      {/* Main logbook entry editor & review status */}
      <div className="lg:col-span-3 space-y-6">
        {message && (
          <div
            className={`p-4 rounded-xl border flex items-center gap-3 text-sm ${
              message.type === "success"
                ? "bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-400"
                : "bg-destructive/10 border-destructive/20 text-destructive"
            }`}
          >
            {message.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Status card */}
        <div className="bg-card rounded-xl border p-5 shadow-sm flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">Week {selectedWeek} Logbook Entry</h2>
            <p className="text-xs text-muted-foreground">
              {currentEntry?.submittedAt ? `Submitted on ${formatDate(currentEntry.submittedAt)}` : "Not submitted"}
            </p>
          </div>
          <StatusBadge status={currentEntry?.status ?? "NOT_STARTED"} />
        </div>

        {/* Supervisor & Lecturer feedback comments */}
        {(currentEntry?.supervisorComment || currentEntry?.lecturerComment) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentEntry?.supervisorComment && (
              <div className="p-4 rounded-xl border bg-card shadow-sm space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                  <MessageSquare size={14} />
                  <span>Workplace Supervisor Feedback</span>
                </div>
                <p className="text-sm text-foreground italic">"{currentEntry.supervisorComment}"</p>
              </div>
            )}
            {currentEntry?.lecturerComment && (
              <div className="p-4 rounded-xl border bg-card shadow-sm space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                  <MessageSquare size={14} />
                  <span>Academic Supervisor Feedback</span>
                </div>
                <p className="text-sm text-foreground italic">"{currentEntry.lecturerComment}"</p>
              </div>
            )}
          </div>
        )}

        {/* Entry form */}
        <form
          key={selectedWeek}
          onSubmit={(e) => handleSubmit(e, "submit")}
          className="bg-card rounded-xl border p-6 shadow-sm space-y-5"
        >
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Week Ending Date</label>
            <input
              type="date"
              name="weekEndingDate"
              defaultValue={
                currentEntry?.weekEndingDate
                  ? new Date(currentEntry.weekEndingDate).toISOString().split("T")[0]
                  : new Date().toISOString().split("T")[0]
              }
              disabled={currentEntry?.status === "APPROVED"}
              className="w-full md:w-64 px-3.5 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Weekly Learning Objectives (Goals planned for this week) *
            </label>
            <textarea
              name="objectives"
              required
              rows={3}
              defaultValue={currentEntry?.objectives ?? ""}
              disabled={currentEntry?.status === "APPROVED"}
              placeholder="e.g. Master Docker containerization for the microservices backend and configure CI/CD pipelines..."
              className="w-full p-3.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Actual Tasks & Technical Activities Completed *
            </label>
            <textarea
              name="actualTasks"
              required
              rows={5}
              defaultValue={currentEntry?.actualTasks ?? ""}
              disabled={currentEntry?.status === "APPROVED"}
              placeholder="Detail specific tasks performed, code written, meetings attended, problems resolved..."
              className="w-full p-3.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Student Reflection & Lessons Learned *
            </label>
            <textarea
              name="reflection"
              required
              rows={3}
              defaultValue={currentEntry?.reflection ?? ""}
              disabled={currentEntry?.status === "APPROVED"}
              placeholder="Reflect on key skills acquired, professional standards observed, and how this relates to your degree coursework..."
              className="w-full p-3.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {currentEntry?.status !== "APPROVED" && (
            <div className="pt-4 border-t flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={loading}
                onClick={(e) => {
                  const form = (e.target as HTMLElement).closest("form")
                  if (form) handleSubmit({ currentTarget: form, preventDefault: () => {} } as any, "draft")
                }}
                className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium hover:bg-accent transition"
              >
                <Save size={16} />
                <span>Save Draft</span>
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition shadow"
              >
                <Send size={16} />
                <span>{loading ? "Submitting..." : "Submit for Approval"}</span>
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}