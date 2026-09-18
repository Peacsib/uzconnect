import { format, formatDistanceToNow, parseISO, isValid } from "date-fns";

function safeParse(date: string): Date {
  try {
    const parsed = parseISO(date);
    if (!isValid(parsed)) return new Date();
    return parsed;
  } catch {
    return new Date();
  }
}

export const formatDate = (date: string) => format(safeParse(date), "dd MMM yyyy");
export const formatDateTime = (date: string) => format(safeParse(date), "dd MMM yyyy, HH:mm");
export const formatRelative = (date: string) => formatDistanceToNow(safeParse(date), { addSuffix: true });

export const getStatusColor = (status: string) => {
  switch (status) {
    case "draft": return "bg-muted text-muted-foreground";
    case "submitted": return "bg-primary/10 text-primary border-primary/20";
    case "reviewed": return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800";
    case "approved": return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800";
    case "active": return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800";
    case "pending": case "pending_coordinator": case "pending_supervisor": return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800";
    case "completed": return "bg-muted text-muted-foreground";
    case "rejected": return "bg-destructive/10 text-destructive border-destructive/20";
    default: return "bg-muted text-muted-foreground";
  }
};
