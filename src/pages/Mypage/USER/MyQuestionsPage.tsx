import { useEffect, useState } from 'react';
import { fetchMyQuestions } from '../../../apis/user';

interface Question {
    id: number;
    content: string;
    createdAt?: string;
    classTitle?: string;
    lectureTitle?: string;
}

export default function MyQuestionsPage() {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadQuestions = async () => {
            try {
                const response = await fetchMyQuestions();
                setQuestions(response?.data ?? []);
            } catch (err) {
                setError('질문 목록을 불러오는데 실패했습니다.');
                console.error('질문 목록 로딩 실패:', err);
            } finally {
                setLoading(false);
            }
        };

        loadQuestions();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-2">질문 목록을 불러오는 중...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <div className="text-red-500 mb-4">⚠️ {error}</div>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    다시 시도
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">내 질문</h2>
                <span className="text-gray-500">총 {questions.length}개</span>
            </div>

            {questions.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">❓</div>
                    <div className="text-gray-600 mb-4">아직 등록한 질문이 없습니다.</div>
                    <div className="text-sm text-gray-500">강의에서 궁금한 점을 질문해보세요!</div>
                </div>
            ) : (
                <div className="space-y-4">
                    {questions.map((question) => (
                        <div
                            key={question.id}
                            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    {question.classTitle && (
                                        <div className="text-sm text-blue-600 font-medium mb-1">
                                            📚 {question.classTitle}
                                        </div>
                                    )}
                                    {question.lectureTitle && (
                                        <div className="text-sm text-gray-500 mb-2">
                                            🎥 {question.lectureTitle}
                                        </div>
                                    )}
                                </div>
                                {question.createdAt && (
                                    <div className="text-sm text-gray-400">
                                        {new Date(question.createdAt).toLocaleDateString()}
                                    </div>
                                )}
                            </div>

                            <div className="text-gray-800 leading-relaxed">
                                {question.content}
                            </div>

                            <div className="mt-4 flex space-x-2">
                                <button className="bg-blue-500 text-white py-2 px-4 rounded text-sm hover:bg-blue-600">
                                    강의로 이동
                                </button>
                                <button className="bg-gray-500 text-white py-2 px-4 rounded text-sm hover:bg-gray-600">
                                    수정
                                </button>
                                <button className="bg-red-500 text-white py-2 px-4 rounded text-sm hover:bg-red-600">
                                    삭제
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}