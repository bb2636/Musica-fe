import React from 'react';

interface CategoryCardProps {
  id: number;
  name: string;
  icon: React.ReactNode;
  classCount: number;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ name, icon, classCount }) => {
  return (
    <div className="flex flex-col items-center justify-center bg-white rounded-xl shadow p-4 min-w-[110px] min-h-[110px]">
      <div className="text-3xl mb-2">{icon}</div>
      <div className="font-semibold text-sm mb-1">{name}</div>
      <div className="text-xs text-gray-400">{classCount}개 클래스</div>
    </div>
  );
};

export default CategoryCard; 