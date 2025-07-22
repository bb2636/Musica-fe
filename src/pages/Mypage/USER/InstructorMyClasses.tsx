import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { enrollmentApi } from "../../../apis/enrollmentApi";

const EnrollmentsPage: React.FC = () => {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEnrollments = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await enrollmentApi.getMyEnrollments();
        setEnrollments(res ?? []);
      } catch (err) {
        setError("수강 중인 강의를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchEnrollments();
  }, []);

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h2 className="text-2xl font-bold mb-6">수강 중인 강의 목록</h2>
      {loading ? (
        <div className="text-gray-500 text-center py-20">로딩 중...</div>
      ) : error ? (
        <div className="text-red-500 text-center py-20">{error}</div>
      ) : enrollments.length === 0 ? (
        <div className="text-gray-500 text-center py-20">수강 중인 강의가 없습니다.</div>
      ) : (
        <div className="space-y-4">
          {enrollments.map((e: any) => (
            <div
              key={e.class_id}
              className="flex items-center bg-gray-100 rounded p-4 gap-4 shadow hover:shadow-lg transition cursor-pointer"
              onClick={() => navigate(`/classes/${e.class_id}`)}
            >
              <img
                src={e.thumbnailUrl}
                alt={e.title}
                className="w-20 h-20 object-cover rounded"
                onError={ev => (ev.currentTarget.src = '/default-thumbnail.png')}
              />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-lg truncate">{e.title}</div>
                <div className="text-sm text-gray-500 truncate">강사: {e.instructorName}</div>
                <div className="text-xs text-gray-500">결제일: {e.paid_at?.slice(0, 10)}</div>
                <div className="text-xs text-gray-500">진도율: {e.progress}%</div>
              </div>
              <div className="text-base font-bold whitespace-nowrap">{e.amount?.toLocaleString()}원</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EnrollmentsPage; 