import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getStudentPlacement } from "@/lib/queries/placements"
import { PageHeader } from "@/components/common/page-header"
import { StatusBadge } from "@/components/common/status-badge"
import { formatDate } from "@/lib/utils"
import Link from "next/link"
import { Building2, User, Mail, Phone, Calendar, Clock, ArrowRight, ShieldCheck, MapPin } from "lucide-react"

export const metadata = { title: "My Placement | UZConnect" }

export default async function StudentPlacementPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const student = await getStudentPlacement(session.user.id)
  const placement = student?.placements?.[0]
  const pendingSubmission = student?.placementSubmissions?.find((s: any) => s.status === "PENDING")

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Work-Related Learning Placement"
        description="View your active placement details, company assignment, and designated supervisors."
        action={
          !placement && (
            <Link
              href="/student/submit-placement"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition shadow"
            >
              Submit Placement Details
              <ArrowRight size={16} />
            </Link>
          )
        }
      />

      {placement ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main placement details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-xl border p-6 shadow-sm">
              <div className="flex items-center justify-between border-b pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                    <Building2 size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{placement.company.name}</h2>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin size={14} />
                      {placement.company.address ? `${placement.company.address}, ${placement.company.city}` : "Harare, Zimbabwe"}
                    </p>
                  </div>
                </div>
                <StatusBadge status={placement.status} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="p-4 rounded-lg bg-muted/40 border">
                  <span className="text-muted-foreground block mb-1">Placement Duration</span>
                  <span className="font-semibold text-foreground flex items-center gap-2">
                    <Calendar size={16} className="text-primary" />
                    {formatDate(placement.startDate)} - {formatDate(placement.endDate)}
                  </span>
                </div>
                <div className="p-4 rounded-lg bg-muted/40 border">
                  <span className="text-muted-foreground block mb-1">Academic Programme</span>
                  <span className="font-semibold text-foreground">
                    {student?.programme?.name} ({student?.programme?.code})
                  </span>
                </div>
              </div>
            </div>

            {/* Supervision team */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Industry Supervisor */}
              <div className="bg-card rounded-xl border p-5 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <ShieldCheck size={18} />
                  <span>Workplace Supervisor</span>
                </div>
                <div>
                  <h3 className="font-semibold text-base">{placement.supervisor.user.name}</h3>
                  <p className="text-xs text-muted-foreground">{placement.supervisor.position || "Senior Mentor"}</p>
                </div>
                <div className="space-y-1.5 text-xs text-muted-foreground pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <Mail size={14} />
                    <span>{placement.supervisor.user.email}</span>
                  </div>
                </div>
              </div>

              {/* Academic Supervisor / Lecturer */}
              <div className="bg-card rounded-xl border p-5 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <User size={18} />
                  <span>University Academic Supervisor</span>
                </div>
                {placement.lecturer ? (
                  <>
                    <div>
                      <h3 className="font-semibold text-base">{placement.lecturer.user.name}</h3>
                      <p className="text-xs text-muted-foreground">{placement.lecturer.department.name}</p>
                    </div>
                    <div className="space-y-1.5 text-xs text-muted-foreground pt-2 border-t">
                      <div className="flex items-center gap-2">
                        <Mail size={14} />
                        <span>{placement.lecturer.user.email}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="py-4 text-center text-sm text-muted-foreground">
                    <Clock size={20} className="mx-auto mb-1 text-muted-foreground/60" />
                    Lecturer allocation pending coordinator assignment.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions & Guidelines */}
          <div className="space-y-6">
            <div className="bg-card rounded-xl border p-5 shadow-sm">
              <h3 className="font-semibold text-sm mb-3">Quick Navigation</h3>
              <div className="space-y-2 text-sm">
                <Link
                  href="/student/logbook"
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent hover:text-accent-foreground transition"
                >
                  <span>Weekly Logbook</span>
                  <ArrowRight size={14} className="text-muted-foreground" />
                </Link>
                <Link
                  href="/student/submissions"
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent hover:text-accent-foreground transition"
                >
                  <span>Assessments & Reports</span>
                  <ArrowRight size={14} className="text-muted-foreground" />
                </Link>
                <Link
                  href="/student/messages"
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent hover:text-accent-foreground transition"
                >
                  <span>Contact Supervisor</span>
                  <ArrowRight size={14} className="text-muted-foreground" />
                </Link>
              </div>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-xl p-5">
              <h3 className="font-semibold text-sm text-primary mb-2">Student Responsibilities</h3>
              <ul className="text-xs text-muted-foreground space-y-2 list-disc list-inside">
                <li>Submit your logbook every Friday for supervisor sign-off.</li>
                <li>Notify your academic supervisor of any workplace changes.</li>
                <li>Submit reports prior to stated due dates.</li>
              </ul>
            </div>
          </div>
        </div>
      ) : pendingSubmission ? (
        <div className="bg-card rounded-xl border p-8 text-center max-w-xl mx-auto space-y-4">
          <div className="w-14 h-14 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto">
            <Clock size={28} />
          </div>
          <h2 className="text-lg font-bold">Placement Application Under Review</h2>
          <p className="text-sm text-muted-foreground">
            You submitted placement details for <strong className="text-foreground">{pendingSubmission.companyName}</strong>. The university WRL coordinator is reviewing your submission and will assign an academic supervisor shortly.
          </p>
          <div className="text-xs text-muted-foreground border-t pt-4">
            Submission Date: {formatDate(pendingSubmission.createdAt)}
          </div>
        </div>
      ) : (
        <div className="bg-card rounded-xl border p-12 text-center max-w-lg mx-auto space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
            <Building2 size={32} />
          </div>
          <h2 className="text-xl font-bold">No Placement Registered Yet</h2>
          <p className="text-sm text-muted-foreground">
            You have not submitted your work-related learning placement information. Once you have secured a position, please submit your company and supervisor details for coordinator approval.
          </p>
          <Link
            href="/student/submit-placement"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition shadow"
          >
            Submit Placement Form
            <ArrowRight size={16} />
          </Link>
        </div>
      )}
    </div>
  )
}