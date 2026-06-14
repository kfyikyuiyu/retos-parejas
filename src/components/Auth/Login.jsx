import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './Login.css'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="auth-circles">
          <div className="circle circle-1"></div>
          <div className="circle circle-2"></div>
          <div className="circle circle-3"></div>
        </div>
      </div>
      <div className="auth-card fade-in">
        <div className="auth-header">
          <div className="auth-logo">
            <span className="logo-icon">💑</span>
            <h1>Retos en Pareja</h1>
          </div>
          <p className="auth-subtitle">Fortalece tu relación con desafíos divertidos</p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-alert"><span className="error-icon">⚠️</span>{error}</div>}
          <div className="input-group">
            <label className="input-label">Correo Electrónico</label>
            <div className="input-wrapper">
              <span className="input-icon">📧</span>
              <input type="email" className="input-field" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading} />
            </div>
          </div>
          <div className="input-group">
            <label className="input-label">Contraseña</label>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input type={showPassword ? 'text' : 'password'} className="input-field" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isLoading} />
              <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>{showPassword ? '👁️' : '👁️‍🗨️'}</button>
            </div>
          </div>
          <div className="form-options">
            <label className="checkbox-label"><input type="checkbox" /><span>Recordarme</span></label>
            <Link to="/forgot-password" className="forgot-link">¿Olvidaste tu contraseña?</Link>
          </div>
          <button type="submit" className="btn btn-primary submit-btn" disabled={isLoading}>
            {isLoading ? <><span className="spinner"></span> Iniciando sesión...</> : 'Iniciar Sesión'}
          </button>
          <div className="auth-divider"><span>o continúa con</span></div>
          <div className="social-buttons">
            <button type="button" className="btn social-btn google-btn"><span>G</span> Google</button>
            <button type="button" className="btn social-btn facebook-btn"><span>f</span> Facebook</button>
          </div>
          <p className="auth-footer">¿No tienes una cuenta? <Link to="/register" className="auth-link">Crear cuenta</Link></p>
        </form>
      </div>
    </div>
  )
}

export default Login