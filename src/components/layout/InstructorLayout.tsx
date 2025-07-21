// InstructorLayout.tsx
import { Outlet } from "react-router-dom";
import InstructorSidebar from "./InstructorSidebar";

const InstructorLayout = () => {
  return (
    <div className="flex min-h-screen">
      <InstructorSidebar />
      <main className="flex-1 bg-gray-50 p-6">
        <Outlet /> {/* 여기에 자식 페이지가 렌더링됨 */}
      </main>
    </div>
  );
};

export default InstructorLayout;
