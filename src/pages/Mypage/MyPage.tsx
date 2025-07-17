import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../apis/axiosInstance";
import { isAxiosError } from "../../types/errors";
import Header from "../../components/Header.tsx";
import Footer from "../../components/Footer.tsx";

export default function MyPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        setLoading(true);
        setError(null);

        // 🔍 localStorage에서 role 확인
        const localRole = localStorage.getItem("userRole");
        if (localRole) {
          const upperRole = localRole.toUpperCase();

          if (upperRole === "ADMIN") {
            navigate("/mypage/admin");
          } else if (upperRole === "INSTRUCTOR") {
            navigate("/mypage/instructor");
          } else if (upperRole === "USER") {
            navigate("/mypage/users");
          } else {
            setError("권한이 없는 사용자입니다.");
          }

          return;
        }

        // 🔍 API로 사용자 정보 조회
        const response = await axiosInstance.get("/users/mypage");
        const fetchedRole = response.data.role?.toUpperCase();

        if (!fetchedRole) {
          setError("사용자 권한을 확인할 수 없습니다.");
          return;
        }

        // 저장
        localStorage.setItem("userRole", fetchedRole);

        // 🔁 역할에 따라 리다이렉트
        if (fetchedRole === "ADMIN") {
          navigate("/mypage/admin");
        } else if (fetchedRole === "INSTRUCTOR") {
          navigate("/mypage/instructor");
        } else if (fetchedRole === "USER") {
          navigate("/mypage/users");
        } else {
          setError("권한이 없는 사용자입니다.");
        }
      } catch (error: unknown) {
        console.error("❌ 마이페이지 정보 불러오기 실패:", error);

        if (isAxiosError(error)) {
          const status = error.response?.status;

          if (status === 401) {
            setError("로그인이 필요합니다. 다시 로그인해주세요.");
            setTimeout(() => navigate("/auth"), 2000);
          } else if (status === 403) {
            setError("권한이 부족합니다.");
          } else if (status === 404) {
            setError("사용자 정보를 찾을 수 없습니다.");
          } else {
            setError("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
          }
        } else {
          setError("알 수 없는 오류가 발생했습니다.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [navigate]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="max-w-4xl mx-auto p-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <div className="text-lg text-gray-600">
                사용자 정보를 불러오는 중...
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="max-w-4xl mx-auto p-8">
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <div className="text-red-500 text-lg mb-4">
              ⚠️ 오류가 발생했습니다
            </div>
            <div className="text-gray-600 mb-6">{error}</div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              다시 시도
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // 이 페이지는 실제 콘텐츠를 직접 렌더링하지 않음 → 리다이렉션만 처리
  return null;
}
