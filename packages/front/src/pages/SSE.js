import React, {useEffect, useState} from 'react';

function SSE(props) {
	const [events, setEvents] = useState([]);
	const [eventSource, setEventSource] = useState(null);
	const [isConnected, setIsConnected] = useState(true); // 연결 상태를 관리하는 상태 추가

	useEffect(() => {
		const source = new EventSource('http://localhost:3001/events');
		setEventSource(source);

		source.onmessage = (event) => {
			const newEvent = JSON.parse(event.data);
			setEvents((prevEvents) => [...prevEvents, newEvent]);
		};

		source.onerror = () => {
			setIsConnected(false); // 오류 발생 시 연결이 끊어진 것으로 처리
		};

		return () => {
			source.close(); // 컴포넌트가 언마운트될 때 SSE 연결 닫기
		};
	}, []);

	const disconnectSSE = () => {
		if (eventSource) {
			eventSource.close(); // SSE 연결 닫기
			setEventSource(null);
			setIsConnected(false); // 연결 상태 업데이트
		}
	};

	return (
		<div>
			<h1>Server-Sent Events</h1>
			<button onClick={disconnectSSE} disabled={!isConnected}>
				Disconnect SSE
			</button>{' '}
			{/* SSE 연결 끊기 버튼 */}
			<p>{isConnected ? 'Connected' : 'Disconnected'}</p> {/* 연결 상태 표시 */}
			<ul>
				{events.map((event, index) => (
					<li key={index}>{event.message}</li>
				))}
			</ul>
		</div>
	);
}

export default SSE;
