import { useState, useEffect, useRef } from 'react'
import socketService from '../../services/socket'
import { useAuth } from '../../context/AuthContext'
import './Chat.css'

const Chat = ({ roomId, onClose }) => {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [typingUser, setTypingUser] = useState('')
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Mensajes de bienvenida simulados
  useEffect(() => {
    const welcomeMessages = [
      {
        id: '1',
        sender: 'Sistema',
        text: '💑 Bienvenidos al chat de pareja',
        timestamp: new Date().toISOString(),
        type: 'system'
      },
      {
        id: '2',
        sender: 'Sistema',
        text: '🎯 Recuerden completar sus retos juntos',
        timestamp: new Date().toISOString(),
        type: 'system'
      }
    ]

    setMessages(welcomeMessages)

    // Conectar socket
    socketService.connect()
    socketService.joinRoom(roomId)

    // Escuchar mensajes
    socketService.onMessage((message) => {
      setMessages(prev => [...prev, message])
    })

    // Escuchar cuando alguien escribe
    socketService.onUserJoined((user) => {
      const joinMessage = {
        id: Date.now().toString(),
        sender: 'Sistema',
        text: `${user.name} se ha unido al chat`,
        timestamp: new Date().toISOString(),
        type: 'system'
      }
      setMessages(prev => [...prev, joinMessage])
    })

    return () => {
      socketService.leaveRoom(roomId)
      socketService.disconnect()
    }
  }, [roomId])

  // Auto-scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Foco en el input
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSendMessage = (e) => {
    e.preventDefault()
    
    if (!newMessage.trim()) return

    const message = {
      id: Date.now().toString(),
      sender: user?.name || 'Usuario',
      senderId: user?.id || '1',
      text: newMessage.trim(),
      timestamp: new Date().toISOString(),
      type: 'message'
    }

    // Agregar mensaje localmente
    setMessages(prev => [...prev, message])
    
    // Enviar por socket
    socketService.sendMessage(roomId, message)
    
    setNewMessage('')
    inputRef.current?.focus()
  }

  const handleTyping = (e) => {
    setNewMessage(e.target.value)
    
    // Simular que el otro usuario está escribiendo
    if (e.target.value.length > 0 && !isTyping) {
      setIsTyping(true)
      setTypingUser('Pareja')
      
      setTimeout(() => {
        setIsTyping(false)
        setTypingUser('')
      }, 3000)
    } else if (e.target.value.length === 0) {
      setIsTyping(false)
      setTypingUser('')
    }
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(e)
    }
  }

  // Simular respuestas automáticas
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      
      if (lastMessage.type === 'message' && lastMessage.senderId !== 'partner') {
        const autoResponses = [
          '¡Me encanta! ❤️',
          'Eso suena divertido 🎉',
          'Estoy de acuerdo 😊',
          '¡Vamos a hacerlo juntos! 💑',
          'Qué buena idea ✨',
          'Te quiero mucho 💕',
          '¡Qué emoción! 🌟',
          'Me haces muy feliz 🥰'
        ]

        // Simular respuesta después de 2-4 segundos
        const timeout = setTimeout(() => {
          const randomResponse = autoResponses[Math.floor(Math.random() * autoResponses.length)]
          
          const response = {
            id: Date.now().toString(),
            sender: 'Pareja',
            senderId: 'partner',
            text: randomResponse,
            timestamp: new Date().toISOString(),
            type: 'message'
          }

          setMessages(prev => [...prev, response])
        }, Math.random() * 2000 + 2000)

        return () => clearTimeout(timeout)
      }
    }
  }, [messages])

  return (
    <div className="chat-container">
      {/* Header del Chat */}
      <div className="chat-header">
        <div className="chat-header-info">
          <div className="chat-avatar">
            <span>💑</span>
          </div>
          <div>
            <h3>Chat de Pareja</h3>
            <span className="chat-status">En línea</span>
          </div>
        </div>
        <button className="chat-close-btn" onClick={onClose}>
          ✕
        </button>
      </div>

      {/* Mensajes */}
      <div className="chat-messages">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message-wrapper ${
              message.type === 'system'
                ? 'system-message'
                : message.senderId === user?.id
                ? 'sent-message'
                : 'received-message'
            }`}
          >
            {message.type !== 'system' && (
              <div className="message-sender">
                {message.sender}
              </div>
            )}
            
            <div className="message-bubble">
              <p>{message.text}</p>
              <span className="message-time">
                {formatTime(message.timestamp)}
              </span>
            </div>
          </div>
        ))}

        {/* Indicador de escritura */}
        {isTyping && (
          <div className="typing-indicator">
            <div className="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span className="typing-text">{typingUser} está escribiendo...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input de mensaje */}
      <form className="chat-input-form" onSubmit={handleSendMessage}>
        <div className="chat-input-wrapper">
          <button type="button" className="emoji-btn" title="Emojis">
            😊
          </button>
          
          <input
            ref={inputRef}
            type="text"
            className="chat-input"
            placeholder="Escribe un mensaje..."
            value={newMessage}
            onChange={handleTyping}
            onKeyPress={handleKeyPress}
            maxLength={500}
          />
          
          <button 
            type="button" 
            className="attachment-btn"
            title="Adjuntar"
          >
            📎
          </button>
          
          <button 
            type="submit" 
            className="send-btn"
            disabled={!newMessage.trim()}
            title="Enviar"
          >
            ➤
          </button>
        </div>
      </form>
    </div>
  )
}

export default Chat