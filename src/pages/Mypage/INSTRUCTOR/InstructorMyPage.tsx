import React from 'react';
import InstructorRevenueSummary from '../../../components/InstructorRevenueSummary.tsx';

export default function InstructorMyPage() {
    return (
        <div className="max-w-3xl mx-auto w-full px-4 py-10">
            <h1 className="text-2xl font-bold mb-8">강사 마이페이지</h1>
            <InstructorRevenueSummary />
        </div>
    );
}