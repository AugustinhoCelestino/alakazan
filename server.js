const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Estado compartilhado entre as abas
let currentState = {
  imageData: null,
  blackout: false,
  players: []
};

const server = http.createServer((req, res) => {
  // Parse da URL
  const parsedUrl = url.parse(req.url, true);
  let pathname = parsedUrl.pathname;
  const query = parsedUrl.query;

  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight CORS
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // API endpoints para sincronização
  if (pathname === '/api/message' && req.method === 'POST') {
    // Receber mensagem do mestre
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        
        // Separar dados de jogadores dos dados de imagem
        if (data.type === 'SYNC_PLAYERS') {
          currentState.players = data.players || [];
          console.log('📤 Jogadores sincronizados:', currentState.players.length);
        } else if (data.type === 'UPDATE_IMAGE' || data.type === 'TOGGLE_BLACKOUT') {
          // Preservar jogadores ao atualizar imagem
          if (data.players) {
            currentState.players = data.players;
          }
          currentState = { ...currentState, ...data };
          console.log('📤 Mensagem recebida:', data.type);
        } else {
          currentState = data;
          console.log('📤 Mensagem recebida:', data.type);
        }
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (e) {
        res.writeHead(400);
        res.end('Invalid JSON');
      }
    });
    return;
  }

  if (pathname === '/api/message' && req.method === 'GET') {
    // Enviar estado atual ao jogador
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(currentState));
    return;
  }

  if (pathname === '/api/clear' && req.method === 'POST') {
    // Limpar estado
    currentState = { imageData: null, blackout: false };
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true }));
    return;
  }

  // Servir arquivos estáticos
  if (pathname === '/') {
    pathname = '/html/index.html';
  }

  const filePath = path.join(__dirname, pathname);
  const ext = path.extname(filePath).toLowerCase();
  const contentTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif'
  };
  const contentType = contentTypes[ext] || 'text/plain';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found: ' + pathname);
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    }
  });
});

server.listen(8080, () => {
  console.log('🚀 Servidor com API de sincronização rodando em http://localhost:8080');
  console.log('📡 Endpoints:');
  console.log('   POST /api/message - Mestre envia mensagem');
  console.log('   GET  /api/message - Player recebe mensagem');
  console.log('   POST /api/clear   - Limpar estado');
});

