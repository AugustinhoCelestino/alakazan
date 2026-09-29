// Usando BroadcastChannel para sincronização em tempo real entre abas/janelas
const channel = new BroadcastChannel('rpg_display_channel');
let imagesList = [];  // Array para armazenar todas as imagens
let currentImageIndex = -1;  // Índice da imagem selecionada
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
    addImageToGallery(url);
    document.getElementById('img-url-input').value = '';
  }
}

function loadFromFile(event) {
  const files = event.target.files;
  if (files && files.length > 0) {
    let filesProcessed = 0;
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = function(e) {
        addImageToGallery(e.target.result);
        filesProcessed++;
        if (filesProcessed === files.length) {
          event.target.value = ''; // Limpar o input
        }
      };
      reader.readAsDataURL(file);
    }
  }
}

function addImageToGallery(src) {
  imagesList.push(src);
  renderGallery();
  
  // Selecionar automaticamente a primeira imagem adicionada
  if (imagesList.length === 1) {
    selectImage(0);
  }
}

function selectImage(index) {
  if (index >= 0 && index < imagesList.length) {
    currentImageIndex = index;
    updatePreview();
    renderGallery();
  }
}

function removeImage(index) {
  imagesList.splice(index, 1);
  
  if (currentImageIndex === index) {
    // Se removeu a imagem selecionada, seleciona a próxima ou anterior
    if (imagesList.length > 0) {
      currentImageIndex = Math.min(index, imagesList.length - 1);
      updatePreview();
    } else {
      currentImageIndex = -1;
      clearPreview();
    }
  } else if (currentImageIndex > index) {
    currentImageIndex--;
  }
  
  renderGallery();
}

function renderGallery() {
  const galleryDiv = document.getElementById('images-gallery');
  const galleryList = document.getElementById('gallery-list');
  
  if (imagesList.length === 0) {
    galleryDiv.style.display = 'none';
    galleryList.innerHTML = '';
    updateNavigationButtons();
    return;
  }
  
  galleryDiv.style.display = 'block';
  galleryList.innerHTML = imagesList.map((img, index) => `
    <div class="gallery-item ${index === currentImageIndex ? 'active' : ''}" onclick="selectImage(${index})">
      <img src="${img}" alt="Imagem ${index + 1}">
      <button class="gallery-item-delete" onclick="event.stopPropagation(); removeImage(${index})">✕</button>
    </div>
  `).join('');
  
  updateNavigationButtons();
}

function updateNavigationButtons() {
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');
  const imagesCount = document.getElementById('images-count');
  const currentImageInfo = document.getElementById('current-image-info');
  
  if (btnPrev) btnPrev.disabled = currentImageIndex <= 0;
  if (btnNext) btnNext.disabled = currentImageIndex >= imagesList.length - 1;
  
  if (imagesCount) imagesCount.textContent = imagesList.length;
  if (currentImageInfo) {
    if (imagesList.length > 0 && currentImageIndex >= 0) {
      currentImageInfo.textContent = `${currentImageIndex + 1} de ${imagesList.length}`;
    } else {
      currentImageInfo.textContent = '';
    }
  }
}

function updatePreview() {
  if (currentImageIndex >= 0 && currentImageIndex < imagesList.length) {
    const previewImg = document.getElementById('master-preview');
    const placeholder = document.getElementById('preview-placeholder');
    
    previewImg.src = imagesList[currentImageIndex];
    previewImg.style.display = 'block';
    placeholder.style.display = 'none';
  }
}

function clearPreview() {
  const previewImg = document.getElementById('master-preview');
  const placeholder = document.getElementById('preview-placeholder');
  
  previewImg.style.display = 'none';
  placeholder.style.display = 'block';

function sendToPlayers(show = true) {
  if (currentImageIndex < 0 || currentImageIndex >= imagesList.length) return;
  isBlackout = !show;
  channel.postMessage({
    type: 'UPDATE_IMAGE',
    src: imagesList[currentImageIndex],
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
  imagesList = [];
  currentImageIndex = -1;
  isBlackout = false;
  clearPreview();
  renderGallery();
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
    if (currentImageIndex >= 0 && currentImageIndex < imagesList.length) {
      sendToPlayers(!isBlackout);
    }
  }
};
