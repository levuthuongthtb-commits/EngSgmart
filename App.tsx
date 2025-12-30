import React, { useState } from 'react';
import TeacherDashboard from './components/TeacherDashboard';
import StudentPortal from './components/StudentPortal';
import { AppState } from './types';
import { BookOpen, User, GraduationCap } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    view: 'landing',
    userRole: null
  });

  // Mock login for teacher
  const [teacherPass, setTeacherPass] = useState('');

  const handleTeacherLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (teacherPass === '123456') {
      setState({ view: 'teacher-dashboard', userRole: 'teacher' });
    } else {
      alert("Mật khẩu không đúng (Mật khẩu mặc định: 123456)");
    }
  };

  const reset = () => {
    setState({ view: 'landing', userRole: null });
    setTeacherPass('');
  };

  const renderLanding = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        {/* Left Side: Branding */}
        <div className="bg-indigo-600 p-12 flex flex-col justify-center items-center text-white md:w-1/2">
            <div className="bg-white/20 p-4 rounded-full mb-6">
                <BookOpen size={48} />
            </div>
            <h1 className="text-4xl font-bold mb-2 text-center">EngSmart</h1>
            <p className="text-indigo-200 text-center mb-8">Nền tảng kiểm tra đánh giá theo định hướng CV 5512</p>
            <div className="space-y-4 w-full">
                <div className="flex items-center text-sm bg-indigo-700/50 p-3 rounded-lg">
                    <span className="mr-3 text-2xl">🤖</span>
                    <span>Tự động tạo đề bằng AI</span>
                </div>
                <div className="flex items-center text-sm bg-indigo-700/50 p-3 rounded-lg">
                    <span className="mr-3 text-2xl">📊</span>
                    <span>Thống kê & Phân tích điểm</span>
                </div>
            </div>
        </div>

        {/* Right Side: Selection */}
        <div className="p-12 md:w-1/2 flex flex-col justify-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">Bạn là ai?</h2>
            
            <button 
                onClick={() => setState({ ...state, view: 'teacher-login' })}
                className="group relative w-full mb-4 bg-white border-2 border-indigo-100 hover:border-indigo-500 p-4 rounded-xl transition-all flex items-center hover:shadow-md"
            >
                <div className="bg-indigo-100 p-3 rounded-full text-indigo-600 mr-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <User size={24} />
                </div>
                <div className="text-left">
                    <span className="block font-bold text-gray-800">Giáo Viên</span>
                    <span className="text-xs text-gray-500">Tạo đề, giao bài, xem báo cáo</span>
                </div>
            </button>

            <button 
                onClick={() => setState({ ...state, view: 'student-login', userRole: 'student' })}
                className="group relative w-full bg-white border-2 border-green-100 hover:border-green-500 p-4 rounded-xl transition-all flex items-center hover:shadow-md"
            >
                <div className="bg-green-100 p-3 rounded-full text-green-600 mr-4 group-hover:bg-green-600 group-hover:text-white transition-colors">
                    <GraduationCap size={24} />
                </div>
                <div className="text-left">
                    <span className="block font-bold text-gray-800">Học Sinh</span>
                    <span className="text-xs text-gray-500">Làm bài kiểm tra & xem điểm</span>
                </div>
            </button>
        </div>
      </div>
    </div>
  );

  const renderTeacherLogin = () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Đăng Nhập Giáo Viên</h2>
            <form onSubmit={handleTeacherLogin}>
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu</label>
                    <input 
                        type="password" 
                        value={teacherPass}
                        onChange={(e) => setTeacherPass(e.target.value)}
                        className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="Nhập 123456"
                        autoFocus
                    />
                </div>
                <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-md font-medium hover:bg-indigo-700 transition-colors">
                    Đăng Nhập
                </button>
                <button type="button" onClick={reset} className="w-full mt-3 text-sm text-gray-500 hover:text-gray-700">
                    Quay lại
                </button>
            </form>
        </div>
    </div>
  );

  return (
    <>
      {state.view === 'landing' && renderLanding()}
      {state.view === 'teacher-login' && renderTeacherLogin()}
      {state.view === 'teacher-dashboard' && <TeacherDashboard onLogout={reset} />}
      {(state.view === 'student-login' || state.view === 'student-exam') && <StudentPortal onLogout={reset} />}
    </>
  );
};

export default App;
