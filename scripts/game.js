'use strict';
var gGame = {
  isOn: false,
  liveCount: 3,
  shownCount: 0,
  markedCount: 0,
  secsPassed: 0,
};
var gLevels = [
  { size: 4, mines: 2 },
  { size: 8, mines: 12 },
  { size: 12, mines: 30 },
];
var gElBombCount, gElEmoji;
var gElCell, gElBoard;
var gElLiveCount;
var gLevel = gLevels[0];
var gBoard;

function init() {
  gBoard = buildBoard(gLevel);
  if (gInterval) clearInterval(gInterval);
  loadElements();
  renderBoard();
  gElBombCount.innerText = gLevel.mines;
}

function loadElements() {
  gInterval = null;
  gGame.isOn = true;
  gGame.liveCount = 3;
  gElBombCount = document.querySelector('.bomb-count');
  gElEmoji = document.querySelector('.emoji');
  gElMins = document.querySelector('.minutes');
  gElSecs = document.querySelector('.seconds');
  gElLiveCount = document.querySelector('.live-count');
  gElBoard = document.querySelector('.board');
  gElEmoji.src = 'imgs/start.png';
  gElLiveCount.innerText = `Lives: ${gGame.liveCount}`;
  gElMins.innerText = '00';
  gElSecs.innerText = '00';
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
  if (!gInterval) {
    startCounter();
    placeAndCountMines();
  }
  if (!gBoard[i][j].isMine) {
    if (!gBoard[i][j].minesAroundCount) expandShown(i, j);
    else gBoard[i][j].isShown = true;
  } else {
    gGame.liveCount--;
    gElLiveCount.innerText = `Lives: ${gGame.liveCount}`;
    elCell.classList.add('mine');
    gBoard[i][j].isShown = true;
  }
  if (!gGame.liveCount) gameOver();
  renderBoard();
}

function cellMarked(elCell) {
  var cellCoord = getCoordByElement(elCell);
  if (gBoard[cellCoord.i][cellCoord.j].isMarked) {
    gBoard[cellCoord.i][cellCoord.j].isMarked = false;
  } else gBoard[cellCoord.i][cellCoord.j].isMarked = true;

  renderBoard();
}

function expandShown(i, j) {
  if (gBoard[i][j].isShown) return;
  if (gBoard[i][j].isMine) return;
  gBoard[i][j].isShown = true;
  for (var x = -1; x <= 1; x++) {
    for (var y = -1; y <= 1; y++) {
      var nI = x + i;
      var nJ = y + j;
      if (y === 0 && x === 0) continue;
      if (nI >= 0 && nI < gLevel.size && nJ >= 0 && nJ < gLevel.size) {
        if (gBoard[nI][nJ].minesAroundCount === 0) expandShown(nI, nJ);
        else gBoard[nI][nJ].isShown = true;
      }
    }
  }
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
  gElEmoji.src = 'imgs/hit.png';
  gGame.isOn = false;
  renderBoard();
}
