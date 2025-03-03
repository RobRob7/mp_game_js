const rows = 6, cols = 7;
let board = Array.from({ length: rows }, () => Array(cols).fill(null));
let currentPlayer = 'player1';

const currentPlayerLabel = document.getElementById('currentPlayerLabel');

const playerLabelArray = ['Player 1 Turn', 'Player 2 Turn'];
const playerLabelColorArray = ['crimson', 'darkblue'];

document.addEventListener("DOMContentLoaded", () => {
    resetGame();
});

function createBoard() {
    const gameBoard = document.getElementById('gameBoard');
    gameBoard.innerHTML = '';
    for (let c = 0; c < cols; c++) {
        const column = document.createElement('div');
        column.classList.add('column');
        column.dataset.col = c;
        for (let r = 0; r < rows; r++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = r;
            column.appendChild(cell);
        }
        column.addEventListener('click', () => dropPiece(c));
        gameBoard.appendChild(column);
    }
}

function dropPiece(col) {
    for (let r = 0; r < rows; r++) {
        if (!board[r][col]) {
            board[r][col] = currentPlayer;
            updateBoard();
            if (checkWin(r, col)) {
                setTimeout(() => alert(`${currentPlayer.toUpperCase()} Wins!`), 10);
                return;
            }
            
            // after piece is dropped (swap to other player)
            if(currentPlayer == 'player1') {
                currentPlayerLabel.style.color = playerLabelColorArray[1];
                currentPlayerLabel.textContent = playerLabelArray[1];
                currentPlayer = 'player2';
            } else {
                currentPlayerLabel.style.color = playerLabelColorArray[0];
                currentPlayerLabel.textContent = playerLabelArray[0];
                currentPlayer = 'player1';
            }
            return;
        }
    }
}

function updateBoard() {
    const columns = document.querySelectorAll('.column');
    columns.forEach((col, c) => {
        col.childNodes.forEach((cell, r) => {
            cell.className = 'cell';
            if (board[r][c]) cell.classList.add(board[r][c]);
        });
    });
}

function checkWin(row, col) {
    return checkDirection(row, col, 1, 0) ||  // Vertical
           checkDirection(row, col, 0, 1) ||  // Horizontal
           checkDirection(row, col, 1, 1) ||  // Diagonal /
           checkDirection(row, col, 1, -1);   // Diagonal \
}

function checkDirection(row, col, rowDir, colDir) {
    let count = 1;
    for (let i = 1; i < 4; i++) {
        let r = row + i * rowDir, c = col + i * colDir;
        if (r >= 0 && r < rows && c >= 0 && c < cols && board[r][c] === currentPlayer) count++;
        else break;
    }
    for (let i = 1; i < 4; i++) {
        let r = row - i * rowDir, c = col - i * colDir;
        if (r >= 0 && r < rows && c >= 0 && c < cols && board[r][c] === currentPlayer) count++;
        else break;
    }
    return count >= 4;
}

function resetGame() {
    board = Array.from({ length: rows }, () => Array(cols).fill(null));
    currentPlayer = 'player1';
    currentPlayerLabel.style.color = playerLabelColorArray[0];
    currentPlayerLabel.textContent = playerLabelArray[0];
    createBoard();
}

createBoard();
