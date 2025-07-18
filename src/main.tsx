import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
// @ts-ignore
import './styles/global.css' // 여기에 연결

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
