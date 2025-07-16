// InstructorQnA.tsx
import React, { useState, useEffect } from 'react';
import { instructorApi } from './services/instructorApi';

interface Question {
    id: number; 
    studentName: string;
    className: string;
    question: string;
    answer?: string;
    status: 'PENDING' | 'ANSWERED';
    createdAt: string;
    answeredAt?: string;
}

const InstructorQnA = () => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'ANSWERED'>('ALL');
    const [answerText, setAnswerText] = useState<{ [key: number]: string }>({});

    useEffect(() => {
        fetchQuestions();
    }, [filter]);

    const fetchQuestions = async () => {
        try {
            const params = filter !== 'ALL' ? { status: filter } : {};
            const data = await instructorApi.getQuestions(params);
            setQuestions(data.content || data);
        } catch (error) {
            console.error('질문 목록 로드 실패:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = async (questionId: number) => {
        const answer = answerText[questionId];
        if (!answer?.trim()) {
            alert('답변을 입력해주세요.');
            return;
        }

        try {
            await instructorApi.answerQuestion(questionId, answer);
            setAnswerText(prev => ({ ...prev, [questionId]: '' }));
            fetchQuestions(); // 목록 새로고침
            alert('답변이 등록되었습니다.');
        } catch (error) {
            console.error('답변 등록 실패:', error);
            alert('답변 등록에 실패했습니다.');
        }
    };

    if (loading) {
        return (
            <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2 text-gray-600">로딩 중...</p>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">질의응답 관리</h2>
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as any)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="ALL">전체</option>
                    <option value="PENDING">미답변</option>
                    <option value="ANSWERED">답변완료</option>
                </select>
            </div>

            <div className="space-y-4">
                {questions.map((question) => (
                    <div key={question.id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-semibold text-lg">{question.className}</h3>
                                <p className="text-sm text-gray-600">
                                    {question.studentName} • {question.createdAt}
                                </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                question.status === 'PENDING'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-green-100 text-green-800'
                            }`}>
                                {question.status === 'PENDING' ? '미답변' : '답변완료'}
                            </span>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                            <p className="text-gray-700">{question.question}</p>
                        </div>

                        {question.answer ? (
                            <div className="bg-blue-50 rounded-lg p-4">
                                <p className="text-blue-900 font-medium mb-2">답변:</p>
                                <p className="text-blue-800">{question.answer}</p>
                                {question.answeredAt && (
                                    <p className="text-xs text-blue-600 mt-2">
                                        답변일: {question.answeredAt}
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <textarea
                                    value={answerText[question.id] || ''}
                                    onChange={(e) => setAnswerText(prev => ({
                                        ...prev,
                                        [question.id]: e.target.value
                                    }))}
                                    placeholder="답변을 입력하세요..."
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows={4}
                                />
                                <button
                                    onClick={() => handleAnswer(question.id)}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    답변 등록
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {questions.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500">질문이 없습니다.</p>
                </div>
            )}
        </div>
    );
};

export default InstructorQnA;
