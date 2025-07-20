import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../apis/user";
import type { AxiosError } from "axios";
import { inputStyle, labelStyle, formContainer } from "../styles/formStyles";

const Login = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await loginUser(form.email, form.password);
      const { accessToken, refreshToken, role, name, email } = res.data;

      if (accessToken && refreshToken) {
        // ✅ 토큰 저장
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);

        // ✅ 사용자 정보 저장
        localStorage.setItem("userName", name || "사용자");
        localStorage.setItem("userEmail", email || form.email);

        // ✅ role 정보 저장 (중요!)
        if (role) {
          localStorage.setItem("userRole", role);
          console.log("🔍 로그인 성공 - Role 저장:", role);
        }

        alert("로그인 성공");

        // ✅ role에 따른 페이지 이동
        if (role === "ADMIN") {
          navigate("/mypage/admin");
        } else if (role === "INSTRUCTOR") {
          // 승인 전 강사일 경우에는 아래에서 걸러짐
          navigate("/main");
        } else {
          navigate("/main");
        }
      } else {
        alert("로그인 실패: 토큰이 없습니다");
      }
    } catch (err) {
      const error = err as AxiosError<{ message: string; errorCode?: string }>;
      const errorMessage = error.response?.data?.message;
      const errorCode = error.response?.data?.errorCode;

      console.error("로그인 에러:", error);

      // 🔍 CustomAuthException 에러 코드 체크
      if (errorCode === "INSTRUCTOR_NOT_APPROVED") {
        alert("강사 계정은 관리자의 승인 후 로그인할 수 있습니다.");
        return;
      }

      if (errorCode === "USER_NOT_FOUND") {
        alert("등록되지 않은 이메일입니다.");
        return;
      }

      if (errorCode === "INVALID_PASSWORD") {
        alert("비밀번호가 일치하지 않습니다.");
        return;
      }

      // 🔍 메시지 기반 에러 처리 (fallback)
      if (errorMessage?.includes("존재하지 않는")) {
        alert("등록되지 않은 이메일입니다.");
      } else if (errorMessage?.includes("비밀번호")) {
        alert("비밀번호가 일치하지 않습니다.");
      } else if (errorMessage?.includes("승인")) {
        alert("강사 계정은 관리자의 승인 후 로그인할 수 있습니다.");
      } else {
        alert(errorMessage || "로그인에 실패했습니다.");
      }
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className={formContainer}>
        <h2 className="text-2xl font-bold mb-6 text-center">로그인</h2>

        <div className="mb-4">
          <label className={labelStyle}>이메일</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="이메일"
            className={inputStyle}
            required
          />
        </div>

        <div className="mb-6">
          <label className={labelStyle}>비밀번호</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="비밀번호"
            className={inputStyle}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-black text-white font-bold py-2 px-4 rounded hover:bg-gray-800 transition"
        >
          로그인
        </button>

        <p className="text-center text-sm text-gray-600 mt-4">또는</p>
        <button
          type="button"
          onClick={() =>
            (window.location.href =
              "http://localhost:8080/oauth2/authorization/kakao")
          }
          className="mt-2 w-full bg-yellow-400 text-black font-bold py-2 px-4 rounded-full hover:bg-yellow-300 transition"
        >
          Kakao로 로그인
        </button>
      </form>
    </div>
  );
};

export default Login;
