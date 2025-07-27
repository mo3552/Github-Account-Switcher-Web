import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import electron from 'vite-plugin-electron';
import renderer from 'vite-plugin-electron-renderer';
import { resolve } from 'path';

export default defineConfig({
	plugins: [
		vue(),
		// Electron 플러그인 (개발 및 프로덕션 모두)
		electron([
			{
				entry: 'electron/main.ts',
				onstart(options) {
					if (process.env.VSCODE_DEBUG) {
						console.log('[startup] Electron App');
					} else if (
						process.env.IS_DEV ||
						process.env.NODE_ENV === 'development'
					) {
						options.startup();
					}
				},
				vite: {
					build: {
						sourcemap: process.env.NODE_ENV === 'development',
						minify: process.env.NODE_ENV === 'production',
						outDir: 'dist-electron',
						rollupOptions: {
							external: ['electron'],
						},
					},
				},
			},
			{
				entry: 'electron/preload.ts',
				onstart(options) {
					if (
						process.env.IS_DEV ||
						process.env.NODE_ENV === 'development'
					) {
						options.reload();
					}
				},
				vite: {
					build: {
						sourcemap:
							process.env.NODE_ENV === 'development'
								? 'inline'
								: false,
						minify: process.env.NODE_ENV === 'production',
						outDir: 'dist-electron',
						rollupOptions: {
							external: ['electron'],
						},
					},
				},
			},
		]),
		renderer(),
	],
	resolve: {
		alias: {
			'@': resolve(__dirname, 'src'),
		},
	},
	build: {
		outDir: 'dist',
		emptyOutDir: true,
	},
});
