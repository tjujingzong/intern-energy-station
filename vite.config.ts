import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 部署到 GitHub Pages 时使用 /<repo>/ 作为 base，本地开发用 /
const repo = 'intern-energy-station';

export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? `/${repo}/` : '/',
  server: {
    port: 5173,
    host: true,
  },
}));
