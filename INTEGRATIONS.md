# 🌐 Exemplos de Integrações

Este arquivo contém exemplos de como estender o P2P Screen Share com diferentes serviços de sinalização e tecnologias.

## 1️⃣ Firebase Realtime Database

**Melhor para:** Prototipagem rápida, sem DevOps.

### Instalação
```bash
npm install firebase
```

### Configuração
```javascript
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, off } from 'firebase/database';

const firebaseConfig = {
  apiKey: "SEU_API_KEY",
  authDomain: "seu-projeto.firebaseapp.com",
  databaseURL: "https://seu-projeto.firebaseio.com",
  projectId: "seu-projeto"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

class FirebaseSignaling {
  constructor(roomId) {
    this.roomId = roomId;
    this.db = db;
  }

  async sendOffer(offer) {
    await set(ref(this.db, `rooms/${this.roomId}/offer`), {
      type: 'offer',
      sdp: offer.sdp,
      timestamp: Date.now()
    });
  }

  async sendAnswer(answer) {
    await set(ref(this.db, `rooms/${this.roomId}/answer`), {
      type: 'answer',
      sdp: answer.sdp,
      timestamp: Date.now()
    });
  }

  onAnswer(callback) {
    onValue(ref(this.db, `rooms/${this.roomId}/answer`), (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val());
      }
    });
  }

  addICECandidate(candidate) {
    const timestamp = Date.now();
    set(ref(this.db, `rooms/${this.roomId}/ice/${timestamp}`), {
      candidate: candidate.candidate,
      sdpMLineIndex: candidate.sdpMLineIndex,
      sdpMid: candidate.sdpMid
    });
  }
}

// Uso
const signaling = new FirebaseSignaling('room123');
peerConnection.addEventListener('icecandidate', (event) => {
  if (event.candidate) {
    signaling.addICECandidate(event.candidate);
  }
});
```

## 2️⃣ WebSocket (Node.js + Socket.IO)

**Melhor para:** Controle total, produção.

### Servidor (Node.js)
```bash
npm install express socket.io
```

```javascript
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: "*" }
});

const rooms = new Map();

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    
    if (!rooms.has(roomId)) {
      rooms.set(roomId, []);
    }
    rooms.get(roomId).push(socket.id);

    // Notificar outros na sala
    socket.to(roomId).emit('peer-joined', {
      peerId: socket.id,
      totalPeers: rooms.get(roomId).length
    });
  });

  socket.on('offer', (data) => {
    socket.to(data.to).emit('offer', {
      from: socket.id,
      offer: data.offer
    });
  });

  socket.on('answer', (data) => {
    socket.to(data.to).emit('answer', {
      from: socket.id,
      answer: data.answer
    });
  });

  socket.on('ice-candidate', (data) => {
    socket.to(data.to).emit('ice-candidate', {
      from: socket.id,
      candidate: data.candidate
    });
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
    // Limpar salas
    rooms.forEach((peers, roomId) => {
      const index = peers.indexOf(socket.id);
      if (index > -1) {
        peers.splice(index, 1);
      }
    });
  });
});

server.listen(3000, () => {
  console.log('Signaling server rodando em :3000');
});
```

### Cliente
```javascript
import io from 'socket.io-client';

class SocketIOSignaling {
  constructor(serverUrl) {
    this.socket = io(serverUrl);
    this.callbacks = {};
  }

  joinRoom(roomId) {
    this.socket.emit('join-room', roomId);
  }

  sendOffer(to, offer) {
    this.socket.emit('offer', {
      to: to,
      offer: offer
    });
  }

  sendAnswer(to, answer) {
    this.socket.emit('answer', {
      to: to,
      answer: answer
    });
  }

  onOffer(callback) {
    this.socket.on('offer', (data) => {
      callback(data.from, data.offer);
    });
  }

  addICECandidate(to, candidate) {
    this.socket.emit('ice-candidate', {
      to: to,
      candidate: candidate
    });
  }
}

// Uso
const signaling = new SocketIOSignaling('http://localhost:3000');
signaling.joinRoom('room123');
```

## 3️⃣ Signalhub (Decentralizado)

**Melhor para:** Sem servidor necessário, P2P puro.

### Instalação
```bash
npm install signalhub simple-peer
```

```javascript
import signalhub from 'signalhub';
import SimplePeer from 'simple-peer';

class SignalhubSignaling {
  constructor(roomId, hubUrls = []) {
    this.roomId = roomId;
    this.hub = signalhub(roomId, hubUrls.length > 0 ? hubUrls : [
      'http://localhost:3000' // Fallback para hub local
    ]);
    this.peers = new Map();
  }

  async createPeer(initiator = false) {
    return new SimplePeer({
      initiator: initiator,
      stream: undefined, // Será adicionado depois
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
      ]
    });
  }

  broadcastOffer(offer) {
    this.hub.broadcast('offer', offer);
  }

  onOffer(callback) {
    this.hub.listen('offer').on('data', (offer) => {
      callback(offer);
    });
  }

  broadcastAnswer(answer) {
    this.hub.broadcast('answer', answer);
  }

  onAnswer(callback) {
    this.hub.listen('answer').on('data', (answer) => {
      callback(answer);
    });
  }
}
```

## 4️⃣ WebTorrent (P2P descentralizado)

**Melhor para:** Distribuição descentralizada.

```bash
npm install webtorrent
```

```javascript
import WebTorrent from 'webtorrent';

const client = new WebTorrent();

// Criar torrent da stream
const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
const files = [
  {
    name: 'screen.webm',
    getStream: () => stream
  }
];

client.createTorrent(files, (err, torrent) => {
  console.log('Magnet link:', torrent.magnetURI);
  
  // Compartilhar magnet link
  // Outros podem conectar com:
  // client.add(magnetLink, (torrent) => { ... })
});
```

## 5️⃣ Jitsi (SFU - Selective Forwarding Unit)

**Melhor para:** Múltiplos participantes com servidor.

```html
<script src='https://meet.jitsi.org/external_api.js'></script>
<div id='meet'></div>

<script>
const domain = 'meet.jitsi.org';
const options = {
  roomName: 'screenshare-room',
  width: 700,
  height: 700,
  parentNode: document.querySelector('#meet'),
  configOverwrite: {
    startWithVideoMuted: false,
    startWithAudioMuted: true,
    desktopSharingChromeExtId: 'YOUR_EXTENSION_ID'
  }
};

const api = new JitsiMeetExternalAPI(domain, options);

api.addEventListener('videoConferenceJoined', () => {
  console.log('Conectado!');
  api.executeCommand('toggleScreenShare');
});
</script>
```

## 6️⃣ TURN Server (Para NAT complexo)

```javascript
// Adicionar servidor TURN à configuração RTCPeerConnection
const peerConnection = new RTCPeerConnection({
  iceServers: [
    // STUN servers (gratuitos)
    { urls: 'stun:stun.l.google.com:19302' },
    
    // TURN server (pago ou auto-hospedado)
    {
      urls: 'turn:seu-turn-server.com:3478',
      username: 'usuario',
      credential: 'senha'
    }
  ]
});
```

**Opções de TURN:**
- [Metered.ca](https://metered.ca) - TURN as a Service
- [Coturn](https://github.com/coturn/coturn) - Self-hosted
- [AWS TURN](https://aws.amazon.com/kinesis/webrtc/) - Enterprise

## 7️⃣ Monitoring & Analytics

### Sentry
```javascript
import * as Sentry from '@sentry/browser';

Sentry.init({
  dsn: 'https://seu-dsn@sentry.io/123456',
  tracesSampleRate: 1.0
});

peerConnection.addEventListener('connectionstatechange', () => {
  Sentry.captureMessage(`Connection state: ${peerConnection.connectionState}`);
});
```

### WebRTC Metrics
```javascript
async function reportWebRTCMetrics() {
  const stats = await peerConnection.getStats();
  const metrics = {};

  stats.forEach(report => {
    if (report.type === 'inbound-rtp') {
      metrics.videoBytesReceived = report.bytesReceived;
      metrics.fps = report.framesPerSecond;
      metrics.jitter = report.jitter;
    }
    if (report.type === 'candidate-pair' && report.state === 'succeeded') {
      metrics.rtt = report.currentRoundTripTime;
      metrics.availableBitrate = report.availableOutgoingBitrate;
    }
  });

  // Enviar para analytics
  fetch('/api/metrics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(metrics)
  });
}

setInterval(reportWebRTCMetrics, 5000);
```

## 🚀 Comparação de Opções

| Solução | Custo | Latência | Escalabilidade | Complexidade |
|---------|-------|----------|-----------------|--------------|
| Local (SessionStorage) | Gratuito | Nenhuma | Apenas 2 peers | ⭐ |
| Firebase | Pago | Baixa | Média | ⭐⭐ |
| Socket.IO | Gratuito* | Baixa | Alta | ⭐⭐⭐ |
| Signalhub | Gratuito | Baixa | Média | ⭐⭐ |
| Jitsi | Gratuito | Média | Alta | ⭐⭐ |
| WebTorrent | Gratuito | Alta | P2P | ⭐⭐⭐ |

*Socket.IO requer servidor próprio

## 📚 Mais Recursos

- [WebRTC Samples](https://github.com/webrtc/samples)
- [PeerJS (SimplePeer wrapper)](https://peerjs.com/)
- [Twilio Video SDK](https://www.twilio.com/video)
- [OpenVidu](https://openvidu.io/)

---

Escolha a integração que melhor se adequa ao seu caso de uso!
