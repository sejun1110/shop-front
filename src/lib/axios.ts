import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:9999",
  withCredentials: true, // ⭐ 세션 쿠키 필수
});

export default api;
