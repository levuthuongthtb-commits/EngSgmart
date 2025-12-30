
import React, { useState, useEffect } from 'react';
import { Quiz, Question, StudentSubmission } from '../types';
import { getQuizByCode, saveSubmission } from '../services/storageService';
import { CheckCircle, XCircle, Clock, AlertCircle, List, ArrowRight, ArrowLeft } from 'lucide-react';

interface StudentPortalProps {
  onLogout: () => void;
}

const StudentPortal: React.FC<StudentPortalProps> = ({ onLogout }) => {
  const [step, setStep] = useState<'login' | 'exam' | 'result'>('login');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  
  const [answers, setAnswers] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submission, setSubmission] = useState<StudentSubmission | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const foundQuiz = getQuizByCode(code.trim().toUpperCase());
    if (foundQuiz) {
      setQuiz(foundQuiz);
      setAnswers(new Array(foundQuiz.questions.length).fill(-1));
      setStep('exam');
    } else {
      alert("Mã bài thi không hợp lệ hoặc giáo viên đã đóng đề.");
    }
  };

  const handleSelectAnswer = (qIdx: number, optIdx: number) => {
    const newAnswers = [...answers];
    newAnswers[qIdx] = optIdx;
    setAnswers(newAnswers);
  };

  const handleSubmit = () => {
    if (!quiz) return;
    const unanswered = answers.filter(a => a === -1).length;
    if (unanswered > 0) {
        if(!confirm(`Bạn còn ${unanswered} câu chưa làm. Bạn có chắc chắn muốn nộp bài?`)) return;
    }
    setIsSubmitting(true);
    let correctCount = 0;
    quiz.questions.forEach((q, idx) => {
        if (q.correctAnswer === answers[idx]) correctCount++;
    });
    const score = (correctCount / quiz.questions.length) * 10;
    const newSubmission: StudentSubmission = {
        id: Date.now().toString(),
        quizId: quiz.id,
        studentName: name,
        score: score,
        totalQuestions: quiz.questions.length,
        submittedAt: Date.now(),
        answers: answers
    };
    saveSubmission(newSubmission);
    setSubmission(newSubmission);
    setStep('result');
    setIsSubmitting(false);
    window.scrollTo(0, 0);
  };

  if (step === 'login') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-indigo-600 px-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden p-8">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-black text-indigo-900">Vào Phòng Thi</h1>
                <p className="text-gray-500 mt-2">Hệ thống bài tập Tiếng Anh Smart 5512</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Họ tên thí sinh</label>
                    <input required type="text" value={name} onChange={e => setName(e.target.value)}
                        className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-xl py-3 px-4 outline-none transition-all font-medium"
                        placeholder="Nhập tên của bạn..."/>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Mã đề thi</label>
                    <input required type="text" value={code} onChange={e => setCode(e.target.value)}
                        className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-xl py-3 px-4 outline-none transition-all font-mono text-xl uppercase tracking-widest"
                        placeholder="ABCXYZ"/>
                </div>
                <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black text-lg shadow-lg hover:bg-indigo-700 active:scale-95 transition-all">
                    Bắt đầu làm bài
                </button>
            </form>
            <button onClick={onLogout} className="w-full mt-6 text-sm text-gray-400 hover:text-indigo-600 transition-colors">Quay lại</button>
        </div>
      </div>
    );
  }

  if (step === 'exam' && quiz) {
    const progress = (answers.filter(a => a !== -1).length / quiz.questions.length) * 100;
    
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-white border-b sticky top-0 z-20 px-4 py-3 shadow-sm">
                <div className="max-w-5xl mx-auto flex justify-between items-center">
                    <div>
                        <h2 className="font-black text-indigo-900 truncate max-w-[200px] sm:max-w-md">{quiz.title}</h2>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-bold">{name}</span>
                            <span className="text-[10px] text-gray-400 uppercase font-medium">{quiz.questions.length} câu • 45 phút</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex flex-col items-end">
                            <span className="text-[10px] text-gray-400 font-bold uppercase">Tiến độ: {Math.round(progress)}%</span>
                            <div className="w-32 h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                                <div className="h-full bg-green-500 transition-all duration-500" style={{width: `${progress}%`}}></div>
                            </div>
                        </div>
                        <button onClick={handleSubmit} className="bg-indigo-600 text-white px-6 py-2 rounded-full text-sm font-black hover:bg-indigo-700 shadow-md active:scale-95 transition-all">Nộp Bài</button>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl w-full mx-auto p-4 space-y-12 pb-24">
                {/* Organize by sections for clarity in 50-question tests */}
                {Array.from(new Set(quiz.questions.map(q => q.section))).map((sectionName) => (
                    <section key={sectionName} className="space-y-6">
                        <div className="sticky top-16 bg-gray-50 py-2 z-10 border-b border-gray-200">
                             <h3 className="text-xl font-black text-gray-400 italic">PART: {sectionName}</h3>
                        </div>
                        {quiz.questions.filter(q => q.section === sectionName).map((q) => {
                            const originalIdx = quiz.questions.findIndex(oq => oq.id === q.id);
                            return (
                                <div key={q.id} id={`q-${originalIdx}`} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <span className="text-sm font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">Câu {originalIdx + 1}</span>
                                        <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">{q.difficulty}</span>
                                    </div>
                                    <h3 className="text-lg text-gray-800 mb-8 font-semibold leading-relaxed whitespace-pre-line">{q.text}</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {q.options.map((opt, optIdx) => (
                                            <button key={optIdx} onClick={() => handleSelectAnswer(originalIdx, optIdx)}
                                                className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center group ${
                                                    answers[originalIdx] === optIdx 
                                                    ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold shadow-inner' 
                                                    : 'border-gray-100 hover:border-indigo-200 hover:bg-white'
                                                }`}>
                                                <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm mr-4 transition-colors ${
                                                     answers[originalIdx] === optIdx ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-indigo-100'
                                                }`}>
                                                    {String.fromCharCode(65 + optIdx)}
                                                </span>
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </section>
                ))}
            </main>
        </div>
    );
  }

  if (step === 'result' && submission && quiz) {
    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="bg-indigo-600 h-64 flex flex-col items-center justify-center text-white text-center px-4">
                <h1 className="text-4xl font-black mb-2">Chúc mừng, {name}!</h1>
                <p className="opacity-80">Bạn đã hoàn thành bài thi: {quiz.title}</p>
            </div>

            <div className="max-w-4xl mx-auto -mt-20 px-4 space-y-8">
                <div className="bg-white rounded-3xl shadow-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex flex-col items-center border-b md:border-b-0 md:border-r border-gray-100 pb-8 md:pb-0 md:pr-12">
                        <span className="text-xs font-black text-gray-400 uppercase mb-2">Điểm của bạn</span>
                        <div className="relative">
                            <div className={`text-6xl font-black ${submission.score >= 8 ? 'text-green-500' : submission.score < 5 ? 'text-red-500' : 'text-indigo-600'}`}>
                                {submission.score.toFixed(1)}
                            </div>
                            <span className="absolute -right-6 -bottom-0 text-gray-300 font-bold">/10</span>
                        </div>
                    </div>
                    <div className="flex-1 grid grid-cols-2 gap-4 w-full">
                        <div className="bg-gray-50 p-4 rounded-2xl">
                            <span className="block text-[10px] text-gray-400 font-bold uppercase">Số câu đúng</span>
                            <span className="text-2xl font-black text-gray-800">
                                {quiz.questions.filter((q, i) => q.correctAnswer === submission.answers[i]).length} <span className="text-sm font-normal text-gray-400">/ {quiz.questions.length}</span>
                            </span>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-2xl">
                            <span className="block text-[10px] text-gray-400 font-bold uppercase">Xếp loại</span>
                            <span className="text-2xl font-black text-gray-800">
                                {submission.score >= 9 ? 'Xuất sắc' : submission.score >= 8 ? 'Giỏi' : submission.score >= 6.5 ? 'Khá' : submission.score >= 5 ? 'Trung bình' : 'Cần cố gắng'}
                            </span>
                        </div>
                    </div>
                    <button onClick={onLogout} className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-black hover:bg-black transition-colors shadow-lg active:scale-95">Quay lại trang chủ</button>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border overflow-hidden">
                    <div className="p-6 bg-gray-50 border-b flex items-center justify-between">
                        <h3 className="font-black text-gray-700">Xem lại bài làm</h3>
                        <span className="text-xs text-gray-400 italic">Hệ thống AI tự động chấm & giải thích</span>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {quiz.questions.map((q, idx) => {
                            const userAnswer = submission.answers[idx];
                            const isCorrect = userAnswer === q.correctAnswer;
                            return (
                                <div key={q.id} className="p-8">
                                    <div className="flex flex-col md:flex-row gap-6">
                                        <div className="w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center font-black text-lg border-2 border-gray-50">
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-4">
                                                <p className="text-lg font-bold text-gray-800 leading-relaxed whitespace-pre-line">{q.text}</p>
                                                {isCorrect ? <CheckCircle className="text-green-500 w-6 h-6 ml-4"/> : <XCircle className="text-red-500 w-6 h-6 ml-4"/>}
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                                                {q.options.map((opt, i) => (
                                                    <div key={i} className={`p-4 rounded-xl text-sm border flex items-center gap-3 ${
                                                        i === q.correctAnswer ? 'bg-green-50 border-green-200 text-green-800 font-bold' :
                                                        (i === userAnswer && !isCorrect) ? 'bg-red-50 border-red-200 text-red-800' : 'bg-gray-50 border-transparent text-gray-500 opacity-60'
                                                    }`}>
                                                        <span className="w-6 text-center font-black">{String.fromCharCode(65 + i)}</span>
                                                        {opt}
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-2xl">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <AlertCircle className="w-4 h-4 text-indigo-600"/>
                                                    <span className="text-xs font-black text-indigo-600 uppercase">Giải thích từ AI</span>
                                                </div>
                                                <p className="text-sm text-indigo-900 leading-relaxed">{q.explanation}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
  }

  return null;
};

export default StudentPortal;
