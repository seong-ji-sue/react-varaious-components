const {createProxyMiddleware} = require('http-proxy-middleware');

module.exports = (app) => {
	app.use(
		createProxyMiddleware('/server', {
			target: process.env.BFF_SERVER_URL,
			changeOrigin: true,
			exposedHeaders: ['*'],
		}),
	);
};
