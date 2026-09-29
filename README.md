# RPG Display System

Sistema de controle visual para mestres de RPG com sincronização em tempo real.

## Estrutura do Projeto

```
/
├── index.html                 # Redirecionador para html/index.html
├── css/
│   └── styles.css            # Estilos CSS da aplicação
├── js/
│   └── script.js             # Lógica JavaScript
└── html/
    └── index.html            # Estrutura HTML principal
```

## Como Usar

1. Abra `index.html` no navegador
2. Escolha entre:
   - **Painel do Mestre**: Controle visual com upload de imagens
   - **Tela dos Jogadores**: Exibição das imagens

## Funcionalidades

- 📤 Upload de imagens via URL ou arquivo
- 🖼️ Pré-visualização em tempo real
- 👥 Sincronização entre múltiplas abas/janelas
- 🕶️ Blackout (escurecer tela)
- 📺 Abertura em nova janela para apresentação

## Tecnologia

- HTML5
- CSS3 (com variáveis CSS)
- JavaScript Vanilla (BroadcastChannel API)
