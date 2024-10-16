// Initialize Chess.js game state and move history
const chess = new Chess();
let moveHistory = []; // To store moves for undo functionality
let redoStack = [];   // To store moves for redo functionality
let selectedSquare = null; // Track selected piece square
let boardElement = document.getElementById('chessboard');
let statusElement = document.getElementById('status');
let modeElement = document.getElementById('play-mode');
let themeElement = document.getElementById('theme');
let isAIActive = false; // Toggle for AI mode
let aiMoveTimeout = null; // To handle AI move delays

// Create the chessboard and render pieces
function createChessboard() {
    boardElement.innerHTML = '';  // Clear previous board state

    for (let row = 7; row >= 0; row--) {
        for (let col = 0; col < 8; col++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = row;
            cell.dataset.col = col;

            // Alternate between light and dark squares
            if ((row + col) % 2 === 0) {
                cell.classList.add('light');
            } else {
                cell.classList.add('dark');
            }

            const square = getSquareFromCoords(row, col);
            const piece = chess.get(square);
            if (piece) {
                cell.innerHTML = getPieceSymbol(piece);
            }

            // Add event listener for clicks
            cell.addEventListener('click', () => handleCellClick(square));

            // Add event listeners for hover highlighting
            cell.addEventListener('mouseover', () => highlightPieceArea(square));
            cell.addEventListener('mouseout', clearHover);

            boardElement.appendChild(cell);
        }
    }

    updateStatus();
}

// Convert row, col coordinates into Chess notation (like 'a1', 'e4')
function getSquareFromCoords(row, col) {
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    return files[col] + (row + 1);
}

// Get the piece's Unicode symbol
function getPieceSymbol(piece) {
    if (!piece) return '';
    const pieceSymbols = {
        'p': '♟', 'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚',
        'P': '♙', 'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔',
    };
    return pieceSymbols[piece.color === 'w' ? piece.type.toUpperCase() : piece.type.toLowerCase()] || '';
}

// Handle cell click (select and move pieces)
function handleCellClick(square) {
    const piece = chess.get(square);

    if (selectedSquare === null) {
        // No piece selected yet
        if (piece && piece.color === chess.turn()) {
            selectedSquare = square;
            highlightMoves(square);
        }
    } else {
        // Try to make a move
        const move = chess.move({
            from: selectedSquare,
            to: square
        });

        if (move) {
            moveHistory.push(move); // Store move in history
            redoStack = []; // Clear redo stack after new move
            selectedSquare = null; // Deselect after a valid move
            clearHighlights();
            createChessboard(); // Update board

            if (chess.in_checkmate()) {
                showCelebration(`Checkmate! ${chess.turn() === 'w' ? 'Black' : 'White'} wins!`, true);
                clearTimeout(aiMoveTimeout);
            } else if (chess.in_stalemate() || chess.in_draw()) {
                showCelebration(`It's a draw!`, true);
                clearTimeout(aiMoveTimeout);
            } else {
                if (isAIActive && chess.turn() === 'b') {
                    aiMoveTimeout = setTimeout(() => {
                        aiMove();
                    }, 500);
                } else {
                    updateStatus();
                }
            }
        } else {
            // Invalid move, deselect
            selectedSquare = null;
            clearHighlights();
        }
    }
    updateStatus();
}

// Highlight valid moves for the selected piece
function highlightMoves(square) {
    clearHighlights(); // Clear previous highlights
    const moves = chess.moves({ square: square, verbose: true });

    moves.forEach(move => {
        const moveSquare = move.to;
        const cell = getCellBySquare(moveSquare);
        if (cell) {
            cell.classList.add('highlight');
        }
    });
}

// Highlight the selected piece area (3x3 grid)
function highlightPieceArea(square) {
    const piece = chess.get(square);
    if (!piece || piece.color !== chess.turn()) return;

    // Clear previous hover highlights
    clearHover();

    const [row, col] = getCoordsFromSquare(square);
    const cellsToHighlight = [];

    for (let r = row - 1; r <= row + 1; r++) {
        for (let c = col - 1; c <= col + 1; c++) {
            if (r >= 0 && r < 8 && c >= 0 && c < 8) {
                cellsToHighlight.push(getCellByCoords(r, c));
            }
        }
    }

    cellsToHighlight.forEach(cell => {
        if (cell) {
            cell.classList.add('piece-hover');
        }
    });
}

// Clear all hover highlights
function clearHover() {
    document.querySelectorAll('.piece-hover').forEach(cell => {
        cell.classList.remove('piece-hover');
    });
}

// Clear all move highlights
function clearHighlights() {
    document.querySelectorAll('.highlight').forEach(cell => {
        cell.classList.remove('highlight');
    });
}

// Get cell by square (e.g. 'a1', 'e4')
function getCellBySquare(square) {
    const row = parseInt(square[1]) - 1;
    const col = square.charCodeAt(0) - 'a'.charCodeAt(0);
    return document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
}

// Get cell by row and column
function getCellByCoords(row, col) {
    return document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
}

// Convert Chess notation to row, col coordinates
function getCoordsFromSquare(square) {
    const col = square.charCodeAt(0) - 'a'.charCodeAt(0);
    const row = parseInt(square[1]) - 1;
    return [row, col];
}

// Update game status display
function updateStatus() {
    const turn = chess.turn() === 'w' ? 'White' : 'Black';
    let status = `${turn}'s turn`;

    if (chess.in_checkmate()) {
        status = `Checkmate! ${chess.turn() === 'w' ? 'Black' : 'White'} wins!`;
    } else if (chess.in_stalemate() || chess.in_draw()) {
        status = `It's a draw!`;
    } else if (chess.in_check()) {
        status += ' - Check!';
    }

    statusElement.textContent = status;
}

// Show celebration window for game end and optionally start a new game
function showCelebration(message, showNewGameOption = false) {
    const celebration = document.createElement('div');
    celebration.className = 'celebration';
    celebration.textContent = message;
    document.body.appendChild(celebration);

    if (showNewGameOption) {
        const newGameButton = document.createElement('button');
        newGameButton.textContent = 'Start New Game';
        newGameButton.style.marginTop = '20px';
        newGameButton.addEventListener('click', function () {
            chess.reset();
            moveHistory = [];
            redoStack = [];
            selectedSquare = null;
            clearHighlights();
            createChessboard();
            document.body.removeChild(celebration);
        });
        celebration.appendChild(newGameButton);
    }

    setTimeout(() => {
        if (!showNewGameOption) {
            document.body.removeChild(celebration);
        }
    }, 3000);
}

// AI makes a random valid move
function aiMove() {
    if (chess.in_checkmate() || chess.in_draw() || chess.in_stalemate()) {
        return; // Stop AI if game is over
    }

    const possibleMoves = chess.moves();
    if (possibleMoves.length === 0) {
        return; // No moves available, game might be over
    }

    const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    chess.move(randomMove);
    moveHistory.push(randomMove); // Store AI move in history
    clearHighlights();
    createChessboard();
    updateStatus();

    if (chess.in_checkmate()) {
        showCelebration(`Checkmate! AI wins!`, true);
    }
}

// Reset game state and board
document.getElementById('reset').addEventListener('click', function () {
    clearTimeout(aiMoveTimeout); // Clear any pending AI move
    chess.reset();
    moveHistory = [];
    redoStack = [];
    selectedSquare = null;
    clearHighlights();
    createChessboard();
    updateStatus();
});

// Undo last move
document.getElementById('undo').addEventListener('click', function () {
    if (moveHistory.length > 0) {
        const lastMove = moveHistory.pop();
        chess.undo();
        redoStack.push(lastMove);
        selectedSquare = null;
        clearHighlights();
        createChessboard();
        updateStatus();
    }
});

// Redo last undone move
document.getElementById('redo').addEventListener('click', function () {
    if (redoStack.length > 0) {
        const move = redoStack.pop();
        chess.move(move);
        moveHistory.push(move);
        selectedSquare = null;
        clearHighlights();
        createChessboard();
        updateStatus();

        // If AI is active and it's AI's turn after redo
        if (isAIActive && chess.turn() === 'b') {
            aiMoveTimeout = setTimeout(() => {
                aiMove();
            }, 500);
        }
    }
});

// Handle mode change (Player vs Player or Player vs AI)
modeElement.addEventListener('change', function () {
    isAIActive = this.value === 'ai';
    clearTimeout(aiMoveTimeout); // Clear any pending AI move
    chess.reset();
    moveHistory = [];
    redoStack = [];
    selectedSquare = null;
    clearHighlights();
    createChessboard();
    updateStatus();
});

// Handle theme changes
themeElement.addEventListener('change', function () {
    const theme = this.value;
    boardElement.className = 'chessboard'; // Reset to default
    if (theme !== 'classic') {
        boardElement.classList.add(`theme-${theme}`);
    }
});

// Initialize the game on page load
window.onload = function () {
    createChessboard();
};
