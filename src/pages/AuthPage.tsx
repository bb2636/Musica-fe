import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import LoginForm from './Login';
import SignupForm from './Signup';

const AuthPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    // 초기값을 쿼리에서 바로 파싱
    const [mode, setMode] = useState<'login' | 'signup'>(() => {
        const params = new URLSearchParams(window.location.search);
        const urlMode = params.get('mode');
        return urlMode === 'login' ? 'login' : 'signup';
    });

    // URL 쿼리 → 상태 반영
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const urlMode = params.get('mode');
        if (urlMode === 'login' || urlMode === 'signup') {
            setMode(urlMode);
        }
    }, [location.search]);

    // 상태 → URL 쿼리 반영 (탭 클릭 시)
    const handleTab = (nextMode: 'login' | 'signup') => {
        setMode(nextMode);
        const params = new URLSearchParams(location.search);
        params.set('mode', nextMode);
        navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
    };

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
                        onClick={() => handleTab('login')}
                        className={`flex-1 py-2 text-sm font-semibold transition ${
                            mode === 'login'
                                ? 'bg-black text-white'
                                : 'bg-white text-gray-600'
                        }`}
                    >
                        로그인
                    </button>
                    <button
                        onClick={() => handleTab('signup')}
                        className={`flex-1 py-2 text-sm font-semibold transition ${
                            mode === 'signup'
                                ? 'bg-black text-white'
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
