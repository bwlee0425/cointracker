// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';  // 기본 export로 가져오기
import { RecoilRoot } from 'recoil';

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
    <React.StrictMode>
        <RecoilRoot>
            <App />
        </RecoilRoot>
    </React.StrictMode>
);
