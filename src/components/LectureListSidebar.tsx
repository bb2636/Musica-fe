// src/components/lecture/LectureListSidebar.tsx

import React from "react";
import { useNavigate } from "react-router-dom";
import type { LectureSummary } from "../types/lecture";

interface LectureListSidebarProps {
  lectureList: LectureSummary[];
  currentLectureId: number;
  classId: number;
}

const LectureListSidebar: React.FC<LectureListSidebarProps> = ({
  lectureList,
  currentLectureId,
  classId,
}) => {
  const navigate = useNavigate();

  return (
    <aside className="w-full lg:w-80">
      <div className="bg-white shadow rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-3">강의 목록</h2>
        <ul className="space-y-2">
          {lectureList.map((lec) => (
            <li
              key={lec.lectureId}
              onClick={() =>
                navigate(`/classes/${classId}/lectures/${lec.lectureId}`)
              }
              className={`p-3 rounded border cursor-pointer transition hover:bg-gray-100 ${
                lec.lectureId === currentLectureId
                  ? "bg-blue-50 border-blue-500"
                  : "border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="truncate font-medium">{lec.title}</span>
                {lec.isCompleted && (
                  <span className="text-green-600 text-xs">✔ 완료</span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                ⏱ {Math.floor(lec.duration / 60)}분 {lec.duration % 60}초
              </p>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default LectureListSidebar;
