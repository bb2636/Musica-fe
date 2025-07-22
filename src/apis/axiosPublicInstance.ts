// src/apis/axiosPublicInstance.ts
import axios from "axios";

const axiosPublicInstance = axios.create({
  baseURL: "/api", // ✅ 프록시 경유로 통일
  withCredentials: true, // 필요 시 (ex. 쿠키 기반 인증 서버)
});

export default axiosPublicInstance;
