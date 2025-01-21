import { useReducer } from '../../packages/react'
import './App.css'

function App() {
  const [count, setCount] = useReducer((x) => {
    return x + 1
  }, 0)

  console.log('App render', count)

  return (
    <div >
      {/* <h1 className={`count-${count}`}>useReducer Function</h1> */}
      { count % 2 === 0 ? <h2 onClick={() => setCount()}>偶数</h2> : <h1 onClick={() => setCount()}>奇数</h1> }
      {/* <button onClick={() => setCount()}>
          {count}
        </button> */}
    </div>
  )
}

function FunctionComponent() {
  const [count1, setCount1] = useReducer((x) => x + 1, 0);
  const arr = count1 % 2 === 0 ? [0, 1, 2, 3, 4] : [0, 1, 2, 3];
  // 0 删除
  return (
    <div className="border">
      <h3>函数组件</h3>
      <button onClick={() => { setCount1(); }}>
        {count1}
      </button>
      <ul>
        {arr.map((item) => (
          <li key={"li" + item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export default FunctionComponent
