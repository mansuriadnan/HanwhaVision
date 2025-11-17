import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "../src/css/index.css";
import "../src/css/dark-theme.css";
import "../src/css/sidebar.css"
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
