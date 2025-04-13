
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { disableScrollRestoration } from './utils/scrollFix'
import { UserProvider } from './context/UserContext'
import { ChatProvider } from './context/ChatContext'
import { Toaster } from 'sonner'

// Disable automatic scroll restoration globally
disableScrollRestoration();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <UserProvider>
        <ChatProvider>
          <App />
          <Toaster position="top-right" />
        </ChatProvider>
      </UserProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
