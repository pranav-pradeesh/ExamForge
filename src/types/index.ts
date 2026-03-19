export type ExamType = 'JEE' | 'VIT'
export type Subject = 'Physics' | 'Chemistry' | 'Mathematics'
export type Difficulty = 'Easy' | 'Medium' | 'Hard'
export type CorrectOption = 'A' | 'B' | 'C' | 'D'

export interface Profile {
  id: string
  email: string
  full_name: string
  target_exam: ExamType | 'BOTH'
  created_at: string
  avatar_url: string | null
  total_tests: number
  avg_score: number
}

export interface Question {
  id: string
  exam_type: ExamType
  subject: Subject
  topic: string
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_option: CorrectOption
  explanation: string
  difficulty: Difficulty
  year: number | null
  created_at: string
}

export interface TestSession {
  id: string
  user_id: string
  exam_type: ExamType
  subject: string | null
  total_questions: number
  attempted: number
  correct: number
  score: number
  time_taken: number
  ai_analysis: string | null
  answers: Record<string, string>
  created_at: string
}

export interface ExamConfig {
  examType: ExamType
  subject: Subject | 'Mixed'
  numQuestions: number
  duration: number // minutes
}
