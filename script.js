// Chess pieces using emojis
const initialBoardSetup = [
    ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'],
    ['♟', '♟', '♟', '♟', '♟', '♟', '♟', '♟'],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['♙', '♙', '♙', '♙', '♙', '♙', '♙', '♙'],
    ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖']
  ];
  
  let selectedCell = null; // Track the selected cell
  let board = [...initialBoardSetup]; // Copy of the board for manipulation
  
  // Create the chessboard grid and place pieces
  function createChessboard() {
    const chessboard = document.getElementById('chessboard');
    chessboard.innerHTML = ''; // Clear previous content
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.row = row;
        cell.dataset.col = col;
        
        // Set cell background color
        if ((row + col) % 2 === 0) {
          cell.classList.add('light');
        } else {
          cell.classList.add('dark');
        }
  
        // Set the piece on the cell, if any
        cell.innerHTML = board[row][col];
  
        // Add event listener to handle piece selection and movement
        cell.addEventListener('click', handleCellClick);
  
        chessboard.appendChild(cell);
      }
    }
  }
  
  // Handle click events on the chessboard cells
  function handleCellClick(event) {
    const clickedCell = event.currentTarget;
    const row = clickedCell.dataset.row;
    const col = clickedCell.dataset.col;
    
    if (selectedCell) {
      // Move the piece from the selected cell to the clicked cell
      const prevRow = selectedCell.dataset.row;
      const prevCol = selectedCell.dataset.col;
  
      // Move the piece if there was one selected
      board[row][col] = board[prevRow][prevCol];
      board[prevRow][prevCol] = '';
  
      selectedCell.classList.remove('selected');
      selectedCell = null;
  
      // Recreate the board to reflect the updated state
      createChessboard();
    } else if (board[row][col] !== '') {
      // Select a cell if it's not empty
      selectedCell = clickedCell;
      selectedCell.classList.add('selected');
    }
  }
  
  // Initialize the game
  createChessboard();
  