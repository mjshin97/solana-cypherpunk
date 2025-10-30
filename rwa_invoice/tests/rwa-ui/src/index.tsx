import React from 'react';
import ReactDOM from 'react-dom/client';

// 🚨 여기가 수정되었습니다!
import './index.css'; // <- Tailwind 코드가 있는 'index.css'를 불러옵니다.

import App from './App'; // App.tsx의 AppWithProvider를 불러옵니다.
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
