"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { formatDate, getStatusColor } from "@/utils/formatters";
import { CalendarDays, ChevronLeft, ChevronRight, Loader2, BookOpen } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { EmptyState, emptyStates } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameDay, isSameMonth, parseISO } from "date-fns";
import { useSubmissions, useLogbookEntries } from "@/hooks/useApi";

interface DeadlineItem {
  id: string;
  type: 'submission' | 'logbook';
  date: Date;
  status: string;
  title: string;
  week?: number;
}

function DeadlineCalendar({ deadlines, onDayClick }: { deadlines: DeadlineItem[]; onDayClick: (date: Date) => void }) {
  const [current, setCurrent] = useState(new Date());
  const monthStart = startOfMonth(current);
  const monthEnd = endOfMonth(current);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPad = getDay(monthStart); // 0=Sun

  const getColor = (day: Date) => {
    const matches = deadlines.filter((d) => isSameDay(d.date, day));
    if (matches.length === 0) return "";
    
    // Priority: overdue > pending > submitted > approved
    const hasOverdue = matches.some(m => new Date(day) < new Date() && (m.status === "draft" || m.status === "pending"));
    const hasPending = matches.some(m => m.status === "draft" || m.status === "pending");
    const hasSubmitted = matches.some(m => m.status === "submitted" || m.status === "pending_supervisor" || m.status === "pending_lecturer" || m.status === "reviewed");
    const hasApproved = matches.some(m => m.status === "approved" || m.status === "graded");
    
    if (hasOverdue) return "bg-destructive text-destructive-foreground";
    if (hasPending) return "bg-amber-500 text-white";
    if (hasSubmitted) return "bg-primary text-primary-foreground";
    if (hasApproved) return "bg-emerald-500 text-white";
    return "bg-muted";
  };

  return (
    <Card>
      <CardContent className="pt-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrent(subMonths(current, 1))}><ChevronLeft className="w-4 h-4" /></Button>
          <h3 className="font-semibold text-sm">{format(current, "MMMM yyyy")}</h3>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrent(addMonths(current, 1))}><ChevronRight className="w-4 h-4" /></Button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground mb-1">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => <div key={d} className="py-1">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: startPad }).map((_, i) => <div key={`pad-${i}`} />)}
          {days.map((day) => {
            const color = getColor(day);
            const isToday = isSameDay(day, new Date());
            const hasDeadlines = deadlines.some((d) => isSameDay(d.date, day));
            return (
              <button
                key={day.toISOString()}
                onClick={() => hasDeadlines && onDayClick(day)}
                className={`h-8 w-full rounded text-xs font-medium transition-colors ${color || (isToday ? "ring-1 ring-primary" : "hover:bg-muted")} ${!isSameMonth(day, current) ? "opacity-30" : ""}`}
              >
                {format(day, "d")}
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-3 mt-3 text-[10px]">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />Approved</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-primary" />Submitted</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" />Pending</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-destructive" />Overdue</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Deadlines() {
  const { user } = useAuth();
  const { data: submissions, isLoading: submissionsLoading } = useSubmissions();
  const { data: logbookEntries, isLoading: logbookLoading } = useLogbookEntries();
  const [highlightDate, setHighlightDate] = useState<Date | null>(null);
  const [selectedItem, setSelectedItem] = useState<DeadlineItem | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const isLoading = submissionsLoading || logbookLoading;

  const allDeadlines = useMemo(() => {
    const items: DeadlineItem[] = [];
    
    // Add submissions
    const mySubs = submissions?.filter((s) => s.student_id === user?.id) || [];
    mySubs.forEach(sub => {
      items.push({
        id: sub.id,
        type: 'submission',
        date: parseISO(sub.due_date || new Date().toISOString()),
        status: sub.status,
        title: sub.title,
      });
    });
    
    // Add logbook entries with due dates
    const myLogbook = logbookEntries?.filter((e) => e.student_id === user?.id && e.due_date) || [];
    myLogbook.forEach(entry => {
      items.push({
        id: entry.id,
        type: 'logbook',
        date: parseISO(entry.due_date!),
        status: entry.status,
        title: `Logbook Week ${entry.week}`,
        week: entry.week,
      });
    });
    
    return items.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [submissions, logbookEntries, user?.id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-[#ff8c00]" />
      </div>
    );
  }

  const displayItems = highlightDate 
    ? allDeadlines.filter((item) => isSameDay(item.date, highlightDate)) 
    : allDeadlines;

  if (allDeadlines.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Deadlines</h1>
        <EmptyState {...emptyStates.submissions} />
      </div>
    );
  }

  const handleItemClick = (item: DeadlineItem) => {
    setSelectedItem(item);
    setViewDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Deadlines</h1>
        {highlightDate && (
          <Button variant="ghost" size="sm" onClick={() => setHighlightDate(null)} className="text-xs">
            Show all
          </Button>
        )}
      </div>

      <DeadlineCalendar deadlines={allDeadlines} onDayClick={(d) => setHighlightDate(d)} />

      <div className="relative pl-6 space-y-4">
        <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-border" />
        {displayItems.map((item) => {
          const isPast = item.date < new Date();
          const isOverdue = isPast && (item.status === "draft" || item.status === "pending");
          const isApproved = item.status === "approved" || item.status === "graded";
          
          return (
            <div key={`${item.type}-${item.id}`} className="relative">
              <div className={`absolute -left-4 top-3 w-3 h-3 rounded-full border-2 ${
                isApproved 
                  ? "bg-emerald-500 border-emerald-300" 
                  : isOverdue 
                    ? "bg-destructive border-destructive/50" 
                    : "bg-accent border-accent/50"
              }`} />
              <Card 
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleItemClick(item)}
              >
                <CardContent className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {item.type === 'logbook' ? (
                      <BookOpen className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <CalendarDays className="w-4 h-4 text-muted-foreground" />
                    )}
                    <div>
                      <p className="font-medium text-sm">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(item.date.toISOString())}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={`text-xs ${getStatusColor(item.status)}`}>
                    {item.status}
                  </Badge>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      {/* View Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedItem?.title}</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Type</Label>
                <p className="font-medium capitalize">{selectedItem.type}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Due Date</Label>
                <p className="font-medium">{format(selectedItem.date, "PPP")}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Status</Label>
                <div className="mt-1">
                  <Badge variant="outline" className={getStatusColor(selectedItem.status)}>
                    {selectedItem.status}
                  </Badge>
                </div>
              </div>
              {selectedItem.type === 'logbook' && (
                <div>
                  <Label className="text-muted-foreground">Week Number</Label>
                  <p className="font-medium">Week {selectedItem.week}</p>
                </div>
              )}
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>Close</Button>
            <Button onClick={() => {
              if (selectedItem?.type === 'logbook') {
                window.location.href = '/student/logbook';
              } else {
                window.location.href = '/student/submissions';
              }
            }}>
              View Details
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
