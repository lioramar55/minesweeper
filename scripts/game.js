'use strict';
var gElBombCount;
var gGame = {
  isOn: false,
  shownCount: 0,
  markedCount: 0,
  secsPassed: 0,
};
var gLevels = [
  { size: 4, mines: 2 },
  { size: 8, mines: 12 },
  { size: 12, mines: 30 },
];

var gLevel = gLevels[0];
var gBoard;
function init() {
  gGame.isOn = true;
  gBoard = buildBoard(gLevel);
  console.log('gBoard', gBoard);
  loadElements();
  renderBoard();
  gElBombCount.innerText = gLevel.mines;
}

function loadElements() {
  gElBombCount = document.querySelector('.bomb-count');
  gElMins = document.querySelector('.minutes');
  gElSecs = document.querySelector('.seconds');
  gElBoard = document.querySelector('.board');
}

function setMinesNegsCount(board, cellCoord) {
  var count = 0;
  for (var i = -1; i <= 1; i++) {
    for (var j = -1; j <= 1; j++) {
      var nI = cellCoord.i + i;
      var nJ = cellCoord.j + j;
      if (i === 0 && j === 0) continue;
      if (nI >= 0 && nI < gLevel.size && nJ >= 0 && nJ < gLevel.size) {
        if (board[nI][nJ].isMine) count++;
      }
    }
  }
  return count;
}

function cellClicked(elCell, i, j) {
  if (!gGame.isOn) return;
  if (!gInterval) startCounter();
  if (!gBoard[i][j].isMine) expandShown(elCell, i, j);
  else {
    elCell.classList.add('mine');
    gameOver();
  }
}

function cellMarked(elCell, i, j) {}

function expandShown(elCell, i, j) {
  elCell.classList.add('exposed');
}

function checkGameOver() {
  for (var i = 0; i < gLevel.size; i++) {
    for (var j = 0; j < gLevel.size; j++) {
      if (!gBoard[i][j].isShown) return false;
    }
  }
}

function gameOver() {
  clearInterval(gInterval);
  gGame.isOn = false;
  for (var i = 0; i < gLevel.size; i++) {
    for (var j = 0; j < gLevel.size; j++) {
      var cell = gBoard[i][j];
      if (cell.isMine) {
        var elCell = document.querySelector(`.cell-${i}-${j}`);
        elCell.classList.add('mine');
      }
    }
  }
  console.log('game over');
}
