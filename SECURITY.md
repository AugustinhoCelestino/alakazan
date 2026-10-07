# 🔒 Guia de Segurança & Próximos Passos

Este documento descreve como melhorar a segurança e adicionar recursos avançados ao P2P Screen Share.

## 🔐 Segurança Atual

### ✅ O que temos:
- Conexão P2P direta via WebRTC
- Sem servidor central armazenando streams
- STUN servers apenas para descoberta de conectividade

### ⚠️ O que falta:
- Criptografia End-to-End (E2EE) de mídia
- Verificação de identidade
- Rate limiting
- Proteção contra replay attacks

## 🛠️ Roadmap - Próximas Melhorias

### Phase 1: Estabilidade (v1.1)
- [ ] Reconexão automática
- [ ] Melhor tratamento de erros
- [ ] Suporte a múltiplos peers
- [ ] Histórico de códigos

### Phase 2: Segurança Intermediária (v1.2)
- [ ] Adicionar servidor TURN opcional
- [ ] Implementar verificação de hash (fingerprint)
- [ ] Rate limiting de conexões
- [ ] Logs de auditoria

### Phase 3: E2EE Completo (v2.0)
Inspirado no p2p.kiwi, implementar:

```
┌─────────────────────────────────────┐
│     MLS (Membership Layer)          │
│  - Gerenciamento de chaves E2EE     │
│  - Autenticação de grupo            │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│    SFrame (Media Encryption)        │
│  - Criptografia de frames de vídeo  │
│  - Sem conhecimento do servidor     │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│      DTLS-SRTP (Transport)          │
│  - Criptografia de transporte       │
│  - Autenticação TLS                 │
└─────────────────────────────────────┘
```

## 📦 Implementar E2EE com SFrame

### Instalação
```bash
npm install sframe-js
```

### Exemplo de código
```javascript
import { SFrameTransformer } from 'sframe-js';

// Criar chave compartilhada (via MLS ou manual)
const key = new Uint8Array(32); // 32 bytes para AES-256
crypto.getRandomValues(key);

// Aplicar criptografia aos frames
const videoTrack = stream.getVideoTracks()[0];
const transformer = new SFrameTransformer(key);
const encryptedTrack = await videoTrack.getProcessor()
  .addTransform(transformer);

peerConnection.addTrack(encryptedTrack);
```

## 🔑 Gerenciamento de Chaves

### Opção 1: Manual (Simples)
```javascript
// Compartilhar senha no QR code
const password = generatePassword(12);
const key = await deriveKeyFromPassword(password);
```

### Opção 2: MLS (Produção)
Usar biblioteca [mlsjs](https://github.com/mlswg/mls-implementations)

```javascript
import { Group } from 'mlsjs';

const group = new Group();
const keyPackage = group.createKeyPackage();
// Compartilhar key package via signaling
```

## 🌐 Servidor de Sinalização

Para uma versão mais robusta, implementar servidor de sinalização:

### Usar Signalhub (WebSocket)
```javascript
const signalhub = require('signalhub');

const hub = signalhub('screenshare-room', [
  'http://localhost:3000'
]);

// Compartilhar oferta/resposta
hub.broadcast('offer', offer);
hub.on('answer', (data) => {
  peerConnection.setRemoteDescription(data.answer);
});
```

### Ou Firebase Realtime Database
```javascript
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue } from 'firebase/database';

const config = {
  apiKey: "...",
  databaseURL: "https://seu-projeto.firebaseio.com"
};

const app = initializeApp(config);
const db = getDatabase(app);

// Armazenar oferta
set(ref(db, `rooms/${code}/offer`), offer);

// Ouvir resposta
onValue(ref(db, `rooms/${code}/answer`), (snapshot) => {
  peerConnection.setRemoteDescription(snapshot.val());
});
```

## 📊 Monitoramento & Análise

### Adicionar Sentry (Error Tracking)
```bash
npm install @sentry/browser
```

```javascript
import * as Sentry from "@sentry/browser";

Sentry.init({
  dsn: "https://seu-dsn@sentry.io/123456",
  environment: "production"
});

try {
  // seu código
} catch (err) {
  Sentry.captureException(err);
}
```

### Google Analytics
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_ID');
</script>
```

## 🚀 Deploy em Produção

### Checklist
- [ ] HTTPS ativado (obrigatório para getUserMedia)
- [ ] CORS configurado
- [ ] CSP (Content Security Policy) headers
- [ ] Rate limiting
- [ ] Logging & Monitoring
- [ ] Backup & Recovery
- [ ] Testes de carga
- [ ] Documentação completa

### Nginx Config
```nginx
server {
    listen 443 ssl http2;
    server_name example.com;

    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'" always;

    root /var/www/p2p-screen-share;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }
}
```

## 🧪 Testes

### Teste E2E com Playwright
```bash
npm install -D @playwright/test
```

```javascript
import { test, expect } from '@playwright/test';

test('screen sharing flow', async ({ browser }) => {
  const context = await browser.newContext();
  const page1 = await context.newPage();
  const page2 = await context.newPage();

  // Página 1: Compartilhar
  await page1.goto('http://localhost:3000');
  await page1.click('#startShareBtn');
  const code = await page1.textContent('#shareCode');

  // Página 2: Conectar
  await page2.goto('http://localhost:3000');
  await page2.click('#joinBtn');
  await page2.fill('#joinCode', code);
  await page2.click('#connectBtn');

  // Verificar conexão
  await expect(page2.locator('video')).toBeVisible({ timeout: 10000 });
});
```

## 📚 Recursos Adicionais

- [WebRTC Security Guide](https://www.ietf.org/rfc/rfc8827.txt)
- [MLS RFC 9420](https://www.rfc-editor.org/rfc/rfc9420.html)
- [SFrame RFC 9605](https://www.rfc-editor.org/rfc/rfc9605.html)
- [p2p.kiwi Source Code](https://github.com/dont-be-evil-company/p2p.kiwi)
- [OWASP WebRTC Security](https://cheatsheetseries.owasp.org/cheatsheets/WebRTC_Security_Cheat_Sheet.html)

## 🤝 Contribuindo

Para contribuir com melhorias de segurança:
1. Não divulgue vulnerabilidades publicamente
2. Envie relatório detalhado para security@example.com
3. Aguarde resposta antes de divulgar
4. Será creditado no SECURITY.md

---

**Última atualização:** 2026-10-07

**Versão:** 1.0.0 - MVP
