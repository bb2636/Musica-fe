import { useState, useEffect } from "react";
import { instructorApi } from "../../../apis/instructorApi";
import { getInstructorAnswers, updateAnswer } from '../../../apis/qna';
import type { InstructorAnswerDto } from '../../../types/qna';

interface Question {
  id: number;
  studentName: string;
  className: string;
  question: string;
  answer?: string;
  status: "PENDING" | "ANSWERED";
  createdAt: string;
  answeredAt?: string;
}

const InstructorQnA = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingAnswer, setEditingAnswer] = useState<string>("");
  const [myAnswers, setMyAnswers] = useState<InstructorAnswerDto[]>([]);
  const [editingMyAnswerId, setEditingMyAnswerId] = useState<number | null>(null);
  const [editingMyAnswer, setEditingMyAnswer] = useState<string>("");

  useEffect(() => {
    fetchQuestions();
    getInstructorAnswers().then(res => setMyAnswers(res.data));
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const params: { status: "PENDING" } = { status: "PENDING" };
      console.log("✅ 요청 params 확인:", params); // 🔍 파라미터 확인
      const data = await instructorApi.getQuestions(params);
      console.log("✅ 응답 데이터:", data); // 🔍 응답 확인
      // id 필드 보장: questionId가 있으면 id로 매핑
      const mapped = (data || []).map((q: any) => ({
        ...q,
        id: q.id ?? q.questionId,
      }));
      setQuestions(mapped);
    } catch (error) {
      console.error("질문 목록 로드 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditAnswer = (questionId: number, currentAnswer: string | undefined) => {
    setEditingId(questionId);
    setEditingAnswer(currentAnswer ?? "");
  };

  const handleUpdateAnswer = async (questionId: number) => {
    if (!editingAnswer.trim()) {
      alert("수정할 답변을 입력해주세요.");
      return;
    }
    try {
      await instructorApi.answerQuestion(questionId, editingAnswer);
      setEditingId(null);
      setEditingAnswer("");
      fetchQuestions();
      alert("답변이 수정되었습니다.");
    } catch (error) {
      alert("답변 수정에 실패했습니다.");
    }
  };

  const handleEditMyAnswer = (idx: number, currentAnswer: string) => {
    setEditingMyAnswerId(idx);
    setEditingMyAnswer(currentAnswer);
  };

  const handleUpdateMyAnswer = async (answer: InstructorAnswerDto) => {
    if (!editingMyAnswer.trim()) {
      alert("수정할 답변을 입력해주세요.");
      return;
    }
    try {
      if (!answer.questionId) {
        alert("질문 ID를 찾을 수 없습니다. (수정 불가)");
        return;
      }
      await updateAnswer(answer.questionId, editingMyAnswer);
      setEditingMyAnswerId(null);
      setEditingMyAnswer("");
      getInstructorAnswers().then(res => setMyAnswers(res.data));
      alert("답변이 수정되었습니다.");
    } catch (error) {
      alert("답변 수정에 실패했습니다.");
    }
  };

  // 날짜 포맷 함수
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
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
    <div className="p-6 max-w-7xl mx-auto space-y-10">
      <div>
        <h2 className="text-xl font-semibold text-black flex items-center gap-2 mb-2">
          질의응답 관리
        </h2>
        <p className="text-gray-700 mb-4">아래는 아직 답변하지 않은 질문 목록입니다.</p>
      </div>

      {/* 미답변 질문 표 */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-800">미답변만 표시</span>
        </h3>
        {questions.length === 0 ? (
          <div className="text-center text-gray-400 py-20">미답변 질문이 없습니다.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto text-sm text-left">
              <thead className="border-b text-gray-700 bg-gray-100 text-center">
                <tr>
                  <th className="px-4 py-2">강의명</th>
                  <th className="px-4 py-2">질문</th>
                  <th className="px-4 py-2">질문자</th>
                  <th className="px-4 py-2">질문일</th>
                  <th className="px-4 py-2">답변</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((question) => (
                  <tr key={question.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2 font-semibold text-center text-black">{question.className}</td>
                    <td className="px-4 py-2 text-gray-900">{question.question}</td>
                    <td className="px-4 py-2 text-gray-700 text-center">{question.studentName}</td>
                    <td className="px-4 py-2 text-gray-500 text-center">{formatDate(question.createdAt)}</td>
                    <td className="px-4 py-2 w-64">
                      {editingId === question.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={editingAnswer}
                            onChange={e => setEditingAnswer(e.target.value)}
                            placeholder="답변을 입력하세요..."
                            className="w-full p-2 border rounded text-black bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black"
                            rows={3}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUpdateAnswer(question.id)}
                              className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-1 rounded transition"
                            >
                              저장
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="w-full bg-gray-400 hover:bg-gray-500 text-white font-semibold py-1 rounded transition"
                            >
                              취소
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEditAnswer(question.id, question.answer)}
                          className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-1 rounded transition"
                        >
                          답변 등록
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 내가 답변한 Q&A 섹션 */}
      <div>
        <h3 className="text-xl font-bold mb-4 text-black flex items-center gap-2">
          내가 답변한 Q&A
        </h3>
        {myAnswers.length === 0 ? (
          <div className="text-gray-400">아직 답변한 Q&A가 없습니다.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myAnswers.map((a, idx) => (
              <div key={idx} className="border rounded-lg bg-white shadow hover:shadow-md transition p-6 flex flex-col justify-between">
                <div>
                  <div className="font-semibold mb-1 text-black">{a.title}</div>
                  <div className="mb-2 text-gray-900 font-medium">Q. {a.question}</div>
                </div>
                <div>
                  {editingMyAnswerId === idx ? (
                    <div className="mb-2">
                      <textarea
                        value={editingMyAnswer}
                        onChange={e => setEditingMyAnswer(e.target.value)}
                        className="w-full p-2 border rounded mb-2 text-black bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black"
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateMyAnswer(a)}
                          className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-2 rounded-lg transition"
                        >
                          저장
                        </button>
                        <button
                          onClick={() => setEditingMyAnswerId(null)}
                          className="w-full bg-gray-400 hover:bg-gray-500 text-white font-semibold py-2 rounded-lg transition"
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="mb-2 text-gray-900">A. {a.answer}</div>
                      <button
                        onClick={() => handleEditMyAnswer(idx, a.answer)}
                        className="px-3 py-1 bg-gray-800 text-white rounded hover:bg-black text-sm font-semibold"
                      >
                        수정
                      </button>
                    </>
                  )}
                </div>
                <div className="text-xs text-gray-400 mt-2">{a.createdAt && formatDate(a.createdAt)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructorQnA;
