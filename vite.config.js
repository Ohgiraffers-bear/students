import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },

  server: {
    proxy: {
      "/api": {
        // 로컬 서버
        // target: 'http://localhost:3000',

        // 외부(Glitch) 서버로 target 변경
        target: "https://paint-speckle-kumquat.glitch.me",
        // changeOrigin: true는 호스트 헤더를 target URL의 호스트로 변경합니다.
        // 이는 CORS 이슈를 방지하고 서버가 요청을 정상적으로 처리할 수 있게 합니다.
        // 특히 외부 API 서버에 요청을 보낼 때 필요한 설정입니다.
        changeOrigin: true,
        // rewrite 옵션은 프록시 요청의 경로를 재작성합니다.
        // 클라이언트에서 '/api/students'로 요청하면 서버에는 '/students'로 전달됩니다.
        // 이는 API 경로의 일관성을 유지하면서 프록시를 통해 요청을 전달할 수 있게 합니다.
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
