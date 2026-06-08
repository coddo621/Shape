import path from "path"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")
  const backendUrl = env.VITE_API_BASE_URL || "http://localhost:5000"

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      host: true,
      port: 5173,
      proxy: {
        "/login": { target: backendUrl, changeOrigin: true, secure: false },
        "/signup": { target: backendUrl, changeOrigin: true, secure: false },
        "/logout": { target: backendUrl, changeOrigin: true, secure: false },
        "/me": { target: backendUrl, changeOrigin: true, secure: false },
        "/user": { target: backendUrl, changeOrigin: true, secure: false },
        "/api/forms": { target: backendUrl, changeOrigin: true, secure: false },
        "/api/responses": { target: backendUrl, changeOrigin: true, secure: false },
        "/api/share": { target: backendUrl, changeOrigin: true, secure: false },
      },
    },
  }
})

