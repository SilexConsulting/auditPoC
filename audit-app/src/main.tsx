import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Import GDS initialization
import { initGDS } from './utils/gdsInit'

// Import GDS styles
import 'govuk-frontend/dist/govuk/govuk-frontend.min.css'

// Initialize GDS components
initGDS();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
