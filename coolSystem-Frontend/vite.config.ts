import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // Указываем порт для фронтенда
    proxy: {
      // Проксируем запросы /api на ваш бэкенд
      '/api': {
        target: 'http://localhost:8080', // Адрес вашего Go-сервиса
        changeOrigin: true, // Необходимо для виртуальных хостов
        // rewrite: (path) => path.replace(/^\/api/, '') // В вашем случае это не нужно, т.к. бэкенд ожидает /api
      },
    },
  },
})