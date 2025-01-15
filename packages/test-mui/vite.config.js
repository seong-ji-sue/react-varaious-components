import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {createHtmlPlugin} from 'vite-plugin-html';
import federation from '@originjs/vite-plugin-federation';
import mkcert from 'vite-plugin-mkcert';

export default defineConfig(({mode}) => {
	const isAnalyze = process.env.ANALYZE === 'true';

	return {
		base: './', // 상대 경로 사용
		build: {
			sourcemap: mode === 'development' ? 'inline' : false,
			outDir: 'dist',
			rollupOptions: {
				input: './src/main.js', // 진입 파일 경로 수정
				output: {
					entryFileNames: 'bundle.js', // 빌드된 파일 이름 지정
					chunkFileNames: '[name].js',
					assetFileNames: '[name].[ext]',
				},
			},
		},
		define: {
			'process.env.NODE_ENV': JSON.stringify(mode),
		},
		optimizeDeps: {
			include: ['react', 'react-dom'],
		},
		esbuild: {
			loader: 'jsx',
			include: /.*\.jsx?$/, // .js와 .jsx 파일 모두 처리
		},
		plugins: [
			react(),
			mkcert(),
			createHtmlPlugin({
				inject: {
					data: {
						title: 'Vite Module Federation App',
					},
				},
			}),
			federation({
				name: 'mui',
				filename: 'remoteEntry.js',
				exposes: {
					'./Page': './src/Page.js',
					'./ExPage': './src/ExPage.js',
				},
				shared: {
					react: {
						singleton: true,
						eager: true,
					},
					'react-dom': {
						singleton: true,
						eager: true,
					},
				},
			}),
		],
		server: {
			host: '0.0.0.0',
			port: 4002,
			open: true,
			cors: {
				origin: '*',
			},
		},
	};
});
