// Usando BroadcastChannel para sincronização em tempo real entre abas/janelas
const channel = new BroadcastChannel('rpg_display_channel');
let currentImageSrc = '';
let isBlackout = false;

function initMode(mode) {
  document.getElementById('mode-selector').style.display = 'none';
  if (mode === 'master') {
    document.getElementById('master-view').classList.add('active-view');
  } else {
    document.getElementById('player-view').classList.add('active-view');
    // Pedir atualização ao abrir
    channel.postMessage({ type: 'REQUEST_STATE' });
  }
}

function openPlayerWindow() {
  window.open(window.location.href + '?mode=player', '_blank');
}

// Auto-detecta parâmetro de URL ?mode=player
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('mode') === 'player') {
  initMode('player');
}

/* --- LÓGICA DO MESTRE --- */
function loadFromUrl() {
  const url = document.getElementById('img-url-input').value.trim();
  if (url) {
    setMasterPreview(url);
  }
}

function loadFromFile(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      setMasterPreview(e.target.result);
    };
    reader.readAsDataURL(file);
  }
}

function setMasterPreview(src) {
  currentImageSrc = src;
  const previewImg = document.getElementById('master-preview');
  const placeholder = document.getElementById('preview-placeholder');
  
  previewImg.src = src;
  previewImg.style.display = 'block';
  placeholder.style.display = 'none';
}

function sendToPlayers(show = true) {
  if (!currentImageSrc) return;
  isBlackout = !show;
  channel.postMessage({
    type: 'UPDATE_IMAGE',
    src: currentImageSrc,
    blackout: isBlackout
  });
}

function toggleBlackout() {
  isBlackout = !isBlackout;
  channel.postMessage({
    type: 'TOGGLE_BLACKOUT',
    blackout: isBlackout
  });
}

function clearDisplay() {
  currentImageSrc = '';
  isBlackout = false;
  document.getElementById('master-preview').style.display = 'none';
  document.getElementById('preview-placeholder').style.display = 'block';
  channel.postMessage({ type: 'CLEAR' });
}

/* --- LÓGICA DE SINCRONIZAÇÃO (CANAL) --- */
channel.onmessage = (event) => {
  const data = event.data;

  // Se for a tela dos jogadores processando o comando do mestre
  const playerImg = document.getElementById('player-image');

  if (data.type === 'UPDATE_IMAGE') {
    playerImg.src = data.src;
    if (!data.blackout) {
      playerImg.classList.add('visible');
    } else {
      playerImg.classList.remove('visible');
    }
  } else if (data.type === 'TOGGLE_BLACKOUT') {
    if (data.blackout) {
      playerImg.classList.remove('visible');
    } else if (playerImg.src) {
      playerImg.classList.add('visible');
    }
  } else if (data.type === 'CLEAR') {
    playerImg.classList.remove('visible');
    setTimeout(() => { playerImg.src = ''; }, 500);
  } else if (data.type === 'REQUEST_STATE') {
    // Envia o estado atual quando um novo jogador se conecta
    if (currentImageSrc) {
      sendToPlayers(!isBlackout);
    }
  }
};
