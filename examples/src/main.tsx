import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// import { createRoot } from '../../packages/react-dom/client'

// function FuncComp() {
//   return <div>
//     <div>FuncComp</div>
//   </div>
// }

// const frag = (
//   <>
//       <h3>child-3</h3>
//       <h4>child-4</h4>
//     </>
// )
// const jsx = (
//   <div className='parent'>
//     {frag}
//     <h1 className='child-1'></h1>
//     1233
//     <h2 className='child-2'></h2>
//     child-3
//     <FuncComp />
//   </div>
// )
// console.log('jsx', jsx)
// createRoot(document.getElementById('root')!).render(jsx)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
