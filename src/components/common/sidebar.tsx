"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { cn, getInitials } from "@/lib/utils"
import {
  LayoutDashboard, FileText, MapPin, BookOpen, MessageSquare,
  Users, ClipboardCheck, BarChart3, Settings, LogOut, ChevronLeft,
  Bell, Upload, Star, Building2, Award, Calendar,
} from "lucide-react"
import { useState } from "react"

const STUDENT_NAV = [
  { label: "Overview", href: "/student", icon: LayoutDashboard },
  { label: "My Placement", href: "/student/placement", icon: MapPin },
  { label: "Submit Placement", href: "/student/submit-placement", icon: Upload },
  { label: "Logbook", href: "/student/logbook", icon: BookOpen },
  { label: "Submissions", href: "/student/submissions", icon: FileText },
  { label: "Deadlines", href: "/student/deadlines", icon: Calendar },
  { label: "Feedback", href: "/student/feedback", icon: Star },
  { label: "Messages", href: "/student/messages", icon: MessageSquare },
]

const SUPERVISOR_NAV = [
  { label: "Overview", href: "/supervisor", icon: LayoutDashboard },
  { label: "My Students", href: "/supervisor/students", icon: Users },
  { label: "Confirmations", href: "/supervisor/confirmations", icon: ClipboardCheck },
  { label: "Logbook Review", href: "/supervisor/logbook", icon: BookOpen },
  { label: "Submissions", href: "/supervisor/submissions", icon: FileText },
  { label: "Assessments", href: "/supervisor/assessments", icon: Award },
  { label: "Messages", href: "/supervisor/messages", icon: MessageSquare },
]

const LECTURER_NAV = [
  { label: "Overview", href: "/lecturer", icon: LayoutDashboard },
  { label: "Students", href: "/lecturer/students", icon: Users },
  { label: "Placements", href: "/lecturer/placements", icon: MapPin },
  { label: "Logbook", href: "/lecturer/logbook", icon: BookOpen },
  { label: "Supervisors", href: "/lecturer/supervisors", icon: Building2 },
  { label: "Assessments", href: "/lecturer/assessments", icon: Award },
  { label: "Analytics", href: "/lecturer/analytics", icon: BarChart3 },
  { label: "Messages", href: "/lecturer/messages", icon: MessageSquare },
]

const COORDINATOR_NAV = [
  { label: "Overview", href: "/coordinator", icon: LayoutDashboard },
  { label: "Students", href: "/coordinator/students", icon: Users },
  { label: "Import Students", href: "/coordinator/students/import", icon: Upload },
  { label: "Placements", href: "/coordinator/placements", icon: MapPin },
  { label: "Rubrics", href: "/coordinator/rubrics", icon: ClipboardCheck },
  { label: "Supervisors", href: "/coordinator/supervisors", icon: Building2 },
  { label: "Messages", href: "/coordinator/messages", icon: MessageSquare },
]

const NAV_BY_ROLE: Record<string, typeof STUDENT_NAV> = {
  STUDENT: STUDENT_NAV,
  SUPERVISOR: SUPERVISOR_NAV,
  LECTURER: LECTURER_NAV,
  COORDINATOR: COORDINATOR_NAV,
}

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [collapsed, setCollapsed] = useState(false)
  const role = session?.user?.role as string
  const navItems = NAV_BY_ROLE[role] ?? []

  return (
    <aside className={cn(
      "flex flex-col h-screen bg-card border-r transition-all duration-300 sticky top-0",
      collapsed ? "w-16" : "w-60"
    )}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b">
        <div className="w-8 h-8 shrink-0 bg-primary rounded-lg flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-sm">UZ</span>
        </div>
        {!collapsed && <span className="font-bold text-base tracking-tight">UZConnect</span>}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
        {navItems.map((item) => {
          const active = item.href === "/student" || item.href === "/supervisor" || item.href === "/lecturer" || item.href === "/coordinator"
            ? pathname === item.href
            : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <item.icon size={18} className="shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="border-t p-3 space-y-1">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground text-sm transition"
        >
          <ChevronLeft size={18} className={cn("shrink-0 transition-transform", collapsed && "rotate-180")} />
          {!collapsed && <span>Collapse</span>}
        </button>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive text-sm transition"
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </aside>
  )
}