const {createProxyMiddleware} = require('http-proxy-middleware');

module.exports = (app) => {
	app.use(
		createProxyMiddleware('/server', {
			target: process.env.REACT_APP_FRONT_NODE_URL,
			changeOrigin: true,
			exposedHeaders: ['*'],
		}),
	);
};
