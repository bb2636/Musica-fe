import React from 'react';
import logo from '../assets/musica-logo.png';

const Footer: React.FC = () => {
  return (
    <footer className="bg-black text-gray-300 py-10 mt-16">
      <div className="flex flex-col items-center justify-center">
        {/* 로고 - 중앙 정렬 */}
        <img
          src={logo}
          alt="Musica Logo"
          className="h-16 md:h-24 w-auto mb-4 select-none pointer-events-none"
          style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.5))' }}
        />
        {/* 슬로건 */}
        <div className="text-lg md:text-xl font-light italic mb-2 text-gray-200 text-center">
          음악, 그 이상의 경험을 Musica와 함께
        </div>
        {/* 링크 */}
        <div className="flex gap-6 mt-2 mb-4 text-sm text-gray-400">
          <a href="#" className="hover:text-white transition">회사소개</a>
          <a href="#" className="hover:text-white transition">이용약관</a>
          <a href="#" className="hover:text-white transition">개인정보처리방침</a>
          <a href="#" className="hover:text-white transition">고객센터</a>
        </div>
        {/* 저작권 */}
        <div className="text-xs text-gray-500 mt-2 text-center">
          © 2023 Musica. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer; 