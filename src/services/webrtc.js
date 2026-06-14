import Peer from 'peerjs'

class WebRTCService {
  constructor() {
    this.peer = null
    this.localStream = null
    this.remoteStream = null
    this.currentCall = null
    this.screenStream = null
    this.dataConnection = null
    this.onRemoteStream = null
    this.onDataReceived = null
    this.onConnectionOpen = null
    this.onError = null
    this.peerId = null
  }

  async initialize(peerId) {
    return new Promise((resolve, reject) => {
      try {
        this.peer = new Peer(peerId, {
          host: '0.peerjs.com',
          port: 443,
          secure: true,
        })

        this.peer.on('open', (id) => {
          console.log('Peer conectado con ID:', id)
          this.peerId = id
          if (this.onConnectionOpen) this.onConnectionOpen(id)
          resolve(id)
        })

        this.peer.on('error', (error) => {
          console.error('Error en Peer:', error)
          if (this.onError) this.onError(error)
          reject(error)
        })

        this.peer.on('call', (call) => {
          console.log('Recibiendo llamada de:', call.peer)
          this.currentCall = call
          if (this.localStream) {
            call.answer(this.localStream)
          } else {
            this.startLocalStream().then(() => call.answer(this.localStream))
          }
          this._setupCallEvents(call)
        })

        this.peer.on('connection', (conn) => {
          console.log('Conexión de datos entrante')
          this.dataConnection = conn
          this._setupDataConnection(conn)
        })
      } catch (error) {
        reject(error)
      }
    })
  }

  async startLocalStream(video = true, audio = true) {
    this.localStream = await navigator.mediaDevices.getUserMedia({
      video: video ? { width: 1280, height: 720 } : false,
      audio: audio
    })
    return this.localStream
  }

  async startScreenShare() {
    this.screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true })
    if (this.currentCall) {
      const videoTrack = this.screenStream.getVideoTracks()[0]
      const sender = this.currentCall.peerConnection
        .getSenders()
        .find(s => s.track && s.track.kind === 'video')
      if (sender) sender.replaceTrack(videoTrack)
    }
    this.screenStream.getVideoTracks()[0].onended = () => {
      this.stopScreenShare()
    }
    return this.screenStream
  }

  stopScreenShare() {
    if (this.screenStream) {
      this.screenStream.getTracks().forEach(track => track.stop())
      this.screenStream = null
    }
    if (this.currentCall && this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0]
      if (videoTrack) {
        const sender = this.currentCall.peerConnection
          .getSenders()
          .find(s => s.track && s.track.kind === 'video')
        if (sender) sender.replaceTrack(videoTrack)
      }
    }
  }

  callPeer(peerId) {
    if (!this.peer || !this.localStream) throw new Error('Peer no inicializado o no hay stream local')
    console.log('Llamando a:', peerId)
    const call = this.peer.call(peerId, this.localStream)
    this.currentCall = call
    this._setupCallEvents(call)
    this.dataConnection = this.peer.connect(peerId, { reliable: true })
    this._setupDataConnection(this.dataConnection)
    return call
  }

  sendData(data) {
    if (this.dataConnection && this.dataConnection.open) {
      this.dataConnection.send(data)
    }
  }

  toggleAudio() {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        return audioTrack.enabled
      }
    }
    return true
  }

  toggleVideo() {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        return videoTrack.enabled
      }
    }
    return true
  }

  endCall() {
    if (this.currentCall) {
      this.currentCall.close()
      this.currentCall = null
    }
    if (this.dataConnection) {
      this.dataConnection.close()
      this.dataConnection = null
    }
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop())
      this.localStream = null
    }
    this.stopScreenShare()
    this.remoteStream = null
  }

  destroy() {
    this.endCall()
    if (this.peer) {
      this.peer.destroy()
      this.peer = null
    }
  }

  _setupCallEvents(call) {
    call.on('stream', (remoteStream) => {
      console.log('Recibiendo stream remoto')
      this.remoteStream = remoteStream
      if (this.onRemoteStream) this.onRemoteStream(remoteStream)
    })
    call.on('close', () => {
      console.log('Llamada finalizada')
      this.remoteStream = null
      if (this.onRemoteStream) this.onRemoteStream(null)
    })
    call.on('error', (err) => {
      console.error('Error en llamada:', err)
      if (this.onError) this.onError(err)
    })
  }

  _setupDataConnection(conn) {
    conn.on('data', (data) => {
      console.log('Mensaje recibido:', data)
      if (this.onDataReceived) this.onDataReceived(data)
    })
    conn.on('open', () => console.log('Canal de datos abierto'))
    conn.on('close', () => {
      console.log('Canal de datos cerrado')
      this.dataConnection = null
    })
  }
}

const webRTCService = new WebRTCService()
export default webRTCService