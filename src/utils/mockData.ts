export interface Student {
  id: string;
  regNumber: string;
  name: string;
  programme: string;
  email: string;
  phone: string;
  placementId?: string;
}

export interface Supervisor {
  id: string;
  name: string;
  email: string;
  company: string;
  companyId: string;
  phone: string;
  jobTitle: string;
}

export interface Lecturer {
  id: string;
  name: string;
  email: string;
  department: string;
}

export interface Company {
  id: string;
  name: string;
  address: string;
  city: string;
}

export interface Placement {
  created_at?: string;
  id: string;
  studentId: string;
  student_id?: string;
  supervisorId: string;
  supervisor_id?: string;
  companyId: string;
  company_id?: string;
  lecturerId: string;
  lecturer_id?: string;
  startDate: string;
  start_date?: string;
  endDate: string;
  end_date?: string;
  status: any;
}

export interface Submission {
  id: string;
  studentId: string;
  student_id?: string;
  title: string;
  type: string;
  dueDate?: string;
  due_date?: string;
  submittedDate?: string;
  submitted_date?: string;
  status: any;
  fileUrl?: string;
  file_url?: string;
  feedback?: string;
}

export interface Assessment {
  id: string;
  submissionId?: string;
  submission_id?: string;
  studentId?: string;
  student_id?: string;
  supervisorScore?: number;
  lecturerScore?: number;
  supervisorComments?: string;
  lecturerComments?: string;
  date?: string;
  created_at?: string;
  overall_score?: number;
  technical_score?: number;
  professional_score?: number;
  communication_score?: number;
  comments?: string;
  due_date?: string;
}

export interface Message {
  id: string;
  senderId: string;
  sender_id?: string;
  receiverId: string;
  receiver_id?: string;
  content: string;
  timestamp: string;
  created_at?: string;
  read: boolean;
}

export interface PlacementSubmission {
  company_city?: string;
  company_name?: string;
  supervisor_name?: string;
  start_date?: string;
  student_id?: string;
  reg_number?: string;
  company_address?: string;
  supervisor_phone?: string;
  supervisor_email?: string;
  student_email?: string;
  student_phone?: string;
  assigned_lecturer_id?: string;
  submitted_at?: string;
  id: string;
  studentId: string;
  regNumber: string;
  surname: string;
  forenames: string;
  programme: string;
  companyName: string;
  companyAddress: string;
  city: string;
  suburb: string;
  supervisorName: string;
  supervisorPhone: string;
  supervisorEmail: string;
  studentEmail: string;
  studentPhone: string;
  startDate: string;
  status: "pending_coordinator" | "pending_supervisor" | "active" | "rejected";
  assignedLecturerId?: string;
  submittedAt: string;
}

export interface LogbookEntry {
  supervisor_comment?: string;
  supervisorComment?: string;
  id: string;
  studentId: string;
  student_id?: string;
  week: number;
  week_number?: number;
  weekEndingDate?: string;
  week_ending_date?: string;
  objectives: string;
  actualTasks?: string;
  actual_tasks?: string;
  reflection: string;
  status: any;
  supervisorApproved?: boolean;
  supervisor_approved?: boolean;
  submittedAt?: string;
  submitted_at?: string;
  dueDate?: string;
  due_date?: string;
}

export const companies: Company[] = [
  { id: "c1", name: "Econet Wireless", address: "1906 Borrowdale Rd", city: "Harare" },
  { id: "c2", name: "Delta Corporation", address: "Seke Rd, Graniteside", city: "Harare" },
  { id: "c3", name: "CBZ Holdings", address: "31 Union Ave", city: "Harare" },
  { id: "c4", name: "Old Mutual Zimbabwe", address: "Mutual Gardens, 100 The Chase", city: "Harare" },
  { id: "c5", name: "TelOne", address: "107 Kwame Nkrumah Ave", city: "Harare" },
];

export const supervisors: Supervisor[] = [
  { id: "sup1", name: "Tendai Moyo", email: "t.moyo@econet.co.zw", company: "Econet Wireless", companyId: "c1", phone: "+263 77 123 4567", jobTitle: "Senior Engineer" },
  { id: "sup2", name: "Grace Ndlovu", email: "g.ndlovu@delta.co.zw", company: "Delta Corporation", companyId: "c2", phone: "+263 77 234 5678", jobTitle: "IT Manager" },
  { id: "sup3", name: "Peter Zimuto", email: "p.zimuto@cbz.co.zw", company: "CBZ Holdings", companyId: "c3", phone: "+263 77 345 6789", jobTitle: "Systems Analyst" },
];

export const lecturers: Lecturer[] = [
  { id: "lec1", name: "F. Makudza", email: "f.makudza@uoz.mail.ac.zw", department: "Computer Science" },
  { id: "lec2", name: "Prof. Samuel Mhlanga", email: "s.mhlanga@uoz.mail.ac.zw", department: "Information Systems" },
  { id: "lec3", name: "Dr. Farai Nhamo", email: "f.nhamo@uoz.mail.ac.zw", department: "Software Engineering" },
];

export const students: Student[] = [
  { id: "stu1", regNumber: "P001234S", name: "Peace Sibanda", programme: "BSc Computer Science", email: "p.sibanda@students.uz.ac.zw", phone: "+263 78 111 2233" },
  { id: "stu2", regNumber: "R218001B", name: "Nyasha Dube", programme: "BSc Information Systems", email: "r218001b@students.uz.ac.zw", phone: "+263 78 222 3344" },
  { id: "stu3", regNumber: "R219045C", name: "Chiedza Maposa", programme: "BSc Software Engineering", email: "r219045c@students.uz.ac.zw", phone: "+263 78 333 4455" },
  { id: "stu4", regNumber: "R220112D", name: "Kudakwashe Matare", programme: "BSc Computer Science", email: "r220112d@students.uz.ac.zw", phone: "+263 78 444 5566" },
  { id: "stu5", regNumber: "R221200E", name: "Rutendo Sibanda", programme: "BSc Information Systems", email: "r221200e@students.uz.ac.zw", phone: "+263 78 555 6677" },
];

export const placements: Placement[] = [];

export const submissions: Submission[] = [
  { id: "sub1", studentId: "stu1", title: "Week 1-4 Logbook", type: "logbook", dueDate: "2026-02-15", submittedDate: "2026-02-14", status: "approved", fileUrl: "#", feedback: "Well documented. Keep it up!" },
  { id: "sub2", studentId: "stu1", title: "Week 5-8 Logbook", type: "logbook", dueDate: "2026-03-15", submittedDate: "2026-03-14", status: "reviewed", fileUrl: "#", feedback: "Good detail on technical tasks." },
  { id: "sub3", studentId: "stu1", title: "Mid-term Report", type: "report", dueDate: "2026-04-01", status: "draft" },
  { id: "sub4", studentId: "stu1", title: "Week 9-12 Logbook", type: "logbook", dueDate: "2026-04-15", status: "draft" },
  { id: "sub5", studentId: "stu2", title: "Week 1-4 Logbook", type: "logbook", dueDate: "2026-03-01", submittedDate: "2026-02-28", status: "submitted", fileUrl: "#" },
  { id: "sub6", studentId: "stu2", title: "Week 5-8 Logbook", type: "logbook", dueDate: "2026-04-01", status: "draft" },
  { id: "sub7", studentId: "stu3", title: "Week 1-4 Logbook", type: "logbook", dueDate: "2026-02-20", submittedDate: "2026-02-19", status: "approved", fileUrl: "#" },
  { id: "sub8", studentId: "stu3", title: "Mid-term Report", type: "report", dueDate: "2026-03-20", submittedDate: "2026-03-19", status: "submitted", fileUrl: "#" },
];

export const assessments: Assessment[] = [
  { id: "a1", submissionId: "sub1", studentId: "stu1", supervisorScore: 82, lecturerScore: 78, supervisorComments: "Peace shows great initiative.", lecturerComments: "Solid start to the placement.", date: "2026-02-20" },
  { id: "a2", submissionId: "sub2", studentId: "stu1", supervisorScore: 85, supervisorComments: "Improving steadily. Good technical skills.", date: "2026-03-20" },
  { id: "a3", submissionId: "sub7", studentId: "stu3", supervisorScore: 90, lecturerScore: 88, supervisorComments: "Exceptional work.", lecturerComments: "Outstanding documentation.", date: "2026-03-01" },
];

export const messages: Message[] = [
  { id: "m1", senderId: "sup1", receiverId: "stu1", content: "Hi Peace, please submit your next logbook before the deadline.", timestamp: "2026-03-10T09:00:00Z", read: true },
  { id: "m2", senderId: "stu1", receiverId: "sup1", content: "Sure Mr Moyo, I will have it ready by Friday.", timestamp: "2026-03-10T09:15:00Z", read: true },
  { id: "m3", senderId: "lec1", receiverId: "stu1", content: "Peace, I've reviewed your logbook. Good progress!", timestamp: "2026-03-12T14:00:00Z", read: false },
];

export const placementSubmissions: PlacementSubmission[] = [];

export const logbookEntries: LogbookEntry[] = [
  { id: "lb1", studentId: "stu1", week: 1, weekEndingDate: "2026-01-24", objectives: "Orientation and familiarization with company systems and processes.", actualTasks: "Completed induction, met team members, received access credentials, toured facilities.", reflection: "The first week was eye-opening. The gap between academic knowledge and real-world application is significant but exciting.", status: "approved", supervisorApproved: true, submittedAt: "2026-01-24T16:00:00Z" },
  { id: "lb2", studentId: "stu1", week: 2, weekEndingDate: "2026-01-31", objectives: "Begin working on assigned project module. Learn internal coding standards.", actualTasks: "Set up development environment, reviewed codebase, completed 2 small bug fixes.", reflection: "Understanding existing code is challenging but rewarding. I learned the importance of code documentation.", status: "approved", supervisorApproved: true, submittedAt: "2026-01-31T16:00:00Z" },
  { id: "lb3", studentId: "stu1", week: 3, weekEndingDate: "2026-02-07", objectives: "Develop API endpoints for user management module.", actualTasks: "Created 3 REST endpoints, wrote unit tests, participated in code review.", reflection: "Code reviews revealed areas where I need to improve — particularly error handling and input validation.", status: "submitted", supervisorApproved: false, submittedAt: "2026-02-07T16:00:00Z" },
  { id: "lb4", studentId: "stu1", week: 4, weekEndingDate: "2026-02-14", objectives: "Complete integration testing and documentation.", actualTasks: "Wrote integration tests, updated API documentation, fixed 5 bugs found during testing.", reflection: "Testing is more complex than expected. I now appreciate why test-driven development is emphasised in industry.", status: "draft", supervisorApproved: false },
];

export const departments = [
  "Computer Science",
  "Information Systems",
  "Software Engineering",
  "Mathematics",
  "Statistics",
  "Electronics",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
];

export type UserRole = "student" | "supervisor" | "lecturer" | "coordinator";

export interface AuthUser {
  reg_number?: string;
  regNumber?: string;
  department?: string;
  faculty?: string;
  programme?: string;
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export const mockUsers: Record<string, AuthUser & { password: string }> = {
  "p.sibanda@students.uz.ac.zw": { id: "stu1", name: "Peace Sibanda", email: "p.sibanda@students.uz.ac.zw", role: "student", password: "student123" },
  "t.moyo@econet.co.zw": { id: "sup1", name: "Tendai Moyo", email: "t.moyo@econet.co.zw", role: "supervisor", password: "super123" },
  "f.makudza@uoz.mail.ac.zw": { id: "lec1", name: "F. Makudza", email: "f.makudza@uoz.mail.ac.zw", role: "lecturer", password: "lecturer123" },
  "coordinator@uoz.mail.ac.zw": { id: "coord1", name: "Ms. Tsitsi Nhira", email: "coordinator@uoz.mail.ac.zw", role: "coordinator", password: "coord123" },
};

placements.forEach((p: any) => { p.student_id = p.studentId; p.supervisor_id = p.supervisorId; p.company_id = p.companyId; p.lecturer_id = p.lecturerId; p.start_date = p.startDate; p.end_date = p.endDate; });
submissions.forEach((s: any) => { s.student_id = s.studentId; s.due_date = s.dueDate; s.submitted_date = s.submittedDate; s.file_url = s.fileUrl; });
logbookEntries.forEach((l: any) => { l.student_id = l.studentId; l.week_number = l.week; l.due_date = l.weekEndingDate; l.week_ending_date = l.weekEndingDate; l.actual_tasks = l.actualTasks; l.supervisor_approved = l.supervisorApproved; l.submitted_at = l.submittedAt; });
messages.forEach((m: any) => { m.sender_id = m.senderId; m.receiver_id = m.receiverId; m.created_at = m.timestamp; });
