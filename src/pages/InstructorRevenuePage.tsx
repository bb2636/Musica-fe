import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import InstructorRevenueStats from '../components/InstructorRevenueStats';

const InstructorRevenuePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-10">
        <h1 className="text-2xl font-bold mb-8">정산 내역</h1>
        <InstructorRevenueStats />
      </main>
      <Footer />
    </div>
  );
};

export default InstructorRevenuePage; 