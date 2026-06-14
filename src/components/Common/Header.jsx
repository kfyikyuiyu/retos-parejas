import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './Header.css'

const Header = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <header className="main-header">
      <div className="header-container">
        <div className="header-left">
          <div className="header-logo" onClick={() => navigate('/dashboard')}>
            <span className="logo-icon">💑</span>
            <span className="logo-text">Retos en Pareja</span>
          </div>
        </div>
        <nav className="header-nav">
          <button className={`nav-btn ${location.pathname === '/dashboard' ? 'active' : ''}`} onClick={() => navigate('/dashboard')}><span className="nav-icon">🏠</span><span>Inicio</span></button>
          <button className={`nav-btn ${location.pathname === '/challenges' ? 'active' : ''}`} onClick={() => navigate('/challenges')}><span className="nav-icon">🎯</span><span>Retos</span></button>
          <button className={`nav-btn ${location.pathname === '/inbox' ? 'active' : ''}`} onClick={() => navigate('/inbox')}><span className="nav-icon">📬</span><span>Buzón</span></button>
        </nav>
        <div className="header-right">
          <div className="user-info">
            <div className="user-avatar">{user?.name?.charAt(0) || 'U'}</div>
            <div className="user-details"><span className="user-name">{user?.name || 'Usuario'}</span><span className="user-status">En línea</span></div>
          </div>
          <div className="header-actions">
            <button className="icon-btn" title="Notificaciones">🔔<span className="notification-badge">3</span></button>
            <button className="btn-logout" onClick={handleLogout} title="Cerrar sesión">🚪</button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header