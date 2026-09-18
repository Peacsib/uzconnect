// API Response Types
export interface ApiUser {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'supervisor' | 'lecturer' | 'coordinator';
  avatar: string | null;
  token?: string;
}

export interface ApiPlacement {
  id: string;
  student_id: string;
  supervisor_id: string;
  company_id: string;
  lecturer_id: string;
  start_date: string;
  end_date: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface ApiLogbookEntry {
  id: string;
  student_id: string;
  week: number;
  week_ending_date: string;
  objectives: string;
  actual_tasks: string;
  reflection: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  supervisor_approved: boolean;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApiSubmission {
  id: string;
  student_id: string;
  title: string;
  type: 'report' | 'presentation' | 'logbook' | 'other';
  due_date: string;
  status: 'pending' | 'submitted' | 'graded';
  file_url: string | null;
  grade: number | null;
  feedback: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApiAssessment {
  id: string;
  submission_id: string;
  assessor_id: string;
  technical_score: number;
  professional_score: number;
  communication_score: number;
  overall_score: number;
  comments: string;
  created_at: string;
  updated_at: string;
}

export interface ApiMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  subject: string;
  content: string;
  read: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApiPlacementSubmission {
  id: string;
  student_id: string;
  company_name: string;
  company_address: string;
  company_city: string;
  supervisor_name: string;
  supervisor_email: string;
  supervisor_phone: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

// Request Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterSupervisorRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  company_id: string;
  phone: string;
  job_title: string;
}

export interface RegisterLecturerRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  department: string;
}

export interface CreateLogbookEntryRequest {
  week: number;
  week_ending_date: string;
  objectives: string;
  actual_tasks: string;
  reflection: string;
}

export interface UpdateLogbookEntryRequest {
  objectives?: string;
  actual_tasks?: string;
  reflection?: string;
}

export interface CreateAssessmentRequest {
  submission_id: string;
  technical_score: number;
  professional_score: number;
  communication_score: number;
  overall_score: number;
  comments: string;
}

export interface CreateMessageRequest {
  receiver_id: string;
  subject: string;
  content: string;
}

export interface CreatePlacementSubmissionRequest {
  company_name: string;
  company_address: string;
  company_city: string;
  supervisor_name: string;
  supervisor_email: string;
  supervisor_phone: string;
}

export interface AssignPlacementRequest {
  supervisor_id: string;
  company_id: string;
  lecturer_id: string;
  start_date: string;
  end_date: string;
}

export interface RejectPlacementRequest {
  reason: string;
}

export interface SyncRequest {
  actions: Array<{
    type: string;
    data: Record<string, unknown>;
    timestamp: string;
  }>;
}
