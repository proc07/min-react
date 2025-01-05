import { useReducer, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  // useReducer setValue 不变的情况下还是会触发组件 render，而 useState 不会
  const [count2, setCount2] = useReducer((x, n) => x + n, 0)
  const [count, setCount] = useState(0)

  console.log('App render', count2, count)

  const [data] = useState(new Array(20000).fill(1))

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount2(0)}>
          count2 is {count2}
        </button>
        <button onClick={() => setCount(0)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      {
        data.map(n => <div>
          <div>
            <div>n</div>
          </div>
          <div>
          <div>n</div>
          </div>
          <div>
          <div>{n}</div>
          </div>
        </div>)
      }
    </>
  )
}

export default App
