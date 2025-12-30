
export enum Difficulty {
  NB = 'Nhận biết', // Recognition
  TH = 'Thông hiểu', // Understanding
  VD = 'Vận dụng',   // Application
  VDC = 'Vận dụng cao' // High Application
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number; // Index 0-3
  difficulty: Difficulty;
  explanation?: string;
  section?: string; // e.g., Phonetics, Reading, Writing
}

export interface Quiz {
  id: string;
  title: string;
  grade: string;
  topic: string;
  createdAt: number;
  questions: Question[];
  accessCode: string;
  isActive: boolean;
}

export interface StudentSubmission {
  id: string;
  quizId: string;
  studentName: string;
  score: number;
  totalQuestions: number;
  submittedAt: number;
  answers: number[]; // Index of selected option per question
}

export interface AppState {
  view: 'landing' | 'teacher-login' | 'teacher-dashboard' | 'student-login' | 'student-exam';
  userRole: 'teacher' | 'student' | null;
  currentQuizId?: string; // For student taking exam
  currentStudentName?: string;
}
