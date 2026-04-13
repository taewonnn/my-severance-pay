import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const isAIT = import.meta.env.VITE_BUILD_TARGET !== 'web'

const renderApp = async () => {
  if (isAIT) {
    const { TDSMobileAITProvider } = await import('@toss/tds-mobile-ait')
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <TDSMobileAITProvider>
          <App />
        </TDSMobileAITProvider>
      </StrictMode>,
    )
  } else {
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
  }
}

renderApp()
