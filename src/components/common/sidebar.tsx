"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import {
  LucideIcon, LayoutDashboard, Briefcase, FileText, CalendarDays,
  MessageSquare, Star, Users, ClipboardCheck, BarChart3, Building2,
  BookOpen, Send, CheckCircle, Bell, LogOut
} from "lucide-react"
import { placements } from "@/utils/mockData"

interface NavItem {
  label: string
  to: string
  icon: LucideIcon
}

const getStudentNav = (userId?: string): NavItem[] => {
  const hasPlacement = placements.some((p) => p.studentId === userId && p.status === "active")
  const items: NavItem[] = [
    { label: "Overview", to: "/student", icon: LayoutDashboard },
    { label: "My Placement", to: "/student/placement", icon: Briefcase },
  ]
  if (!hasPlacement) {
    items.push({ label: "Submit Placement", to: "/student/submit-placement", icon: Send })
  }
  items.push(
    { label: "Logbook", to: "/student/logbook", icon: BookOpen },
    { label: "Submissions", to: "/student/submissions", icon: FileText },
    { label: "Deadlines", to: "/student/deadlines", icon: CalendarDays },
    { label: "Feedback", to: "/student/feedback", icon: Star },
    { label: "Messages", to: "/student/messages", icon: MessageSquare },
    { label: "Notifications", to: "/notifications", icon: Bell },
  )
  return items
}

const supervisorNav: NavItem[] = [
  { label: "Overview", to: "/supervisor", icon: LayoutDashboard },
  { label: "My Students", to: "/supervisor/students", icon: Users },
  { label: "Confirmations", to: "/supervisor/confirmations", icon: CheckCircle },
  { label: "Logbook Review", to: "/supervisor/logbook", icon: BookOpen },
  { label: "Submissions", to: "/supervisor/submissions", icon: FileText },
  { label: "Assessments", to: "/supervisor/assessments", icon: ClipboardCheck },
  { label: "Messages", to: "/supervisor/messages", icon: MessageSquare },
  { label: "Notifications", to: "/notifications", icon: Bell },
]

const lecturerNav: NavItem[] = [
  { label: "Overview", to: "/lecturer", icon: LayoutDashboard },
  { label: "Students", to: "/lecturer/students", icon: Users },
  { label: "Placements", to: "/lecturer/placements", icon: Briefcase },
  { label: "Logbook Overview", to: "/lecturer/logbook", icon: BookOpen },
  { label: "Supervisors", to: "/lecturer/supervisors", icon: Building2 },
  { label: "Assessments", to: "/lecturer/assessments", icon: ClipboardCheck },
  { label: "Analytics", to: "/lecturer/analytics", icon: BarChart3 },
  { label: "Messages", to: "/lecturer/messages", icon: MessageSquare },
  { label: "Notifications", to: "/notifications", icon: Bell },
]

const coordinatorNav: NavItem[] = [
  { label: "Overview", to: "/coordinator", icon: LayoutDashboard },
  { label: "Students", to: "/coordinator/students", icon: Users },
  { label: "Placements", to: "/coordinator/placements", icon: ClipboardCheck },
  { label: "Messages", to: "/coordinator/messages", icon: MessageSquare },
  { label: "Notifications", to: "/notifications", icon: Bell },
]

export function getNavItems(role?: string, userId?: string): NavItem[] {
  switch (role?.toLowerCase()) {
    case "student": return getStudentNav(userId)
    case "supervisor": return supervisorNav
    case "lecturer": return lecturerNav
    case "coordinator": return coordinatorNav
    default: return getStudentNav(userId)
  }
}

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function AppSidebar({ open, onClose }: SidebarProps) {
  const { user, logout } = useAuth()
  const pathname = usePathname()

  const role = user?.role || (pathname.startsWith("/supervisor") ? "supervisor" : pathname.startsWith("/lecturer") ? "lecturer" : pathname.startsWith("/coordinator") ? "coordinator" : "student")
  const items = getNavItems(role, user?.id)

  
  return (
    <>
      {open && <div className="fixed inset-0 bg-foreground/20 z-40 lg:hidden" onClick={onClose} />}
      <aside className={`fixed top-14 left-0 bottom-0 w-60 bg-sidebar border-r border-sidebar-border z-50 transition-transform duration-200 lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"} flex flex-col justify-between`}>
        <nav className="p-3 space-y-1 overflow-y-auto flex-1">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
            Navigation
          </div>
          {items.map((item) => {
            const active = pathname === item.to || (item.to !== "/student" && item.to !== "/supervisor" && item.to !== "/lecturer" && item.to !== "/coordinator" && pathname.startsWith(item.to))
            return (
              <Link
                key={item.to}
                href={item.to}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  active
                    ? "bg-sidebar-accent text-sidebar-primary font-semibold"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}
              >
                <item.icon className={`w-4 h-4 shrink-0 ${active ? "text-sidebar-primary" : "text-muted-foreground"}`} />
                <span>{item.label}</span>
                {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-sidebar-primary" />}
              </Link>
            )
          })}
        </nav>

        </aside>
    </>
  )
}
