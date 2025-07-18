import React, { useEffect, useState } from "react";
import { instructorApi } from "../apis/instructorApi";
import type { Question } from "../types/instructor";

const InstructorPendingAnswers: React.FC = () => {
  const [pendingQuestions, setPendingQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await instructorApi.getQuestions({ status: "PENDING" });
        setPendingQuestions(res);
      } catch (e: any) {
        setError(e.message || "질문을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <h2 className="text-lg font-bold mb-4">답변 대기 질문</h2>
      {pendingQuestions.length === 0 ? (
        <div className="text-gray-500">답변 대기 중인 질문이 없습니다.</div>
      ) : (
        <ul className="space-y-3">
          {pendingQuestions.map(q => (
            <li key={q.id} className="border rounded p-3">
              <div className="font-semibold">{q.question}</div>
              <div className="text-xs text-gray-400 mt-1">작성일: {q.createdAt?.slice(0, 10)}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default InstructorPendingAnswers; 