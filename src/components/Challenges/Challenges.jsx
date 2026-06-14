import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { questions, challenges, hotTruths } from '../../data/challengesData'
import './Challenges.css'

const Challenges = () => {
  const { user } = useAuth()
  const [activeCategory, setActiveCategory] = useState('questions')
  const [currentIndex, setCurrentIndex] = useState(() => Math.floor(Math.random() * questions.length))
  const [completedCards, setCompletedCards] = useState([])
  const [showAnswerInput, setShowAnswerInput] = useState(false)
  const [answer, setAnswer] = useState('')
  const [message, setMessage] = useState('')

  // Cargar completados desde localStorage
  useEffect(() => {
    if (user?.code) {
      const saved = JSON.parse(localStorage.getItem(`completed_${user.code}`) || '[]')
      setCompletedCards(saved)
    }
  }, [user])

  const getCurrentList = () => {
    if (activeCategory === 'questions') return questions
    if (activeCategory === 'challenges') return challenges
    return hotTruths
  }

  const currentList = getCurrentList()
  const currentItem = currentList[currentIndex] || currentList[0]

  const getCategoryLabel = () => {
    if (activeCategory === 'questions') return 'Pregunta Romántica'
    if (activeCategory === 'challenges') return 'Reto Divertido'
    return 'Verdad Caliente 🔥'
  }

  const getCategoryIcon = () => {
    if (activeCategory === 'questions') return '💬'
    if (activeCategory === 'challenges') return '🎯'
    return '🌶️'
  }

  // Guardar respuesta en el buzón
  const saveResponse = (content, answerText) => {
    if (!user?.code) return
    const storageKey = `responses_${user.code}`
    const existing = JSON.parse(localStorage.getItem(storageKey) || '[]')
    existing.push({
      type: activeCategory === 'challenges' ? 'challenge' : 'question',
      content,
      answer: answerText || '✅ Completado',
      timestamp: new Date().toISOString()
    })
    localStorage.setItem(storageKey, JSON.stringify(existing))
  }

  // Marcar como completado
  const markAsDone = () => {
    const cardId = `${activeCategory}-${currentIndex}`
    if (completedCards.includes(cardId)) {
      // Ya completado, saltamos
      handleNext()
      return
    }

    // Si es reto, guardar y saltar
    if (activeCategory === 'challenges') {
      const newCompleted = [...completedCards, cardId]
      setCompletedCards(newCompleted)
      localStorage.setItem(`completed_${user.code}`, JSON.stringify(newCompleted))
      saveResponse(currentItem, '')
      handleNext()
      return
    }

    // Si es pregunta/verdad, mostrar input de respuesta
    setShowAnswerInput(true)
    setMessage('')
  }

  // Enviar respuesta escrita
  const handleSubmitAnswer = () => {
    const trimmed = answer.trim()
    if (!trimmed) {
      setMessage('❌ Escribe una respuesta antes de enviar.')
      return
    }
    const cardId = `${activeCategory}-${currentIndex}`
    const newCompleted = [...completedCards, cardId]
    setCompletedCards(newCompleted)
    localStorage.setItem(`completed_${user.code}`, JSON.stringify(newCompleted))

    saveResponse(currentItem, trimmed)
    setAnswer('')
    setShowAnswerInput(false)
    setMessage('✅ Respuesta guardada correctamente')
    handleNext()
  }

  const handleNext = () => {
    let nextIndex
    do {
      nextIndex = Math.floor(Math.random() * currentList.length)
    } while (nextIndex === currentIndex && currentList.length > 1)
    setCurrentIndex(nextIndex)
    setShowAnswerInput(false)
    setAnswer('')
    setMessage('')
  }

  const handleCategoryChange = (category) => {
    setActiveCategory(category)
    const list = category === 'questions' ? questions : category === 'challenges' ? challenges : hotTruths
    setCurrentIndex(Math.floor(Math.random() * list.length))
    setShowAnswerInput(false)
    setAnswer('')
    setMessage('')
  }

  const completedCount = completedCards.filter(id => id.startsWith(activeCategory)).length
  const totalCount = currentList.length

  return (
    <div className="challenges-page">
      <div className="challenges-container">
        <div className="challenges-header fade-in">
          <div>
            <h1>❤️‍🔥 Juego de Pareja</h1>
            <p>Preguntas, retos y verdades para encender la chispa</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="category-tabs fade-in">
          <button className={`tab-btn ${activeCategory === 'questions' ? 'active' : ''}`}
            onClick={() => handleCategoryChange('questions')}>💬 Preguntas</button>
          <button className={`tab-btn ${activeCategory === 'challenges' ? 'active' : ''}`}
            onClick={() => handleCategoryChange('challenges')}>🎯 Retos</button>
          <button className={`tab-btn hot-tab ${activeCategory === 'hot' ? 'active' : ''}`}
            onClick={() => handleCategoryChange('hot')}>🔥 Verdades Hot</button>
        </div>

        {/* Progreso */}
        <div className="progress-counter fade-in">
          <span>{completedCount} / {totalCount} completadas</span>
          <div className="mini-bar">
            <div className="mini-bar-fill" style={{ width: `${(completedCount / totalCount) * 100}%` }}></div>
          </div>
        </div>

        {/* Tarjeta actual */}
        <div className="game-card fade-in">
          <div className="card-inner">
            <div className="card-category">
              <span className="category-icon">{getCategoryIcon()}</span>
              <span>{getCategoryLabel()}</span>
            </div>
            <div className="card-content">
              <p>{currentItem}</p>
            </div>
            <div className="card-instruction">
              {activeCategory === 'challenges' ? '¡Cúmplelo ahora!' : 'Responde con honestidad'}
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="game-actions fade-in">
          <button className="btn btn-secondary" onClick={handleNext}>⏭️ Saltar</button>
          <button className="btn btn-primary" onClick={markAsDone}>
            ✅ {activeCategory === 'challenges' ? 'Completado' : 'Responder'}
          </button>
        </div>

        {/* Mensaje de feedback */}
        {message && <div className="feedback-message fade-in">{message}</div>}

        {/* Input de respuesta (se muestra solo para preguntas/verdades) */}
        {showAnswerInput && (
          <div className="answer-input-area fade-in">
            <textarea
              className="input-field"
              placeholder="Escribe tu respuesta aquí..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={4}
            />
            <div className="answer-actions">
              <button className="btn btn-secondary" onClick={() => {
                setShowAnswerInput(false)
                setAnswer('')
                setMessage('')
              }}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSubmitAnswer}>Enviar respuesta</button>
            </div>
          </div>
        )}

        {activeCategory === 'hot' && (
          <div className="hot-disclaimer fade-in">
            🔞 Contenido solo para adultos. Jueguen con consentimiento y respeto.
          </div>
        )}
      </div>
    </div>
  )
}

export default Challenges