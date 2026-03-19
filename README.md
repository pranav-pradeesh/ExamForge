# ExamForge — JEE & VIT AI Prep Platform

Full-stack Next.js 14 application with Supabase, AI-powered analysis via Groq (Llama 4), and a dark glassmorphism design system in your custom colour palette (`#010101`, `#f4f9fd`, `#2baffc`, `#55c360`).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 · React 18 · TypeScript · Tailwind CSS |
| Database | Supabase (PostgreSQL) with Row Level Security |
| Auth | Supabase Auth (email/password) |
| AI | Groq API — `meta-llama/llama-4-scout-17b-16e-instruct` (free tier) |
| Charts | Recharts (Radar, etc.) |
| Icons | Lucide React |
| Fonts | JetBrains Mono (display) · Space Grotesk (body) |

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                        # Landing page
│   ├── login/page.tsx                  # Login
│   ├── signup/page.tsx                 # Sign up
│   ├── dashboard/
│   │   ├── layout.tsx                  # Sidebar layout
│   │   ├── page.tsx                    # Overview + Progress Nebula
│   │   ├── exam/
│   │   │   ├── page.tsx                # Exam selector
│   │   │   └── [sessionId]/
│   │   │       ├── layout.tsx          # Full-screen (no sidebar)
│   │   │       └── page.tsx            # CBT Engine
│   │   ├── results/
│   │   │   ├── page.tsx                # All results
│   │   │   └── [resultId]/page.tsx     # Result detail + AI analysis
│   │   ├── notes/page.tsx              # Study notes
│   │   └── checklist/page.tsx          # Study plan checklist
│   ├── admin/page.tsx                  # Admin panel (password protected)
│   └── api/
│       ├── ai/analyze/route.ts         # POST: generate exam analysis
│       ├── ai/explain/route.ts         # POST: explain a question
│       └── admin/auth/route.ts         # POST: verify admin password
├── lib/
│   ├── supabase.ts                     # Supabase client
│   ├── groq.ts                         # Groq AI client + helpers
│   └── utils.ts                        # formatTime, scoreColor, nebula gradient
└── types/index.ts                      # TypeScript types
```

---

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase Database

Go to your Supabase project → **SQL Editor** → paste and run the entire contents of `supabase-schema.sql`.

This creates:
- `profiles` — extended user info (auto-created on signup via trigger)
- `subjects` — Physics, Chemistry, Maths for JEE & VIT
- `questions` — PYQ bank with options, correct answer, explanation
- `mock_exams` — exam templates (5 pre-loaded)
- `mock_exam_questions` — junction table linking exams to questions
- `test_sessions` — student attempts with scores and AI analysis
- `test_answers` — per-question responses
- `student_notes` — personal notes
- `study_checklist` — AI + manual study topics
- `leaderboard` view
- Row Level Security policies
- Auto-profile-creation trigger
- Score-update trigger

### 3. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
GROQ_API_KEY=gsk_your-key
ADMIN_PASSWORD=YourSecurePassword
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Deploy to Vercel

```bash
npx vercel --prod
```

Add all env variables in Vercel dashboard → Settings → Environment Variables.

---

## Adding Questions (Admin Panel)

1. Go to `/admin`
2. Enter admin password (`Achupavi@0913` by default — change in `.env.local`)
3. Click **Questions** tab → **Add Question**
4. Fill in exam type, subject, question, 4 options, correct answer, explanation
5. Save — question is immediately available in mock tests

---

## AI Model

Uses **`meta-llama/llama-4-scout-17b-16e-instruct`** via Groq — the best free-tier model for:
- Post-exam performance analysis
- Per-question step-by-step explanations
- Weak topic identification
- Study plan recommendations

Falls back gracefully if Groq API is unavailable (stored explanation shown instead).

---

## Features

### Student Dashboard
- **Progress Nebula** — animated gradient that shifts colour based on strongest subject
- **Radar chart** — subject-wise performance visualisation
- Quick-start links for JEE Full Mock, VIT Full Mock, Chapter Practice
- Recent test history with scores

### CBT Exam Engine
- Full-screen mode (no sidebar) exactly like real exam
- Question palette with colour-coded status: Answered (green), Flagged (amber), Visited (grey), Unvisited (dark)
- Flag/unflag questions for review
- Clear answer
- Auto-submit on timer expiry
- Per-question time tracking

### Results & AI Analysis
- Subject-wise score breakdown
- AI analysis panel with weak zones + strong areas
- Per-question review with correct/wrong highlighting
- AI re-explain button on any question (calls Groq on demand)

### Admin Panel (`/admin`)
- Password-gated (no account needed — env variable)
- Overview: platform-wide stats + recent registrations
- Questions: add, edit, delete questions with full form
- Mock Exams: enable/disable exams
- Students: view all registered students, test counts, scores

---

## Colour Palette

| Token | Hex | Usage |
|---|---|---|
| Black | `#010101` | Background |
| Polar | `#f4f9fd` | Primary text |
| Dodger Blue | `#2baffc` | Primary accent, JEE badge |
| Emerald | `#55c360` | Success, VIT badge, CTA |

---

## Security Notes

- Admin password is verified server-side in `/api/admin/auth` — never exposed to client
- All student data is protected by Supabase Row Level Security
- Supabase anon key is safe to expose publicly (RLS enforces access control)
- GROQ_API_KEY is server-side only (used only in API routes, never in client components)
