import { useState, useEffect, useRef, useCallback } from 'react'
import webRTCService from '../services/webrtc'

export const useWebRTC = (roomId, isInitiator) => {
  const [localStream, setLocalStream] = useState(null)
  const [remoteStream, setRemoteStream] = useState(null)
  const [screenStream, setScreenStream] = useState(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState(null)
  const [peerId, setPeerId] = useState(null)
  const [messages, setMessages] = useState([])

  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)

  useEffect(() => {
    const uniqueId = `${roomId}-${isInitiator ? 'host' : 'guest'}-${Date.now()}`
    setPeerId(uniqueId)

    webRTCService.onRemoteStream = (stream) => {
      setRemoteStream(stream)
      setIsConnected(!!stream)
      if (remoteVideoRef.current && stream) {
        remoteVideoRef.current.srcObject = stream
      }
    }

    webRTCService.onDataReceived = (data) => {
      if (data.type === 'chat') {
        setMessages(prev => [...prev, { sender: 'Pareja', text: data.text, timestamp: new Date().toISOString() }])
      }
    }

    webRTCService.onError = (err) => setError(err.message)

    webRTCService.initialize(uniqueId)
      .then(async () => {
        const stream = await webRTCService.startLocalStream()
        setLocalStream(stream)
        if (localVideoRef.current) localVideoRef.current.srcObject = stream

        if (!isInitiator) {
          setTimeout(() => {
            webRTCService.callPeer(`${roomId}-host`)
              .catch(err => setError('No se pudo conectar con la pareja. Asegúrate de que el host haya iniciado la videollamada.'))
          }, 2000)
        }
      })
      .catch(err => setError(err.message))

    return () => {
      webRTCService.destroy()
    }
  }, [roomId, isInitiator])

  const sendChatMessage = useCallback((text) => {
    if (!text.trim()) return
    webRTCService.sendData({ type: 'chat', text: text.trim() })
    setMessages(prev => [...prev, { sender: 'Tú', text: text.trim(), timestamp: new Date().toISOString() }])
  }, [])

  const toggleMute = useCallback(() => {
    const enabled = webRTCService.toggleAudio()
    setIsMuted(!enabled)
  }, [])

  const toggleVideo = useCallback(() => {
    const enabled = webRTCService.toggleVideo()
    setIsVideoOff(!enabled)
  }, [])

  const startScreenShare = useCallback(async () => {
    try {
      const stream = await webRTCService.startScreenShare()
      setScreenStream(stream)
      setIsScreenSharing(true)
    } catch (err) {
      setError(err.message)
    }
  }, [])

  const stopScreenShare = useCallback(() => {
    webRTCService.stopScreenShare()
    setScreenStream(null)
    setIsScreenSharing(false)
  }, [])

  const endCall = useCallback(() => {
    webRTCService.endCall()
    setLocalStream(null)
    setRemoteStream(null)
    setIsConnected(false)
  }, [])

  return {
    localStream,
    remoteStream,
    screenStream,
    isMuted,
    isVideoOff,
    isScreenSharing,
    isConnected,
    error,
    peerId,
    messages,
    localVideoRef,
    remoteVideoRef,
    toggleMute,
    toggleVideo,
    startScreenShare,
    stopScreenShare,
    endCall,
    sendChatMessage,
  }
}