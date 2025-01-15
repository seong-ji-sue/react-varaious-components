const esbuild = require('esbuild');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const isAnalyze = process.env.ANALYZE === 'true';

// 환경 변수 로드
dotenv.config({path: `../../config/.env.${process.env.NODE_ENV}`});

const isProduction = process.env.NODE_ENV === 'production';

esbuild
	.build({
		entryPoints: ['./src/index.js'],
		bundle: true,
		outdir: 'dist',
		format: 'esm',
		target: ['es2020'],
		splitting: true,
		sourcemap: isProduction ? false : 'inline',
		minify: isProduction,
		chunkNames: 'chunks/[name]-[hash]',
		assetNames: 'assets/[name]-[hash]',
		loader: {
			'.js': 'jsx',
			'.ts': 'ts',
			'.tsx': 'tsx',
			'.css': 'css',
			'.png': 'file',
			'.jpg': 'file',
			'.svg': 'file',
		},
		define: {
			'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
		},
		treeShaking: true,
		metafile: true, // 메타파일 생성
		logLevel: 'info',
	})
	.then((result) => {
		if (result.metafile) {
			const metafilePath = path.resolve('dist', 'metafile.json');
			fs.writeFileSync(metafilePath, JSON.stringify(result.metafile, null, 2));
			console.log(`Metafile saved to ${metafilePath}`);

			if (isAnalyze) {
				// 번들 분석 수행
				const {analyzeMetafile} = require('esbuild');
				analyzeMetafile(result.metafile).then((analysis) => {
					console.log('\n--- Bundle Analysis ---');
					console.log(analysis);
				});
			}
		}
		console.log('Esbuild: Build complete!');
	})
	.catch(() => process.exit(1));
