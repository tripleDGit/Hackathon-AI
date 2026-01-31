import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

// https://vitejs.dev/config/
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    plugins: [
        react(),
        {
            name: 'api-logger',
            configureServer(server) {
                server.middlewares.use((req: { url?: string; method?: string; on?: (event: string, handler: (...args: unknown[]) => void) => void }, res, next) => {
                    if (req.url === '/__api_log' && req.method === 'POST') {
                        let body = '';
                        req.on('data', (chunk: Buffer) => body += chunk);
                        req.on('end', () => {
                            try {
                                const { level, message, data, timestamp } = JSON.parse(body);
                                const colors = {
                                    INFO: '\x1b[36m',    // Cyan
                                    SUCCESS: '\x1b[32m', // Green
                                    ERROR: '\x1b[31m',   // Red
                                    WARN: '\x1b[33m',    // Yellow
                                };
                                const color = colors[level as keyof typeof colors] || '\x1b[0m';
                                const reset = '\x1b[0m';
                                
                                console.log(`${color}[API ${level}]${reset} ${timestamp} - ${message}`);
                                if (data && Object.keys(data).length > 0) {
                                    console.log(`${color}  └─${reset}`, JSON.stringify(data, null, 2));
                                }
                            } catch (e) {
                                // Invalid JSON, ignore
                            }
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end('{}');
                        });
                        return; // Don't call next() for this route
                    }
                    next(); // Always call next() for other routes
                });
            },
        },
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        port: 3000,
        open: true,
    },
})
