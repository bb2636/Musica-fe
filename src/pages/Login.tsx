import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../apis/user';
import type { AxiosError } from 'axios';
import {
    inputStyle,
    labelStyle,
    formContainer,
} from '../styles/formStyles';

const Login = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: '',
        password: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await loginUser(form.email, form.password);
            const accessToken = res.data?.accessToken;
            const refreshToken = res.data?.refreshToken;

            if (accessToken && refreshToken) {
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);
                localStorage.setItem('userName', res.data?.name || '사용자');
                alert('로그인 성공');
                navigate('/main');
            } else {
                alert('로그인 실패: 토큰이 없습니다');
            }
        } catch (err) {
            const error = err as AxiosError<{ message: string; code?: string }>;
            const code = error.response?.data?.code;

            if (code === 'INSTRUCTOR_NOT_APPROVED') {
                alert('강사 계정은 관리자의 승인 후 로그인할 수 있습니다.');
                return;
            }

            alert(error.response?.data?.message || '로그인 실패');
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit} className={formContainer}>
                <h2 className="text-2xl font-bold mb-6 text-center">로그인</h2>

                <div className="mb-4">
                    <label className={labelStyle}>이메일</label>
                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="이메일"
                        className={inputStyle}
                    />
                </div>

                <div className="mb-6">
                    <label className={labelStyle}>비밀번호</label>
                    <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="비밀번호"
                        className={inputStyle}
                    />
                </div>

                <button type="submit" className="w-full bg-black text-white font-bold py-2 px-4 rounded hover:bg-gray-800 transition">
                    로그인
                </button>

                <p className="text-center text-sm text-gray-600 mt-4">또는</p>
                <button
                    type="button"
                    onClick={() => window.location.href = "http://localhost:8080/oauth2/authorization/kakao"}
                    className="mt-2 w-full bg-yellow-400 text-black font-bold py-2 px-4 rounded-full hover:bg-yellow-300 transition"
                >
                    Kakao로 로그인
                </button>
            </form>
        </div>
    );
};

export default Login;
