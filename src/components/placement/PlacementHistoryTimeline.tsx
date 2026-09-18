"use client";

import { useState, useEffect } from "react";
import { placementHistoryService } from '@/services/placementHistoryService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Building2, Calendar, User, TrendingUp, AlertCircle, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import type { CompletionStatus, TransitionType } from '@/types/placementHistory';

interface PlacementHistoryTimelineProps {
  studentId: string;
}

const getStatusColor = (status: CompletionStatus): string => {
  const colors = {
    ongoing: 'bg-blue-500',
    completed: 'bg-green-500',
    terminated_by_student: 'bg-orange-500',
    terminated_by_company: 'bg-red-500',
    terminated_by_coordinator: 'bg-purple-500',
    transferred: 'bg-yellow-500',
  };
  return colors[status] || 'bg-gray-500';
};

const getStatusIcon = (status: CompletionStatus) => {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="h-4 w-4" />;
    case 'ongoing':
      return <TrendingUp className="h-4 w-4" />;
    default:
      return <XCircle className="h-4 w-4" />;
  }
};

const getStatusLabel = (status: CompletionStatus): string => {
  const labels = {
    ongoing: 'Ongoing',
    completed: 'Completed Successfully',
    terminated_by_student: 'Terminated by Student',
    terminated_by_company: 'Terminated by Company',
    terminated_by_coordinator: 'Terminated by Coordinator',
    transferred: 'Transferred',
  };
  return labels[status] || status;
};

const getTransitionLabel = (type: TransitionType): string => {
  const labels = {
    new_placement: 'New Placement Started',
    completion: 'Placement Completed',
    termination: 'Placement Terminated',
    transfer: 'Transferred to New Organization',
    reactivation: 'Placement Reactivated',
  };
  return labels[type] || type;
};

export function PlacementHistoryTimeline({ studentId }: PlacementHistoryTimelineProps) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    setIsLoading(true);
    placementHistoryService.getStudentHistory(studentId)
      .then((res: any) => setData(res))
      .catch((err: any) => setError(err))
      .finally(() => setIsLoading(false));
  }, [studentId]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p>Failed to load placement history</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const { active_placement, placement_history, transitions, total_placements, completed_placements, terminated_placements } = data;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Placements</CardDescription>
            <CardTitle className="text-3xl">{total_placements}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Completed</CardDescription>
            <CardTitle className="text-3xl text-green-600">{completed_placements}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Terminated</CardDescription>
            <CardTitle className="text-3xl text-red-600">{terminated_placements}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Success Rate</CardDescription>
            <CardTitle className="text-3xl">
              {total_placements > 0 
                ? `${Math.round((completed_placements / total_placements) * 100)}%`
                : 'N/A'}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Active Placement */}
      {active_placement && (
        <Card className="border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Current Placement #{active_placement.placement_number}
                </CardTitle>
                <CardDescription>Active since {format(new Date(active_placement.start_date), 'MMM dd, yyyy')}</CardDescription>
              </div>
              <Badge className="bg-blue-500">Active</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Company</p>
                  <p className="text-sm text-muted-foreground">{active_placement.company?.name}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Supervisor</p>
                  <p className="text-sm text-muted-foreground">{active_placement.supervisor?.name}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Duration</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(active_placement.start_date), 'MMM dd, yyyy')} - {format(new Date(active_placement.end_date), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Lecturer</p>
                  <p className="text-sm text-muted-foreground">{active_placement.lecturer?.name}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Placement History Timeline */}
      {placement_history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Placement History</CardTitle>
            <CardDescription>Previous placements and transitions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative space-y-6">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

              {placement_history.map((placement: any, index: number) => (
                <div key={placement.id} className="relative pl-10">
                  {/* Timeline dot */}
                  <div className={`absolute left-2.5 top-2 h-3 w-3 rounded-full ${getStatusColor(placement.completion_status)}`} />

                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">Placement #{placement.placement_number}</h4>
                          <Badge variant="outline" className="flex items-center gap-1">
                            {getStatusIcon(placement.completion_status)}
                            {getStatusLabel(placement.completion_status)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {placement.company?.name}
                        </p>
                      </div>
                      {placement.performance_rating && (
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm font-medium">{placement.performance_rating}/5</span>
                        </div>
                      )}
                    </div>

                    <div className="text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {format(new Date(placement.start_date), 'MMM dd, yyyy')} - {format(new Date(placement.actual_end_date || placement.planned_end_date), 'MMM dd, yyyy')}
                        </span>
                      </div>
                    </div>

                    {placement.termination_reason && (
                      <div className="mt-2 p-3 bg-muted rounded-md">
                        <p className="text-sm">
                          <span className="font-medium">Reason: </span>
                          {placement.termination_reason}
                        </p>
                      </div>
                    )}

                    {placement.notes && (
                      <div className="mt-2 p-3 bg-muted rounded-md">
                        <p className="text-sm">
                          <span className="font-medium">Notes: </span>
                          {placement.notes}
                        </p>
                      </div>
                    )}

                    {index < placement_history.length - 1 && (
                      <Separator className="mt-4" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transitions Log */}
      {transitions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Transition History</CardTitle>
            <CardDescription>Record of all placement changes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transitions.map((transition: any) => (
                <div key={transition.id} className="flex items-start gap-3 p-3 rounded-lg border">
                  <ArrowRight className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{getTransitionLabel(transition.transition_type)}</p>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(transition.transition_date), 'MMM dd, yyyy')}
                      </span>
                    </div>
                    {transition.reason && (
                      <p className="text-sm text-muted-foreground mt-1">{transition.reason}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Initiated by: {transition.initiated_by}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {placement_history.length === 0 && !active_placement && (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            <p>No placement history available</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
