import express from 'express';
import {testFunc} from '@jsproject/common';
import cors from 'cors';

const app = express();
const port = 3001;

app.use(cors({origin: '*', credentials: true}));

app.get('/', (req, res) => {
	res.send('Hello from backend!');
});

app.listen(port, () => {
	console.log(`Backend server is running at http://localhost:${port}`);
	console.log(testFunc());
});
