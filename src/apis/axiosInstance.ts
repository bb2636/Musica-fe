import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

// ✅ 인증 없이 접근 가능한 경로 목록 (Spring Security permitAll 기준)
const publicPaths = [
  "/users/register",
  "/auth/login",
  "/auth/refresh",
  "/meta",
  "/admin/login",
  "/dev",
  "/reviews/summary/lecture",
  "/users/check-email",
  "/levels",
  "/reviews/classes",
  "/user/signup",
  "/payment/cart/checkout",
  "/main",

  // baseURL 없이 요청되는 경로들
  "/oauth2",
  "/oauth2/authorization/kakao",
  "/login/oauth2",
  "/oauth-success",
];

// 🔄 토큰 갱신 상태 관리
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

const onRefreshFailed = () => {
  refreshSubscribers = [];
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  window.location.href = "/auth";
};

// ✅ 요청 인터셉터 - 토큰 자동 주입
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  const fullPath = `${config.baseURL ?? ""}${config.url ?? ""}`;
  const isPublic = publicPaths.some((path) => fullPath.startsWith(path));

  if (!isPublic && token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ✅ 응답 인터셉터 - 자동 토큰 갱신
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        if (originalRequest.url?.includes("/auth/refresh")) {
          onRefreshFailed();
          return Promise.reject(error);
        }

        if (isRefreshing) {
          return new Promise((resolve) => {
            subscribeTokenRefresh((token: string) => {
              originalRequest.headers["Authorization"] = `Bearer ${token}`;
              resolve(axiosInstance(originalRequest));
            });
          });
        }

        isRefreshing = true;

        try {
          const refreshToken = localStorage.getItem("refreshToken");
          if (!refreshToken) throw new Error("No refresh token available");

          const res = await axios.post(
              "/api/auth/refresh",
              { refreshToken },
              { withCredentials: true }
          );

          const newAccessToken = res.data.accessToken;
          const newRefreshToken = res.data.refreshToken;

          localStorage.setItem("accessToken", newAccessToken);
          if (newRefreshToken) {
            localStorage.setItem("refreshToken", newRefreshToken);
          }

          onRefreshed(newAccessToken);
          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
          return axiosInstance(originalRequest);
        } catch (refreshErr) {
          console.error("토큰 갱신 실패:", refreshErr);
          onRefreshFailed();
          return Promise.reject(refreshErr);
        } finally {
          isRefreshing = false;
        }
      }

      // ✅ 기타 에러 처리
      const status = error.response?.status;

      if (
          error.code === "ECONNREFUSED" ||
          error.message?.includes("ECONNREFUSED")
      ) {
        console.error("서버 연결 실패:", error);
        return Promise.reject(error);
      }

      if (status === 403) {
        alert("권한이 없습니다. 다시 로그인 해주세요.");
      } else if (status === 404) {
        alert("요청하신 페이지를 찾을 수 없습니다.");
      } else if (status >= 500) {
        alert("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      } else if (!status && !error.code?.includes("ECONNREFUSED")) {
        alert("네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.");
      }

      return Promise.reject(error);
    }
);

export default axiosInstance;
