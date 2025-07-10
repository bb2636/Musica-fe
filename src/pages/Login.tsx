import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../apis/axiosInstance';
import type { AxiosError } from 'axios';
import {
    inputStyle,
    labelStyle,
    buttonStyle,
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
            const res = await axiosInstance.post('/auth/login', form);
            const token = res.data?.token;
            if (token) {
                localStorage.setItem('accessToken', token);
                alert('로그인 성공');
                navigate('/home'); // 홈 또는 대시보드로 이동
            } else {
                alert('로그인 실패: 토큰이 없습니다');
            }
        } catch (err) {
            const error = err as AxiosError<{ message: string }>;
            const msg = error.response?.data?.message || '로그인 실패';
            alert(msg);
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

                <button type="submit" className={buttonStyle}>
                    로그인
                </button>
            </form>
        </div>
    );
};

export default Login;
