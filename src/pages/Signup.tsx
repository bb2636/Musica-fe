import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../apis/user';
import type { AxiosError } from 'axios';
import useSortedLevels from '../hooks/useSortedLevels';
import {
    inputStyle,
    labelStyle,
    checkboxStyle,
    formContainer,
} from '../styles/formStyles';
import axiosInstance from "../apis/axiosInstance.ts";

const Signup = () => {
    const navigate = useNavigate();
    const { levels } = useSortedLevels();

    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        role: 'USER',
        levelId: '',
        agree: false,
    });

    const [isDuplicate, setIsDuplicate] = useState<boolean | null>(null);
    const [isEmailChecked, setIsEmailChecked] = useState(false);

    const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));

        if (name === 'email') {
            setIsDuplicate(null);
            setIsEmailChecked(false);
        }
    };

    const checkEmail = async () => {
        if (!form.email.trim()) return alert('이메일을 입력해주세요');
        if (!isValidEmail(form.email)) return alert('유효한 이메일 형식을 입력해주세요');

        try {
            const res = await axiosInstance.get('/users/check-email', {
                params: { email: form.email },
            });
            const isExist = res.data;
            setIsDuplicate(isExist);
            setIsEmailChecked(!isExist);
        } catch (err) {
            const error = err as AxiosError<{ message?: string }>;
            alert(error.response?.data?.message || '이메일 중복 확인 중 오류 발생');
            setIsDuplicate(null);
            setIsEmailChecked(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.agree) return alert('약관에 동의해주세요');
        if (isDuplicate) return alert('이미 사용 중인 이메일입니다');
        if (!isEmailChecked) return alert('이메일 중복 확인을 완료해주세요');

        try {
            const { name, email, password, role, levelId } = form;
            await registerUser({
                name,
                email,
                password,
                role: role as "USER" | "INSTRUCTOR",
                levelId: role === 'USER' ? Number(levelId) : null,
            });
            alert('회원가입 성공');
            navigate('/auth');
        } catch (err) {
            const error = err as AxiosError<{ message: string }>;
            alert(error.response?.data?.message || '회원가입 실패');
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit} className={formContainer}>
                <h2 className="text-2xl font-bold mb-6 text-center">회원가입</h2>

                <div className="mb-4">
                    <label className={labelStyle}>이름</label>
                    <input name="name" value={form.name} onChange={handleChange} className={inputStyle} />
                </div>

                <div className="mb-4">
                    <label className={labelStyle}>이메일</label>
                    <div className="flex gap-2">
                        <input name="email" value={form.email} onChange={handleChange} className={`${inputStyle} flex-1`} />
                        <button
                            type="button"
                            onClick={checkEmail}
                            disabled={isEmailChecked}
                            className={`px-3 py-2 text-sm rounded ${isEmailChecked ? 'bg-gray-400' : 'bg-black text-white'}`}
                        >
                            {isEmailChecked ? '확인 완료' : '중복 확인'}
                        </button>
                    </div>
                    {isDuplicate !== null && (
                        <p className={`mt-2 text-sm ${isDuplicate ? 'text-red-500' : 'text-green-500'}`}>
                            {isDuplicate ? '이미 사용 중인 이메일입니다.' : '사용 가능한 이메일입니다.'}
                        </p>
                    )}
                </div>

                <div className="mb-4">
                    <label className={labelStyle}>비밀번호</label>
                    <input name="password" type="password" value={form.password} onChange={handleChange} className={inputStyle} />
                </div>

                <div className="mb-4">
                    <span className={labelStyle}>역할 선택</span>
                    <div className="flex gap-4">
                        <label>
                            <input type="radio" name="role" value="USER" checked={form.role === 'USER'} onChange={handleChange} /> 수강생
                        </label>
                        <label>
                            <input type="radio" name="role" value="INSTRUCTOR" checked={form.role === 'INSTRUCTOR'} onChange={handleChange} /> 강사
                        </label>
                    </div>
                </div>

                {form.role === 'USER' && (
                    <div className="mb-4">
                        <label className={labelStyle}>레벨 선택</label>
                        <select name="levelId" value={form.levelId} onChange={handleChange} className={inputStyle}>
                            <option value="">레벨을 선택하세요</option>
                            {levels.map(level => (
                                <option key={level.id} value={level.id}>{level.name}</option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="mb-6 flex items-center">
                    <input type="checkbox" id="agree" name="agree" checked={form.agree} onChange={handleChange} className={checkboxStyle} />
                    <label htmlFor="agree" className="text-sm text-gray-600">이용약관에 동의합니다</label>
                </div>

                <button type="submit" className="w-full bg-black text-white font-bold py-2 px-4 rounded hover:bg-gray-800 transition">
                    회원가입
                </button>

                <p className="text-center text-sm text-gray-600 mt-4">또는 소셜 미디어로 회원가입</p>
                <button
                    type="button"
                    onClick={() => window.location.href = "http://musica.o-r.kr:8080/oauth2/authorization/kakao"}
                    className="mt-2 w-full bg-yellow-400 text-black font-bold py-2 px-4 rounded-full hover:bg-yellow-300 transition"
                >
                    Kakao로 회원가입
                </button>
            </form>
        </div>
    );
};

export default Signup;
