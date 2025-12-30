
import React, { useState, useEffect } from 'react';
import { Quiz, Question, Difficulty } from '../types';
import { generateQuestions } from '../services/geminiService';
import { saveQuiz, getQuizzes, deleteQuiz, getSubmissionsByQuizId } from '../services/storageService';
import { Plus, Trash2, Save, BarChart2, Loader2, Copy, CheckCircle, Play, Pause, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TeacherDashboardProps {
  onLogout: () => void;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'list' | 'create' | 'stats'>('list');
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  
  const [topic, setTopic] = useState('');
  const [grade, setGrade] = useState('9');
  const [qCount, setQCount] = useState(50);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  const [quizTitle, setQuizTitle] = useState('');

  const [selectedQuizStats, setSelectedQuizStats] = useState<Quiz | null>(null);

  useEffect(() => {
    refreshQuizzes();
  }, []);

  const refreshQuizzes = () => {
    setQuizzes(getQuizzes().sort((a, b) => b.createdAt - a.createdAt));
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const questions = await generateQuestions(topic, grade, qCount);
      setGeneratedQuestions(questions);
      setQuizTitle(`Đề thi học kỳ English ${grade}: ${topic}`);
    } catch (e) {
      console.error(e);
      alert("Lỗi tạo câu hỏi. Việc tạo 50 câu yêu cầu thời gian xử lý AI lâu hơn, vui lòng thử lại nếu quá thời gian.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveQuiz = () => {
    if (!quizTitle || generatedQuestions.length === 0) return;
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const newQuiz: Quiz = {
      id: Date.now().toString(),
      title: quizTitle,
      grade,
      topic,
      createdAt: Date.now(),
      questions: generatedQuestions,
      accessCode: code,
      isActive: true
    };
    saveQuiz(newQuiz);
    refreshQuizzes();
    setActiveTab('list');
    setGeneratedQuestions([]);
    setTopic('');
    setQuizTitle('');
  };

  // Fix: Added missing handleDelete function to allow deleting quizzes
  const handleDelete = (quizId: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa đề thi này?")) {
      deleteQuiz(quizId);
      refreshQuizzes();
    }
  };

  // Fix: Added missing toggleStatus function to enable/disable quiz access
  const toggleStatus = (quiz: Quiz) => {
    const updatedQuiz = { ...quiz, isActive: !quiz.isActive };
    saveQuiz(updatedQuiz);
    refreshQuizzes();
  };

  const renderCreateTab = () => (
    <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="bg-indigo-100 text-indigo-600 p-2 rounded-lg mr-2">🤖</span>
                Thiết kế Đề thi 5512 (50 câu)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Trọng tâm kiến thức</label>
                    <input 
                        type="text" 
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="VD: Units 1-6, Grammar Review..."
                        className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Khối Lớp</label>
                    <select value={grade} onChange={(e) => setGrade(e.target.value)} className="w-full border rounded-md p-2 outline-none">
                        <option value="6">Lớp 6</option><option value="7">Lớp 7</option>
                        <option value="8">Lớp 8</option><option value="9">Lớp 9</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng câu</label>
                    <select value={qCount} onChange={(e) => setQCount(Number(e.target.value))} className="w-full border rounded-md p-2 outline-none">
                        <option value="10">10 câu (Mini-test)</option>
                        <option value="25">25 câu (15-45 phút)</option>
                        <option value="50">50 câu (Chuẩn 5512 - Học kỳ)</option>
                    </select>
                </div>
            </div>
            
            <button 
                onClick={handleGenerate}
                disabled={isGenerating || !topic}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-md transition-all flex items-center justify-center disabled:opacity-50"
            >
                {isGenerating ? (
                    <><Loader2 className="animate-spin mr-2 h-5 w-5" /> AI đang soạn 50 câu hỏi & đọc hiểu (khoảng 20-30s)...</>
                ) : (
                    "Bắt đầu soạn đề AI"
                )}
            </button>
        </div>

        {generatedQuestions.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 animate-fade-in">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b pb-4">
                    <div className="flex-1">
                        <input 
                            type="text" 
                            value={quizTitle}
                            onChange={(e) => setQuizTitle(e.target.value)}
                            className="text-xl font-bold border-none outline-none w-full text-indigo-900"
                            placeholder="Tên đề thi..."
                        />
                        <div className="flex gap-2 mt-1">
                            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-medium">NB: 40%</span>
                            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-medium">TH: 30%</span>
                            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-medium">VD: 20%</span>
                            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-medium">VDC: 10%</span>
                        </div>
                    </div>
                    <button onClick={handleSaveQuiz} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md flex items-center shadow-lg font-bold whitespace-nowrap">
                        <Save className="w-4 h-4 mr-2" /> Lưu & Giao Mã
                    </button>
                </div>

                <div className="space-y-8">
                    {/* Render by sections */}
                    {Array.from(new Set(generatedQuestions.map(q => q.section))).map((sectionName) => (
                        <div key={sectionName} className="space-y-4">
                            <h3 className="text-lg font-bold text-indigo-600 flex items-center bg-indigo-50 p-2 rounded">
                                <FileText className="w-4 h-4 mr-2"/>
                                Part: {sectionName}
                            </h3>
                            {generatedQuestions.filter(q => q.section === sectionName).map((q, idx) => (
                                <div key={q.id} className="border-l-4 border-indigo-200 pl-4 py-2 hover:border-indigo-500 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="font-semibold text-gray-800">{q.text}</p>
                                        <span className="text-[10px] uppercase font-bold px-2 py-1 bg-gray-50 rounded border">{q.difficulty}</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                                        {q.options.map((opt, i) => (
                                            <div key={i} className={`text-sm p-1 ${i === q.correctAnswer ? 'text-green-700 font-bold' : 'text-gray-600'}`}>
                                                {String.fromCharCode(65 + i)}. {opt}
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-[11px] text-gray-400 italic">Giải thích: {q.explanation}</p>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        )}
    </div>
  );

  const renderStatsTab = () => {
    if (!selectedQuizStats) return null;
    const submissions = getSubmissionsByQuizId(selectedQuizStats.id);
    const avgScore = submissions.length > 0 
        ? (submissions.reduce((acc, s) => acc + s.score, 0) / submissions.length).toFixed(1)
        : 0;
    const rangeData = [
        { name: '0-4', count: submissions.filter(s => s.score < 5).length },
        { name: '5-6.5', count: submissions.filter(s => s.score >= 5 && s.score < 7).length },
        { name: '7-8.5', count: submissions.filter(s => s.score >= 7 && s.score < 9).length },
        { name: '9-10', count: submissions.filter(s => s.score >= 9).length },
    ];

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <button onClick={() => setSelectedQuizStats(null)} className="mb-4 text-blue-600 hover:underline">← Quay lại danh sách</button>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold">{selectedQuizStats.title}</h2>
                    <p className="text-gray-500">Mã: {selectedQuizStats.accessCode} • {selectedQuizStats.questions.length} câu hỏi</p>
                </div>
                <div className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-center mt-4 md:mt-0">
                    <p className="text-xs opacity-80">Điểm trung bình</p>
                    <p className="text-2xl font-bold">{avgScore}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="h-64 border rounded-xl p-4">
                    <h3 className="text-sm font-semibold mb-2 text-gray-400 uppercase">Phân phối điểm</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={rangeData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="overflow-auto max-h-64 border rounded-xl p-4">
                     <h3 className="text-sm font-semibold mb-2 text-gray-400 uppercase">Bảng điểm (N = {submissions.length})</h3>
                     <table className="w-full text-sm">
                        <thead className="sticky top-0 bg-white">
                            <tr className="text-left text-gray-400">
                                <th className="pb-2">Tên</th>
                                <th className="pb-2">Điểm</th>
                            </tr>
                        </thead>
                        <tbody>
                            {submissions.sort((a,b) => b.score - a.score).map(s => (
                                <tr key={s.id} className="border-t">
                                    <td className="py-2">{s.studentName}</td>
                                    <td className={`py-2 font-bold ${s.score >= 8 ? 'text-green-600' : s.score < 5 ? 'text-red-600' : 'text-blue-600'}`}>{s.score.toFixed(1)}</td>
                                </tr>
                            ))}
                        </tbody>
                     </table>
                </div>
            </div>
        </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
        <header className="bg-white border-b shadow-sm sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
                <span className="text-xl font-black text-indigo-600 flex items-center gap-2">
                    <FileText className="w-6 h-6"/>
                    EngSmart <span className="text-gray-300 font-light text-sm hidden sm:inline">| Dashboard 5512</span>
                </span>
                <button onClick={onLogout} className="text-gray-400 hover:text-red-500 font-medium text-sm transition-colors">Đăng xuất</button>
            </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 pt-8">
            {activeTab !== 'stats' && (
                <div className="flex gap-2 mb-8 border-b pb-4 overflow-x-auto">
                    <button onClick={() => setActiveTab('list')} className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'list' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-100 border'}`}>Kho đề của tôi</button>
                    <button onClick={() => setActiveTab('create')} className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'create' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-100 border'}`}>+ Soạn đề 50 câu</button>
                </div>
            )}

            {activeTab === 'list' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {quizzes.length === 0 && (
                        <div className="col-span-full py-20 text-center bg-white border-2 border-dashed rounded-2xl">
                            <p className="text-gray-400">Bạn chưa có đề thi nào.</p>
                            <button onClick={() => setActiveTab('create')} className="mt-4 text-indigo-600 font-bold">Bắt đầu tạo ngay</button>
                        </div>
                    )}
                    {quizzes.map(quiz => (
                        <div key={quiz.id} className="bg-white rounded-2xl p-6 border shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between mb-4">
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${quiz.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                    {quiz.isActive ? 'Đang hoạt động' : 'Đã đóng'}
                                </span>
                                <span className="text-xs text-gray-400">{new Date(quiz.createdAt).toLocaleDateString('vi-VN')}</span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 line-clamp-2 mb-2 h-14">{quiz.title}</h3>
                            <div className="flex items-center text-xs text-gray-500 gap-3 mb-6">
                                <span>Lớp {quiz.grade}</span>
                                <span>•</span>
                                <span>{quiz.questions.length} câu hỏi</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl mb-6">
                                <span className="text-xl font-mono font-black text-indigo-600">{quiz.accessCode}</span>
                                <button onClick={() => navigator.clipboard.writeText(quiz.accessCode)} className="p-2 hover:bg-white rounded-lg transition-colors"><Copy className="w-4 h-4 text-gray-400"/></button>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => { setSelectedQuizStats(quiz); setActiveTab('stats'); }} className="flex-1 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-bold flex items-center justify-center hover:bg-indigo-100 transition-colors">
                                    <BarChart2 className="w-4 h-4 mr-2"/> Thống kê
                                </button>
                                <button onClick={() => toggleStatus(quiz)} className={`p-2 rounded-lg border ${quiz.isActive ? 'text-orange-500' : 'text-green-500'} hover:bg-gray-50`}>
                                    {quiz.isActive ? <Pause className="w-5 h-5"/> : <Play className="w-5 h-5"/>}
                                </button>
                                <button onClick={() => handleDelete(quiz.id)} className="p-2 rounded-lg border text-red-400 hover:bg-red-50 hover:text-red-600">
                                    <Trash2 className="w-5 h-5"/>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'create' && renderCreateTab()}
            {activeTab === 'stats' && renderStatsTab()}
        </main>
    </div>
  );
};

export default TeacherDashboard;
