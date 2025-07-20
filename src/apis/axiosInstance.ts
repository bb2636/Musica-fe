import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

// 🔄 토큰 갱신 상태 관리
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

// 🔄 토큰 갱신 대기 중인 요청들을 처리하는 함수
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

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  console.log("🚨 interceptor에서 가져온 accessToken:", token);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    //console.log('[axiosInstance] Authorization 헤더 주입됨:', config.headers.Authorization); // 로그 4
    }
  //   else {
  //     console.warn('[axiosInstance] 토큰 없음, Authorization 미주입됨');
  // }
  return config;
});

// ✅ 공통 에러 처리 + 자동 재발급 (개선된 버전)
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // ✅ refresh 자체가 실패하면 무한루프 방지
      if (originalRequest.url?.includes("/auth/refresh")) {
        onRefreshFailed();
        return Promise.reject(error);
      }

      // 🔄 이미 토큰 갱신 중이면 대기열에 추가
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

        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        // 🔄 refresh 요청 시 axios 인스턴스 사용하지 않고 직접 요청
        const res = await axios.post(
          "/api/auth/refresh",
          {
            refreshToken: refreshToken,
          },
          {
            withCredentials: true,
          }
        );

        const newAccessToken = res.data.accessToken;
        const newRefreshToken = res.data.refreshToken; // 새로운 refresh token도 받는 경우

        // 🔐 새 토큰들 저장
        localStorage.setItem("accessToken", newAccessToken);
        if (newRefreshToken) {
          localStorage.setItem("refreshToken", newRefreshToken);
        }

        // ✅ 대기 중인 요청들에 새 토큰 적용
        onRefreshed(newAccessToken);

        // 원래 요청 재시도
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

    // ✅ 그 외 에러 공통 처리
    const status = error.response?.status;

    // 🚨 백엔드 서버 연결 실패 처리
    if (
      error.code === "ECONNREFUSED" ||
      error.message?.includes("ECONNREFUSED")
    ) {
      console.error("백엔드 서버 연결 실패:", error);
      // 서버 연결 실패시에는 로그아웃하지 않고 에러만 표시
      if (!originalRequest.url?.includes("/auth")) {
        // 인증 관련 요청이 아닌 경우에만 에러 표시
        // alert("서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.");
      }
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
