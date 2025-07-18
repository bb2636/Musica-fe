<<<<<<< Updated upstream
// pages/Mypage/INSTRUCTOR/InstructorMyPage.tsx
import { Outlet } from 'react-router-dom';
import InstructorLayout from '../../../components/layout/InstructorLayout';

const InstructorMyPage = () => {
  return (
    <InstructorLayout>
      <Outlet />
    </InstructorLayout>
  );
};

export default InstructorMyPage;
=======
import React from 'react';
import InstructorRevenueStats from '../../../components/InstructorRevenueStats';

export default function InstructorMyPage() {
    return (
        <div className="max-w-3xl mx-auto w-full px-4 py-10">
            <h1 className="text-2xl font-bold mb-8">강사 마이페이지</h1>

            <InstructorRevenueStats />
        </div>
    );
}
>>>>>>> Stashed changes
