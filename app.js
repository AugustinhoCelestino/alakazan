// P2P Screen Share - Versão 3.0 Inline
console.log('✅ P2P Screen Share v3.0 Carregado com Sucesso!');

class P2PScreenShare {
    constructor() {
        this.peerConnection = null;
        this.screenStream = null;
        this.isSharing = false;
        this.shareCode = null;
        this.iceServers = [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' }
        ];
        this.init();
    }

    init() {
        document.getElementById('startShareBtn').addEventListener('click', () => this.startSharing());
        document.getElementById('joinBtn').addEventListener('click', () => this.showJoinSection());
        document.getElementById('stopShareBtn').addEventListener('click', () => this.stopSharing());
        document.getElementById('connectBtn').addEventListener('click', () => this.connectToShare());
        document.getElementById('cancelJoinBtn').addEventListener('click', () => this.cancelJoin());
        document.getElementById('copyCodeBtn').addEventListener('click', () => this.copyShareCode());
        this.checkUrlParams();
    }

    generateCode() {
        let code = '';
        for (let i = 0; i < 8; i++) {
            code += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 36)];
        }
        return code;
    }

    async startSharing() {
        try {
            this.shareCode = this.generateCode();
            document.getElementById('shareCode').textContent = this.shareCode;
            this.generateQRCode(this.shareCode);

            this.screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: { cursor: 'always' },
                audio: false
            });

            this.isSharing = true;
            document.getElementById('connectionSection').style.display = 'none';
            document.getElementById('shareSection').style.display = 'block';

            this.screenStream.getTracks()[0].addEventListener('ended', () => {
                if (this.isSharing) this.stopSharing();
            });

            await this.setupWebRTC(true);
            this.storeCode(this.shareCode);

        } catch (err) {
            console.error('❌ Erro:', err);
            this.showStatus('Erro: ' + err.message, 'error');
        }
    }

    async stopSharing() {
        this.isSharing = false;
        if (this.screenStream) {
            this.screenStream.getTracks().forEach(t => t.stop());
            this.screenStream = null;
        }
        if (this.peerConnection) {
            this.peerConnection.close();
            this.peerConnection = null;
        }
        document.getElementById('connectionSection').style.display = 'block';
        document.getElementById('shareSection').style.display = 'none';
    }

    showJoinSection() {
        document.getElementById('connectionSection').style.display = 'none';
        document.getElementById('viewSection').style.display = 'block';
    }

    cancelJoin() {
        document.getElementById('connectionSection').style.display = 'block';
        document.getElementById('viewSection').style.display = 'none';
    }

    async connectToShare() {
        const code = document.getElementById('joinCode').value.toUpperCase();
        if (code.length !== 8) {
            this.showStatus('Código inválido', 'error');
            return;
        }

        const data = this.retrieveCode(code);
        if (!data) {
            this.showStatus('Código expirado', 'error');
            return;
        }

        await this.setupWebRTC(false, data.offer);
    }

    async setupWebRTC(isOfferer, remoteOffer = null) {
        this.peerConnection = new RTCPeerConnection({ iceServers: this.iceServers });

        this.peerConnection.addEventListener('track', (event) => {
            document.getElementById('remoteVideo').srcObject = event.streams[0];
            document.querySelector('.video-container').classList.add('active');
            this.showStatus('✅ Conectado!', 'success');
        });

        if (isOfferer && this.screenStream) {
            this.peerConnection.addTrack(this.screenStream.getVideoTracks()[0], this.screenStream);
            const offer = await this.peerConnection.createOffer();
            await this.peerConnection.setLocalDescription(offer);
            this.storeOffer(this.shareCode, offer);
        } else if (remoteOffer) {
            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(remoteOffer));
            const answer = await this.peerConnection.createAnswer();
            await this.peerConnection.setLocalDescription(answer);
        }
    }

    generateQRCode(code) {
        const qr = document.getElementById('qrContainer');
        qr.innerHTML = '';
        const img = document.createElement('img');
        img.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(location.href + '?join=' + code)}`;
        qr.appendChild(img);
    }

    storeCode(code) {
        sessionStorage.setItem(`share_${code}`, JSON.stringify({ code, timestamp: Date.now(), offer: null }));
    }

    storeOffer(code, offer) {
        const data = JSON.parse(sessionStorage.getItem(`share_${code}`) || '{}');
        data.offer = offer;
        sessionStorage.setItem(`share_${code}`, JSON.stringify(data));
    }

    retrieveCode(code) {
        const data = sessionStorage.getItem(`share_${code}`);
        if (!data) return null;
        const p = JSON.parse(data);
        if (Date.now() - p.timestamp > 300000) {
            sessionStorage.removeItem(`share_${code}`);
            return null;
        }
        return p;
    }

    copyShareCode() {
        navigator.clipboard.writeText(this.shareCode);
        const btn = document.getElementById('copyCodeBtn');
        btn.textContent = '✅ Copiado!';
        setTimeout(() => btn.textContent = '📋 Copiar', 2000);
    }

    showStatus(msg, type) {
        const st = document.getElementById('connectionStatus');
        st.textContent = msg;
        st.className = `status ${type} active`;
    }

    checkUrlParams() {
        const code = new URLSearchParams(location.search).get('join');
        if (code) {
            document.getElementById('joinCode').value = code;
            this.showJoinSection();
        }
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    window.screenShare = new P2PScreenShare();
});

function toggleStats() {
    const el = document.getElementById('statsOverlay');
    el.style.display = el.style.display === 'none' ? 'block' : 'none';
}
