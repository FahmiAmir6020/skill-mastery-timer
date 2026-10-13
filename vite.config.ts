import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({ server: { host: 'localhost', port: 5173, strictPort: true }, plugins: [react(), VitePWA({ registerType: 'autoUpdate', includeAssets: ['icon.svg'], manifest: { name: 'Skill Mastery Timer', short_name: 'Mastery Timer', description: 'Track the hours. Protect the practice. Work toward mastery.', theme_color: '#0b0b0c', background_color: '#0b0b0c', display: 'standalone', icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }] }, workbox: { globPatterns: ['**/*.{js,css,html,svg,woff2}'] } })] });
