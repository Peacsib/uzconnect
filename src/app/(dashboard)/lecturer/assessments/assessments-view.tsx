"use client"

import { useState } from "react"
import { gradeSubmission } from "@/lib/actions/assessments"
import { StatusBadge } from "@/components/common/status-badge"
import { formatDate } from "@/lib/utils"
import { Award, FileText, ExternalLink, CheckCircle2, Star, AlertCircle, X } from "lucide-react"

export function LecturerAssessmentsView({
  submissions,
  rubrics,
}: {
  submissions: any[]
  rubrics: any[]
}) {
  const [selectedSub, setSelectedSub] = useState<any | null>(null)
  const [tech, setTech] = useState(80)
  const [prof, setProf] = useState(85)
  const [comm, setComm] = useState(80)
  const [comments, setComments] = useState("")
  const [rubricId, setRubricId] = useState(rubrics[0]?.id ?? "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleGrade(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedSub) return
    setLoading(true)
    setError(null)
    try {
      await gradeSubmission({
        submissionId: selectedSub.id,
        technicalScore: Number(tech),
        professionalScore: Number(prof),
        communicationScore: Number(comm),
        comments,
        rubricId: rubricId || undefined,
      })
      setSelectedSub(null)
    } catch (err: any) {
      setError(err.message || "Failed to submit assessment.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {submissions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {submissions.map((sub) => {
            const hasGraded = sub.assessments.length > 0
            const assessment = sub.assessments[0]

            return (
              <div key={sub.id} className="bg-card rounded-xl border p-6 shadow-sm flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-base">{sub.title}</h3>
                      <p className="text-xs text-muted-foreground">
                        {sub.placement.student.user.name} ({sub.placement.student.regNumber})
                      </p>
                    </div>
                    <StatusBadge status={sub.status} />
                  </div>

                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>Company: <strong className="text-foreground">{sub.placement.company.name}</strong></div>
                    <div>Due Date: {formatDate(sub.dueDate)}</div>
                    {sub.submittedAt && (
                      <div className="text-green-600 dark:text-green-400">
                        Submitted: {formatDate(sub.submittedAt)}
                      </div>
                    )}
                  </div>

                  {sub.fileUrl && (
                    <div className="pt-2">
                      <a
                        href={sub.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-primary font-medium hover:underline"
                      >
                        <ExternalLink size={13} />
                        <span>View Submitted Deliverable</span>
                      </a>
                    </div>
                  )}

                  {hasGraded && (
                    <div className="p-3 bg-muted/40 rounded-lg border text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold">
                        <span>Overall Score</span>
                        <span className="text-primary text-sm">{assessment.overallScore}%</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1 text-[11px] text-muted-foreground pt-1">
                        <span>Tech: {assessment.technicalScore}%</span>
                        <span>Prof: {assessment.professionalScore}%</span>
                        <span>Comm: {assessment.communicationScore}%</span>
                      </div>
                      {assessment.comments && (
                        <p className="text-muted-foreground italic pt-1">"{assessment.comments}"</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t flex items-center justify-end">
                  <button
                    onClick={() => {
                      setSelectedSub(sub)
                      if (hasGraded) {
                        setTech(assessment.technicalScore)
                        setProf(assessment.professionalScore)
                        setComm(assessment.communicationScore)
                        setComments(assessment.comments || "")
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-lg hover:bg-primary/90 transition shadow-sm"
                  >
                    <Award size={13} />
                    <span>{hasGraded ? "Update Grade" : "Grade Submission"}</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-card rounded-xl border p-12 text-center max-w-md mx-auto space-y-3">
          <Award size={32} className="mx-auto text-muted-foreground" />
          <p className="font-medium">No Submissions Found</p>
          <p className="text-xs text-muted-foreground">Deliverables from assigned students will appear here.</p>
        </div>
      )}

      {/* Grading Modal */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border rounded-xl shadow-xl w-full max-w-md p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-base">Grade: {selectedSub.title}</h3>
                <p className="text-xs text-muted-foreground">{selectedSub.placement.student.user.name}</p>
              </div>
              <button onClick={() => setSelectedSub(null)} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-lg flex items-center gap-2">
                <AlertCircle size={14} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleGrade} className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <label>Technical Competence (0 - 100)</label>
                  <span>{tech}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={tech}
                  onChange={(e) => setTech(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <label>Professional Conduct & Initiative (0 - 100)</label>
                  <span>{prof}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={prof}
                  onChange={(e) => setProf(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <label>Documentation & Communication (0 - 100)</label>
                  <span>{comm}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={comm}
                  onChange={(e) => setComm(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 flex items-center justify-between text-xs font-bold text-primary">
                <span>Calculated Overall Average</span>
                <span>{Math.round(((tech + prof + comm) / 3) * 10) / 10}%</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Examiner Remarks / Justification</label>
                <textarea
                  rows={3}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Provide qualitative comments on the student's deliverable..."
                  className="w-full p-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setSelectedSub(null)}
                  className="px-4 py-2 border rounded-lg text-xs font-medium hover:bg-accent transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 transition shadow disabled:opacity-50"
                >
                  {loading ? "Recording..." : "Save Assessment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}