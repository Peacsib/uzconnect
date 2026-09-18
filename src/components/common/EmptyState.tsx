import { LucideIcon, FileText, Users, Briefcase, MessageSquare, BarChart3, ClipboardCheck } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon = FileText, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export const emptyStates = {
  students: { icon: Users, title: "No students yet", description: "Add students manually or import from a spreadsheet to get started." },
  placements: { icon: Briefcase, title: "No placements yet", description: "Create your first placement to assign students to companies." },
  messages: { icon: MessageSquare, title: "No messages yet", description: "Start a conversation with your students or supervisors." },
  assessments: { icon: ClipboardCheck, title: "No assessments yet", description: "Assessments will appear here once supervisors submit evaluations." },
  submissions: { icon: FileText, title: "No submissions yet", description: "Your submissions will appear here once you upload your first logbook or report." },
  analytics: { icon: BarChart3, title: "No data yet", description: "Analytics will populate as students submit work and assessments are completed." },
};
