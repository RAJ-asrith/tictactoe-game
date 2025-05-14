const board = document.getElementById('board');
const status = document.getElementById('status');
const resetBtn = document.getElementById('reset');
const modeRadios = document.querySelectorAll('input[name="mode"]');
const scoreXEl = document.getElementById('scoreX');
const scoreOEl = document.getElementById('scoreO');
const scoreTiesEl = document.getElementById('scoreTies');
const popup = document.getElementById('popup');
const popupMessage = document.getElementById('popup-message');
const playAgainBtn = document.getElementById('play-again');

let currentPlayer = 'X';
let gameActive = true;
let gameState = Array(9).fill('');
let vsAI = false;

// Scores
let scoreX = 0;
let scoreO = 0;
let scoreTies = 0;

const winConditions = [
  [0,1,2], [3,4,5], [6,7,8],
  [0,3,6], [1,4,7], [2,5,8],
  [0,4,8], [2,4,6]
];

// Handle game mode selection
modeRadios.forEach(radio => {
  radio.addEventListener('change', () => {
    vsAI = document.querySelector('input[name="mode"]:checked').value === 'ai';
    resetGame(); // Reset when mode changes
  });
});

function handleClick(e) {
  const cell = e.target;
  const index = parseInt(cell.dataset.index);

  if (gameState[index] !== '' || !gameActive || (vsAI && currentPlayer === 'O')) return;

  makeMove(index, currentPlayer);

  if (vsAI && gameActive) {
    setTimeout(aiMove, 300);
  }
}

function makeMove(index, player) {
  gameState[index] = player;
  document.querySelector(`[data-index="${index}"]`).textContent = player;

  if (checkWinner(gameState, player)) {
    updateScore(player);
    gameActive = false;
    showPopup(`🎉 Player ${player} wins!`);
  } else if (!gameState.includes('')) {
    scoreTies++;
    updateScore();
    gameActive = false;
    showPopup("🤝 It's a tie!");
  } else {
    currentPlayer = player === 'X' ? 'O' : 'X';
    status.textContent = `Player ${currentPlayer}'s turn`;
  }
}

function checkWinner(boardState, player) {
  return winConditions.some(([a, b, c]) =>
    boardState[a] === player && boardState[b] === player && boardState[c] === player
  );
}

function aiMove() {
  const bestMove = minimax(gameState.slice(), 'O').index;
  if (bestMove !== undefined) {
    makeMove(bestMove, 'O');
  }
}

// Minimax algorithm (unbeatable AI)
function minimax(newBoard, player) {
  const huPlayer = 'X';
  const aiPlayer = 'O';

  const availSpots = newBoard
    .map((val, idx) => val === '' ? idx : null)
    .filter(val => val !== null);

  if (checkWinner(newBoard, huPlayer)) {
    return { score: -10 };
  } else if (checkWinner(newBoard, aiPlayer)) {
    return { score: 10 };
  } else if (availSpots.length === 0) {
    return { score: 0 };
  }

  const moves = [];

  for (let i = 0; i < availSpots.length; i++) {
    const move = {};
    move.index = availSpots[i];
    newBoard[availSpots[i]] = player;

    const result = minimax(newBoard, player === aiPlayer ? huPlayer : aiPlayer);
    move.score = result.score;

    newBoard[availSpots[i]] = '';
    moves.push(move);
  }

  let bestMove;
  if (player === aiPlayer) {
    let bestScore = -Infinity;
    for (let i = 0; i < moves.length; i++) {
      if (moves[i].score > bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < moves.length; i++) {
      if (moves[i].score < bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  }

  return moves[bestMove];
}

function updateScore(winner) {
  if (winner === 'X') scoreX++;
  else if (winner === 'O') scoreO++;

  scoreXEl.textContent = scoreX;
  scoreOEl.textContent = scoreO;
  scoreTiesEl.textContent = scoreTies;
}

function showPopup(message) {
  popupMessage.textContent = message;
  popup.style.display = 'flex';
}

playAgainBtn.addEventListener('click', () => {
  popup.style.display = 'none';
  resetGame();
});

function resetGame() {
  gameState.fill('');
  gameActive = true;
  currentPlayer = 'X';
  status.textContent = `Player X's turn`;
  board.innerHTML = '';
  createBoard();
}

function createBoard() {
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.dataset.index = i;
    cell.addEventListener('click', handleClick);
    board.appendChild(cell);
  }
}

resetBtn.addEventListener('click', resetGame);
createBoard();
