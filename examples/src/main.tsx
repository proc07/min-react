import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
import { createRoot } from '../../packages/react-dom/client'
import './index.css'
import App from './App.tsx'

const jsx = (
  <div className='parent'>
    <h1 className='child-1'></h1>
    1233
    <h2 className='child-2'></h2>
    child-3
  </div>
)
console.log('jsx', jsx)
createRoot(document.getElementById('root')!).render(jsx)

// createRoot(document.getElementById('root')!).render(
//   <StrictMode>
//     <App />
//   </StrictMode>,
// )
