import { cloudflare } from '@cloudflare/vite-plugin'
import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
	return {
		plugins: [cloudflare(), react()],
		server: {
			proxy: {
				'/api': {
					target: 'http://localhost:3001',
					changeOrigin: true,
					secure: false,
				},
				'/generate': {
					target: 'http://localhost:8787',
					changeOrigin: true,
					secure: false,
				},
				'/stream': {
					target: 'http://localhost:8787',
					changeOrigin: true,
					secure: false,
				}
			}
		}
	}
})
