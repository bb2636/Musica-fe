// components/layout/InstructorLayout.tsx
import React from 'react';
import InstructorSidebar from './InstructorSidebar';

const InstructorLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="flex min-h-screen">
            <InstructorSidebar />
            <main className="flex-1 bg-gray-50 p-6">{children}</main>
        </div>
    );
};

export default InstructorLayout;