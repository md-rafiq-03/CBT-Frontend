export interface Student {
  id: string;
  roll_number: string;
  full_name: string;
  email: string | null;
  created_at: string;
}

export type UserRole = "ADMIN" | "STUDENT";

export interface AuthUser {
  token: string;
  userId: string;
  rollNumber: string;
  fullName: string;
  role: UserRole;
  mustChangePassword: boolean;
}

export interface LoginResponse extends AuthUser {}

export interface MeResponse {
  userId: string;
  rollNumber: string;
  fullName: string;
  role: UserRole;
  mustChangePassword: boolean;
}

export interface UserDirectoryItem {
  userId: string;
  rollNumber: string;
  fullName: string;
  role: UserRole;
}

export interface CreateStudentRequest {
  fullName: string;
  rollNumber: string;
  dob: string;
  email: string;
}

export interface SubmissionPerQuestion {
  questionId: string;
  type: "MCQ" | "INTEGER";
  submittedValue: string;
}

export interface Submission {
  id?: string;
  submissionId?: string;
  userId: string;
  testId: string;
  submissionPerQuestionList: SubmissionPerQuestion[];
  startedAt: number;
  endTime: number;
  cheatFlag: boolean;
  score: number;
}

export interface SubmissionPayload {
  userId: string;
  testId: string;
  submissionPerQuestionList: SubmissionPerQuestion[];
  startedAt: number;
  endTime: number;
  cheatFlag: boolean;
  score: number;
}

export interface SectionAnalysis {
  section: string;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  marksObtained: number;
  maxMarks: number;
}

export interface QuestionAnalysis {
  questionId: string;
  section: string;
  type: string;
  stem: string;
  submittedValue: string;
  correctAnswer: string | null;
  correct: boolean | null;
  answered: boolean;
  marksAwarded: number;
  maxMarks: number;
  negativeMarks: number;
}

export interface AttemptAnalysis {
  submissionId: string;
  userId: string;
  testId: string;
  testName: string;
  score: number;
  maxMarks: number;
  startedAt: number;
  endTime: number;
  timeTakenMs: number;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  sections: SectionAnalysis[];
  questions: QuestionAnalysis[];
}

/** Section metadata on a Test (not the same as question Section enum). */
export interface TestSection {
  name: string;
  count: number;
  mcqType: number;
  integerType: number;
}

export interface Test {
  // API-provided identifiers
  id: string;
  testId?: string; // e.g. "T-1002"

  // Human-readable fields
  testName?: string; // e.g. "Physics Mock Test"
  description?: string;

  // Questions / sections
  totalQuestions?: number | string;
  sections?: TestSection[];

  // Scoring
  negativeMarking?: NegativeMarking;
  maxMarks?: number;
  passingMarks?: number;

  // Timing / behavior
  durationInMins?: number;
  shuffleQuestions?: boolean;
  active?: boolean;

  // Timestamps (epoch ms)
  createdAt?: number;
  startAt?: number;
  expireAt?: number;
}

export interface NegativeMarking {
  enabled: boolean;
  perWrong: number;
}

/** Payload for POST /api/v1/tests (server overwrites testId/createdAt). */
export interface CreateTestPayload {
  testId?: string;
  testName: string;
  totalQuestions: string;
  sections: TestSection[];
  negativeMarking?: NegativeMarking;
  durationInMins: number;
  maxMarks: number;
  passingMarks?: number;
  active: boolean;
  shuffleQuestions?: boolean;
  startAt: number;
  expireAt: number;
}

export interface TestAttempt {
  id: string;
  student_id: string;
  test_id: string;
  score: number;
  attempted_date: string;
  completed: boolean;
  created_at: string;
}

export interface Question {
  id?: string;
  questionId?: string;
  testId: string;
  section: Section; // enum
  type: Type; // enum
  stem: string;
  attachments?: string[];
  options?: Option[];
  correctAnswer: CorrectAnswer;
  tolerance?: number;
  marks: number;
  negativeMarks?: number;
  createdAt?: string;
  modifiedAt?: string;
}

export enum Section {
  PHYSICS = "PHYSICS",
  CHEMISTRY = "CHEMISTRY",
  MATHS = "MATHS",
  BIOLOGY = "BIOLOGY",
}

export enum Type {
  MCQ = "MCQ",
  INTEGER = "INTEGER",
}
export interface Option {
  optionId: string;
  text: string;
  image?: string;
}

export interface CorrectAnswer {
  answer: string;
  explanation?: string;
  attachments?: string[];
}

export interface QuestionAttachment {
  url: string;
  type: string;
  description?: string;
}

export interface QuestionOption {
  optionId: string;
  text: string;
  image?: string | null;
}

export interface StudentAnswer {
  question_id: string;
  selected_option_id: string | null;
  integer_answer?: number;
  is_answered: boolean;
  answered_at: string;
}
