'use strict';
var gGame = {
  isOn: false,
  liveCount: 3,
  shownCount: 0,
  markedCount: 0,
  secsPassed: 0,
  hintsLeft: 3,
  safeClicks: 3,
  lastMove: null,
  isManual: false,
  moves: [],
};
var gLevels = [
  { size: 4, mines: 2 },
  { size: 8, mines: 12 },
  { size: 12, mines: 30 },
];
var gManualBombCount;
var gElBombCount, gElEmoji;
var gElCell, gElBoard;
var gElLiveCount;
var gElHint, gHintMode;
var gElUndo, gUndo;
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
  gGame.moves = [];
  gGame.lastMove = null;
  gGame.liveCount = 3;
  gGame.markedCount = 0;
  gGame.shownCount = 0;
  gGame.hintsLeft = 3;
  gGame.isManual = false;
  gElBombCount = document.querySelector('.bomb-count');
  gElEmoji = document.querySelector('.emoji');
  gElMins = document.querySelector('.minutes');
  gElSecs = document.querySelector('.seconds');
  gElHint = document.querySelector('.hint');
  gElLiveCount = document.querySelector('.live-count');
  gElBoard = document.querySelector('.board');
  gElUndo = document.querySelector('.undo');
  gElEmoji.src = 'assets/imgs/start.png';
  gElLiveCount.innerText = `Lives: ${gGame.liveCount}`;
  gElHint.innerText = `Hints: ${gGame.hintsLeft}`;
  gElMins.innerText = '00';
  gElSecs.innerText = '00';
  gGame.moves.push(clone2DArray(gBoard));
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
    if (gGame.isManual) {
      if (++gManualBombCount === gLevel.mines) {
        startCounter();
        countMinesAround();
      }
      gBoard[i][j].isMine = true;
      return;
    } else {
      startCounter();
      randomizeMines();
      countMinesAround();
    }
  }
  if (gHintMode) {
    var elBtn = document.querySelector('.hint');
    elBtn.innerText = `Hints: ${--gGame.hintsLeft}`;
    setTimeout(revealHint, 1000, i, j);
    revealHint(i, j);
    gHintMode = false;
    return;
  }
  if (!gBoard[i][j].isMine) {
    gGame.lastMove = [{ i, j }];
    if (!gBoard[i][j].minesAroundCount) {
      expandShown(i, j);
      gGame.moves.push(gGame.lastMove);
    } else {
      gGame.moves.push(gGame.lastMove);
      gBoard[i][j].isShown = true;
      gGame.shownCount++;
    }
  } else {
    gGame.liveCount--;
    gGame.moves.push({ i, j });
    gElLiveCount.innerText = `Lives: ${gGame.liveCount}`;
    elCell.classList.add('mine');
    gBoard[i][j].isShown = true;
  }
  if (!gGame.liveCount) gameOver();
  if (checkGameOver()) gameOver();
  renderBoard();
}

function cellMarked(elCell) {
  if (!gInterval) return;
  var cellCoord = getCoordByElement(elCell);
  if (gBoard[cellCoord.i][cellCoord.j].isMarked) {
    gBoard[cellCoord.i][cellCoord.j].isMarked = false;
    gGame.markedCount--;
  } else {
    gBoard[cellCoord.i][cellCoord.j].isMarked = true;
    gGame.markedCount++;
  }

  renderBoard();
}

function expandShown(i, j) {
  if (gBoard[i][j].isShown) return;
  if (gBoard[i][j].isMine) return;
  gBoard[i][j].isShown = true;
  // gGame.shownCount++;
  for (var x = -1; x <= 1; x++) {
    for (var y = -1; y <= 1; y++) {
      var nI = x + i;
      var nJ = y + j;
      // if (y === 0 && x === 0) continue;
      if (nI >= 0 && nI < gLevel.size && nJ >= 0 && nJ < gLevel.size) {
        gGame.lastMove.push({ i: nI, j: nJ });
        gGame.shownCount++;
        if (gBoard[nI][nJ].minesAroundCount === 0) expandShown(nI, nJ);
        else gBoard[nI][nJ].isShown = true;
      }
    }
  }
}

function undoAction() {
  if (!gInterval || !gGame.shownCount) return;
  var lastMove = gGame.moves.pop();
  if (!lastMove.length) {
    var cell = gBoard[lastMove.i][lastMove.j];
    cell.isShown = false;
    gGame.shownCount--;
    if (cell.isMine) {
      var elCell = getElementByCoord(lastMove);
      elCell.classList.remove('mine');
    }
    renderBoard();
    return;
  }
  for (var i = 0; i < lastMove.length; i++) {
    var moveCoord = lastMove[i];
    var cell = gBoard[moveCoord.i][moveCoord.j];
    // debugger;
    cell.isShown = false;
    gGame.shownCount--;
    if (cell.isMine) {
      var elCell = getElementByCoord(lastMove);
      console.log('elCell', elCell);
      elCell.classList.remove('mine');
    }
  }
  renderBoard();
}

function manualMode() {
  gGame.isManual = true;
  gManualBombCount = 0;
}

function safeClick(elBtn) {
  if (!gInterval || !gGame.safeClicks) return;
  gGame.safeClicks--;
  elBtn.innerText = `Safe Click: ${gGame.safeClicks}`;
  var isOk = false;
  while (!isOk) {
    var randI = getRandomIntInclusive(0, gLevel.size - 1);
    var randJ = getRandomIntInclusive(0, gLevel.size - 1);
    var currCell = gBoard[randI][randJ];
    if (!currCell.isShown && !currCell.isMine) {
      isOk = true;
      renderCell(randI, randJ, gEmptyImg);
      setTimeout(renderCell, 1000, randI, randJ, gCoverImg);
    }
  }
}

function getHint() {
  if (!gGame.hintsLeft || !gInterval) return;
  gHintMode = true;
}

function revealHint(i, j) {
  gBoard[i][j].isShown = gBoard[i][j].isShown ? false : true;
  for (var x = -1; x <= 1; x++) {
    for (var y = -1; y <= 1; y++) {
      var nI = x + i;
      var nJ = j + y;
      if (y === 0 && x === 0) continue;
      // if (gBoard[nI][nJ].isShown) continue;
      if (inBounds(nI, nJ, gLevel.size)) {
        gBoard[nI][nJ].isShown = gBoard[nI][nJ].isShown ? false : true;
      }
    }
  }
  renderBoard();
}

function checkGameOver() {
  var countShownCells = 0;
  for (var i = 0; i < gLevel.size; i++) {
    for (var j = 0; j < gLevel.size; j++) {
      if (gBoard[i][j].isShown && !gBoard[i][j].isMine) countShownCells++;
    }
  }
  if (countShownCells + gLevel.mines === gLevel.size ** 2) return true;
  return false;
}

function gameOver() {
  if (checkGameOver()) {
    console.log('You Won');
    clearInterval(gInterval);
    gElEmoji.src = 'assets/imgs/win.png';
    gGame.isOn = false;
  } else {
    clearInterval(gInterval);
    gElEmoji.src = 'assets/imgs/hit.png';
    gGame.isOn = false;
  }
}
