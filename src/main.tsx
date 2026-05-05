import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

// Suppress sticky hover on hybrid touch+mouse devices.
// After a touch, add `using-touch` to <html> to disable :hover styles.
// Only remove it once the mouse genuinely moves (500ms after last touch).
let lastTouchTime = 0
document.addEventListener('touchstart', () => {
  lastTouchTime = Date.now()
  document.documentElement.classList.add('using-touch')
}, { passive: true })
document.addEventListener('pointermove', (e) => {
  if (e.pointerType === 'mouse' && Date.now() - lastTouchTime > 500) {
    document.documentElement.classList.remove('using-touch')
  }
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
