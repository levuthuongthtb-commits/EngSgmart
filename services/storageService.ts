import { Quiz, StudentSubmission } from '../types';

const QUIZ_KEY = 'engsmart_quizzes';
const SUBMISSION_KEY = 'engsmart_submissions';

export const saveQuiz = (quiz: Quiz): void => {
  const quizzes = getQuizzes();
  const existingIndex = quizzes.findIndex(q => q.id === quiz.id);
  if (existingIndex >= 0) {
    quizzes[existingIndex] = quiz;
  } else {
    quizzes.push(quiz);
  }
  localStorage.setItem(QUIZ_KEY, JSON.stringify(quizzes));
};

export const getQuizzes = (): Quiz[] => {
  const data = localStorage.getItem(QUIZ_KEY);
  return data ? JSON.parse(data) : [];
};

export const getQuizByCode = (code: string): Quiz | undefined => {
  const quizzes = getQuizzes();
  return quizzes.find(q => q.accessCode === code && q.isActive);
};

export const saveSubmission = (submission: StudentSubmission): void => {
  const submissions = getSubmissions();
  submissions.push(submission);
  localStorage.setItem(SUBMISSION_KEY, JSON.stringify(submissions));
};

export const getSubmissions = (): StudentSubmission[] => {
  const data = localStorage.getItem(SUBMISSION_KEY);
  return data ? JSON.parse(data) : [];
};

export const getSubmissionsByQuizId = (quizId: string): StudentSubmission[] => {
  return getSubmissions().filter(s => s.quizId === quizId);
};

export const deleteQuiz = (quizId: string): void => {
    let quizzes = getQuizzes();
    quizzes = quizzes.filter(q => q.id !== quizId);
    localStorage.setItem(QUIZ_KEY, JSON.stringify(quizzes));
}
