// components/layout/InstructorSidebar.tsx
import { NavLink } from "react-router-dom";

const menus = [
  { label: "대시보드", path: "/mypage/instructor/dashboard" },
  { label: "클래스 관리", path: "/mypage/instructor/classes" },
  { label: "질의응답 관리", path: "/mypage/instructor/qna" },
  { label: "리뷰 관리", path: "/mypage/instructor/reviews" },
  { label: "정산 내역", path: "/mypage/instructor/settlements" },
  { label: "설정", path: "/mypage/instructor/settings" },
];

const InstructorSidebar = () => {
  return (
    <aside className="w-64 bg-white border-r min-h-screen p-4">
      <h2 className="text-xl font-bold mb-6">강사 마이페이지</h2>
      <nav className="space-y-2">
        {menus.map((menu) => (
          <NavLink
            key={menu.path}
            to={menu.path}
            className={({ isActive }) =>
              `block px-3 py-2 rounded ${
                isActive ? "bg-blue-500 text-white" : "hover:bg-gray-100"
              }`
            }
          >
            {menu.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default InstructorSidebar;
