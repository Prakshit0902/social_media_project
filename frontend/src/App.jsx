import { useState } from 'react'

import './App.css'
import { NavBar } from './components/NavBar/NavBar'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <div>
      <NavBar/>
    </div>
    </>
  )
}

export default App
