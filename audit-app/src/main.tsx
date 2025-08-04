import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Import GDS styles
import 'govuk-frontend/dist/govuk/govuk-frontend.min.css'

// Import GDS initialization
import { initGDS } from './utils/gdsInit'

// Initialize GDS components
initGDS();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
