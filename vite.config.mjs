import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { SvelteKitPWA } from 'vite-plugin-pwa';

export default defineConfig({
    plugins: [
        sveltekit(),
        SvelteKitPWA({
            strategies: 'generateSW',
            manifest: { 
                // We use a placeholder here, but we will override this 
                // by providing a static manifest.json for better control.
                name: 'Lumina Manager', short_name: 'Lumina' 
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'google-fonts-cache',
                            expiration: {
                                maxEntries: 10,
                                maxAgeSeconds: 60 * 60 * 24 * 365 // < 1 year
                            },
                            cacheableResponse: {
                                statuses: [0, 200]
                            }
                        }
                    },
                    {
                        urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'cdn-cache',
                            expiration: {
                                maxEntries: 20,
                                maxAgeSeconds: 60 * 60 * 24 * 30 // < 30 days
                            }
                        }
                    }
                ]
            }
        })
    ]
});
