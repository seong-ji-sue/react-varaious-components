import React, {useState} from 'react';
import axios from 'axios';

function Webhooks(props) {
	const [response, setResponse] = useState('');
	const [webhookData, setWebhookData] = useState(null);

	const registerWebhook = () => {
		axios
			.post('http://localhost:3001/register-webhook', {
				url: 'http://localhost:3001/webhook-handler',
			})
			.then((response) => setResponse('Webhook registered'))
			.catch((error) => setResponse('Failed to register webhook'));
	};

	const triggerWebhook = () => {
		axios
			.post('http://localhost:3001/trigger-webhook', {
				message: 'Hello from client',
			})
			.then((response) =>
				setResponse('Webhook triggered and received response from client'),
			)
			.catch((error) => setResponse('Failed to trigger webhook'));
	};

	const unregisterWebhook = () => {
		axios
			.post('http://localhost:3001/unregister-webhook')
			.then((response) => setResponse('Webhook unregistered'))
			.catch((error) => setResponse('Failed to unregister webhook'));
	};

	return (
		<div>
			<h1>Webhook Example</h1>
			<button onClick={registerWebhook}>Register Webhook</button>
			<button onClick={triggerWebhook}>Trigger Webhook</button>
			<button onClick={unregisterWebhook}>Unregister Webhook</button>{' '}
			{/* 연결 끊기 버튼 */}
			<div>{response}</div>
			{webhookData && (
				<div>
					<h2>Received Webhook Data:</h2>
					<pre>{JSON.stringify(webhookData, null, 2)}</pre>
				</div>
			)}
		</div>
	);
}

export default Webhooks;
