# ExamGuard – Build Phases Tracker

> This document tracks all implementation phases for the ExamGuard platform.
> Each phase is built sequentially, producing a working increment.

---

## Phase 1: Project Scaffolding & Configuration ⏳
**Status:** In Progress  
**Description:** Bootstrap Next.js project, install dependencies, configure tooling, establish folder architecture.  
**Key Deliverables:**
- Next.js 15 (App Router) with TypeScript
- Tailwind CSS v4 + custom theme
- shadcn/ui component library
- Drizzle ORM configuration
- Environment variables setup
- Docker & Docker Compose
- Project folder structure
- Provider components (theme, query, session, toast)
- Next.js middleware skeleton

---

## Phase 2: Database Schema (Drizzle ORM + PostgreSQL) 🔲
**Status:** Not Started  
**Description:** Design and implement complete database schema with Drizzle ORM targeting Neon PostgreSQL.  
**Key Deliverables:**
- PostgreSQL enum types
- Users, roles, sessions, verification tokens tables
- Exams, sections, questions, options tables
- Question bank tables
- Exam attempts and student answers tables
- Proctoring sessions, violations, media captures tables
- Notifications, audit logs, system settings tables
- Relations and indexes
- Schema push to Neon DB
- Seed script with sample data

---

## Phase 3: Authentication & Authorization 🔲
**Status:** Not Started  
**Description:** Implement NextAuth.js with credentials provider, JWT sessions, RBAC middleware, and all auth pages.  
**Key Deliverables:**
- NextAuth.js configuration with Drizzle adapter
- Credentials provider (email + password)
- JWT strategy with embedded roles
- Login, Register, Forgot/Reset Password pages
- Email verification flow
- RBAC middleware (Super Admin, Admin, Student)
- Password hashing with bcrypt
- Session management

---

## Phase 4: Design System & Core UI Components 🔲
**Status:** Not Started  
**Description:** Build the visual foundation — custom theme, layout components, and all reusable shared components.  
**Key Deliverables:**
- Custom color palette (indigo/violet primary, emerald accents)
- Dark/Light mode with next-themes
- Sidebar navigation (collapsible, role-based)
- Header with search, notifications, user menu
- DataTable component (sorting, filtering, pagination)
- Stat cards, status badges, empty states
- File upload, confirm dialog, search input
- Chart wrapper components
- Loading skeletons

---

## Phase 5: Landing Page 🔲
**Status:** Not Started  
**Description:** Build a premium, animated landing page that showcases the platform.  
**Key Deliverables:**
- Hero section with animated gradient
- Feature highlights with Framer Motion
- How it works section
- Trust indicators / testimonials
- CTA sections
- Responsive footer

---

## Phase 6: Admin Dashboard ✅
**Status:** Completed  
**Description:** Build the complete administrative dashboard with all management pages.  
**Key Deliverables:**
- Dashboard overview (stats, charts, activity feed)
- User management (list, detail, activate/deactivate/suspend)
- Exam management (CRUD, multi-step wizard)
- Question bank management (categories, import, bulk ops)
- Live monitoring dashboard
- Reports & analytics pages
- System settings page

---

## Phase 7: Student Dashboard ✅
**Status:** Completed  
**Description:** Build student-facing dashboard with exam browsing, history, and profile.  
**Key Deliverables:**
- Student dashboard (upcoming exams, recent results, stats)
- Available exams listing with filters
- Exam detail & instructions page
- Exam history with past attempts
- Result detail with score breakdown
- Profile management
- PDF report download

---

## Phase 8: Examination Engine ✅
**Status:** Completed  
**Description:** Build the core exam-taking interface — fullscreen, distraction-free, with all question types.  
**Key Deliverables:**
- Fullscreen exam shell
- Countdown timer with auto-submit
- Question navigator (sidebar)
- MCQ, Multi-select, True/False, Fill-blank, Descriptive renderers
- Answer persistence (Zustand + API)
- Question flagging
- Review before submission
- Submit and auto-submit flows
- Section-wise navigation

---

## Phase 9: AI Proctoring System 🔲
**Status:** Not Started  
**Description:** Browser-based proctoring with face detection and environment monitoring.  
**Key Deliverables:**
- Face detection via face-api.js
- Single face verification
- Browser tab/window monitoring
- DevTools detection
- Copy/paste/right-click prevention
- Keyboard shortcut blocking
- Violation logging with timestamps
- Screenshot capture on violations
- Periodic webcam snapshots
- Auto-termination on max violations
- Pre-exam camera check

---

## Phase 10: Reports & PDF Generation 🔲
**Status:** Not Started  
**Description:** Generate comprehensive reports and enable PDF/CSV export.  
**Key Deliverables:**
- Student performance reports
- Exam analytics (pass/fail, score distribution)
- Proctoring violation reports
- PDF generation with @react-pdf/renderer
- CSV export utility
- Chart visualizations

---

## Phase 11: Email & Notifications 🔲
**Status:** Not Started  
**Description:** Email notifications via Resend and in-app notification system.  
**Key Deliverables:**
- Resend email service integration
- Email verification template
- Password reset template
- Exam reminder template
- Violation alert template (admin)
- Result notification template
- In-app notification system
- Notification API routes

---

## Phase 12: DevOps & Documentation 🔲
**Status:** Not Started  
**Description:** Docker setup, documentation, and final polish.  
**Key Deliverables:**
- Docker Compose (PostgreSQL + app)
- Multi-stage Dockerfile
- Complete README with setup instructions
- Environment variable documentation
- Deployment guide for Vercel
- API documentation

---

## Configuration Notes

| Setting | Value |
|---------|-------|
| Database | Neon PostgreSQL (cloud) |
| Email | Resend (free tier) |
| File Storage | Cloudinary (free plan) |
| PDF Library | @react-pdf/renderer |
| Deployment | Vercel |
| Auth | NextAuth.js with JWT |
| ORM | Drizzle ORM |
| UI | Tailwind CSS + shadcn/ui |
