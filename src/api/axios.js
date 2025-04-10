import axios from "axios";

// axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: "https://kb-json.onrender.com",
  timeout: 5000, // 5초
});

export default apiClient;
