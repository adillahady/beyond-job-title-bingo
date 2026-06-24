const activities = [
  { text: 'Pernah bantu orang tanpa diminta', icon: '🤲' },
  { text: 'Selalu bersyukur untuk hal yang kecil dalam hidup', icon: '😊' },
  { text: 'Pernah cakap “on the way” padahal baru bangun', icon: '⏰' },
  { text: 'Pernah buka TikTok “5 minit” jadi 1 jam', icon: '📱' },
  { text: 'Buat muka fokus di office walaupun kepala fikirkan cuti', icon: '🧳' },
  { text: 'Pura-pura busy bila orang lalu belakang', icon: '💻' },
  { text: 'Pernah memberi kata-kata positif kepada rakan sekerja', icon: '💬' },
  { text: 'Kacau kawan di office', icon: '😄' },
  { text: 'Menjadi tempat orang meluah', icon: '💗' },
  { text: 'Pergi tandas untuk berehat dari interaksi sosial', icon: '🌿' },
  { text: 'Pernah memaafkan seseorang walaupun sukar', icon: '🩹' },
  { text: 'Tengok jam setiap 10 minit tunggu balik', icon: '⌚' },
  { text: 'Menjaga hubungan baik dengan keluarga', icon: '👨‍👩‍👧' },
  { text: 'Cakap “noted” walaupun sebenarnya blur', icon: '📝' },
  { text: 'Buka Excel untuk nampak busy', icon: '📊' },
  { text: 'Belajar sesuatu daripada kegagalan', icon: '🌱' },
  { text: 'Percaya setiap cabaran ada hikmah', icon: '⛰️' },
  { text: 'Menjaga kesihatan fizikal dan emosi', icon: '💪' },
  { text: 'Selalu mengeluh tetapi tetap produktif', icon: '😮‍💨' },
  { text: 'Pernah tertidur sambil buka laptop', icon: '💤' },
  { text: 'Pernah keluar dari comfort zone', icon: '🚶' },
  { text: 'Pernah bersabar dalam situasi yang mencabar', icon: '⏳' },
  { text: 'Lupa balas mesej sebab “reply dalam kepala”', icon: '💭' },
  { text: 'Berani meminta bantuan apabila diperlukan', icon: '🤝' }
];

const freeSpace = { text: 'RUANG PERCUMA', icon: '✨', isFree: true };
const storageKey = 'beyond-job-title-bingo-v1';
const winningLines = [
  [0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13, 14], [15, 16, 17, 18, 19], [20, 21, 22, 23, 24],
  [0, 5, 10, 15, 20], [1, 6, 11, 16, 21], [2, 7, 12, 17, 22], [3, 8, 13, 18, 23], [4, 9, 14, 19, 24],
  [0, 6, 12, 18, 24], [4, 8, 12, 16, 20]
];

const boardElement = document.getElementById('bingoBoard');
const playerNameInput = document.getElementById('playerName');
const progressElement = document.getElementById('progress');
const signModal = document.getElementById('signModal');
const qrModal = document.getElementById('qrModal');
const winnerModal = document.getElementById('winnerModal');
const selectedStatement = document.getElementById('selectedStatement');
const colleagueNameInput = document.getElementById('colleagueName');
const signMessage = document.getElementById('signMessage');
const qrContainer = document.getElementById('qrCode');
const qrUrl = document.getElementById('qrUrl');
const localWarning = document.getElementById('localWarning');

let game = null;
let activeCellIndex = null;

function shuffle(list) {
  const result = [...list];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function createGameState(name = '') {
  const shuffled = shuffle(activities);
  return {
    playerName: name,
    card: [...shuffled.slice(0, 12), freeSpace, ...shuffled.slice(12)],
    selected: [12],
    signatures: {},
    celebrated: false
  };
}

function saveGame() {
  localStorage.setItem(storageKey, JSON.stringify(game));
}

function loadGame() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (saved && Array.isArray(saved.card) && saved.card.length === 25) {
      game = saved;
      game.selected = Array.isArray(game.selected) ? game.selected : [12];
      game.signatures = game.signatures || {};
      game.celebrated = Boolean(game.celebrated);
      return;
    }
  } catch (error) {
    // A fresh game is safer than using incomplete saved data.
  }
  game = createGameState();
  saveGame();
}

function normalizeName(name) {
  return name.trim().replace(/\s+/g, ' ').toLocaleLowerCase();
}

function renderBoard() {
  boardElement.innerHTML = '';
  const selected = new Set(game.selected.map(Number));

  game.card.forEach((item, index) => {
    const cell = document.createElement('button');
    const isMarked = selected.has(index);
    const signature = item.isFree ? (game.playerName || 'BEBAS') : (game.signatures[index] || '');

    cell.type = 'button';
    cell.className = `bingo-cell ${item.isFree ? 'free-cell' : `tone-${index % 5}`} ${isMarked ? 'is-marked' : ''}`;
    cell.setAttribute('role', 'gridcell');
    cell.setAttribute('aria-pressed', String(isMarked));
    cell.setAttribute('aria-label', `${item.text}${signature ? `, ditandakan oleh ${signature}` : ''}`);
    cell.dataset.index = String(index);

    const icon = document.createElement('span');
    icon.className = 'cell-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = item.icon;

    const text = document.createElement('span');
    text.className = 'cell-text';
    text.textContent = item.text;

    const sign = document.createElement('span');
    sign.className = 'cell-signature';
    sign.textContent = item.isFree ? (game.playerName ? `Pemain: ${game.playerName}` : 'Pemain anda') : signature;

    const check = document.createElement('span');
    check.className = 'cell-check';
    check.setAttribute('aria-hidden', 'true');
    check.textContent = '✓';

    cell.append(icon, text, sign, check);
    if (item.isFree) {
      cell.disabled = true;
    } else {
      cell.addEventListener('click', () => handleCellClick(index));
    }
    boardElement.appendChild(cell);
  });

  updateProgress();
}

function getCompletedLines() {
  const marked = new Set(game.selected.map(Number));
  return winningLines.filter((line) => line.every((index) => marked.has(index)));
}

function updateProgress() {
  const markedActivities = game.selected.filter((index) => Number(index) !== 12).length;
  const lineCount = getCompletedLines().length;

  if (lineCount > 0) {
    progressElement.textContent = `BINGO! ${lineCount} garisan lengkap • ${markedActivities}/24 kotak ditanda.`;
  } else {
    progressElement.textContent = `${markedActivities}/24 kotak ditanda • Lengkapkan 5 kotak sebaris, selajur atau diagonal.`;
  }
}

function handleCellClick(index) {
  const marked = new Set(game.selected.map(Number));
  if (marked.has(index)) {
    const signature = game.signatures[index] || '';
    const label = signature ? `Buang tanda oleh ${signature}?` : 'Buang tanda pada kotak ini?';
    if (window.confirm(label)) {
      game.selected = game.selected.filter((item) => Number(item) !== index);
      delete game.signatures[index];
      game.celebrated = false;
      saveGame();
      renderBoard();
    }
    return;
  }

  activeCellIndex = index;
  selectedStatement.textContent = game.card[index].text;
  colleagueNameInput.value = '';
  signMessage.textContent = '';
  openModal(signModal);
  window.setTimeout(() => colleagueNameInput.focus(), 50);
}

function saveSignature() {
  const signature = colleagueNameInput.value.trim();
  if (!signature) {
    signMessage.textContent = 'Sila masukkan nama atau inisial rakan sekerja.';
    colleagueNameInput.focus();
    return;
  }

  const normalized = normalizeName(signature);
  const currentUses = Object.entries(game.signatures)
    .filter(([index, value]) => Number(index) !== activeCellIndex && normalizeName(String(value)) === normalized)
    .length;

  if (currentUses >= 3) {
    signMessage.textContent = 'Nama/inisial ini sudah digunakan untuk 3 kotak. Sila cari rakan lain.';
    return;
  }

  if (!game.selected.includes(activeCellIndex)) {
    game.selected.push(activeCellIndex);
  }
  game.signatures[activeCellIndex] = signature;
  closeModal(signModal);
  saveGame();
  renderBoard();
  checkForBingo();
}

function checkForBingo() {
  const lines = getCompletedLines();
  if (lines.length === 0 || game.celebrated) return;

  game.celebrated = true;
  saveGame();
  const displayName = game.playerName ? `${game.playerName}, anda` : 'Anda';
  document.getElementById('winnerText').textContent = `${displayName} telah melengkapkan ${lines.length} garisan Bingo. Ambil tangkap layar sebagai bukti kemenangan!`;
  openModal(winnerModal);
}

function resetMarks() {
  if (!window.confirm('Reset semua tanda pada kad ini?')) return;
  game.selected = [12];
  game.signatures = {};
  game.celebrated = false;
  saveGame();
  renderBoard();
}

function newCard() {
  if (!window.confirm('Cipta kad baharu? Semua tanda pada kad semasa akan hilang.')) return;
  const playerName = playerNameInput.value.trim();
  game = createGameState(playerName);
  saveGame();
  renderBoard();
}

function openModal(modal) {
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
}

function closeModal(modal) {
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
}

function showQRCode() {
  const url = window.location.href;
  qrContainer.innerHTML = '';
  qrUrl.textContent = url;
  localWarning.hidden = url.startsWith('http://') || url.startsWith('https://');

  if (typeof QRCode === 'function') {
    new QRCode(qrContainer, {
      text: url,
      width: 220,
      height: 220,
      colorDark: '#0a3f87',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.H
    });
  } else {
    qrContainer.textContent = 'Kod QR tidak dapat dimuatkan. Semak sambungan internet dan cuba semula.';
  }
  openModal(qrModal);
}

async function copyUrl() {
  const url = window.location.href;
  try {
    await navigator.clipboard.writeText(url);
    document.getElementById('copyUrlButton').textContent = 'Pautan disalin ✓';
  } catch (error) {
    window.prompt('Salin pautan ini:', url);
  }
}

async function shareGame() {
  const shareData = {
    title: 'Beyond the Job Title Bingo',
    text: 'Jom main Beyond the Job Title Bingo!',
    url: window.location.href
  };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      await navigator.clipboard.writeText(window.location.href);
      document.getElementById('shareButton').textContent = 'Pautan disalin ✓';
    }
  } catch (error) {
    // The user may close the browser share sheet. No error message is needed.
  }
}

playerNameInput.addEventListener('input', () => {
  game.playerName = playerNameInput.value.trim();
  saveGame();
  renderBoard();
});

document.getElementById('saveSignButton').addEventListener('click', saveSignature);
colleagueNameInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') saveSignature();
});
document.getElementById('resetButton').addEventListener('click', resetMarks);
document.getElementById('newCardButton').addEventListener('click', newCard);
document.getElementById('qrButton').addEventListener('click', showQRCode);
document.getElementById('copyUrlButton').addEventListener('click', copyUrl);
document.getElementById('shareButton').addEventListener('click', shareGame);

document.querySelectorAll('[data-close-modal]').forEach((button) => {
  button.addEventListener('click', () => closeModal(document.getElementById(button.dataset.closeModal)));
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  [signModal, qrModal, winnerModal].forEach((modal) => closeModal(modal));
});

loadGame();
playerNameInput.value = game.playerName || '';
renderBoard();
