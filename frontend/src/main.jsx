// src/main.jsx (ESM 사용)
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';  // Tailwind CSS 적용
import App from './App';

// React 18의 새로운 API 사용
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
