# ⚡ Quick Start

## Opção 1: Usar no GitHub Pages (Sem instalação)

1. **Fork este repositório:**
   - Vá para https://github.com/seu-usuario/alakazan
   - Clique em ⭐ **Settings**
   - Scroll até **GitHub Pages**
   - Habilite com branch `main`

2. **Seu site está pronto em:**
   ```
   https://seu-usuario.github.io/alakazan/
   ```

## Opção 2: Executar Localmente

### Requisitos
- Navegador moderno (Chrome, Firefox, Edge)
- Python 3 ou Node.js (opcional, apenas para servir localmente)

### Passos

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/seu-usuario/alakazan.git
   cd alakazan
   ```

2. **Inicie um servidor local:**

   **Com Python:**
   ```bash
   python -m http.server 8000
   # Ou para Python 2:
   python -m SimpleHTTPServer 8000
   ```

   **Com Node.js:**
   ```bash
   npx http-server
   ```

   **Com Live Server (VS Code):**
   - Instale extensão "Live Server"
   - Clique em "Go Live" no VS Code

3. **Abra no navegador:**
   ```
   http://localhost:8000
   ```

## 🎯 Usar a Aplicação

### Para Compartilhar:
1. Click: **🔴 Iniciar Compartilhamento**
2. Escolha sua tela/janela
3. Compartilhe o código ou QR Code

### Para Assistir:
1. Click: **👁️ Assistir Compartilhamento**
2. Cole o código ou use o link: `http://localhost:8000?join=CODIGO`
3. Conectar e visualizar!

## 🔗 Compartilhar Código

### Método 1: Código Manual
```
Código: ABCD1234
```

### Método 2: Link Direto
```
https://seu-usuario.github.io/alakazan/?join=ABCD1234
```

### Método 3: QR Code
Escanear QR Code gerado na tela

## ❓ Troubleshooting

### Erro: "Permissão negada"
```
✅ Solução: Autorize o acesso à tela quando o navegador solicitar
```

### Erro: "Sem conexão"
```
✅ Solução 1: Verifique sua conexão Internet
✅ Solução 2: Tente de outro navegador
✅ Solução 3: Aumente timeout (arquivo: script.js, linha ~50)
```

### QR Code não aparece
```
✅ Solução: Verifique console (F12) para erros
```

### Tela travada/lag
```
✅ Solução: Verifique latência (Mostrar Estatísticas)
✅ Solução: Reduza resolução de tela compartilhada
✅ Solução: Use navegador mais recente
```

## 📱 Testar em Múltiplos Dispositivos

### Cenário 1: Mesmo dispositivo
```
1. Abra 2 abas no Chrome
2. Aba 1: Clique "Iniciar Compartilhamento"
3. Aba 2: Cole código e "Conectar"
4. Verá espelho do próprio navegador 😄
```

### Cenário 2: Dispositivos diferentes
```
1. PC - Navegador 1: Inicia compartilhamento
2. Smartphone - Navegador 2: Conecta com QR Code
3. Visualiza tela do PC no smartphone!
```

### Cenário 3: Redes diferentes
```
1. Use link público: https://seu-usuario.github.io/alakazan/?join=CODIGO
2. Compartilhe em grupo Whatsapp/Discord
3. Todos podem conectar ao código mesmo em redes diferentes
```

## 🛠️ Customizações Rápidas

### Mudar cor principal
**Arquivo: `style.css`**
```css
:root {
    --primary: #10b981;  /* Mude aqui */
}
```

### Mudar título
**Arquivo: `index.html`**
```html
<h1>Seu Título Aqui</h1>
```

### Adicionar logo
**Arquivo: `index.html`**
```html
<header>
    <img src="logo.png" alt="Logo" width="100">
    <h1>Screen Share</h1>
</header>
```

## 📖 Próximos Passos

1. ✅ Configurar GitHub Pages
2. ✅ Fazer primeiro compartilhamento
3. 📖 Ler [README.md](README.md) completo
4. 🔒 Revisar [SECURITY.md](SECURITY.md) para produção
5. 🚀 Fazer deploy em servidor próprio (opcional)

## 🆘 Precisa de Ajuda?

- 📺 Veja demo em: https://p2p.kiwi
- 📚 Documentação: [MDN WebRTC](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)
- 🐛 Abra issue: GitHub Issues
- 💬 Pergunte: GitHub Discussions

---

**Pronto para começar? Abra [index.html](index.html) agora!** 🚀
