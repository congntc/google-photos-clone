import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            refresh: true,
        }),
        react(),
        tailwindcss(),
    ],
    resolve: {
        alias: {
            '@': '/resources/js',
        },
    },
    server: {
        host: '0.0.0.0', // Cho phép truy cập từ bên ngoài container
        port: 5173,
        hmr: {
            host: 'localhost', // HMR host cho browser
        },
        watch: {
            usePolling: true, // Cần thiết cho Docker trên Windows
        },
    },
});
