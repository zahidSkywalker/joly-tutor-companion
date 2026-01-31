import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa'; // FIXED: Changed SvelteKitPWA to VitePWA

export default defineConfig({
    plugins: [
        sveltekit(),
        VitePWA({ // FIXED: Changed SvelteKitPWA to VitePWA
            strategies: 'generateSW',
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: { cacheName: 'google-fonts', expiration: { maxEntries: 10 } }
                    },
                    {
                        urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/.*/i,
                        handler: 'CacheFirst',
                        options: { cacheName: 'cdn-cache', expiration: { maxEntries: 20 } }
                    }
                ]
            }
        })
    ]
});
