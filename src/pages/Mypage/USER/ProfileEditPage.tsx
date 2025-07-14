import { useEffect, useState } from 'react';
import { fetchMyProfile, updateMyProfile, fetchLevels } from '../../../apis/user.ts';
import { useNavigate } from 'react-router-dom';

interface Level {
    id: number;
    name: string;
}

export default function ProfileEditPage() {
    const navigate = useNavigate();

    const [form, setForm] = useState<{ name: string; email: string; levelId: number | null }>({
        name: '',
        email: '',
        levelId: null
    });

    const [levels, setLevels] = useState<Level[]>([]);
    const [userId, setUserId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const profileRes = await fetchMyProfile();
                const user = profileRes.data;
                setForm({
                    name: user.name,
                    email: user.email,
                    levelId: user.level?.id ?? null
                });
                setUserId(user.id);
            } catch {
                alert("회원 정보를 불러오는데 실패했습니다.");
            } finally {
                setLoading(false);
            }

            try {
                const levelsRes = await fetchLevels();
                setLevels(levelsRes.data);
            } catch {
                alert("레벨 목록을 불러오는데 실패했습니다.");
            }
        })();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: name === "levelId" ? (value ? Number(value) : null) : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId) {
            alert("사용자 정보를 찾을 수 없습니다.");
            return;
        }

        try {
            await updateMyProfile(userId, form);
            alert('수정되었습니다!');
            navigate('/users/mypage');
        } catch {
            alert("수정에 실패했습니다. 다시 시도해주세요.");
        }
    };

    if (loading) {
        return <div className="p-8 text-center">로딩중...</div>;
    }

    return (
        <div className="max-w-xl mx-auto p-8">
            <h2 className="text-xl font-bold mb-6">회원 정보 수정</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block mb-1 text-sm font-medium">이름</label>
                    <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                        required
                    />
                </div>
                <div>
                    <label className="block mb-1 text-sm font-medium">이메일</label>
                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                        required
                    />
                </div>
                <div>
                    <label className="block mb-1 text-sm font-medium">레벨</label>
                    <select
                        name="levelId"
                        value={form.levelId ?? ''}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                    >
                        <option value="">선택</option>
                        {levels.map((lv) => (
                            <option key={lv.id} value={lv.id}>{lv.name}</option>
                        ))}
                    </select>
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded"
                >
                    수정하기
                </button>
            </form>
        </div>
    );
}
