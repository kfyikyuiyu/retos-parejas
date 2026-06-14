import { useState } from 'react'
import { questions, challenges, hotTruths } from '../../data/challengesData'
import './Challenges.css'

const Challenges = () => {
  const [activeCategory, setActiveCategory] = useState('questions') // 'questions', 'challenges', 'hot'
  const [currentIndex, setCurrentIndex] = useState(() => Math.floor(Math.random() * questions.length))
  const [isFlipped, setIsFlipped] = useState(false)
  const [completedCards, setCompletedCards] = useState([])

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

  const handleNext = () => {
    let nextIndex
    do {
      nextIndex = Math.floor(Math.random() * currentList.length)
    } while (nextIndex === currentIndex && currentList.length > 1)
    setCurrentIndex(nextIndex)
    setIsFlipped(false)
  }

  const handleMarkDone = () => {
    const cardId = `${activeCategory}-${currentIndex}`
    if (!completedCards.includes(cardId)) {
      setCompletedCards([...completedCards, cardId])
    }
    handleNext()
  }

  const handleCategoryChange = (category) => {
    setActiveCategory(category)
    const list = category === 'questions' ? questions : category === 'challenges' ? challenges : hotTruths
    setCurrentIndex(Math.floor(Math.random() * list.length))
    setIsFlipped(false)
  }

  const completedCount = completedCards.filter(id => id.startsWith(activeCategory)).length
  const totalCount = currentList.length

  return (
    <div className="challenges-page">
      <div className="challenges-container">
        {/* Header */}
        <div className="challenges-header fade-in">
          <div>
            <h1>❤️‍🔥 Juego de Pareja</h1>
            <p>Preguntas, retos y verdades para encender la chispa</p>
          </div>
        </div>

        {/* Categorías */}
        <div className="category-tabs fade-in">
          <button
            className={`tab-btn ${activeCategory === 'questions' ? 'active' : ''}`}
            onClick={() => handleCategoryChange('questions')}
          >
            💬 Preguntas
          </button>
          <button
            className={`tab-btn ${activeCategory === 'challenges' ? 'active' : ''}`}
            onClick={() => handleCategoryChange('challenges')}
          >
            🎯 Retos
          </button>
          <button
            className={`tab-btn hot-tab ${activeCategory === 'hot' ? 'active' : ''}`}
            onClick={() => handleCategoryChange('hot')}
          >
            🔥 Verdades Hot
          </button>
        </div>

        {/* Contador de progreso */}
        <div className="progress-counter fade-in">
          <span>{completedCount} / {totalCount} completadas</span>
          <div className="mini-bar">
            <div
              className="mini-bar-fill"
              style={{ width: `${(completedCount / totalCount) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Tarjeta actual */}
        <div className={`game-card fade-in ${isFlipped ? 'flipped' : ''}`}>
          <div className="card-inner">
            <div className="card-front">
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
        </div>

        {/* Botones de acción */}
        <div className="game-actions fade-in">
          <button className="btn btn-secondary" onClick={() => setIsFlipped(!isFlipped)}>
            {isFlipped ? 'Ocultar' : 'Ver respuesta / Idea'}
          </button>
          <button className="btn btn-primary" onClick={handleMarkDone}>
            ✅ Hecho
          </button>
          <button className="btn btn-secondary" onClick={handleNext}>
            ⏭️ Saltar
          </button>
        </div>

        {/* Nota si es categoría hot */}
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