import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './components/Auth/Login'
import Register from './components/Auth/Register'
import Dashboard from './components/Dashboard/Dashboard'
import VideoCall from './components/VideoCall/VideoCall'
import Challenges from './components/Challenges/Challenges'
import Inbox from './pages/Inbox'
import Header from './components/Common/Header'
import { AuthProvider } from './context/AuthContext'
import './assets/styles/variables.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<><Header /><Dashboard /></>} />
            <Route path="/call/:roomId" element={<VideoCall />} />
            <Route path="/challenges" element={<><Header /><Challenges /></>} />
            <Route path="/inbox" element={<><Header /><Inbox /></>} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
