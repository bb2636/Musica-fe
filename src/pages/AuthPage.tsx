import { useState } from 'react';
import LoginForm from './Login';
import SignupForm from './Signup';

const AuthPage = () => {
    const [mode, setMode] = useState<'login' | 'signup'>('signup');

    return (
        <div className="flex justify-center items-start py-10">
            <div className="w-full max-w-md">
                {/* 안내 문구 */}
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold">환영합니다</h2>
                    <p className="text-sm text-gray-600">계정에 로그인하거나 새로운 계정을 만드세요</p>
                </div>

                {/* 탭 버튼 */}
                <div className="flex mb-4 border rounded-md overflow-hidden">
                    <button
                        onClick={() => setMode('login')}
                        className={`flex-1 py-2 text-sm font-semibold transition ${
                            mode === 'login'
                                ? 'bg-blue-500 text-white'
                                : 'bg-white text-gray-600'
                        }`}
                    >
                        로그인
                    </button>
                    <button
                        onClick={() => setMode('signup')}
                        className={`flex-1 py-2 text-sm font-semibold transition ${
                            mode === 'signup'
                                ? 'bg-blue-500 text-white'
                                : 'bg-white text-gray-600'
                        }`}
                    >
                        회원가입
                    </button>
                </div>

                {/* 여기! 회색 배경 없이 폼만 삽입 */}
                {mode === 'login' ? <LoginForm /> : <SignupForm />}
            </div>
        </div>
    );
};

export default AuthPage;
