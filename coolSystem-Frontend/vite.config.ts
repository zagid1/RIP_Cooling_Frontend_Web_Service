// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import mkcert from 'vite-plugin-mkcert'
// mkcert отключён для Tauri

export default defineConfig(({ command, mode }) => {
  const isTauri = process.env.VITE_TARGET === 'tauri';
  
  return {
    base: command === 'build'
      ? (isTauri ? './' : '/RIP_Frontend_Web_Service/')
      : '/',
    plugins: [
      react(),
      // VitePWA({
      //   registerType: 'autoUpdate',
      //   devOptions: { enabled: true },
      //   manifest: {
      //     name: "CoolSystems",
      //     short_name: "CoolSystems",
      //     description: "Сервис для определения необходимой системы охлаждения.",
      //     start_url: "/",
      //     display: "standalone",
      //     background_color: "#ffffff",
      //     theme_color: "#06388dff",
      //     icons: [
      //       { src: "/logo/logo32.png", type: "image/png", sizes: "32x32" },
      //       { src: "/logo/logo192.png", type: "image/png", sizes: "192x192", purpose: "any maskable" },
      //       { src: "/logo/logo512.png", type: "image/png", sizes: "512x512", purpose: "any maskable" }
      //     ]
      //   }
      // })
    ],
    server: {
      host: '0.0.0.0',
      port: 3000,
      proxy: {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
        },
      },
    },
  }
})