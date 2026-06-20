import {
  Routes,
  Route
} from "react-router-dom";
import './App.css'
import {HomePage} from './pages/home.jsx'
import { Login } from './pages/login.jsx'
import { Register } from './pages/register.jsx'

function App() {

  return (
    <Routes>
      <Route path="/" element={<HomePage/>}/>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  )
}

export default App
