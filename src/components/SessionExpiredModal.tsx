import React from "react";
import { useNavigate } from "react-router-dom";

const SessionExpiredModal: React.FC = () => {
  const navigate = useNavigate();

  const handleGoLogin = () => {
    localStorage.removeItem("logoutReason");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    navigate("/auth");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg text-center text-black max-w-sm w-full">
        <h2 className="text-xl font-bold mb-4">세션이 만료되었습니다</h2>
        <p className="text-sm text-gray-700 mb-6">
          보안을 위해 로그인이 만료되었습니다.
          <br />
          다시 로그인해주세요.
        </p>
        <button
          onClick={handleGoLogin}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
        >
          로그인 페이지로 이동
        </button>
      </div>
    </div>
  );
};

export default SessionExpiredModal;
