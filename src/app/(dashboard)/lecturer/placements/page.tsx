"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatDate, getStatusColor } from "@/utils/formatters";
import { Plus, Search, FileDown, FileSpreadsheet, Loader2, Calendar as CalendarIcon, Clock } from "lucide-react";
import { PlacementWizard } from "@/components/lecturer/PlacementWizard";
import { motion } from "framer-motion";
import { useDebounce } from "@/hooks/useDebounce";
import { EmptyState, emptyStates } from "@/components/common/EmptyState";
import { exportToPDF, exportToExcel } from "@/utils/exportUtils";
import { usePlacements, useSetPlacementDeadlines, useGetPlacementDeadlines } from "@/hooks/useApi";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const PAGE_SIZE = 10;

export default function PlacementsManagement() {
  const { data: placements, isLoading } = usePlacements();
  const setDeadlines = useSetPlacementDeadlines();
  const [wizardOpen, setWizardOpen] = useState(false);
  const [deadlineDialogOpen, setDeadlineDialogOpen] = useState(false);
  const [selectedPlacement, setSelectedPlacement] = useState<any>(null);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [page, setPage] = useState(1);
  
  // Deadline state - 12 weeks
  const [weekDeadlines, setWeekDeadlines] = useState<Array<{ week: number; due_date: Date | undefined }>>([]);
  
  // Fetch existing deadlines when placement is selected
  const { data: existingDeadlines } = useGetPlacementDeadlines(selectedPlacement?.id || '');

  useEffect(() => {
    if (deadlineDialogOpen && selectedPlacement) {
      // Initialize with 12 weeks
      const weeks = Array.from({ length: 12 }, (_, i) => ({
        week: i + 1,
        due_date: undefined as Date | undefined,
      }));
      
      // Populate with existing deadlines if available
      if (existingDeadlines && existingDeadlines.length > 0) {
        existingDeadlines.forEach((deadline: any) => {
          const weekIndex = weeks.findIndex(w => w.week === deadline.week);
          if (weekIndex !== -1) {
            weeks[weekIndex].due_date = new Date(deadline.due_date);
          }
        });
      }
      
      setWeekDeadlines(weeks);
    }
  }, [deadlineDialogOpen, selectedPlacement, existingDeadlines]);

  const filtered = useMemo(() => {
    if (!placements) return [];
    return placements.filter((pl) => {
      const q = debouncedSearch.toLowerCase();
      return !q || (pl.student_id || "").toLowerCase().includes(q) || (pl.company_id || "").toLowerCase().includes(q);
    });
  }, [placements, debouncedSearch]);

  useEffect(() => setPage(1), [debouncedSearch]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-[#ff8c00]" />
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const exportCols = ["Student ID", "Company ID", "Supervisor ID", "Start", "End", "Status"];
  const getExportRows = () => filtered.map((pl) => [
    pl.student_id,
    pl.company_id,
    pl.supervisor_id,
    formatDate(pl.start_date || ""),
    formatDate(pl.end_date || ""),
    pl.status
  ]);

  const handleSetDeadlines = (placement: any) => {
    setSelectedPlacement(placement);
    setDeadlineDialogOpen(true);
  };

  const handleSaveDeadlines = async () => {
    if (!selectedPlacement) return;
    
    // Filter out weeks without dates
    const deadlinesToSave = weekDeadlines
      .filter(w => w.due_date)
      .map(w => ({
        week: w.week,
        due_date: format(w.due_date!, 'yyyy-MM-dd'),
      }));
    
    if (deadlinesToSave.length === 0) {
      toast.error("Please set at least one deadline");
      return;
    }
    
    try {
      await setDeadlines.mutateAsync({
        id: selectedPlacement.id,
        deadlines: deadlinesToSave,
      });
      setDeadlineDialogOpen(false);
      setSelectedPlacement(null);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleBulkSetDeadlines = (startDate: Date, intervalDays: number) => {
    const newDeadlines = weekDeadlines.map((w, index) => {
      const dueDate = new Date(startDate);
      dueDate.setDate(dueDate.getDate() + (index * intervalDays));
      return {
        ...w,
        due_date: dueDate,
      };
    });
    setWeekDeadlines(newDeadlines);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold">Placements</h1>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => exportToPDF("Placements", exportCols, getExportRows())}>
            <FileDown className="w-4 h-4 mr-1" />PDF
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportToExcel("Placements", exportCols, getExportRows())}>
            <FileSpreadsheet className="w-4 h-4 mr-1" />Excel
          </Button>
          <Button onClick={() => setWizardOpen(true)} className="bg-primary text-primary-foreground">
            <Plus className="w-4 h-4 mr-2" />Create Placement
          </Button>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search by student or company..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {filtered.length === 0 && !debouncedSearch ? (
        <EmptyState {...emptyStates.placements} />
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Supervisor</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paged.map((pl) => {
                    return (
                      <TableRow key={pl.id}>
                        <TableCell className="font-medium">{pl.student_id}</TableCell>
                        <TableCell>{pl.company_id}</TableCell>
                        <TableCell>{pl.supervisor_id}</TableCell>
                        <TableCell className="text-sm">{formatDate(pl.start_date || "")} – {formatDate(pl.end_date || "")}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusColor(pl.status)}>{pl.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSetDeadlines(pl)}
                            disabled={pl.status !== 'active'}
                            title={pl.status !== 'active' ? 'Placement must be active' : 'Set logbook deadlines'}
                          >
                            <Clock className="w-4 h-4 mr-1" />
                            Deadlines
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {paged.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No placements found</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
              </div>
            </div>
          )}
        </motion.div>
      )}

      <PlacementWizard open={wizardOpen} onOpenChange={setWizardOpen} />

      {/* Set Deadlines Dialog */}
      <Dialog open={deadlineDialogOpen} onOpenChange={setDeadlineDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Set Logbook Deadlines</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-muted/50 p-3 rounded-md">
              <p className="text-sm">
                <span className="font-medium">Student:</span> {selectedPlacement?.student_id}
              </p>
              <p className="text-sm">
                <span className="font-medium">Placement Period:</span> {selectedPlacement && formatDate(selectedPlacement.start_date)} – {selectedPlacement && formatDate(selectedPlacement.end_date)}
              </p>
            </div>

            {/* Bulk Set Option */}
            <div className="border rounded-md p-3 space-y-3">
              <Label className="text-sm font-medium">Quick Set (Optional)</Label>
              <p className="text-xs text-muted-foreground">Set all deadlines at once with a weekly interval</p>
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <Label className="text-xs">Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        Pick start date
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        onSelect={(date) => date && handleBulkSetDeadlines(date, 7)}
                        
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    const today = new Date();
                    handleBulkSetDeadlines(today, 7);
                  }}
                >
                  Set Weekly from Today
                </Button>
              </div>
            </div>

            {/* Individual Week Deadlines */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Individual Week Deadlines</Label>
              <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto p-1">
                {weekDeadlines.map((week, index) => (
                  <div key={week.week} className="flex items-center gap-2 border rounded-md p-2">
                    <Label className="text-sm font-medium w-16">Week {week.week}</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "flex-1 justify-start text-left font-normal text-xs",
                            !week.due_date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-3 w-3" />
                          {week.due_date ? format(week.due_date, "dd MMM yyyy") : "Set date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={week.due_date}
                          onSelect={(date) => {
                            const newDeadlines = [...weekDeadlines];
                            newDeadlines[index].due_date = date;
                            setWeekDeadlines(newDeadlines);
                          }}
                          disabled={(date) => date < new Date()}
                          
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    {week.due_date && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newDeadlines = [...weekDeadlines];
                          newDeadlines[index].due_date = undefined;
                          setWeekDeadlines(newDeadlines);
                        }}
                        className="h-8 px-2"
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeadlineDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveDeadlines}
              disabled={setDeadlines.isPending}
              className="bg-primary text-primary-foreground"
            >
              {setDeadlines.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4 mr-2" />
                  Save Deadlines
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
