import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import {testFunc} from '@jsproject/common';
import {resolve} from 'path';
import * as dotenv from 'dotenv';
import * as path from 'path';
import router from './routers/index.js';

const app = express();
const __dirname = resolve();

dotenv.config({
	path: path.join(__dirname, `../../.env.${process.env.BFF_SERVER__URL}`),
});

const PORT = process.env.BFF_SERVER_PORT;

app.use(cors({origin: '*', credentials: true}));

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(function (req, res, next) {
	res.setHeader(
		'Access-Control-Allow-Methods',
		'GET, POST, OPTIONS, PUT, PATCH, DELETE',
	);
	res.setHeader('Access-Control-Expose-Headers', 'Content-Range');

	next();
});

app.use('/server', router);

app.use((err, req, res, next) => {
	console.log('err', err);
	console.log('err.config', err.config); //params 확인

	res.status(err?.response?.status || 500).send(err?.response?.data);
});

app.listen(PORT, () => {
	console.log(`Backend server is running at http://localhost:${PORT}`);
	console.log(testFunc());
});
