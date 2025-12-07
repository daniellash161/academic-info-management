import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// 1. האם השורה הזו קיימת?
import { BrowserRouter } from 'react-router-dom' 
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* 2. האם App עטוף בתוך זה? חובה! */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)