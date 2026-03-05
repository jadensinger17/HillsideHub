# HillsideHub — CLAUDE.md

Internal platform for Hillside Ventures.

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14, App Router, TypeScript |
| Styling | Tailwind CSS |
| Database / Auth / Storage | Supabase |
| UI Primitives | Radix UI (`@radix-ui/react-tabs`, `@radix-ui/react-dialog`) |
| Forms | `react-hook-form` + `zod` |
| Toasts | `sonner` |

## Project Structure

```
app/
  (auth)/login/         Login page
  (auth)/auth/callback/ Supabase OAuth callback route
  (protected)/layout.tsx  Auth + role injection (Server Component)
  (protected)/recruitment/ Admin-only recruitment page
  (protected)/mid-semester/ Role-aware mid-semester page
  api/upload-resume/    Signed upload URL endpoint
  api/resume-url/       Signed download URL endpoint

components/
  layout/               Navbar, RoleProvider (context), RoleGuard
  recruitment/          RecruitmentTabs, ApplicantsTab, InterviewsTab, AIAnalysisTab,
                        ApplicantDetailPanel, RubricForm
  mid-semester/         AnalystReportForm, AdminReportsTable
  ui/                   Button, Badge, Modal, LoadingSpinner

lib/
  supabase/client.ts    Browser Supabase client (use in Client Components)
  supabase/server.ts    Server Supabase client (use in Server Components / Server Actions)
  supabase/admin.ts     Service-role client (server-only, bypasses RLS)
  types/app.types.ts    App-level TypeScript interfaces
  types/database.types.ts  Supabase-generated DB types
  utils/roles.ts        isAdmin(), isAnalyst() helpers
  utils/format.ts       formatGpa(), formatDate(), statusLabel(), statusColor()
  utils/cn.ts           clsx + tailwind-merge helper

hooks/
  useFileUpload.ts      Resume upload flow (client)

supabase/migrations/    SQL migration files (run in order 001 → 005)

middleware.ts           Edge route protection + session refresh
```

## Role System

Two roles: **admin** and **analyst**. Roles are stored in the `profiles` table (not `user_metadata`).

| Route | Admin | Analyst |
|---|---|---|
| `/recruitment` | Full access | Redirected to `/` |
| `/mid-semester` | Sees all analyst reports | Sees own form |
| `/login` | Redirected to `/` if already logged in | Same |

### Role flow
```
Request
  → middleware.ts       (session refresh, redirect unauthenticated to /login)
  → (protected)/layout.tsx  (getUser() + profiles query → RoleProvider context)
  → Page (Server Component) (checks role, renders correct branch)
  → Server Action       (independently re-queries role from profiles — NEVER trusts client)
```

## Supabase Client Usage

| File type | Client to use | Import from |
|---|---|---|
| Server Component, Server Action, Route Handler | `createClient()` | `@/lib/supabase/server` |
| Client Component (`"use client"`) | `createClient()` | `@/lib/supabase/client` |
| Route Handler needing bypass RLS | `createAdminClient()` | `@/lib/supabase/admin` |

**Never** import `admin.ts` in client components. **Never** call `getSession()` to verify auth — always `getUser()`.

## Server Action Security Rule

Every Server Action that mutates data **must** independently fetch the user and role from Supabase:

```ts
const { data: { user } } = await supabase.auth.getUser()
const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
if (profile?.role !== "admin") throw new Error("Forbidden")
```

Never accept a role value from the request body or client-side state.

## Database Schema

### `profiles`
`id` → `auth.users(id)` | `email` | `role: 'admin'|'analyst'` | `full_name` | timestamps

Auto-created by `handle_new_user()` trigger on auth signup. Default role is `analyst`. Promote to admin manually in Supabase dashboard.

### `applicants`
`id` | `name` | `email` | `gpa NUMERIC(3,2)` | `application_message` | `resume_path` (Storage) | `status: 'pending'|'interview'|'accepted'|'rejected'` | timestamps

### `interview_rubrics`
`id` | `applicant_id` → `applicants(id)` UNIQUE | `template JSONB` | `responses JSONB` | `filled_by` → `profiles(id)` | `is_complete` | timestamps

One rubric per applicant. Auto-created when applicant is moved to interview. Template structure:
```json
{ "sections": [{ "title": "...", "fields": [{ "key": "...", "label": "...", "type": "rating|text|boolean", "max": 5 }] }] }
```

### `mid_semester_reports`
`id` | `analyst_id` → `profiles(id)` UNIQUE | `form_data JSONB` | `submitted_at` | `updated_at`

One report per analyst. Upserted on submission.

## Resume Storage

- Bucket: `resumes` (private, no public access)
- Path pattern: `resumes/{applicant_id}/{filename}`
- Upload: client → `POST /api/upload-resume` → signed upload URL → PUT directly to Supabase Storage
- Download: Server Component/Route Handler → `createAdminClient().storage.from('resumes').createSignedUrl(path, 300)`

## Running Migrations

Run SQL files in order in the Supabase SQL editor:
1. `supabase/migrations/001_create_profiles.sql`
2. `supabase/migrations/002_create_applicants.sql`
3. `supabase/migrations/003_create_interview_rubrics.sql`
4. `supabase/migrations/004_create_mid_semester_reports.sql`
5. `supabase/migrations/005_storage_policies.sql` (after creating the `resumes` bucket)

## Getting Started (after installing Node.js)

```bash
cd HillsideHub
npm install
# Add SUPABASE_SERVICE_ROLE_KEY to .env.local
# Run migrations in Supabase dashboard
# Create "resumes" storage bucket (private)
npm run dev
```

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL        # Public — safe to expose
NEXT_PUBLIC_SUPABASE_ANON_KEY   # Public — safe to expose
SUPABASE_SERVICE_ROLE_KEY       # Private — server-only, never commit
```
