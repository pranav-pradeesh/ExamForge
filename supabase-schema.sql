-- ============================================================
-- ExamPrep Platform — Supabase Schema
-- Run this entire file in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  target_exam TEXT DEFAULT 'JEE' CHECK (target_exam IN ('JEE', 'VIT', 'BITSAT', 'MHT-CET')),
  streak_days INTEGER DEFAULT 0,
  total_tests_taken INTEGER DEFAULT 0,
  total_score_points INTEGER DEFAULT 0,
  rank INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SUBJECTS
-- ============================================================
CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  exam_type TEXT NOT NULL,
  color TEXT DEFAULT '#2baffc',
  icon TEXT DEFAULT '📚',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO subjects (name, code, exam_type, color, icon) VALUES
  ('Physics', 'PHY', 'JEE', '#2baffc', '⚡'),
  ('Chemistry', 'CHE', 'JEE', '#55c360', '🧪'),
  ('Mathematics', 'MAT', 'JEE', '#f59e0b', '📐'),
  ('Physics', 'PHY-VIT', 'VIT', '#2baffc', '⚡'),
  ('Chemistry', 'CHE-VIT', 'VIT', '#55c360', '🧪'),
  ('Mathematics', 'MAT-VIT', 'VIT', '#f59e0b', '📐'),
  ('English', 'ENG-VIT', 'VIT', '#ec4899', '📖');

-- ============================================================
-- QUESTIONS (PYQ Bank)
-- ============================================================
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  exam_type TEXT NOT NULL CHECK (exam_type IN ('JEE', 'VIT', 'BITSAT', 'MHT-CET')),
  year INTEGER,
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_option TEXT NOT NULL CHECK (correct_option IN ('A', 'B', 'C', 'D')),
  explanation TEXT,
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  topic TEXT,
  marks_positive INTEGER DEFAULT 4,
  marks_negative INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sample questions
INSERT INTO questions (subject_id, exam_type, year, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, difficulty, topic) 
SELECT 
  s.id, 'JEE', 2024,
  'A particle moves in a circle of radius r with speed v. The centripetal acceleration is:',
  'v/r', 'v²/r', 'v²r', 'vr²',
  'B', 'Centripetal acceleration = v²/r. This is derived from the rate of change of velocity vector direction.',
  'medium', 'Circular Motion'
FROM subjects s WHERE s.code = 'PHY';

INSERT INTO questions (subject_id, exam_type, year, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, difficulty, topic) 
SELECT 
  s.id, 'JEE', 2024,
  'The pH of a solution with [H⁺] = 10⁻⁷ M at 25°C is:',
  '6', '7', '8', '14',
  'B', 'pH = -log[H⁺] = -log(10⁻⁷) = 7. This is the neutral pH at 25°C.',
  'easy', 'Ionic Equilibrium'
FROM subjects s WHERE s.code = 'CHE';

INSERT INTO questions (subject_id, exam_type, year, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, difficulty, topic) 
SELECT 
  s.id, 'JEE', 2023,
  'The derivative of sin(x²) with respect to x is:',
  'cos(x²)', '2x cos(x²)', 'cos(2x)', '2cos(x²)',
  'B', 'Using chain rule: d/dx[sin(x²)] = cos(x²) · 2x = 2x cos(x²)',
  'easy', 'Differentiation'
FROM subjects s WHERE s.code = 'MAT';

INSERT INTO questions (subject_id, exam_type, year, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, difficulty, topic) 
SELECT 
  s.id, 'JEE', 2023,
  'In Young''s double slit experiment, the fringe width β is given by (D=distance to screen, d=slit separation, λ=wavelength):',
  'βλd/D', 'βλD/d', 'βdD/λ', 'βλ/(dD)',
  'B', 'Fringe width β = λD/d. It increases with wavelength and screen distance, decreases with slit separation.',
  'medium', 'Wave Optics'
FROM subjects s WHERE s.code = 'PHY';

INSERT INTO questions (subject_id, exam_type, year, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, difficulty, topic) 
SELECT 
  s.id, 'JEE', 2022,
  'Which of the following has the highest electronegativity?',
  'Oxygen', 'Nitrogen', 'Fluorine', 'Chlorine',
  'C', 'Fluorine (F) has the highest electronegativity of 3.98 on the Pauling scale due to its small atomic radius and high nuclear charge.',
  'easy', 'Chemical Bonding'
FROM subjects s WHERE s.code = 'CHE';

INSERT INTO questions (subject_id, exam_type, year, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, difficulty, topic) 
SELECT 
  s.id, 'JEE', 2024,
  'The integral ∫(1/(1+x²))dx equals:',
  'ln|1+x²| + C', 'arctan(x) + C', '1/(2x) + C', 'arcsin(x) + C',
  'B', '∫(1/(1+x²))dx = arctan(x) + C. This is a standard integral formula.',
  'easy', 'Integration'
FROM subjects s WHERE s.code = 'MAT';

INSERT INTO questions (subject_id, exam_type, year, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, difficulty, topic) 
SELECT 
  s.id, 'JEE', 2023,
  'A body of mass m is thrown vertically upward with velocity u. The maximum height reached is:',
  'u/g', 'u²/2g', 'u²/g', '2u²/g',
  'B', 'Using v²=u²-2gh, at max height v=0: h = u²/2g',
  'easy', 'Kinematics'
FROM subjects s WHERE s.code = 'PHY';

INSERT INTO questions (subject_id, exam_type, year, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, difficulty, topic) 
SELECT 
  s.id, 'JEE', 2022,
  'The hybridization of carbon in methane (CH₄) is:',
  'sp', 'sp²', 'sp³', 'sp³d',
  'C', 'In CH₄, carbon forms 4 equivalent C-H bonds using sp³ hybrid orbitals in a tetrahedral arrangement.',
  'easy', 'Chemical Bonding'
FROM subjects s WHERE s.code = 'CHE';

-- ============================================================
-- MOCK EXAMS (Templates)
-- ============================================================
CREATE TABLE mock_exams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  exam_type TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 180,
  total_questions INTEGER NOT NULL DEFAULT 90,
  total_marks INTEGER NOT NULL DEFAULT 360,
  instructions TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_by TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO mock_exams (title, exam_type, duration_minutes, total_questions, total_marks, instructions) VALUES
  ('JEE Main 2024 — Full Mock Test 1', 'JEE', 180, 90, 300, 'This mock test follows the exact JEE Main 2024 pattern. +4 for correct, -1 for wrong. Section A: MCQ, Section B: Numerical.'),
  ('JEE Main 2024 — Full Mock Test 2', 'JEE', 180, 90, 300, 'Second full-length mock. Focus on time management.'),
  ('VIT Engineering — Mock Test 1', 'VIT', 150, 125, 500, 'VITEEE pattern. +4 for correct, no negative marking. Physics, Chemistry, Maths, English, Aptitude.'),
  ('JEE Advanced — Paper 1', 'JEE', 180, 57, 198, 'JEE Advanced Paper 1 pattern. Multiple question types including MSQ and integer type.'),
  ('JEE Main — Chapter Test: Physics', 'JEE', 60, 30, 120, 'Chapter-wise test covering Mechanics, Thermodynamics, and Waves.');

-- ============================================================
-- MOCK EXAM QUESTIONS (Junction)
-- ============================================================
CREATE TABLE mock_exam_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mock_exam_id UUID REFERENCES mock_exams(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  question_order INTEGER NOT NULL,
  section_name TEXT DEFAULT 'Section A',
  UNIQUE(mock_exam_id, question_id)
);

-- Auto-populate mock exam 1 with all available questions
INSERT INTO mock_exam_questions (mock_exam_id, question_id, question_order, section_name)
SELECT 
  (SELECT id FROM mock_exams WHERE title LIKE '%Mock Test 1%' AND exam_type = 'JEE' LIMIT 1),
  q.id,
  ROW_NUMBER() OVER (ORDER BY q.created_at),
  CASE WHEN s.code = 'PHY' THEN 'Physics' WHEN s.code = 'CHE' THEN 'Chemistry' ELSE 'Mathematics' END
FROM questions q
JOIN subjects s ON q.subject_id = s.id
WHERE q.exam_type = 'JEE' AND q.is_active = TRUE;

-- ============================================================
-- TEST SESSIONS (Student Attempts)
-- ============================================================
CREATE TABLE test_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  mock_exam_id UUID REFERENCES mock_exams(id) ON DELETE SET NULL,
  exam_type TEXT NOT NULL,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  time_taken_seconds INTEGER,
  total_score INTEGER DEFAULT 0,
  max_score INTEGER DEFAULT 300,
  percentage NUMERIC(5,2) DEFAULT 0,
  correct_count INTEGER DEFAULT 0,
  wrong_count INTEGER DEFAULT 0,
  skipped_count INTEGER DEFAULT 0,
  physics_score INTEGER DEFAULT 0,
  chemistry_score INTEGER DEFAULT 0,
  maths_score INTEGER DEFAULT 0,
  ai_analysis TEXT,
  ai_weak_topics TEXT[],
  ai_strong_topics TEXT[],
  ai_recommendations TEXT[]
);

-- ============================================================
-- TEST ANSWERS (Per-question responses)
-- ============================================================
CREATE TABLE test_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES test_sessions(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  selected_option TEXT CHECK (selected_option IN ('A', 'B', 'C', 'D') OR selected_option IS NULL),
  is_correct BOOLEAN,
  is_marked_for_review BOOLEAN DEFAULT FALSE,
  time_spent_seconds INTEGER DEFAULT 0,
  answered_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, question_id)
);

-- ============================================================
-- STUDENT NOTES
-- ============================================================
CREATE TABLE student_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[],
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- STUDY CHECKLIST ITEMS
-- ============================================================
CREATE TABLE study_checklist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  topic TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  source TEXT DEFAULT 'ai' CHECK (source IN ('ai', 'manual')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- LEADERBOARD VIEW
-- ============================================================
CREATE OR REPLACE VIEW leaderboard AS
SELECT 
  p.id,
  p.full_name,
  p.target_exam,
  p.total_tests_taken,
  p.total_score_points,
  RANK() OVER (ORDER BY p.total_score_points DESC) as rank,
  RANK() OVER (PARTITION BY p.target_exam ORDER BY p.total_score_points DESC) as exam_rank
FROM profiles p;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_checklist ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read all, only update own
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Test sessions: own only
CREATE POLICY "Users can view own sessions" ON test_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sessions" ON test_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions" ON test_sessions FOR UPDATE USING (auth.uid() = user_id);

-- Answers: own only
CREATE POLICY "Users can manage own answers" ON test_answers FOR ALL USING (
  auth.uid() = (SELECT user_id FROM test_sessions WHERE id = session_id)
);

-- Notes: own only
CREATE POLICY "Users can manage own notes" ON student_notes FOR ALL USING (auth.uid() = user_id);

-- Checklist: own only
CREATE POLICY "Users can manage own checklist" ON study_checklist FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, email, target_exam)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'target_exam', 'JEE')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update profile stats after test completion
CREATE OR REPLACE FUNCTION update_profile_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status = 'in_progress' THEN
    UPDATE profiles SET
      total_tests_taken = total_tests_taken + 1,
      total_score_points = total_score_points + NEW.total_score,
      updated_at = NOW()
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_test_completed
  AFTER UPDATE ON test_sessions
  FOR EACH ROW EXECUTE FUNCTION update_profile_stats();

-- ============================================================
-- GRANTS (allow anon to read questions/exams)
-- ============================================================
GRANT SELECT ON subjects TO anon, authenticated;
GRANT SELECT ON questions TO anon, authenticated;
GRANT SELECT ON mock_exams TO anon, authenticated;
GRANT SELECT ON mock_exam_questions TO anon, authenticated;
GRANT SELECT ON leaderboard TO anon, authenticated;
