import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Common/Header'
import './Inbox.css'

const Inbox = () => {
  const { user } = useAuth()
  const [partnerResponses, setPartnerResponses] = useState([])
  const [myResponses, setMyResponses] = useState([])
  const [view, setView] = useState('partner')

  useEffect(() => {
    if (user?.partnerCode) {
      const responses = JSON.parse(localStorage.getItem(`responses_${user.partnerCode}`) || '[]')
      setPartnerResponses(responses.reverse())
    }
    if (user?.code) {
      const myResps = JSON.parse(localStorage.getItem(`responses_${user.code}`) || '[]')
      setMyResponses(myResps.reverse())
    }
  }, [user])

  const formatDate = (timestamp) => new Date(timestamp).toLocaleString('es-ES')

  return (
    <div>
      <Header />
      <div className="inbox-container">
        <div className="inbox-header">
          <h1>📬 Buzón de Pareja</h1>
          <div className="inbox-tabs">
            <button className={`tab ${view === 'partner' ? 'active' : ''}`} onClick={() => setView('partner')}>Respuestas de mi pareja</button>
            <button className={`tab ${view === 'mine' ? 'active' : ''}`} onClick={() => setView('mine')}>Mis respuestas enviadas</button>
          </div>
        </div>

        {view === 'partner' && (
          <div className="responses-list">
            {user?.partnerCode ? (
              partnerResponses.length > 0 ? partnerResponses.map((item, idx) => (
                <div key={idx} className="response-card"><div className="response-type">{item.type === 'question' ? '💬 Pregunta' : '🎯 Reto'}</div><p className="response-content">{item.content}</p><p className="response-answer"><strong>Respuesta:</strong> {item.answer}</p><span className="response-date">{formatDate(item.timestamp)}</span></div>
              )) : <div className="empty-inbox"><span>📭</span><p>Tu pareja aún no ha respondido nada</p></div>
            ) : <div className="empty-inbox"><span>💔</span><p>No tienes pareja vinculada</p></div>}
          </div>
        )}

        {view === 'mine' && (
          <div className="responses-list">
            {myResponses.length > 0 ? myResponses.map((item, idx) => (
              <div key={idx} className="response-card own"><div className="response-type">{item.type === 'question' ? '💬 Pregunta' : '🎯 Reto'}</div><p className="response-content">{item.content}</p><p className="response-answer"><strong>Tu respuesta:</strong> {item.answer}</p><span className="response-date">{formatDate(item.timestamp)}</span></div>
            )) : <div className="empty-inbox"><span>📝</span><p>Aún no has respondido nada</p></div>}
          </div>
        )}
      </div>
    </div>
  )
}

export default Inbox