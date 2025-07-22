import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

// 인증 없이 접근 가능한 경로 목록 (백엔드 permitAll 기준)
const publicPaths = [
  "/users/register",
  "/auth/login",
  "/auth/refresh",
  "/meta",
  "/admin/login",
  "/reviews/summary/lecture",
  "/reviews/summary/cards",
  "/users/check-email",
  "/levels",
  "/reviews/classes",
  "/user/signup",
  "/payment/cart/checkout",
  "/main",
  "/main/popular",
  "/main/latest",
  "/main/reviews/summary",
  "/main/classes/free",

  // baseURL 없이 요청되는 경로들
  "/oauth2",
  "/oauth2/authorization/kakao",
  "/login/oauth2",
  "/oauth-success",
];

// 토큰 갱신 관리
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

  // 로그아웃 처리를 즉시하지 않고 로그만 남김
  console.error("토큰 갱신 실패 - 자동 로그아웃하지 않음 (디버깅용)");
  console.log("현재 토큰 상태:", {
    accessToken: localStorage.getItem("accessToken"),
    refreshToken: localStorage.getItem("refreshToken"),
  });

  // 실제 운영에서는 아래 주석을 해제하여 로그아웃 처리
  // localStorage.removeItem("accessToken");
  // localStorage.removeItem("refreshToken");
  // window.location.href = "/auth";
};

// 요청 인터셉터 - 토큰 주입
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  const fullPath = `${config.baseURL ?? ""}${config.url ?? ""}`;
  const isPublic = publicPaths.some((path) => fullPath.startsWith(path));

  console.log("요청 정보:", {
    method: config.method?.toUpperCase(),
    url: fullPath,
    isPublic,
    hasToken: !!token && token !== "null",
  });

  if (isPublic || !token || token === "null") {
    delete config.headers.Authorization;
    console.log("인증 토큰 제외됨");
  } else {
    config.headers.Authorization = `Bearer ${token}`;
    console.log("인증 토큰 포함됨");
  }

  return config;
});

// 응답 인터셉터 - 자동 토큰 갱신
axiosInstance.interceptors.response.use(
  (response) => {
    console.log("응답 성공:", {
      status: response.status,
      url: response.config.url,
      method: response.config.method?.toUpperCase(),
    });
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    console.error("응답 에러:", {
      status: error.response?.status,
      url: originalRequest?.url,
      method: originalRequest?.method?.toUpperCase(),
      message: error.message,
      code: error.code,
    });

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (originalRequest.url?.includes("/auth/refresh")) {
        console.error("토큰 갱신 엔드포인트에서 401 에러 발생");
        onRefreshFailed();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        console.log("토큰 갱신 중... 대기열에 추가");
        return new Promise((resolve) => {
          subscribeTokenRefresh((token: string) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            resolve(axiosInstance(originalRequest));
          });
        });
      }

      isRefreshing = true;
      console.log("토큰 갱신 시도 시작");

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          console.error("리프레시 토큰이 없음");
          throw new Error("No refresh token available");
        }

        console.log("리프레시 토큰으로 갱신 요청 중...");
        const res = await axios.post(
          "/api/auth/refresh",
          { refreshToken },
          { withCredentials: true }
        );

        const newAccessToken = res.data.accessToken;
        const newRefreshToken = res.data.refreshToken;

        console.log("토큰 갱신 성공");
        localStorage.setItem("accessToken", newAccessToken);
        if (newRefreshToken) {
          localStorage.setItem("refreshToken", newRefreshToken);
          console.log("새 리프레시 토큰도 저장됨");
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

    // 기타 오류 처리 - alert 대신 console.error 사용
    const status = error.response?.status;

    if (
      error.code === "ECONNREFUSED" ||
      error.message?.includes("ECONNREFUSED")
    ) {
      console.error("서버 연결 실패:", error);
    } else if (status === 403) {
      console.error("권한 없음 (403):", originalRequest?.url);
      // alert("권한이 없습니다. 다시 로그인 해주세요.");
    } else if (status === 404) {
      console.error("페이지를 찾을 수 없음 (404):", originalRequest?.url);
      // alert("요청하신 페이지를 찾을 수 없습니다.");
    } else if (status >= 500) {
      console.error("서버 오류 (5xx):", status, originalRequest?.url);
      // alert("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } else if (!status) {
      console.error("네트워크 오류:", error.message);
      // alert("네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.");
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
