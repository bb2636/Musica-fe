import React from "react";

const SearchBar: React.FC = () => {
  return (
    <form
      className="flex items-center w-full max-w-xl mx-auto border border-gray-300 rounded-full bg-white shadow-md px-5 py-3"
      onSubmit={(e) => {
        e.preventDefault(); /* 검색 로직 추가 */
      }}
    >
      {/* 돋보기 아이콘 */}
      <svg
        className="w-5 h-5 text-gray-400 mr-3"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <circle cx="11" cy="11" r="7" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      {/* 입력창 */}
      <input
        type="text"
        placeholder="악기, 클래스, 또는 강사 검색…"
        className="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-400 text-base"
      />
      {/* 검색 버튼 */}
      <button
        type="submit"
        className="ml-3 px-5 py-2 rounded-full bg-black text-white font-semibold shadow hover:bg-gray-800 transition"
      >
        검색
      </button>
    </form>
  );
};

export default SearchBar;
