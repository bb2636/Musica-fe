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

    useEffect(() => {
        axiosInstance
            .get('/levels')
            .then(res => {
                console.log('레벨 불러오기 성공:', res.data);
                setLevels(res.data);
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
            setIsDuplicate(null); // 이메일 변경 시 중복확인 초기화
        }
    };

    const checkEmail = async () => {
        try {
            const res = await fetch(`/api/users/check-email?email=${encodeURIComponent(form.email)}`);
            if (!res.ok) throw new Error('이메일 확인 실패');
            const isExist = await res.json();
            setIsDuplicate(isExist);
        } catch (err) {
            console.error(err);
            alert('이메일 중복 확인 중 오류가 발생했습니다');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.agree) return alert('약관에 동의해주세요');
        if (isDuplicate) return alert('이미 사용 중인 이메일입니다');

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
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
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
                            className="px-3 py-2 text-sm bg-blue-500 text-white rounded whitespace-nowrap"
                        >
                            중복 확인
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
