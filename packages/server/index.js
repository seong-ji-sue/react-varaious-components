import express from 'express';
import {testFunc} from '@jsproject/common';
import cors from 'cors';
import axios from 'axios';

const app = express();
const port = 3001;

app.use(cors({origin: '*', credentials: true}));

app.use(express.json()); // 요청에서 JSON 데이터 파싱을 허용

// 클라이언트가 웹훅을 등록하는 엔드포인트
let webhookUrl = '';

app.post('/register-webhook', (req, res) => {
	webhookUrl = req.body.url; // 클라이언트가 제공한 웹훅 URL 저장
	res.send('Webhook URL registered'); // 등록 확인 메시지 전송
});

// 서버가 웹훅을 트리거하는 엔드포인트
app.post('/trigger-webhook', (req, res) => {
	if (webhookUrl) {
		axios
			.post(webhookUrl, {event: 'test_event', data: req.body}) // 저장된 웹훅 URL로 POST 요청 전송
			.then((response) => {
				res.send('Webhook triggered'); // 성공 메시지 전송
			})
			.catch((error) => {
				res.status(500).send('Failed to trigger webhook'); // 오류 메시지 전송
			});
	} else {
		res.status(400).send('No webhook URL registered'); // 웹훅 URL이 등록되지 않은 경우
	}
});

// 클라이언트에서 웹훅 데이터를 처리하는 엔드포인트
app.post('/webhook-handler', (req, res) => {
	console.log('Webhook data received:', req.body); // 수신한 웹훅 데이터 콘솔 출력
	res.status(200).send('Webhook data received'); // 성공 메시지 전송
});

app.get('/events', (req, res) => {
	res.setHeader('Content-Type', 'text/event-stream'); // SSE 스트림 응답 설정
	res.setHeader('Cache-Control', 'no-cache'); // 캐시 비활성화
	res.setHeader('Connection', 'keep-alive'); // 연결 유지 설정

	const sendEvent = (data) => {
		res.write(`data: ${JSON.stringify(data)}\n\n`); // 클라이언트로 이벤트 데이터 전송
	};

	sendEvent({message: 'Connection established'}); // 클라이언트에게 초기 메시지 전송

	const intervalId = setInterval(() => {
		sendEvent({message: 'Hello from server'}); // 5초마다 서버에서 클라이언트로 메시지 전송
	}, 2000);

	req.on('close', () => {
		clearInterval(intervalId); // 연결이 닫히면 인터벌 중지
		res.end(); // 응답 종료
	});
});
app.get('/', (req, res) => {
	res.send('Hello from backend!');
});

app.listen(port, () => {
	console.log(`Backend server is running at http://localhost:${port}`);
	console.log(testFunc());
});
