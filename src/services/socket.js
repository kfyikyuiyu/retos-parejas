import { io } from 'socket.io-client'

class SocketService {
  constructor() {
    this.socket = null
    this.isConnected = false
    this.listeners = {}
  }

  connect(url = 'http://localhost:3001') {
    try {
      this.socket = io(url, {
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      })

      this.socket.on('connect', () => {
        console.log('Socket conectado:', this.socket.id)
        this.isConnected = true
      })

      this.socket.on('disconnect', () => {
        console.log('Socket desconectado')
        this.isConnected = false
      })

      this.socket.on('error', (error) => {
        console.error('Error de socket:', error)
      })

      return this.socket
    } catch (error) {
      console.error('Error al conectar socket:', error)
      return null
    }
  }

  joinRoom(roomId) {
    if (this.socket) {
      this.socket.emit('join-room', roomId)
      console.log('Unido a sala:', roomId)
    }
  }

  leaveRoom(roomId) {
    if (this.socket) {
      this.socket.emit('leave-room', roomId)
      console.log('Abandonó sala:', roomId)
    }
  }

  sendMessage(roomId, message) {
    if (this.socket) {
      this.socket.emit('send-message', { roomId, message })
    }
  }

  onMessage(callback) {
    if (this.socket) {
      this.socket.on('new-message', callback)
    }
  }

  offMessage(callback) {
    if (this.socket) {
      this.socket.off('new-message', callback)
    }
  }

  onUserJoined(callback) {
    if (this.socket) {
      this.socket.on('user-joined', callback)
    }
  }

  onUserLeft(callback) {
    if (this.socket) {
      this.socket.on('user-left', callback)
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
    }
  }
}

const socketService = new SocketService()
export default socketService