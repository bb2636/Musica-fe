import { useEffect, useState } from 'react';
import { fetchMyQuestions } from '../../../apis/user.ts';

interface Question {
    id: number;
    content: string;
    createdAt: string;
}

export default function MyQuestionsPage() {
    const [questions, setQuestions] = useState<Question[]>([]);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetchMyQuestions();
                setQuestions(res.data);
            } catch {
                alert("질문 목록을 불러오지 못했습니다.");
            }
        })();
    }, []);

    return (
        <div className="max-w-4xl mx-auto p-8">
            <h2 className="text-xl font-bold mb-6">내 질문</h2>
            {questions.length === 0 ? (
                <div>작성한 질문이 없습니다.</div>
            ) : (
                <ul className="space-y-4">
                    {questions.map(q => (
                        <li key={q.id} className="bg-white p-4 rounded shadow">
                            <div className="font-semibold">{q.content}</div>
                            <div className="text-xs text-gray-500 mt-1">{q.createdAt}</div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
