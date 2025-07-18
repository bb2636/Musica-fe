import React, { useEffect, useState } from 'react';
import {
  getQuestionsByClass,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  createAnswer
} from '../apis/qna';
import type { QuestionDto } from '../types/qna';

const classId = 1; // TODO: Replace with dynamic classId from props or URL

export default function QnAPage() {
  const [questions, setQuestions] = useState<QuestionDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newQuestion, setNewQuestion] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');

  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getQuestionsByClass(classId);
      setQuestions(res.data);
    } catch (e: any) {
      setError(e.message || '질문을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleCreate = async () => {
    if (!newQuestion.trim()) return;
    try {
      await createQuestion({ classId, question: newQuestion });
      setNewQuestion('');
      fetchQuestions();
    } catch (e: any) {
      alert(e.message || '질문 등록 실패');
    }
  };

  const handleEdit = (q: QuestionDto) => {
    setEditingId(q.questionId);
    setEditingText(q.question);
  };

  const handleUpdate = async (id: number) => {
    try {
      await updateQuestion(id, { question: editingText });
      setEditingId(null);
      setEditingText('');
      fetchQuestions();
    } catch (e: any) {
      alert(e.message || '질문 수정 실패');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      await deleteQuestion(id);
      fetchQuestions();
    } catch (e: any) {
      alert(e.message || '질문 삭제 실패');
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Q&amp;A</h1>
      <div className="mb-6">
        <textarea
          className="w-full border rounded p-2 mb-2"
          rows={3}
          placeholder="질문을 입력하세요"
          value={newQuestion}
          onChange={e => setNewQuestion(e.target.value)}
        />
        <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleCreate}>
          질문 등록
        </button>
      </div>
      {loading ? (
        <div>로딩 중...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <ul className="space-y-4">
          {questions.map(q => (
            <li key={q.questionId} className="border rounded p-4">
              {editingId === q.questionId ? (
                <div>
                  <textarea
                    className="w-full border rounded p-2 mb-2"
                    rows={2}
                    value={editingText}
                    onChange={e => setEditingText(e.target.value)}
                  />
                  <button className="bg-green-500 text-white px-2 py-1 rounded mr-2" onClick={() => handleUpdate(q.questionId)}>
                    저장
                  </button>
                  <button className="bg-gray-300 px-2 py-1 rounded" onClick={() => setEditingId(null)}>
                    취소
                  </button>
                </div>
              ) : (
                <div>
                  <div className="font-semibold">Q. {q.question}</div>
                  <div className="text-xs text-gray-500 mt-1">작성일: {q.createdAt?.slice(0, 10)}</div>
                  <div className="mt-2 flex gap-2">
                    <button className="text-blue-500" onClick={() => handleEdit(q)}>
                      수정
                    </button>
                    <button className="text-red-500" onClick={() => handleDelete(q.questionId)}>
                      삭제
                    </button>
                  </div>
                </div>
              )}
              {/* TODO: 답변 표시 및 답변 작성 UI (강사용) */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 