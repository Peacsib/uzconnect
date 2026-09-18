export enum CompletionStatus {
  ONGOING = 'ongoing',
  COMPLETED = 'completed',
  TERMINATED_BY_STUDENT = 'terminated_by_student',
  TERMINATED_BY_COMPANY = 'terminated_by_company',
  TERMINATED_BY_COORDINATOR = 'terminated_by_coordinator',
  TRANSFERRED = 'transferred',
}

export enum TransitionType {
  NEW_PLACEMENT = 'new_placement',
  COMPLETION = 'completion',
  TERMINATION = 'termination',
  TRANSFER = 'transfer',
  REACTIVATION = 'reactivation',
}

export enum InitiatedBy {
  STUDENT = 'student',
  COMPANY = 'company',
  COORDINATOR = 'coordinator',
  LECTURER = 'lecturer',
  SYSTEM = 'system',
}

export interface PlacementHistory {
  id: string;
  student_id: string;
  company_id: string;
  supervisor_id: string;
  lecturer_id: string;
  original_placement_id: string;
  placement_number: number;
  start_date: string;
  planned_end_date: string;
  actual_end_date: string | null;
  completion_status: CompletionStatus;
  termination_reason: string | null;
  performance_rating: number | null;
  notes: string | null;
  archived_at: string;
  created_at: string;
  updated_at: string;
  company?: {
    id: string;
    name: string;
  };
  supervisor?: {
    id: string;
    name: string;
  };
  lecturer?: {
    id: string;
    name: string;
  };
}

export interface PlacementTransition {
  id: string;
  student_id: string;
  from_placement_id: string | null;
  to_placement_id: string | null;
  transition_type: TransitionType;
  transition_date: string;
  reason: string | null;
  initiated_by: InitiatedBy;
  initiated_by_user_id: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  from_placement?: {
    id: string;
    company: {
      name: string;
    };
  };
  to_placement?: {
    id: string;
    company: {
      name: string;
    };
  };
  initiated_by_user?: {
    id: string;
    name: string;
  };
}

export interface Placement {
  id: string;
  student_id: string;
  company_id: string;
  supervisor_id: string;
  lecturer_id: string;
  placement_number: number;
  is_active: boolean;
  previous_placement_id: string | null;
  start_date: string;
  end_date: string;
  actual_end_date: string | null;
  status: string;
  completion_status: CompletionStatus;
  termination_reason: string | null;
  performance_rating: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  company?: {
    id: string;
    name: string;
  };
  supervisor?: {
    id: string;
    name: string;
  };
  lecturer?: {
    id: string;
    name: string;
  };
}

export interface StudentPlacementHistory {
  active_placement: Placement | null;
  placement_history: PlacementHistory[];
  transitions: PlacementTransition[];
  total_placements: number;
  completed_placements: number;
  terminated_placements: number;
}

export interface PlacementAnalytics {
  total_placements: number;
  completed: number;
  terminated: number;
  completion_rate: number;
  termination_rate: number;
  average_duration_days: number;
}

export interface CompletePlacementRequest {
  initiated_by: InitiatedBy;
  notes?: string;
  performance_rating?: number;
}

export interface TerminatePlacementRequest {
  termination_status: CompletionStatus;
  reason: string;
  initiated_by: InitiatedBy;
  notes?: string;
}

export interface TransferPlacementRequest {
  transfer_reason: string;
  initiated_by: InitiatedBy;
  new_placement: {
    company_id: string;
    supervisor_id: string;
    lecturer_id: string;
    start_date: string;
    end_date: string;
    status?: string;
  };
}
