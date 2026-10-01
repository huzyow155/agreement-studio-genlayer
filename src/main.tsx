import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './App'
import { WalletProvider } from './context/WalletContext'
import { TransactionProvider } from './context/TransactionContext'
import { ThemeProvider } from './context/ThemeContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <WalletProvider>
        <TransactionProvider>
          <App />
        </TransactionProvider>
      </WalletProvider>
    </ThemeProvider>
  </StrictMode>,
)
