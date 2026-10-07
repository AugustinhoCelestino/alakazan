# 🖥️ P2P Screen Share

Um aplicativo de compartilhamento de tela peer-to-peer simples e seguro, inspirado no [p2p.kiwi](https://github.com/dont-be-evil-company/p2p.kiwi).

**Características:**
- ✅ Sem servidor central (P2P puro com WebRTC)
- ✅ Código de compartilhamento único de 8 caracteres
- ✅ QR Code para conexão rápida
- ✅ Interface moderna e responsiva
- ✅ Estatísticas de conexão em tempo real
- ✅ Compatível com navegadores modernos
- ✅ Hospedável no GitHub Pages (estático)

## 🚀 Como Usar

### Para Compartilhar sua Tela:
1. Clique em **"🔴 Iniciar Compartilhamento"**
2. Autorize o acesso à sua tela no navegador
3. Um código de 8 caracteres será gerado
4. Compartilhe o código ou escaneie o QR Code com outro dispositivo

### Para Assistir uma Tela Compartilhada:
1. Clique em **"👁️ Assistir Compartilhamento"**
2. Cole o código recebido (ou use o link com parâmetro `?join=CODIGO`)
3. Clique em **"Conectar"**
4. A tela compartilhada aparecerá automaticamente

## 🌐 Fazer Deploy no GitHub Pages

### Opção 1: Setup Automático (Recomendado)

1. **Fork ou clone este repositório**
   ```bash
   git clone https://github.com/seu-usuario/alakazan.git
   cd alakazan
   ```

2. **Habilite GitHub Pages**
   - Vá para **Settings** → **Pages**
   - Selecione **Deploy from a branch**
   - Escolha branch `main` e pasta `/root`
   - Clique em **Save**

3. **Seu site estará disponível em:**
   ```
   https://seu-usuario.github.io/alakazan/
   ```

### Opção 2: Via GitHub Actions (Mais automático)

Um workflow pode ser configurado para fazer deploy automático. Crie `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: .
```

## 📋 Estrutura de Arquivos

```
.
├── index.html       # Página principal
├── style.css        # Estilos
├── script.js        # Lógica WebRTC
├── README.md        # Este arquivo
└── .nojekyll        # Desabilita Jekyll no GitHub Pages
```

## 🔧 Tecnologias

- **HTML5** - Estrutura
- **CSS3** - Estilos modernos
- **JavaScript (Vanilla)** - Lógica WebRTC
- **WebRTC API** - Comunicação P2P
- **QRCode.js** - Geração de QR Code
- **STUN Servers** - Conectividade (Google públicos)

## 🎯 Como Funciona

```
┌─────────────────────────────────────────┐
│         Usuário A (Compartilha)         │
│  - Captura tela via getDisplayMedia()   │
│  - Cria oferta WebRTC                   │
│  - Gera código único (8 chars)          │
└────────┬────────────────────────────────┘
         │ Compartilha Código/QR
         ▼
┌─────────────────────────────────────────┐
│      Transmissão (SessionStorage)       │
│   Oferta armazenada localmente para     │
│   download quando outro peer conecta    │
└────────┬────────────────────────────────┘
         │ Cole código
         ▼
┌─────────────────────────────────────────┐
│         Usuário B (Assiste)             │
│  - Recupera oferta do código            │
│  - Cria resposta WebRTC                 │
│  - Recebe stream de tela                │
└─────────────────────────────────────────┘
```

## 🌐 Conectividade

O app usa **STUN servers públicos** do Google para permitir conexões diretas:
- `stun:stun.l.google.com:19302`
- `stun:stun1.l.google.com:19302`
- `stun:stun2.l.google.com:19302`
- `stun:stun3.l.google.com:19302`
- `stun:stun4.l.google.com:19302`

**Nota:** Para funcionar em todos os cenários (NAT complexo, redes corporativas), considere adicionar um servidor TURN.

## 🔒 Privacidade & Segurança

- ✅ Sem servidor central armazenando dados
- ✅ Sem criação de conta necessária
- ✅ Códigos expirando em 5 minutos
- ✅ Conexão P2P direta
- ⚠️ **AVISO:** Este é um protótipo educacional. Para produção, implemente:
  - Criptografia E2EE (MLS + SFrame como no p2p.kiwi)
  - Servidor TURN seguro
  - Autenticação de pares
  - Rate limiting

## 🎨 Personalizar

### Mudar cores:
Edite `:root` no `style.css`:

```css
:root {
    --primary: #10b981;      /* Verde principal */
    --secondary: #6366f1;    /* Roxo secundário */
    --danger: #ef4444;       /* Vermelho */
    --bg: #0f172a;           /* Fundo escuro */
}
```

### Adicionar logo:
Edite o `<header>` no `index.html`:

```html
<header>
    <img src="seu-logo.png" alt="Logo">
    <h1>Seu Título</h1>
</header>
```

## 📱 Suporte a Navegadores

| Navegador | Suporte |
|-----------|---------|
| Chrome    | ✅ Completo |
| Firefox   | ✅ Completo |
| Edge      | ✅ Completo |
| Safari    | ⚠️ Parcial (iOS 15+) |
| Opera     | ✅ Completo |
| IE 11     | ❌ Não suportado |

## 🐛 Troubleshooting

### "Permissão negada" ao iniciar compartilhamento
- Verifique se deu permissão ao navegador acessar sua tela
- Tente em abas anônimas/privadas

### Conexão cai continuamente
- Firewall pode estar bloqueando
- Tente adicionar servidor TURN
- Verifique latência com `ping`

### QR Code não aparece
- Certifique-se que QRCode.js foi carregado (biblioteca CDN)
- Abra console (F12) para ver erros

## 📚 Referências

- [WebRTC MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)
- [Screen Capture API](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Capture_API)
- [p2p.kiwi](https://p2p.kiwi/) - Projeto inspirador
- [RFC 9420 - MLS](https://www.rfc-editor.org/rfc/rfc9420.html)

## 📄 Licença

MIT License - Veja LICENSE para detalhes

## 🤝 Contribuições

Contribuições são bem-vindas! Por favor:
1. Faça fork
2. Crie uma branch (`git checkout -b feature/melhoria`)
3. Commit suas mudanças (`git commit -am 'Add feature'`)
4. Push para a branch (`git push origin feature/melhoria`)
5. Abra um Pull Request

## 📞 Suporte

Encontrou um bug? Abra uma [Issue](https://github.com/seu-usuario/alakazan/issues)!

---

**Desenvolvido com ❤️ como um projeto P2P simples**

Inspirado em: [p2p.kiwi](https://github.com/dont-be-evil-company/p2p.kiwi) 🥝
