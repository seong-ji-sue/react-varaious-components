module.exports = {
	env: {
		browser: true,
		es2021: true,
	},
	extends: ['eslint:recommended', 'plugin:react/recommended'],
	overrides: [
		{
			env: {
				node: true,
			},
			files: ['.eslintrc.{js,cjs}'],
			parserOptions: {
				sourceType: 'script',
			},
		},
	],
	parserOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module',
	},
	plugins: ['react'],
	rules: {
		'react/react-in-jsx-scope': 'off', // 이 줄을 추가하여 규칙을 비활성화
		'no-unused-vars': 'off', //_ 활성화
	},
	settings: {
		react: {
			version: 'detect', // React 버전을 자동으로 감지
		},
	},
};
