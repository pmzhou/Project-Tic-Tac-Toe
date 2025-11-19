// ===== Gameboard Module (IIFE) =====
const Gameboard = (function () {
  let board = ["", "", "", "", "", "", "", "", ""];

  const getBoard = () => [...board];

  const markSquare = (index, marker) => {
    if (index >= 0 && index < board.length && board[index] === "") {
      board[index] = marker;
      return true;
    }
    return false;
  };

  const reset = () => {
    board = ["", "", "", "", "", "", "", "", ""];
  };

  return { getBoard, markSquare, reset };
})();

// ===== Player Factory Function =====
function createPlayer(name, marker) {
  return { name, marker };
}

// ===== Game Controller Module (IIFE) =====
const Game = (function () {
  // Start with default players (will be updated via setPlayers)
  let player1 = createPlayer("Player 1", "X");
  let player2 = createPlayer("Player 2", "O");
  let currentPlayer = player1;

  const setPlayers = (name1, name2) => {
    player1 = createPlayer(name1, "X");
    player2 = createPlayer(name2, "O");
    currentPlayer = player1; // reset turn to Player 1
  };

  const switchPlayer = () => {
    currentPlayer = currentPlayer === player1 ? player2 : player1;
  };

  const checkWin = (board) => {
    const winPatterns = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6]             // diagonals
    ];
    for (const [a, b, c] of winPatterns) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return null;
  };

  const checkTie = (board) => board.every(cell => cell !== "");

  const playRound = (index) => {
    const successfulMove = Gameboard.markSquare(index, currentPlayer.marker);
    if (!successfulMove) {
      return "invalid";
    }

    const board = Gameboard.getBoard();
    const winner = checkWin(board);

    if (winner) return "win";
    if (checkTie(board)) return "tie";

    switchPlayer();
    return "continue";
  };

  const reset = () => {
    Gameboard.reset();
    currentPlayer = player1;
  };

  const getCurrentPlayer = () => currentPlayer;

  return { playRound, reset, getCurrentPlayer, setPlayers };
})();

// ===== Display Controller Module (IIFE) =====
const DisplayController = (function () {
  const cells = document.querySelectorAll('.cell');
  const statusDiv = document.getElementById('game-status');
  const startButton = document.getElementById('start-game');
  const restartButton = document.getElementById('restart');
  const playerXInput = document.getElementById('player-x');
  const playerOInput = document.getElementById('player-o');

  const updateBoard = () => {
    const board = Gameboard.getBoard();
    cells.forEach((cell, index) => {
      cell.textContent = board[index];
    });
  };

  const updateStatus = (message) => {
    statusDiv.textContent = message;
  };

  const handleClick = (e) => {
    const index = parseInt(e.target.dataset.index, 10);
    const result = Game.playRound(index);

    if (result === "invalid") {
      // Optional: show error, or just ignore
      return;
    }

    updateBoard();

    if (result === "win") {
      const winner = Game.getCurrentPlayer();
      updateStatus(`🎉 ${winner.name} wins!`);
      restartButton.style.display = "inline-block";
    } else if (result === "tie") {
      updateStatus("It's a tie!");
      restartButton.style.display = "inline-block";
    } else {
      const currentPlayer = Game.getCurrentPlayer();
      updateStatus(`Current player: ${currentPlayer.name} (${currentPlayer.marker})`);
    }
  };

  const initializeEventListeners = () => {
    cells.forEach(cell => {
      cell.addEventListener('click', handleClick);
    });

    startButton.addEventListener('click', () => {
      const name1 = playerXInput.value.trim() || "Player 1";
      const name2 = playerOInput.value.trim() || "Player 2";
      Game.setPlayers(name1, name2);
      Game.reset();
      updateBoard();
      restartButton.style.display = "none";
      const currentPlayer = Game.getCurrentPlayer();
      updateStatus(`Current player: ${currentPlayer.name} (${currentPlayer.marker})`);
    });

    restartButton.addEventListener('click', () => {
      Game.reset();
      updateBoard();
      restartButton.style.display = "none";
      const currentPlayer = Game.getCurrentPlayer();
      updateStatus(`Current player: ${currentPlayer.name} (${currentPlayer.marker})`);
    });
  };

  const init = () => {
    initializeEventListeners();
    updateStatus("Enter names and click 'Start Game'!");
  };

  return { init };
})();

// ===== Start the App =====
DisplayController.init();