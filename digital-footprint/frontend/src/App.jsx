import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'
import NavBar from './NavBar'
import Hero from './Hero'
import Scan from './Scan'
import Tips from './Tips'
import Privacy from './Privacy'

function Home() {
  return (
    <>
      <Hero />
      <Scan />
      <Tips />
    </>
  )
}

function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/privacy" element={<Privacy />} />
      </Routes>
    </Router>
  )
}

export default App
