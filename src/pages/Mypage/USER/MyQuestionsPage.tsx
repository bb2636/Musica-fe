import { useEffect, useState } from 'react';
import { fetchMyQuestions } from '../../../apis/user';
import { updateQuestion, deleteQuestion } from '../../../apis/qna';

interface Question {
    id: number;
    content: string;
    answer?: string;
    createdAt?: string;
    classTitle?: string;
    lectureTitle?: string;
    classId?: number;
    lectureId?: number;
}

export default function MyQuestionsPage() {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingText, setEditingText] = useState<string>("");

    const loadQuestions = async () => {
        try {
            const response = await fetchMyQuestions();
            console.log('[QNA] 내 질문 API 응답:', response?.data);
            const mapped = (response?.data ?? []).map((q: any) => ({
              id: q.questionId,
              content: q.question,
              answer: q.answer,
              createdAt: q.createdAt,
              classTitle: q.classTitle,
              lectureTitle: q.lectureTitle,
              classId: q.classId,
              lectureId: q.lectureId,
            }));
            setQuestions(mapped);
        } catch (err) {
            setError('질문 목록을 불러오는데 실패했습니다.');
            console.error('질문 목록 로딩 실패:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadQuestions();
    }, []);

    const handleEdit = (q: Question) => {
        setEditingId(q.id);
        setEditingText(q.content);
    };

    const handleUpdate = async (id: number) => {
        try {
            await updateQuestion(id, { question: editingText });
            setEditingId(null);
            setEditingText("");
            loadQuestions();
        } catch (e) {
            alert('질문 수정에 실패했습니다.');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('정말 삭제하시겠습니까?')) return;
        try {
            await deleteQuestion(id);
            loadQuestions();
        } catch (e) {
            alert('질문 삭제에 실패했습니다.');
        }
    };

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
        <div className="space-y-6 bg-white min-h-screen py-8 px-2 md:px-0 font-sans">
            <div className="flex items-center justify-between max-w-3xl mx-auto">
                <h2 className="text-2xl font-bold text-black">질문관리</h2>
                <span className="text-gray-500">총 {questions.length}개</span>
            </div>

            {questions.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-6xl mb-4 text-black">❓</div>
                    <div className="text-gray-600 mb-4">아직 등록한 질문이 없습니다.</div>
                    <div className="text-sm text-gray-400">강의에서 궁금한 점을 질문해보세요!</div>
                </div>
            ) : (
                <div className="space-y-4 max-w-3xl mx-auto">
                    {questions.map((question) => (
                        <div
                            key={question.id}
                            className="bg-neutral-100 rounded-lg shadow p-6 hover:shadow-lg transition-shadow border border-neutral-200 relative"
                        >
                            {/* 날짜 왼쪽 상단 */}
                            {question.createdAt && (
                                <div className="absolute left-6 top-4 text-sm text-gray-400">
                                    {new Date(question.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                                </div>
                            )}
                            <div className="flex flex-col gap-6 pt-6">
                              {/* 질문 영역 */}
                              <div>
                                <div className="font-bold text-gray-800 mb-1">질문 :</div>
                                <div className="text-gray-900 leading-relaxed min-h-[56px] w-full px-2 py-3 font-normal bg-white rounded border border-neutral-200">
                                  {editingId === question.id ? (
                                    <input
                                      className="w-full bg-white text-black border-none outline-none font-normal leading-relaxed min-h-[56px]"
                                      value={editingText}
                                      onChange={e => setEditingText(e.target.value)}
                                      autoFocus
                                    />
                                  ) : (
                                    question.content
                                  )}
                                </div>
                              </div>

                              {/* 답변 영역 */}
                              <div>
                                <div className="font-bold text-gray-700 mb-1">답변 :</div>
                                <div className={`min-h-[56px] w-full px-2 py-3 font-normal leading-relaxed rounded bg-white border border-neutral-200 ${question.answer ? 'text-gray-900' : 'text-gray-400 italic'}`}>
                                  {question.answer ? question.answer : '아직 답변이 등록되지 않았습니다.'}
                                </div>
                              </div>
                            </div>

                            {/* 버튼 오른쪽 하단 */}
                            <div className="flex justify-end mt-6 gap-2">
                              {editingId === question.id ? (
                                <>
                                  <button
                                    className="bg-black text-white py-2 px-4 rounded text-sm hover:bg-gray-900 border border-black"
                                    onClick={() => handleUpdate(question.id)}
                                  >
                                    저장
                                  </button>
                                  <button
                                    className="bg-white text-black py-2 px-4 rounded text-sm border border-black hover:bg-gray-100"
                                    onClick={() => setEditingId(null)}
                                  >
                                    취소
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    className="bg-black text-white py-2 px-4 rounded text-sm hover:bg-gray-900 border border-black"
                                    onClick={() => handleEdit(question)}
                                  >
                                    수정
                                  </button>
                                  <button
                                    className="bg-red-600 text-white py-2 px-4 rounded text-sm border border-red-600 hover:bg-red-700"
                                    onClick={() => handleDelete(question.id)}
                                  >
                                    삭제
                                  </button>
                                </>
                              )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}