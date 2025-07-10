import React from 'react';

const SearchBar: React.FC = () => {
  return (
    <div className="flex items-center w-full max-w-md bg-gray-100 rounded-lg px-3 py-2">
      <input
        type="text"
        placeholder="악기, 클래스, 또는 강사 검색..."
        className="flex-1 bg-transparent outline-none px-2 text-sm"
      />
      <button className="ml-2 px-3 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50">필터</button>
    </div>
  );
};

export default SearchBar; 