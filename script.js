// =======================
// P2P Screen Share - JavaScript
// =======================

class P2PScreenShare {
    constructor() {
        this.peerConnection = null;
        this.dataChannel = null;
        this.localStream = null;
        this.screenStream = null;
        this.isSharing = false;
        this.isViewing = false;
        this.shareCode = null;
        this.signalingServerUrl = 'wss://signal.p2p.kiwi/signal'; // Servidor de sinalização público (fallback)
        this.statsInterval = null;
        this.peers = new Map();
        
        // Configuração STUN/TURN
        this.iceServers = [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
            { urls: 'stun:stun3.l.google.com:19302' },
            { urls: 'stun:stun4.l.google.com:19302' }
        ];

        this.initializeUI();
        this.checkUrlParams();
    }

    initializeUI() {
        // Botões principais
        document.getElementById('startShareBtn').addEventListener('click', () => this.startSharing());
        document.getElementById('joinBtn').addEventListener('click', () => this.showJoinSection());
        document.getElementById('stopShareBtn').addEventListener('click', () => this.stopSharing());
        document.getElementById('connectBtn').addEventListener('click', () => this.connectToShare());
        document.getElementById('cancelJoinBtn').addEventListener('click', () => this.cancelJoin());
        
        // Copiar código
        document.getElementById('copyCodeBtn').addEventListener('click', () => this.copyShareCode());
    }

    // Gerar código único de compartilhamento
    generateShareCode() {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
            code += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return code;
    }

    // Iniciar compartilhamento
    async startSharing() {
        try {
            // Gerar código
            this.shareCode = this.generateShareCode();
            document.getElementById('shareCode').textContent = this.shareCode;

            // TODO: Gerar QR Code (será implementado em breve)
            // this.generateQRCode(this.shareCode);

            // Capturar tela
            try {
                this.screenStream = await navigator.mediaDevices.getDisplayMedia({
                    video: {
                        cursor: 'always'
                    },
                    audio: false
                });

                this.isSharing = true;

                // Mostrar seção de compartilhamento
                document.getElementById('connectionSection').style.display = 'none';
                document.getElementById('shareSection').style.display = 'block';
                document.getElementById('viewSection').style.display = 'none';

                // Monitorar parada de captura
                this.screenStream.getTracks()[0].addEventListener('ended', () => {
                    if (this.isSharing) {
                        this.stopSharing();
                    }
                });

                // Preparar WebRTC como oferente
                await this.setupWebRTC(true);

                // Armazenar código localmente (simular "servidor")
                this.storeShareCode(this.shareCode);

            } catch (err) {
                if (err.name === 'NotAllowedError') {
                    this.showStatus('Permissão negada. Autorize o acesso à tela.', 'error');
                } else {
                    this.showStatus('Erro ao capturar tela: ' + err.message, 'error');
                }
                throw err;
            }
        } catch (err) {
            console.error('Erro ao iniciar compartilhamento:', err);
        }
    }

    // Parar compartilhamento
    async stopSharing() {
        this.isSharing = false;

        // Parar tracks
        if (this.screenStream) {
            this.screenStream.getTracks().forEach(track => track.stop());
            this.screenStream = null;
        }

        // Fechar conexão
        if (this.peerConnection) {
            this.peerConnection.close();
            this.peerConnection = null;
        }

        // Voltar ao início
        document.getElementById('connectionSection').style.display = 'block';
        document.getElementById('shareSection').style.display = 'none';
        document.getElementById('viewSection').style.display = 'none';
    }

    // Mostrar seção de entrada
    showJoinSection() {
        document.getElementById('connectionSection').style.display = 'none';
        document.getElementById('shareSection').style.display = 'none';
        document.getElementById('viewSection').style.display = 'block';
    }

    // Cancelar entrada
    cancelJoin() {
        document.getElementById('connectionSection').style.display = 'block';
        document.getElementById('shareSection').style.display = 'none';
        document.getElementById('viewSection').style.display = 'none';
        document.getElementById('connectionStatus').innerHTML = '';
    }

    // Conectar ao compartilhamento
    async connectToShare() {
        const code = document.getElementById('joinCode').value.trim().toUpperCase();

        if (!code || code.length !== 8) {
            this.showStatus('Digite um código válido (8 caracteres).', 'error', true);
            return;
        }

        try {
            this.showStatus('Conectando...', 'info', true);

            // Recuperar dados do compartilhador
            const shareData = this.retrieveShareCode(code);
            if (!shareData) {
                this.showStatus('Código inválido ou expirado.', 'error', true);
                return;
            }

            this.isViewing = true;
            await this.setupWebRTC(false, shareData.offer);

        } catch (err) {
            this.showStatus('Erro ao conectar: ' + err.message, 'error', true);
            console.error('Erro:', err);
        }
    }

    // Configurar WebRTC
    async setupWebRTC(isOfferer, remoteOffer = null) {
        // Criar conexão peer
        this.peerConnection = new RTCPeerConnection({
            iceServers: this.iceServers
        });

        // Event listeners
        this.peerConnection.addEventListener('icecandidate', (event) => {
            if (event.candidate) {
                console.log('ICE Candidate:', event.candidate);
            }
        });

        this.peerConnection.addEventListener('connectionstatechange', () => {
            console.log('Estado da conexão:', this.peerConnection.connectionState);
            
            if (this.peerConnection.connectionState === 'connected') {
                this.showStatus('Conectado com sucesso!', 'success', true);
                this.startStats();
            } else if (this.peerConnection.connectionState === 'failed') {
                this.showStatus('Falha na conexão. Tente novamente.', 'error', true);
            }
        });

        this.peerConnection.addEventListener('track', (event) => {
            console.log('Track recebido:', event.track.kind);
            const remoteVideo = document.getElementById('remoteVideo');
            remoteVideo.srcObject = event.streams[0];
            document.querySelector('.video-container').classList.add('active');
        });

        if (isOfferer) {
            // Adicionar stream de tela
            if (this.screenStream) {
                const videoTrack = this.screenStream.getVideoTracks()[0];
                this.peerConnection.addTrack(videoTrack, this.screenStream);
            }

            // Criar oferta
            const offer = await this.peerConnection.createOffer();
            await this.peerConnection.setLocalDescription(offer);

            // Armazenar oferta
            this.storeOfferForCode(this.shareCode, offer);

        } else {
            // Receber oferta e criar resposta
            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(remoteOffer));
            
            const answer = await this.peerConnection.createAnswer();
            await this.peerConnection.setLocalDescription(answer);

            // Simulação: em produção, enviar para o servidor de sinalização
            console.log('Resposta criada:', answer);
        }
    }

    // Simular armazenamento de código (localStorage)
    storeShareCode(code) {
        const data = {
            code: code,
            timestamp: Date.now(),
            offer: null
        };
        sessionStorage.setItem(`share_${code}`, JSON.stringify(data));
    }

    storeOfferForCode(code, offer) {
        const data = JSON.parse(sessionStorage.getItem(`share_${code}`) || '{}');
        data.offer = offer;
        sessionStorage.setItem(`share_${code}`, JSON.stringify(data));
    }

    retrieveShareCode(code) {
        const data = sessionStorage.getItem(`share_${code}`);
        if (!data) return null;
        
        const parsed = JSON.parse(data);
        // Verificar expiração (5 minutos)
        if (Date.now() - parsed.timestamp > 5 * 60 * 1000) {
            sessionStorage.removeItem(`share_${code}`);
            return null;
        }
        
        return parsed;
    }

    // Copiar código
    copyShareCode() {
        if (!this.shareCode) return;

        navigator.clipboard.writeText(this.shareCode).then(() => {
            const btn = document.getElementById('copyCodeBtn');
            const originalText = btn.textContent;
            btn.textContent = '✅ Copiado!';
            setTimeout(() => {
                btn.textContent = originalText;
            }, 2000);
        });
    }

    // Gerar QR Code usando API online
    generateQRCode(code) {
        const qrContainer = document.querySelector('.qr-container');
        if (!qrContainer) return;

        // Limpar conteúdo anterior
        qrContainer.innerHTML = '';

        // Criar elemento de imagem com QR code
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
            `${window.location.href}?join=${code}`
        )}`;

        const img = document.createElement('img');
        img.src = qrUrl;
        img.alt = `QR Code para ${code}`;
        img.style.maxWidth = '200px';
        img.style.height = 'auto';

        qrContainer.appendChild(img);
    }

    // Mostrar status
    showStatus(message, type = 'info', show = false) {
        const status = document.getElementById('connectionStatus');
        status.textContent = message;
        status.className = `status ${type} ${show ? 'active' : ''}`;
        
        // Auto-hide após 5 segundos
        if (show && type === 'info') {
            setTimeout(() => {
                status.classList.remove('active');
            }, 5000);
        }
    }

    // Estatísticas de conexão
    async startStats() {
        this.statsInterval = setInterval(async () => {
            if (!this.peerConnection) return;

            try {
                const stats = await this.peerConnection.getStats();
                let statsHtml = '<strong>Estatísticas WebRTC:</strong><br>';

                stats.forEach(report => {
                    if (report.type === 'inbound-rtp' && report.mediaType === 'video') {
                        statsHtml += `Fps: ${report.framesPerSecond || 'N/A'}<br>`;
                        statsHtml += `Bytes recebidos: ${(report.bytesReceived / 1024).toFixed(2)} KB<br>`;
                        statsHtml += `Pacotes perdidos: ${report.packetsLost}<br>`;
                    }
                    if (report.type === 'candidate-pair' && report.state === 'succeeded') {
                        statsHtml += `Latência: ${report.currentRoundTripTime.toFixed(3)}s<br>`;
                        statsHtml += `Taxa: ${(report.availableOutgoingBitrate / 1024000).toFixed(2)} Mbps<br>`;
                    }
                });

                document.getElementById('statsContent').innerHTML = statsHtml;
            } catch (err) {
                console.error('Erro ao obter stats:', err);
            }
        }, 1000);
    }

    // Verificar parâmetros de URL
    checkUrlParams() {
        const params = new URLSearchParams(window.location.search);
        const joinCode = params.get('join');

        if (joinCode) {
            document.getElementById('joinCode').value = joinCode;
            this.showJoinSection();
        }
    }
}

// Toggle estatísticas
function toggleStats() {
    const statsOverlay = document.getElementById('statsOverlay');
    statsOverlay.style.display = statsOverlay.style.display === 'none' ? 'block' : 'none';
}

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.screenShare = new P2PScreenShare();
    
    // Verificar suporte WebRTC
    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        console.error('Seu navegador não suporta compartilhamento de tela.');
        alert('Seu navegador não suporta WebRTC Screen Sharing. Use Chrome, Firefox ou Edge.');
    }
});

// Cleanup ao sair
window.addEventListener('beforeunload', () => {
    if (window.screenShare) {
        window.screenShare.stopSharing();
    }
});
