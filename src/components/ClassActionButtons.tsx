import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { instructorApi } from "../apis/instructorApi";

interface Props {
  classId: number;
  fetchClasses: () => void;
}

const ClassActionButtons = ({ classId, fetchClasses }: Props) => {
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {
    const confirmed = window.confirm("정말로 이 클래스를 삭제하시겠습니까?");
    if (!confirmed) return;

    setIsDeleting(true);

    // 클릭 핸들러 블로킹 방지
    setTimeout(async () => {
      try {
        await instructorApi.deleteClass(classId);
        fetchClasses();

        // alert은 UI 갱신 이후에 실행
        setTimeout(() => {
          alert("클래스가 삭제되었습니다.");
        }, 0);
      } catch (err) {
        console.error("삭제 실패:", err);
        alert("클래스 삭제에 실패했습니다.");
      } finally {
        setIsDeleting(false);
      }
    }, 0);
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() =>
          navigate(`/mypage/instructor/classes/${classId}/lectures/create`)
        }
        className="w-full bg-neutral-200 hover:bg-neutral-300 text-sm text-gray-900 py-1 rounded transition"
        disabled={isDeleting}
      >
        수정
      </button>
      <button
        onClick={handleDelete}
        className="w-full bg-neutral-400 hover:bg-neutral-600 text-sm text-white py-1 rounded transition"
        disabled={isDeleting}
      >
        {isDeleting ? "삭제 중..." : "삭제"}
      </button>
    </div>
  );
};

export default ClassActionButtons;
