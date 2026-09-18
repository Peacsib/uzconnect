"use client"

import { useState } from "react"
import { approvePlacementSubmission, rejectPlacementSubmission } from "@/lib/actions/placement"
import { StatusBadge } from "@/components/common/status-badge"
import { formatDate } from "@/lib/utils"
import { CheckCircle2, XCircle, Building2, User, Mail, Phone, Calendar, Clock, AlertCircle } from "lucide-react"

export function CoordinatorPlacementsView({
  pendingSubmissions,
  activePlacements,
  lecturers,
}: {
  pendingSubmissions: any[]
  activePlacements: any[]
  lecturers: any[]
}) {
  const [tab, setTab] = useState<"pending" | "active">("pending")
  const [selectedSub, setSelectedSub] = useState<any | null>(null)
  const [lecturerId, setLecturerId] = useState(lecturers[0]?.id ?? "")
  const [rejectReason, setRejectReason] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleApprove() {
    if (!selectedSub) return
    setLoading(true)
    setError(null)
    try {
      await approvePlacementSubmission(selectedSub.id, lecturerId || undefined)
      setSelectedSub(null)
    } catch (err: any) {
      setError(err.message || "Approval failed.")
    } finally {
      setLoading(false)
    }
  }

  async function handleReject() {
    if (!selectedSub || !rejectReason.trim()) return
    setLoading(true)
    setError(null)
    try {
      await rejectPlacementSubmission(selectedSub.id, rejectReason)
      setSelectedSub(null)
    } catch (err: any) {
      setError(err.message || "Rejection failed.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex border-b">
        <button
          onClick={() => setTab("pending")}
          className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
            tab === "pending"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Clock size={16} />
          <span>Pending Submissions ({pendingSubmissions.length})</span>
        </button>
        <button
          onClick={() => setTab("active")}
          className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
            tab === "active"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <CheckCircle2 size={16} />
          <span>Active Placements ({activePlacements.length})</span>
        </button>
      </div>

      {tab === "pending" ? (
        pendingSubmissions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pendingSubmissions.map((sub) => (
              <div key={sub.id} className="bg-card rounded-xl border p-6 shadow-sm space-y-4">
                <div className="flex items-start justify-between border-b pb-3">
                  <div>
                    <h3 className="font-bold text-base">{sub.student.user.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {sub.student.regNumber} • {sub.student.programme.code}
                    </p>
                  </div>
                  <StatusBadge status={sub.status} />
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-muted/40 rounded-lg space-y-1">
                    <span className="font-semibold text-primary block flex items-center gap-1.5">
                      <Building2 size={14} />
                      {sub.companyName}
                    </span>
                    <span className="text-muted-foreground block">{sub.companyAddress}, {sub.companyCity}</span>
                  </div>

                  <div className="p-3 bg-muted/40 rounded-lg space-y-1">
                    <span className="font-semibold text-foreground block">Supervisor: {sub.supervisorName}</span>
                    <div className="text-muted-foreground flex flex-col gap-0.5">
                      <span>Email: {sub.supervisorEmail}</span>
                      <span>Phone: {sub.supervisorPhone}</span>
                    </div>
                  </div>

                  {sub.startDate && sub.endDate && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Calendar size={13} className="text-primary" />
                      <span>{formatDate(sub.startDate)} - {formatDate(sub.endDate)}</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t flex items-center justify-end gap-2">
                  <button
                    onClick={() => setSelectedSub(sub)}
                    className="px-4 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-lg hover:bg-primary/90 transition shadow-sm"
                  >
                    Review & Approve
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-card rounded-xl border p-12 text-center max-w-md mx-auto space-y-3">
            <CheckCircle2 size={32} className="mx-auto text-muted-foreground" />
            <p className="font-medium">No Pending Placement Applications</p>
            <p className="text-xs text-muted-foreground">All submitted placements have been reviewed.</p>
          </div>
        )
      ) : (
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 border-b text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-semibold">Student / Reg No.</th>
                  <th className="px-5 py-3 font-semibold">Host Organization</th>
                  <th className="px-5 py-3 font-semibold">Assigned Lecturer</th>
                  <th className="px-5 py-3 font-semibold">Workplace Supervisor</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {activePlacements.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/30 transition">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-foreground">{p.student.user.name}</div>
                      <div className="text-xs text-muted-foreground">{p.student.regNumber}</div>
                    </td>
                    <td className="px-5 py-4 font-medium">{p.company.name}</td>
                    <td className="px-5 py-4 text-xs">
                      {p.lecturer ? p.lecturer.user.name : <span className="text-muted-foreground italic">Unassigned</span>}
                    </td>
                    <td className="px-5 py-4 text-xs">{p.supervisor.user.name}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={p.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border rounded-xl shadow-xl w-full max-w-lg p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-base">Review Placement Application</h3>
                <p className="text-xs text-muted-foreground">
                  {selectedSub.student.user.name} ({selectedSub.student.regNumber})
                </p>
              </div>
              <button onClick={() => setSelectedSub(null)} className="text-muted-foreground hover:text-foreground">
                x
              </button>
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-lg flex items-center gap-2">
                <AlertCircle size={14} />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-muted/40 rounded-lg space-y-1">
                <span className="font-bold text-foreground">{selectedSub.companyName}</span>
                <p className="text-muted-foreground">{selectedSub.companyAddress}, {selectedSub.companyCity}</p>
                <p className="text-muted-foreground">
                  Supervisor: {selectedSub.supervisorName} ({selectedSub.supervisorEmail} / {selectedSub.supervisorPhone})
                </p>
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-semibold text-foreground">Allocate Academic Supervisor / Lecturer *</label>
                <select
                  value={lecturerId}
                  onChange={(e) => setLecturerId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">-- Select Lecturer --</option>
                  {lecturers.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.user.name} ({l.department.name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-semibold text-foreground">Rejection Reason (only if declining)</label>
                <input
                  type="text"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Incomplete company accreditation documentation..."
                  className="w-full px-3.5 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                disabled={loading}
                onClick={handleReject}
                className="px-4 py-2 bg-destructive/10 text-destructive rounded-lg text-xs font-medium hover:bg-destructive/20 transition"
              >
                Reject Application
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleApprove}
                className="px-5 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 transition shadow"
              >
                {loading ? "Processing..." : "Approve & Create Placement"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}