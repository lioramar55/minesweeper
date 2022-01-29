'use strict';

function setMinesNegsCount(cellCoord) {
  var count = 0;
  for (var i = -1; i <= 1; i++) {
    for (var j = -1; j <= 1; j++) {
      var nI = cellCoord.i + i;
      var nJ = cellCoord.j + j;
      if (i === 0 && j === 0) continue;
      if (inBounds(nI, nJ, gLevel.size)) {
        if (gBoard[nI][nJ].isMine) count++;
      }
    }
  }
  return count;
}
function countMinesAround() {
  for (var i = 0; i < gLevel.size; i++) {
    for (var j = 0; j < gLevel.size; j++) {
      gBoard[i][j].minesAroundCount = setMinesNegsCount({ i, j });
    }
  }
}

function cellClicked(elCell, i, j) {
  if (!gGame.isOn || gBoard[i][j].isMarked) return;
  if (!gInterval) {
    if (gGame.isManual) {
      if (!gBoard[i][j].isMine) {
        gElManualBtn.innerText = `Manual (${++gManualBombCount}/${gLevel.mines})`;
        gBoard[i][j].isMine = true;
        if (gManualBombCount === gLevel.mines) {
          countMinesAround();
          startCounter();
        }
        return;
      } else return;
    } else if (gSevenBoomMode) {
      startCounter();
      countMinesAround();
      gSevenBoomMode = false;
    } else {
      startCounter();
      randomizeMines(i, j);
      countMinesAround();
    }
  }
  if (gHintMode) {
    gHintCells = [];
    var elBtn = document.querySelector('.hint');
    elBtn.innerText = `Hints: ${--gGame.hintsLeft}`;
    revealHint(i, j);
    setTimeout(revealHint, 1000, i, j, false);
    gHintMode = false;
    return;
  }
  if (!gBoard[i][j].isMine) {
    gGame.lastMove = [{ i, j }];
    if (!gBoard[i][j].minesAroundCount) {
      expandShown(i, j);
      if (gSound) uncoverSound.play();
      gGame.moves.push(gGame.lastMove);
    } else {
      gGame.moves.push(gGame.lastMove);
      gBoard[i][j].isShown = true;
      gGame.shownCount++;
    }
  } else {
    if (gBoard[i][j].isShown) {
      return;
    }
    if (gSound) bombSound.play();
    gElEmoji.src = `assets/imgs/hit.png`;
    gGame.liveCount--;
    gGame.moves.push({ i, j });
    gElLiveCount.innerHTML = gLivesImg.repeat(gGame.liveCount);
    elCell.classList.add('mine');
    gBoard[i][j].isShown = true;
  }
  if (!gGame.liveCount) gameOver();
  checkGameOver();
  renderBoard();
}

function loadSevenBoomMode() {
  var nums = numRange(1, gLevel.size ** 2, 1);
  var res = [];
  for (var i = 0; i < gLevel.size ** 2; i++) {
    if (nums[i] % 7 === 0 || isNumberContainSeven(nums[i]) !== -1) res.push(nums[i]);
  }
  var counter = 0;
  for (var i = 0; i < gLevel.size; i++) {
    for (var j = 0; j < gLevel.size; j++) {
      res.forEach((num) => {
        if (counter === num) {
          gBoard[i][j].isMine = true;
        }
      });
      counter++;
    }
  }
}

function checkGameOver() {
  var countShownCells = 0;
  var countBlownBombs = 0;
  for (var i = 0; i < gLevel.size; i++) {
    for (var j = 0; j < gLevel.size; j++) {
      if (gBoard[i][j].isShown && !gBoard[i][j].isMine) countShownCells++;
      if (gBoard[i][j].isShown && gBoard[i][j].isMine) countBlownBombs++;
    }
  }
  if (countBlownBombs === gLevel.mines && gGame.liveCount > 0) {
    gElLiveCount.innerHTML = '';
    gameOver(false);
  }
  if (countShownCells + gLevel.mines === gLevel.size ** 2) gameOver(true);
}

function gameOver(isPlayerWin) {
  if (isPlayerWin) {
    console.log('You Won');
    clearInterval(gInterval);
    gElEmoji.src = 'assets/imgs/win.png';
    gGame.isOn = false;
    var bestTimeKey = `best-time-${gLevel.name}`;
    if (!localStorage.getItem(bestTimeKey)) {
      localStorage.setItem(bestTimeKey, gGame.secsPassed + ' seconds');
    } else {
      var lastTime = localStorage.getItem(bestTimeKey).split(' ');
      if (gGame.secsPassed < lastTime[0]) {
        localStorage.setItem(bestTimeKey, gGame.secsPassed + ' seconds');
      }
    }
  } else {
    revealBombs();
    clearInterval(gInterval);
    gElEmoji.src = `assets/imgs/dead.png`;
    gGame.isOn = false;
  }
}
function cellMarked(elCell, i, j) {
  if (!gGame.isOn || !gInterval || gBoard[i][j].isShown) return;
  var cellCoord = getCoordByElement(elCell);
  if (gBoard[cellCoord.i][cellCoord.j].isMarked) {
    if (gSound) flagSound.play();
    gBoard[cellCoord.i][cellCoord.j].isMarked = false;
    gGame.markedCount--;
  } else {
    if (gSound) flagSound.play();
    gBoard[cellCoord.i][cellCoord.j].isMarked = true;
    gGame.markedCount++;
  }
  gElBombCount.innerText = gLevel.mines - gGame.markedCount;

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
      if (inBounds(nI, nJ, gLevel.size)) {
        gGame.lastMove.push({ i: nI, j: nJ });
        gGame.shownCount++;
        if (gBoard[nI][nJ].isMarked) {
          gBoard[nI][nJ].isMarked = false;
          gGame.markedCount--;
        }
        if (gBoard[nI][nJ].minesAroundCount === 0) expandShown(nI, nJ);
        else gBoard[nI][nJ].isShown = true;
      }
    }
  }
  gElBombCount.innerText = gLevel.mines - gGame.markedCount;
}

function undoAction() {
  if (!gInterval || !gGame.isOn || !gGame.shownCount) return;
  var lastMove = gGame.moves.pop();
  if (!lastMove.length) {
    var cell = gBoard[lastMove.i][lastMove.j];
    cell.isShown = false;
    gGame.shownCount--;
    if (cell.isMine) {
      var elCell = getElementByCoord(lastMove);
      gGame.liveCount++;
      if (gGame.liveCount === 3) gElEmoji.src = `assets/imgs/start.png`;
      gElLiveCount.innerHTML = gLivesImg.repeat(gGame.liveCount);
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

function sevenBoomMode() {
  gSevenBoomMode = true;
  init();
}
function manualMode() {
  if (!gGame.isOn || gSevenBoomMode) return;
  gGame.isManual = true;
}

function getHint() {
  if (!gGame.hintsLeft || !gInterval) return;
  gHintMode = true;
}

function revealHint(i, j, toReveal = true) {
  if (toReveal) {
    gBoard[i][j].isShown = true;
    for (var x = -1; x <= 1; x++) {
      for (var y = -1; y <= 1; y++) {
        var nI = x + i;
        var nJ = j + y;
        if (y === 0 && x === 0) continue;
        if (inBounds(nI, nJ, gLevel.size)) {
          if (gBoard[nI][nJ].isShown) continue;
          gBoard[nI][nJ].isShown = true;
          gHintCells.push({ i: nI, j: nJ });
        }
      }
    }
  } else {
    gBoard[i][j].isShown = false;
    console.log('Hey');
    for (var i = 0; i < gHintCells.length; i++) {
      var currCoord = gHintCells[i];
      gBoard[currCoord.i][currCoord.j].isShown = false;
    }
  }
  renderBoard();
}
function safeClick(elBtn) {
  if (!gInterval || !gGame.safeClicks || !checkForHiddenBombs()) return;
  elBtn.innerText = `Safe Click: ${--gGame.safeClicks}`;
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
function checkForHiddenBombs() {
  for (var i = 0; i < gLevel.size; i++) {
    for (var j = 0; j < gLevel.size; j++) {
      if (gBoard[i][j].isMine && !gBoard[i][j].isShown) return true;
    }
  }
  return false;
}
