import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './Dashboard.css'

const Dashboard = () => {
  const { user, setPartnerCode } = useAuth()
  const navigate = useNavigate()
  const [greeting, setGreeting] = useState('')
  const [partnerInput, setPartnerInput] = useState('')
  const [linkMessage, setLinkMessage] = useState('')
  const [stats, setStats] = useState({ myResponses: 0, partnerResponses: 0, challengesDone: 0, streakDays: 0 })

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Buenos días')
    else if (hour < 18) setGreeting('Buenas tardes')
    else setGreeting('Buenas noches')

    const myResponses = JSON.parse(localStorage.getItem(`responses_${user?.code}`) || '[]')
    const partnerResponses = user?.partnerCode ? JSON.parse(localStorage.getItem(`responses_${user.partnerCode}`) || '[]') : []
    const challengesDone = JSON.parse(localStorage.getItem(`challenges_${user?.code}`) || '[]')

    setStats({
      myResponses: myResponses.length,
      partnerResponses: partnerResponses.length,
      challengesDone: challengesDone.length,
      streakDays: Math.floor(Math.random() * 7) + 1
    })
  }, [user])

  const handleLinkPartner = () => {
    if (!partnerInput.trim()) { setLinkMessage('❌ Ingresa un código válido'); return }
    if (partnerInput.trim() === user.code) { setLinkMessage('❌ No puedes vincularte contigo mismo'); return }
    const allUsers = Object.keys(localStorage).filter(key => key.startsWith('user_')).map(key => JSON.parse(localStorage.getItem(key)))
    if (!allUsers.some(u => u.code === partnerInput.trim())) { setLinkMessage('❌ Código no encontrado'); return }
    setPartnerCode(partnerInput.trim())
    setLinkMessage('✅ ¡Pareja vinculada correctamente!')
    setPartnerInput('')
  }

  const startVideoCall = () => {
    const roomId = `room_${Date.now()}`
    if (user?.partnerCode) {
      localStorage.setItem(`activeCall_${user.partnerCode}`, roomId)
    }
    navigate(`/call/${roomId}?initiator=true`)
  }

  const joinPartnerCall = () => {
    if (!user?.partnerCode) return
    const activeRoom = localStorage.getItem(`activeCall_${user.code}`)
    if (activeRoom) {
      navigate(`/call/${activeRoom}?initiator=false`)
    } else {
      alert('No hay videollamada activa de tu pareja en este momento.')
    }
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="welcome-section fade-in">
          <div className="welcome-text">
            <h1>{greeting}, {user?.name?.split(' ')[0] || 'Usuario'}! 👋</h1>
            <p>Tu viaje de amor y conexión continúa hoy</p>
          </div>
          <div className="welcome-date">
            <span className="date-text">
              {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </div>

        <div className="pairing-section fade-in">
          <div className="code-card">
            <div className="code-label">🔑 Tu código único</div>
            <div className="code-value">{user?.code}</div>
            <p className="code-hint">Compártelo con tu pareja para vincularse</p>
          </div>
          <div className="linking-card">
            {user?.partnerCode ? (
              <div className="linked-partner">
                <div className="partner-linked-icon">💑</div>
                <div>
                  <h3>Pareja vinculada</h3>
                  <p className="partner-code">Código: {user.partnerCode}</p>
                </div>
              </div>
            ) : (
              <div className="link-form">
                <h3>Vincular pareja</h3>
                <div className="link-input-group">
                  <input type="text" className="input-field" placeholder="Código de tu pareja" value={partnerInput} onChange={(e) => setPartnerInput(e.target.value)} />
                  <button className="btn btn-primary" onClick={handleLinkPartner}>Vincular</button>
                </div>
                {linkMessage && <p className="link-message">{linkMessage}</p>}
              </div>
            )}
          </div>
        </div>

        <div className="stats-grid fade-in">
          <div className="stat-card"><div className="stat-icon">✍️</div><div className="stat-info"><span className="stat-number">{stats.myResponses}</span><span className="stat-label">Mis respuestas</span></div></div>
          <div className="stat-card"><div className="stat-icon">📬</div><div className="stat-info"><span className="stat-number">{stats.partnerResponses}</span><span className="stat-label">Resp. de mi pareja</span></div></div>
          <div className="stat-card"><div className="stat-icon">🎯</div><div className="stat-info"><span className="stat-number">{stats.challengesDone}</span><span className="stat-label">Retos hechos</span></div></div>
          <div className="stat-card"><div className="stat-icon">🔥</div><div className="stat-info"><span className="stat-number">{stats.streakDays}</span><span className="stat-label">Días de racha</span></div></div>
        </div>

        <div className="dashboard-actions fade-in">
          <button className="btn btn-primary" onClick={startVideoCall}><span>📹</span> Iniciar Videollamada</button>
          {user?.partnerCode && (
            <button className="btn btn-secondary" onClick={joinPartnerCall}><span>📹</span> Unirse a videollamada de mi pareja</button>
          )}
          <button className="btn btn-secondary" onClick={() => navigate('/challenges')}><span>❤️‍🔥</span> Juego de Pareja</button>
          <button className="btn btn-secondary" onClick={() => navigate('/inbox')}><span>📬</span> Buzón de Pareja</button>
        </div>
      </div>
    </div>
  )
}

export default Dashboard