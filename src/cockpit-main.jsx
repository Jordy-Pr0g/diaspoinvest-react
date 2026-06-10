import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Cockpit from './Cockpit.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Cockpit />
  </StrictMode>
)
