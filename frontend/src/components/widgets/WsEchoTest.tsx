import React, { useState } from 'react';
import { useWebSocket } from '../../hooks/useWebSocket';

const WsEchoTest = () => {
    const [input, setInput] = useState('');

    const { isConnected, messages, sendMessage } = useWebSocket('ws://localhost:8000/ws/echo/', {
        token: 'your-auth-token-here',             // ← 여기에 실제 JWT 토큰 또는 API 토큰 삽입
        subscribeTopics: ['echo_channel'],         // ← 서버에서 처리하는 채널 이름에 맞게 설정
        reconnectInterval: 3000,
        pingInterval: 10000,
    });

    const handleSend = () => {
        if (input.trim()) {
            sendMessage(input.trim());
            setInput('');
        }
    };

    return (
        <div>
            <h2>Echo WebSocket Test</h2>
            <p>Status: <strong style={{ color: isConnected ? 'green' : 'red' }}>
                {isConnected ? 'Connected' : 'Disconnected'}
            </strong></p>

            <div>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Enter message"
                />
                <button onClick={handleSend} disabled={!isConnected}>
                    Send
                </button>
            </div>

            <div>
                <h3>Received Messages:</h3>
                <ul>
                    {messages.map((msg, index) => (
                        <li key={index}>{msg}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default WsEchoTest;
