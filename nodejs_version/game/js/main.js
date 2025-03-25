// CS 532 - Modern Web Technologies
// Robert J. Armendariz
// 03-24-2025
// File: main.js

// number of rows on game board
const ROWS = 6;

// number of columns on game board
const COLUMNS = 7;

// the current players turns
let currentPlayer = 1;

// the clients player number ID
let myPlayer = null;

// internal board data structure
let board = [];

// socket io
const socket = io();

// the game board element
const gameBoard = document.getElementById('gameBoard');

// the player label elements
const label = document.getElementById('currentPlayerLabel');

// will hold win direction
let winDirection;


function resetBoardToEmpty() {
    // reset internal board data structure to empty
	board = [];

    // reset game board display to nothing
	gameBoard.innerHTML = '';
}


// will create and display the game board
// PRE:
//      None
// POST:
//      None
function createBoard() {
    // reset internal board data structure to empty
	board = [];

    // reset game board display to nothing
	gameBoard.innerHTML = '';

    // loop through all columns on board
	for (let col = 0; col < COLUMNS; col++) {
        // create div (for column)
		const column = document.createElement('div');
		column.classList.add('column');

        // set the column value
		column.dataset.col = col;

        // listen for click on column
		column.addEventListener('click', () => columnPlacement(col));

        // listen for mouse over on column
        column.addEventListener('mouseover', () => {
            // if clients turn
            if (myPlayer === currentPlayer)
                // add highlight effect
                column.classList.add('highlight');
        });
        
        // listen for mouse leaving column
        column.addEventListener('mouseout', () => {
            // remove highlight from column
            column.classList.remove('highlight');
        });
        
        // set contents of column to empty
		board[col] = [];

        // loop through all rows of game board
		for (let row = 0; row < ROWS; row++) {
            // create div (for cell/piece)
			const cell = document.createElement('div');
			cell.classList.add('cell');

            // set the row value
			cell.dataset.row = row;

            // set the column value
            cell.dataset.col = col;

            // set piece position to default (0)
			board[col][row] = 0;

            // add cell to column
			column.appendChild(cell);
		} // end for

        // add column to the game board element
		gameBoard.appendChild(column);
	} // end for
} // end of createBoard()


// will handle the placing of piece and move logic
// PRE:
//      col - column of interest
// POST:
//      None
function columnPlacement(col) {
    // only place if it's their turn
	if (myPlayer !== currentPlayer) return;

    // loop through all rows
	for (let row = ROWS - 1; row >= 0; row--) {
        // update default value at row, column
		if (board[col][row] === 0) {
            // update internal board data structure
			board[col][row] = currentPlayer;

            // update piece that is dropped
			if(dropPiece(col, row, currentPlayer)) {
                return;
            }

            // call move
			socket.emit('move', { col, row, player: currentPlayer });
            
            // after player places piece, stop column highlight
            [...document.querySelectorAll('.column')].forEach(col => col.classList.remove('highlight'));
			break;
		}
	} // end for
} // end of columnPlacement(...)


// will update cell with appropriate color piece
// PRE:
//      col - column
//      row - row
//      player - player
// POST:
//      true - win condition met
//      false - no win present
function dropPiece(col, row, player) {
    // get the appropriate column to place piece
	const column = gameBoard.children[col];

    // get the appropriate cell to modify
	const cell = column.children[row];

    // add the cell (piece) with appropriate color
	cell.classList.add(player === 1 ? 'player1' : 'player2');

    // add drop animation to piece
	cell.style.animation = 'pop 0.3s ease-in-out';
    setTimeout(() => (cell.style.animation = ''), 300);

    // check for a win
    if (checkWin(row, col)) {
        // display pop-up window of winner
        alert(`Player ${currentPlayer} Wins!\nWin Direction: ${winDirection}`);

        // restart the game (in play after alert window is closed)
        resetGame();
        return true;
    }
    return false;
} // end of dropPiece(...)


// function will check for a win
// pre:
//      row - row
//      col - column
// post:
//      true -  win condition is met
//      false - win condition is unmet
function checkWin(row, col) {
    // check for each win direction, else no win    
    if(checkWinDirection(row, col, 1, 0)) {
        winDirection = 'Vertical';
        return true;
    } else if(checkWinDirection(row, col, 0, 1)) {
        winDirection = 'Horizontal';
        return true;
    } else if(checkWinDirection(row, col, 1, -1)) {
        winDirection = 'Diagonal /';
        return true;
    } else if(checkWinDirection(row, col, 1, 1)) {
        winDirection = 'Diagonal \\';
        return true;
    } else {
        return false;
    }
} // end of checkWin(...)


// function will check the direction of all 
// possible win conditions
// pre:
//      row - row
//      col - column
//      rowDir - check in direction of row
//      colDir - check in direction of column
// post:
//      true -  win condition is met
//      false - win condition is unmet
function checkWinDirection(row, col, rowDir, colDir) {
    // will hold count of correctly connected pieces
    let count = 1;

    // loop through 3 iterations (count + 3 will give us >= 4 - a connect)
    for (let i = 1; i < 4; i++) {
        // calculate next piece on board (in forward direction)
        let r = row + i * rowDir; // row
        let c = col + i * colDir; // column

        // check for row, column within bounds
        let rowIsInBounds = r >= 0 && r < ROWS;
        let colIsInBounds = c >= 0 && c < COLUMNS;

        // check is in bounds, and is current player
        if (rowIsInBounds && colIsInBounds && board[c][r] === currentPlayer)
            count++;
        else
            break;
    } // end for

    // loop through 3 iterations (count + 3 will give us >= 4 - a connect)
    for (let i = 1; i < 4; i++) {
        // calculate next piece on board (in backward direction)
        let r = row - i * rowDir; // row
        let c = col - i * colDir; // column

        // check for row, column within bounds
        let rowIsInBounds = r >= 0 && r < ROWS;
        let colIsInBounds = c >= 0 && c < COLUMNS;
        
        // check is in bounds, and is current player
        if (rowIsInBounds && colIsInBounds && board[c][r] === currentPlayer)
            count++;
        else
            break;
    } // end for
    // return true if count >= 4 (win condition)
    return count >= 4;
} // end of checkWinDirection(...)


// will reset the game
function resetGame() {
    // call to createBoard
	createBoard();

    // reset game for all players in game
	socket.emit('reset');
} // end of resetGame()


// called when opponent moves
socket.on('opponentMove', ({ col, row, player }) => {
    // update internal board data structure
	board[col][row] = player;
    // drop piece on board
	dropPiece(col, row, player);
});


// called when turn is over, next players turn
socket.on('updateTurn', (player) => {
    // update current player
	currentPlayer = player;

    // update player turn label text
	label.textContent = `Player ${player}'s Turn`;

    // update player turn label color
    label.style.color = currentPlayer === 1 ? 'crimson' : 'darkcyan';
});


// called when game reset needed
socket.on('resetGame', () => {
    // create the fresh game board
	createBoard();
});


// called when initializing game, waiting for other player
socket.on('initialization', (player) => {
    // this client; set player
	myPlayer = player;

    // update label to waiting
	label.textContent = `Waiting for opponent...`;
});


// called when game is to start
socket.on('start', ({ currentPlayer }) => {
    // start the fresh game board
    createBoard();

    // update label to current player
	label.textContent = `Player ${currentPlayer}'s Turn`;
});


// called when game is full
socket.on('gamefull', () => {
    // output alert popup
	alert('Game is full. Only 2 players allowed!');
});


// called when game is to end
socket.on('end', () => {
    // output alert popup
	alert('Opponent disconnected. Game has ended!');

    // create the empty game board (hidden)
	resetBoardToEmpty();

    // update label to waiting
	label.textContent = 'Waiting for new opponent...';
});

// reset game for window
window.resetGame = resetGame;
