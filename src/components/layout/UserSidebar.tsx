import { NavLink } from "react-router-dom";

const menus = [
  { label: "내 정보 수정", path: "/mypage/users/profile" },
  { label: "수강 중인 강의 목록", path: "/mypage/users/enrollments" },
  { label: "찜 목록 전체보기", path: "/mypage/users/wishlist" },
  { label: "내 질문 전체보기", path: "/mypage/users/questions" },
  { label: "내 후기 전체보기", path: "/mypage/users/reviews" },
  { label: "AI 튜너 바로가기", path: "/mypage/users/tuner" },
  { label: "결제 내역", path: "/mypage/users/payments" },
];

const UserSidebar = () => {
  return (
    <aside className="w-64 bg-white border-r min-h-screen p-4">
      <h2 className="text-xl font-bold mb-6">마이페이지</h2>
      <nav className="space-y-2">
        {menus.map((menu) => (
          <NavLink
            key={menu.path}
            to={menu.path}
            className={({ isActive }) =>
              `block px-3 py-2 rounded font-medium transition-colors ${
                isActive
                  ? "bg-gradient-to-r from-neutral-800 to-gray-950 text-white"
                  : "hover:bg-gray-100"
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

export default UserSidebar;
