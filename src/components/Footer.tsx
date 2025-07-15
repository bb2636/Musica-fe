import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-200 py-8 mt-auto w-full">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between gap-8">
        <div>
          <div className="font-bold text-lg text-blue-400 mb-2">InstruConnect</div>
          <div className="text-xs mb-2">음악 교육의 새로운 기준을 제시합니다.<br />
            전문가들의 노하우를 언제 어디서나 배울 수 있는 플랫폼입니다.</div>
          <div className="text-xs text-gray-400">© 2023 InstruConnect. All rights reserved.</div>
        </div>
        <div className="flex flex-col gap-2 text-xs">
          <div className="font-semibold text-gray-100 mb-1">회사 정보</div>
          <div>소개</div>
          <div>강사 지원</div>
          <div>채용 정보</div>
          <div>블로그</div>
        </div>
        <div className="flex flex-col gap-2 text-xs">
          <div className="font-semibold text-gray-100 mb-1">고객 지원</div>
          <div>자주 묻는 질문</div>
          <div>문의하기</div>
          <div>환불 정책</div>
          <div>이용약관</div>
          <div>개인정보처리방침</div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 