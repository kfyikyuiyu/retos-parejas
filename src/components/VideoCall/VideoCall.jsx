import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useWebRTC } from '../../hooks/useWebRTC'
import './VideoCall.css'

const VideoCall = () => {
  const { roomId } = useParams()
  const [searchParams] = useSearchParams()
  const isInitiator = searchParams.get('initiator') === 'true'
  const navigate = useNavigate()
  const [showChat, setShowChat] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const timerRef = useRef(null)
  const chatMessagesRef = useRef(null)

  const {
    localStream,
    remoteStream,
    screenStream,
    isMuted,
    isVideoOff,
    isScreenSharing,
    isConnected,
    error,
    messages,
    localVideoRef,
    remoteVideoRef,
    toggleMute,
    toggleVideo,
    startScreenShare,
    stopScreenShare,
    endCall,
    sendChatMessage,
  } = useWebRTC(roomId, isInitiator)

  useEffect(() => {
    if (isConnected) {
      timerRef.current = setInterval(() => setCallDuration(prev => prev + 1), 1000)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [isConnected])

  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight
    }
  }, [messages])

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleEndCall = () => {
    endCall()
    localStorage.removeItem(`activeCall_${roomId}`)
    navigate('/dashboard')
  }

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullScreen(true)
    } else {
      document.exitFullscreen()
      setIsFullScreen(false)
    }
  }

  const handleSendChat = (e) => {
    e.preventDefault()
    if (!chatInput.trim()) return
    sendChatMessage(chatInput.trim())
    setChatInput('')
  }

  return (
    <div className="video-call-container">
      <div className="call-header">
        <div className="call-info">
          <h2>Videollamada de Pareja</h2>
          <div className="call-meta">
            <span className="room-badge">Sala: {roomId}</span>
            <span className={`call-status ${isConnected ? 'connected' : ''}`}>
              {isConnected ? 'Conectado' : isInitiator ? 'Esperando pareja...' : 'Conectando...'}
            </span>
            {isConnected && <span className="call-duration">{formatTime(callDuration)}</span>}
          </div>
        </div>
        <div className="call-header-actions">
          <button className="icon-btn" onClick={toggleFullScreen} title="Pantalla completa">
            {isFullScreen ? '↙️' : '↗️'}
          </button>
        </div>
      </div>

      <div className="video-area">
        {error && <div className="call-error"><span>⚠️</span><p>{error}</p></div>}

        <div className="video-wrapper remote-video-wrapper">
          {remoteStream ? (
            <video ref={remoteVideoRef} autoPlay playsInline className="video remote-video" />
          ) : (
            <div className="video-placeholder">
              <div className="placeholder-content">
                <span className="placeholder-icon">💑</span>
                <p>{isInitiator ? 'Esperando que tu pareja se una...' : 'Conectando con tu pareja...'}</p>
                {isInitiator && <p className="room-info-small">Comparte el enlace de esta sala para que se una</p>}
              </div>
            </div>
          )}
          {screenStream && (
            <div className="screen-share-overlay">
              <video autoPlay playsInline className="video screen-video" srcObject={screenStream} />
              <div className="screen-share-label">Compartiendo pantalla</div>
            </div>
          )}
        </div>

        {localStream && (
          <div className={`video-wrapper local-video-wrapper ${isVideoOff ? 'video-off' : ''}`}>
            <video ref={localVideoRef} autoPlay playsInline muted className="video local-video" />
            {isVideoOff && <div className="video-off-overlay"><span>📷❌</span><p>Cámara apagada</p></div>}
            <div className="video-label">Tú</div>
          </div>
        )}

        {showChat && (
          <div className="chat-panel">
            <div className="chat-container">
              <div className="chat-header">
                <h3>Chat</h3>
                <button className="chat-close-btn" onClick={() => setShowChat(false)}>✕</button>
              </div>
              <div className="chat-messages" ref={chatMessagesRef}>
                {messages.map((msg, idx) => (
                  <div key={idx} className={`message-wrapper ${msg.sender === 'Tú' ? 'sent-message' : 'received-message'}`}>
                    <div className="message-sender">{msg.sender}</div>
                    <div className="message-bubble">
                      <p>{msg.text}</p>
                      <span className="message-time">
                        {new Date(msg.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <form className="chat-input-form" onSubmit={handleSendChat}>
                <input
                  type="text"
                  className="chat-input"
                  placeholder="Escribe un mensaje..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                />
                <button type="submit" className="send-btn">➤</button>
              </form>
            </div>
          </div>
        )}
      </div>

      <div className="call-controls">
        <div className="controls-group">
          <button className={`control-btn ${isMuted ? 'active' : ''}`} onClick={toggleMute} title="Micrófono">
            <span className="control-icon">{isMuted ? '🔇' : '🎤'}</span>
            <span className="control-label">Mic</span>
          </button>
          <button className={`control-btn ${isVideoOff ? 'active' : ''}`} onClick={toggleVideo} title="Cámara">
            <span className="control-icon">{isVideoOff ? '📷❌' : '📷'}</span>
            <span className="control-label">Cámara</span>
          </button>
          <button className={`control-btn ${isScreenSharing ? 'active' : ''}`}
            onClick={isScreenSharing ? stopScreenShare : startScreenShare} title="Compartir pantalla">
            <span className="control-icon">🖥️</span>
            <span className="control-label">Compartir</span>
          </button>
          <button className={`control-btn ${showChat ? 'active' : ''}`}
            onClick={() => setShowChat(!showChat)} title="Chat">
            <span className="control-icon">💬</span>
            <span className="control-label">Chat</span>
          </button>
        </div>
        <button className="control-btn end-call-btn" onClick={handleEndCall} title="Finalizar">
          <span className="control-icon">❌</span>
          <span className="control-label">Finalizar</span>
        </button>
      </div>
    </div>
  )
}

export default VideoCall