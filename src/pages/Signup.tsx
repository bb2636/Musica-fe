import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../apis/axiosInstance';
import type { Level } from '../types/level';
import type { AxiosError } from 'axios';
import {
    inputStyle,
    labelStyle,
    checkboxStyle,
    buttonStyle,
    formContainer,
} from '../styles/formStyles';

const Signup = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        role: 'USER',
        levelId: '',
        agree: false,
    });

    const [levels, setLevels] = useState<Level[]>([]);
    const [isDuplicate, setIsDuplicate] = useState<boolean | null>(null);
    const [isEmailChecked, setIsEmailChecked] = useState(false); // 중복 확인 성공 여부
    const isValidEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };
    useEffect(() => {
        axiosInstance
            .get('/levels')
            .then(res => {
                const desiredOrder = ['Beginner', 'Intermediate', 'Advanced'];
                const sorted = res.data.sort(
                    (a: Level, b: Level) =>
                        desiredOrder.indexOf(a.name) - desiredOrder.indexOf(b.name)
                );
                console.log('레벨 불러오기 성공:', sorted);
                setLevels(sorted);
            })
            .catch((error) => {
                console.error('레벨 불러오기 실패:', error);
                alert('레벨 목록 불러오기 실패');
            });
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const target = e.target as HTMLInputElement | HTMLSelectElement;
        const { name, value, type } = target;
        const checked = (target as HTMLInputElement).checked;

        setForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));

        if (name === 'email') {
            setIsDuplicate(null);
            setIsEmailChecked(false); // 다시 확인해야 함
        }
    };

    const checkEmail = async () => {
        if (!form.email.trim()) {
            return alert('이메일을 입력해주세요');
        }

        if (!isValidEmail(form.email)) {
            return alert('유효한 이메일 형식을 입력해주세요');
        }

        try {
            const res = await axiosInstance.get('/users/check-email', {
                params: { email: form.email },
            });
            const isExist = res.data;
            setIsDuplicate(isExist);
            setIsEmailChecked(!isExist); // 중복이 아니면 true, 중복이면 false
        } catch (err) {
            const error = err as AxiosError<{ message?: string }>;
            const msg = error.response?.data?.message || '이메일 중복 확인 중 오류가 발생했습니다';
            alert(msg);
            setIsDuplicate(null);
            setIsEmailChecked(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.agree) return alert('약관에 동의해주세요');
        if (isDuplicate) return alert('이미 사용 중인 이메일입니다');
        if (!isEmailChecked) {
            return alert('이메일 중복 확인을 완료해주세요');
        }

        try {
            const { name, email, password, role, levelId } = form;
            await axiosInstance.post('/users/register', {
                name,
                email,
                password,
                role,
                levelId: role === 'USER' ? levelId : null,
            });
            alert('회원가입 성공');
            navigate('/auth/login');
        } catch (err) {
            const error = err as AxiosError<{ message: string }>;
            const msg = error.response?.data?.message || '회원가입 실패';
            alert(msg);
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit} className={formContainer}>
                <h2 className="text-2xl font-bold mb-6 text-center">회원가입</h2>

                <div className="mb-4">
                    <label className={labelStyle}>이름</label>
                    <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="이름"
                        className={inputStyle}
                    />
                </div>

                <div className="mb-4">
                    <label className={labelStyle}>이메일</label>
                    <div className="flex gap-2">
                        <input
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="이메일"
                            className={`${inputStyle} flex-1`} // 입력창이 버튼과 높이 맞도록
                        />
                        <button
                            type="button"
                            onClick={checkEmail}
                            disabled={isEmailChecked} // 중복 확인 완료 시 비활성화
                            className={`px-3 py-2 text-sm rounded whitespace-nowrap ${
                                isEmailChecked ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 text-white'
                            }`}
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
                    <input
                        name="password"
                        type="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="비밀번호"
                        className={inputStyle}
                    />
                </div>

                <div className="mb-4">
                    <span className={labelStyle}>역할 선택</span>
                    <div className="flex gap-4">
                        <label>
                            <input
                                type="radio"
                                name="role"
                                value="USER"
                                checked={form.role === 'USER'}
                                onChange={handleChange}
                                className="mr-1"
                            />
                            수강생
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="role"
                                value="INSTRUCTOR"
                                checked={form.role === 'INSTRUCTOR'}
                                onChange={handleChange}
                                className="mr-1"
                            />
                            강사
                        </label>
                    </div>
                </div>

                {form.role === 'USER' && (
                    <div className="mb-4">
                        <label className={labelStyle}>레벨 선택</label>
                        <select
                            name="levelId"
                            value={form.levelId}
                            onChange={handleChange}
                            className={inputStyle}
                        >
                            <option value="">레벨을 선택하세요</option>
                            {levels.map((level: Level) => (
                                <option key={level.id} value={level.id}>
                                    {level.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="mb-6 flex items-center">
                    <input
                        type="checkbox"
                        id="agree"
                        name="agree"
                        checked={form.agree}
                        onChange={handleChange}
                        className={checkboxStyle}
                    />
                    <label htmlFor="agree" className="text-sm text-gray-600">
                        이용약관에 동의합니다
                    </label>
                </div>

                <button type="submit" className={buttonStyle}>
                    회원가입
                </button>
            </form>
        </div>
    );
};

export default Signup;
