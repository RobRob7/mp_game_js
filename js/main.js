// CS 532 - Modern Web Technologies
// Robert J. Armendariz
// 03-03-2025
// File: main.js

// number of rows on boardStruct
const rows = 6;

// number of columns on boardStruct
const columns = 7;

// will contain structure of game boardStruct of size rows x columns
let boardStruct = Array.from({ length: rows }, () => Array(columns).fill(null));

// will hold current player during course of game
let currentPlayer = 'player1';

// get div by id 'currentPlayerLabel'
const currentPlayerLabel = document.getElementById('currentPlayerLabel');

// array containing all possible labels for player turn
const playerLabelArray = ['Player 1 Turn', 'Player 2 Turn'];

// array containing all possible player chip colors
const playerLabelColorArray = ['crimson', 'darkcyan'];

// as soon as DOM loaded
document.addEventListener("DOMContentLoaded", () => {
    // call resetGame
    resetGame();
});


// this function will populate the inital game board
function createBoard() {
    // get element id 'gameBoard'
    const gameBoard = document.getElementById('gameBoard');

    // set game board innerHTML to empty
    gameBoard.innerHTML = '';

    // loop through all columns
    for (let c = 0; c < columns; c++) {
        // create new html element 'div' for column
        const column = document.createElement('div');

        // add 'column' class to column element
        column.classList.add('column');

        // add column value to new column entry
        column.dataset.col = c;

        // loop through all rows of board
        for (let r = 0; r < rows; r++) {
            // create new html element 'div' for cell
            const cell = document.createElement('div');

            // add CSS class 'cell' to cell element
            cell.classList.add('cell');

            // add row property to cell element
            cell.dataset.row = r;

            // append cell element to its column
            column.appendChild(cell);
        }

        // listen for click on column (call dropPiece function on click
        // for appropriate column)
        column.addEventListener('click', () => dropPiece(c));

        // listen for hover on column (highlight column)
        column.addEventListener('mouseenter', () => {
            column.classList.add('highlight');
        });

        // listen for mouse leaving column (remove highlight)
        column.addEventListener('mouseleave', () => {
            column.classList.remove('highlight');
        });

        // add column to game board
        gameBoard.appendChild(column);
    }
} // end of createBoard()


// function will drop appropriate piece on board
function dropPiece(col) {
    // loop through all rows of board
    for (let r = 0; r < rows; r++) {
        // only drop piece if column is NOT full
        if (!boardStruct[r][col]) {
            // update row, column entry with correct color
            boardStruct[r][col] = currentPlayer;

            // update the board
            updateBoard();

            // check for a win
            if (checkWin(r, col)) {
                // display pop-up window of winner
                setTimeout(() => alert(`${currentPlayer.toUpperCase()} Wins!`), 7);

                // restart the game (in play after alert window is closed)
                setTimeout(() => resetGame(), 7);
                return;
            }
            
            // if current player is player 1, swap to player2
            if(currentPlayer == 'player1') {
                currentPlayerLabel.style.color = playerLabelColorArray[1];
                currentPlayerLabel.textContent = playerLabelArray[1];
                currentPlayer = 'player2';
            } else { // if current player is player 2, swap to player1
                currentPlayerLabel.style.color = playerLabelColorArray[0];
                currentPlayerLabel.textContent = playerLabelArray[0];
                currentPlayer = 'player1';
            }

            // return from function
            return;
        }
    }
} // end of dropPiece(...)


// function will update the board
function updateBoard() {
    // get all columns
    const columns = document.querySelectorAll('.column');

    // loop through each column
    columns.forEach((col, c) => {
        // loop through all cells in a column
        col.childNodes.forEach((cell, r) => {
            // set each cell CSS class to 'cell'
            cell.className = 'cell';

            // if board at row,col contains value
            if (boardStruct[r][c])
                // add boardStruct state of cell to display cell
                cell.classList.add(boardStruct[r][c]);
        });
    });
} // end of updateBoard()


// function will check for a win
function checkWin(row, col) {
    // if vertical, horizontal, diagonal /, diagonal \
    if(checkDirection(row, col, 1, 0) ||
        checkDirection(row, col, 0, 1) ||
        checkDirection(row, col, 1, 1) ||
        checkDirection(row, col, 1, -1)) {
            return true;
        }
} // end of checkWin(...)


// function will check the direction of all 
// possible win conditions
function checkDirection(row, col, rowDir, colDir) {
    // will hold count of correctly connected pieces
    let count = 1;

    // loop
    for (let i = 1; i < 4; i++) {
        let r = row + i * rowDir, c = col + i * colDir;
        if (r >= 0 && r < rows && c >= 0 && c < columns && boardStruct[r][c] === currentPlayer) count++;
        else break;
    }
    // loop
    for (let i = 1; i < 4; i++) {
        let r = row - i * rowDir, c = col - i * colDir;
        if (r >= 0 && r < rows && c >= 0 && c < columns && boardStruct[r][c] === currentPlayer) count++;
        else break;
    }
    // return true if count >= 4 (win condition)
    return count >= 4;
} // end of checkDirection(...)


// function will reset the game to start
function resetGame() {

    // reset game board structure
    boardStruct = Array.from({ length: rows }, () => Array(columns).fill(null));

    // reset current player to player1
    currentPlayer = 'player1';

    // reset current player label color to player1 color
    currentPlayerLabel.style.color = playerLabelColorArray[0];

    // reset current player label text to player1
    currentPlayerLabel.textContent = playerLabelArray[0];

    // call createBoard
    createBoard();
} // end of resetGame()
