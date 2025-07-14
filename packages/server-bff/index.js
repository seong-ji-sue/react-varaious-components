import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import {resolve} from 'path';
import * as dotenv from 'dotenv';
import * as path from 'path';
import router from './routers';

const app = express();
const __dirname = resolve();

dotenv.config({
	path: path.join(__dirname, `../../.env.${process.env.NODE_ENV}`),
});

const PORT = process.env.BFF_SERVER_PORT;

const allowedOrigins = [
	process.env.FRONT_SERVER_URL,
	process.env.MUI_TEST_SERVER_URL,
	process.env.TAILWIND_TEST_SERVER_URL,
	process.env.DIFF_TEST_SERVER_URL,
	process.env.VIEWER_TEST_SERVER_URL,
	process.env.FILE_UPLOAD_TEST_SERVER_URL,
];

app.use(
	cors({
		origin: function (origin, callback) {
			if (!origin || allowedOrigins.includes(origin)) {
				callback(null, true); // 허용
			} else {
				console.warn(`CORS: Origin ${origin} Not Allowed!`);
				callback(new Error('Not allowed by CORS'));
			}
		},
		credentials: true,
		methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'PATCH', 'DELETE'], // 허용할 HTTP 메소드 명시
		exposedHeaders: ['Content-Range'], // Content-Range 노출
	}),
);

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use('/server', router);

app.use((err, req, res, next) => {
	console.log('err', err);
	console.log('err.config', err.config); //params 확인

	res.status(err?.response?.status || 500).send(err?.response?.data);
});

app.listen(PORT, (err) => {
	if (err) {
		console.log(err);
		throw err;
	}
});
