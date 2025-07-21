// src/components/ClassActionButtons.tsx

import { useNavigate } from "react-router-dom";
import { instructorApi } from "../apis/instructorApi";

const ClassActionButtons = ({
  classId,
  fetchClasses,
}: {
  classId: number;
  fetchClasses: () => void;
}) => {
  const navigate = useNavigate();

  const handleDelete = async () => {
    const confirmed = window.confirm("정말로 이 클래스를 삭제하시겠습니까?");
    if (!confirmed) return;

    try {
      await instructorApi.deleteClass(classId);
      alert("클래스가 삭제되었습니다.");
      fetchClasses();
    } catch (err) {
      console.error("삭제 실패:", err);
      alert("클래스 삭제에 실패했습니다.");
    }
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() =>
          navigate(`/mypage/instructor/classes/${classId}/lectures/create`)
        }
        className="w-full bg-neutral-200 hover:bg-neutral-300 text-sm text-gray-900 py-1 rounded transition"
      >
        수정
      </button>
      <button
        onClick={handleDelete}
        className="w-full bg-neutral-400 hover:bg-neutral-600 text-sm text-white py-1 rounded transition"
      >
        삭제
      </button>
    </div>
  );
};

export default ClassActionButtons;
