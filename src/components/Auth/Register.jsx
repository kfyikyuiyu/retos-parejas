import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './Register.css'

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '', partnerEmail: '' })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (formData.password !== formData.confirmPassword) { setError('Las contraseñas no coinciden'); return }
    setIsLoading(true)
    try {
      await register(formData.name, formData.email, formData.password, formData.partnerEmail)
      navigate('/dashboard')
    } catch (err) { setError(err.message) }
    finally { setIsLoading(false) }
  }

  return (
    <div className="auth-container">
      <div className="auth-background"><div className="auth-circles"><div className="circle circle-1"></div><div className="circle circle-2"></div><div className="circle circle-3"></div></div></div>
      <div className="auth-card fade-in">
        <div className="auth-header">
          <div className="auth-logo"><span className="logo-icon">💑</span><h1>Crear Cuenta</h1></div>
          <p className="auth-subtitle">Únete y comienza la aventura con tu pareja</p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-alert"><span className="error-icon">⚠️</span>{error}</div>}
          <div className="input-group"><label className="input-label">Nombre Completo</label><div className="input-wrapper"><span className="input-icon">👤</span><input type="text" name="name" className="input-field" placeholder="Tu nombre" value={formData.name} onChange={handleChange} required disabled={isLoading} /></div></div>
          <div className="input-group"><label className="input-label">Correo Electrónico</label><div className="input-wrapper"><span className="input-icon">📧</span><input type="email" name="email" className="input-field" placeholder="tu@email.com" value={formData.email} onChange={handleChange} required disabled={isLoading} /></div></div>
          <div className="input-group"><label className="input-label">Contraseña</label><div className="input-wrapper"><span className="input-icon">🔒</span><input type="password" name="password" className="input-field" placeholder="Mínimo 6 caracteres" value={formData.password} onChange={handleChange} required disabled={isLoading} /></div></div>
          <div className="input-group"><label className="input-label">Confirmar Contraseña</label><div className="input-wrapper"><span className="input-icon">🔒</span><input type="password" name="confirmPassword" className="input-field" placeholder="Repite tu contraseña" value={formData.confirmPassword} onChange={handleChange} required disabled={isLoading} /></div></div>
          <div className="input-group"><label className="input-label">Correo de tu Pareja <span className="optional">(opcional)</span></label><div className="input-wrapper"><span className="input-icon">💕</span><input type="email" name="partnerEmail" className="input-field" placeholder="pareja@email.com" value={formData.partnerEmail} onChange={handleChange} disabled={isLoading} /></div></div>
          <button type="submit" className="btn btn-primary submit-btn" disabled={isLoading}>{isLoading ? <><span className="spinner"></span> Creando cuenta...</> : 'Crear Cuenta'}</button>
          <p className="auth-footer">¿Ya tienes una cuenta? <Link to="/" className="auth-link">Iniciar Sesión</Link></p>
        </form>
      </div>
    </div>
  )
}

export default Register