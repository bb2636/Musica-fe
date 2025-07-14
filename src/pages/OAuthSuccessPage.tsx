import { useSearchParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import useSortedLevels from '../hooks/useSortedLevels';
import useJwtPayload from "../hooks/useJwtPayload";
import type { JwtPayload } from "../hooks/useJwtPayload";

export const OAuthSuccessPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token") || localStorage.getItem("accessToken");

    const payload: JwtPayload | null = useJwtPayload(token);

    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [role, setRole] = useState("USER");
    const [levelId, setLevelId] = useState<number | null>(null);
    const { levels } = useSortedLevels();

    useEffect(() => {
        if (token) {
            localStorage.setItem("accessToken", token);
        }
    }, [token]);

    useEffect(() => {
        if (payload) {
            console.log("Parsed payload:", payload);
            setEmail(payload.email || "");
            setName(payload.name || "");
            setRole(payload.role || "USER");
        }
    }, [payload]);

    const handleSubmit = async () => {
        try {
            await axios.post("/api/user/signup", {
                email,
                name,
                role,
                levelId
            });
            alert("회원가입 완료!");
            navigate("/");
        } catch {
            alert("추가 정보 등록 실패");
        }
    };

    return (
        <div className="max-w-md mx-auto p-8 bg-white shadow rounded mt-10">
            <h2 className="text-2xl font-bold mb-6 text-center">추가 정보 입력</h2>
            <p className="text-center mb-4">{name}님, 환영합니다!</p>

            <label className="block mb-2 text-sm font-semibold">역할 선택</label>
            <select
                className="w-full border rounded p-2 mb-4"
                value={role}
                onChange={e => setRole(e.target.value)}
            >
                <option value="USER">일반 사용자</option>
                <option value="INSTRUCTOR">강사</option>
            </select>

            {role === "USER" && (
                <>
                    <label className="block mb-2 text-sm font-semibold">레벨 선택</label>
                    <select
                        className="w-full border rounded p-2 mb-6"
                        value={levelId ?? ""}
                        onChange={e => setLevelId(Number(e.target.value))}
                    >
                        <option value="">선택해주세요</option>
                        {levels.map(level => (
                            <option key={level.id} value={level.id}>{level.name}</option>
                        ))}
                    </select>
                </>
            )}

            <button
                onClick={handleSubmit}
                className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-400 transition"
            >
                가입 완료
            </button>
        </div>
    );
};


