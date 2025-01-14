import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import {terser} from 'rollup-plugin-terser';
import replace from '@rollup/plugin-replace';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';
import {babel} from '@rollup/plugin-babel';
import html from '@rollup/plugin-html';
import url from '@rollup/plugin-url';
import {visualizer} from 'rollup-plugin-visualizer';
import analyzer from 'rollup-plugin-analyzer';
import dotenv from 'dotenv';
import postcss from 'rollup-plugin-postcss';

dotenv.config({path: `../../config/.env.${process.env.NODE_ENV}`});
const NODE_ENV = process.env.NODE_ENV || 'development';
const isAnalyze = process.env.ANALYZE === 'true';

export default {
	input: './src/index.js',
	output: {
		dir: 'dist',
		format: 'esm', // 브라우저가 인식할 수 있는 ESM 포맷
		sourcemap: NODE_ENV === 'development' ? 'inline' : true,
		manualChunks(id) {
			if (id.includes('node_modules')) {
				return 'vendor'; // 외부 모듈은 'vendor'로 분리
			}
		},
	},
	plugins: [
		replace({
			preventAssignment: true,
			'process.env.NODE_ENV': JSON.stringify(NODE_ENV),
		}),
		babel({
			babelrc: true,
			exclude: 'node_modules/**',
			babelHelpers: 'bundled',
		}),
		resolve(),
		commonjs(),
		url({
			include: ['**/*.jpg', '**/*.png', '**/*.svg'],
			limit: 25000,
		}),
		postcss({
			minimize: NODE_ENV === 'production',
		}),
		html({
			fileName: 'index.html',
			title: 'React App',
			template: ({files}) => `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="utf-8" />
            <title>React App</title>
          </head>
          <body>
            <div id="root"></div>
            ${files.js.map((file) => `<script type="module" src="${file.fileName}"></script>`).join('\n')}
          </body>
        </html>
      `,
		}),
		NODE_ENV !== 'production' &&
			serve({
				open: true,
				contentBase: 'dist',
				port: 4002,
				historyApiFallback: true,
				headers: {
					'Access-Control-Allow-Origin': '*',
				},
			}),
		NODE_ENV !== 'production' && livereload({watch: 'dist'}),
		NODE_ENV === 'production' && terser(),
		isAnalyze && analyzer({summaryOnly: true}),
		isAnalyze &&
			visualizer({
				open: true, // 브라우저에서 자동으로 열기
				generate: false, // HTML 파일을 생성하지 않음
			}),
	].filter(Boolean),
	treeshake: {
		moduleSideEffects: false,
	},
};
