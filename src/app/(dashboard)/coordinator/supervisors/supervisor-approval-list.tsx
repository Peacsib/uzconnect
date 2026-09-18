"use client"

import { useState } from "react"
import { approveSupervisorAccount } from "@/lib/actions/supervisors"
import { Building2, CheckCircle2, Mail, Phone, ShieldCheck, User } from "lucide-react"

export function SupervisorApprovalList({ supervisors }: { supervisors: any[] }) {
  const [list, setList] = useState(supervisors)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  async function handleApprove(id: string) {
    setLoadingId(id)
    try {
      await approveSupervisorAccount(id)
      setList(list.map((s) => (s.id === id ? { ...s, approved: true } : s)))
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {list.map((s) => (
        <div key={s.id} className="bg-card rounded-xl border p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                {s.user.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-sm">{s.user.name}</h3>
                <p className="text-xs text-muted-foreground">{s.position || "Workplace Supervisor"}</p>
              </div>
            </div>
            {s.approved ? (
              <span className="text-[11px] font-semibold text-green-600 dark:text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 size={12} />
                Approved
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                Pending
              </span>
            )}
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Building2 size={14} className="text-primary shrink-0" />
              <span className="font-semibold text-foreground">{s.company.name}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail size={14} className="shrink-0" />
              <span>{s.user.email}</span>
            </div>
            {s.user.phone && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone size={14} className="shrink-0" />
                <span>{s.user.phone}</span>
              </div>
            )}
          </div>

          <div className="pt-3 border-t flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {s.placements.length} Intern{s.placements.length !== 1 ? "s" : ""}
            </span>
            {!s.approved && (
              <button
                disabled={loadingId === s.id}
                onClick={() => handleApprove(s.id)}
                className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-lg hover:bg-primary/90 transition shadow-sm disabled:opacity-50"
              >
                {loadingId === s.id ? "Approving..." : "Approve Account"}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}