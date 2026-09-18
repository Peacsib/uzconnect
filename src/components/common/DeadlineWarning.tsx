import { AlertTriangle, Clock, CheckCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { differenceInDays, differenceInHours, format, parseISO } from "date-fns";

export interface DeadlineWarningProps {
  deadline: string | Date;
  status?: string;
  className?: string;
}

export function DeadlineWarning({ deadline, status, className }: DeadlineWarningProps) {
  const deadlineDate = typeof deadline === 'string' ? parseISO(deadline) : deadline;
  const now = new Date();
  const daysUntil = differenceInDays(deadlineDate, now);
  const hoursUntil = differenceInHours(deadlineDate, now);

  // Don't show warning if already submitted or approved
  if (status === 'pending_supervisor' || status === 'pending_lecturer' || status === 'approved') {
    return null;
  }

  // Overdue
  if (daysUntil < 0) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Deadline Passed</AlertTitle>
        <AlertDescription>
          This submission was due on {format(deadlineDate, "PPP")} ({Math.abs(daysUntil)} day{Math.abs(daysUntil) !== 1 ? 's' : ''} ago).
          Please contact your lecturer for an extension.
        </AlertDescription>
      </Alert>
    );
  }

  // Due today or within 24 hours
  if (hoursUntil <= 24) {
    return (
      <Alert className={`border-red-600 bg-red-50 text-red-900 ${className}`}>
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertTitle className="text-red-900">Due Very Soon!</AlertTitle>
        <AlertDescription className="text-red-800">
          Deadline: {format(deadlineDate, "PPP 'at' p")} ({hoursUntil} hour{hoursUntil !== 1 ? 's' : ''} remaining)
        </AlertDescription>
      </Alert>
    );
  }

  // Due within 2 days
  if (daysUntil <= 2) {
    return (
      <Alert className={`border-orange-600 bg-orange-50 text-orange-900 ${className}`}>
        <Clock className="h-4 w-4 text-orange-600" />
        <AlertTitle className="text-orange-900">Deadline Approaching</AlertTitle>
        <AlertDescription className="text-orange-800">
          Due {format(deadlineDate, "PPP")} ({daysUntil} day{daysUntil !== 1 ? 's' : ''} remaining)
        </AlertDescription>
      </Alert>
    );
  }

  // Due within 7 days - info only
  if (daysUntil <= 7) {
    return (
      <Alert className={`border-blue-600 bg-blue-50 text-blue-900 ${className}`}>
        <Clock className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-900">Upcoming Deadline</AlertTitle>
        <AlertDescription className="text-blue-800">
          Due {format(deadlineDate, "PPP")} ({daysUntil} day{daysUntil !== 1 ? 's' : ''} remaining)
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}

export interface DeadlineCountdownProps {
  deadline: string | Date;
  compact?: boolean;
}

export function DeadlineCountdown({ deadline, compact = false }: DeadlineCountdownProps) {
  const deadlineDate = typeof deadline === 'string' ? parseISO(deadline) : deadline;
  const now = new Date();
  const daysUntil = differenceInDays(deadlineDate, now);
  const hoursUntil = differenceInHours(deadlineDate, now);

  if (daysUntil < 0) {
    return (
      <div className="flex items-center gap-1 text-red-600 text-sm">
        <AlertTriangle className="w-4 h-4" />
        <span>Overdue by {Math.abs(daysUntil)} day{Math.abs(daysUntil) !== 1 ? 's' : ''}</span>
      </div>
    );
  }

  if (hoursUntil <= 24) {
    return (
      <div className="flex items-center gap-1 text-red-600 text-sm font-medium">
        <AlertTriangle className="w-4 h-4" />
        <span>Due in {hoursUntil} hour{hoursUntil !== 1 ? 's' : ''}</span>
      </div>
    );
  }

  if (daysUntil <= 2) {
    return (
      <div className="flex items-center gap-1 text-orange-600 text-sm font-medium">
        <Clock className="w-4 h-4" />
        <span>Due in {daysUntil} day{daysUntil !== 1 ? 's' : ''}</span>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-1 text-muted-foreground text-sm">
        <Clock className="w-3 h-3" />
        <span>{daysUntil} day{daysUntil !== 1 ? 's' : ''}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 text-muted-foreground text-sm">
      <Clock className="w-4 h-4" />
      <span>Due in {daysUntil} day{daysUntil !== 1 ? 's' : ''}</span>
    </div>
  );
}
