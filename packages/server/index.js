import express from 'express';
import cors from 'cors';
import {testFunc} from '@jsproject/common';

const app = express();
const port = process.env.NODE_SERVER_PORT;

app.use(cors({origin: '*', credentials: true}));

app.get('/', (req, res) => {
	res.send('Hello from backend!');
});

app.listen(port, () => {
	console.log(`Backend server is running at http://localhost:${port}`);
	console.log(testFunc());
});
