# UZConnect - Work-Related Learning Management System

A modern, full-stack Next.js web application built for the **University of Zimbabwe (UZ)** to manage student industrial attachments, host company supervision, academic assessments, logbooks, and inter-stakeholder communications.

Migrated from legacy PHP/Laravel/MySQL to **Next.js 16+ (App Router)** + **TypeScript** + **Prisma ORM** + **PostgreSQL** + **Tailwind CSS** + **NextAuth (Auth.js)**.

---

## Key Features

### 1. Student Portal (`/student`)
- **Placement Dashboard**: Real-time overview of active attachment status, host organization, and supervision team.
- **Placement Submission**: Online submission form with host company details, mentor contacts, and duration.
- **12-Week Interactive Logbook**: Week-by-week entry editor with learning objectives, tasks completed, reflections, draft saving, and supervisor sign-off tracking.
- **Deliverables & Reports**: Submit mid-term reports, final attachment reports, presentations, and portfolios.
- **Deadlines & Timelines**: Visual chronological tracker with status indicators (Upcoming, Due Soon, Completed, Overdue).
- **Feedback & Scores**: Rubric-based assessment breakdowns (Technical, Professional, Communication) with evaluator remarks.
- **Direct Messaging**: Communicate directly with workplace supervisors and university lecturers.

### 2. Academic Lecturer Portal (`/lecturer`)
- **Student Roster**: Assigned students across departments and programmes with placement sites and contacts.
- **Placements Overview**: Host company sites, address locations, and mentor details.
- **Logbook Reviews**: Review student weekly logbooks, verify tasks, provide academic comments, and sign off.
- **Deliverable Grading**: Evaluate reports and presentations with multi-criteria rubric sliders and qualitative comments.
- **Workplace Mentors**: Directory of host company supervisors working with assigned students.
- **Analytics & Insights**: Cohort performance metrics, grading completion rates, and host distribution charts.
- **Direct Messaging**: In-app inbox to communicate with mentees, mentors, and coordinators.

### 3. Workplace Supervisor Portal (`/supervisor`)
- **Intern Management**: Track students placed at your company.
- **Placement Confirmations**: Verify and confirm acceptance of student interns.
- **Weekly Logbook Sign-off**: Review and verify on-site technical activities with qualitative supervisor remarks.
- **Employer Assessments**: Conduct industry evaluations on professionalism, technical competence, and communication.
- **Direct Messaging**: Seamless communication with intern students and university lecturers.

### 4. WRL Coordinator Administration (`/coordinator`)
- **Institution Student Roster**: Search, filter, and track placement status across all departments.
- **Bulk CSV Import**: Batch import student cohorts directly from university enrollment CSV files.
- **Placement Approvals & Allocations**: Review student attachment applications, verify host companies, and assign academic lecturers.
- **Supervisor Verification**: Review and approve workplace mentor registration requests.
- **Assessment Rubrics**: Standardized grading matrices and evaluation criteria.
- **System Messaging**: Broadcast announcements and communicate with all platform users.

---

## Tech Stack

- **Framework**: Next.js 16+ (App Router, Server Components & Server Actions)
- **Database**: PostgreSQL (`uzconnect`)
- **ORM**: Prisma 6 with 20 models & relational migrations
- **Authentication**: NextAuth.js v5 (JWT session strategy, role-based middleware protection)
- **Styling**: Tailwind CSS, CSS variables, `next-themes` (Dark/Light mode support)
- **Icons**: Lucide React
- **Forms & Validation**: Zod, React Hook Form

---

## Getting Started

### 1. Environment Configuration

Copy `.env.example` to `.env`:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/uzconnect"
NEXTAUTH_SECRET="your-32-character-secret-key"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="UZConnect"
```

### 2. Database Migration & Seeding

```bash
# Run migrations
npx prisma migrate dev --name init

# Seed database with faculties, programmes, demo users, and demo placements
npx tsx prisma/seed.ts
```

### 3. Development Server

```bash
npm run dev
```

Navigate to `http://localhost:3000`.

---

## Demo Accounts

| Role | Email | Password |
|---|---|---|
| **Coordinator** | `coordinator@uz.ac.zw` | `coord123!` |
| **Lecturer** | `f.makudza@uz.ac.zw` | `lecturer123!` |
| **Supervisor** | `t.moyo@econet.co.zw` | `super123!` |
| **Student** | `R2421428@uofzmail.uz.ac.zw` | `student123!` |

---

## License

University of Zimbabwe (UZ) - Department of Computer Science / Work-Related Learning.