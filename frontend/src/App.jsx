import { useState } from 'react'

import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className="App">
        <h1 className="text-4xl font-bold underline text-fuchsia-700">
          Hello world!
        </h1>
        <p className="text-lg text-gray-600">
          This is a sample React application with Tailwind CSS.
        </p>
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => setCount(count + 1)}
        >
          Count: {count}
        </button>
      </div>
    </>
  )
}

export default App
