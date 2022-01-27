'use strict';

var gSound = false;
var gInterval, gCounter, gElSecs, gElMins;
var gSecs, gMins;
var gElBombCount, gElEmoji;
var gElCell, gElBoard;

function toggleSound(elImg) {
  if (gSound) {
    elImg.src = 'imgs/mute.png';
    gSound = false;
  } else {
    elImg.src = 'imgs/sound.png';
    gSound = true;
  }
}

function buildBoard(level) {
  var board = [];
  for (var i = 0; i < level.size; i++) {
    board[i] = [];
    for (var j = 0; j < level.size; j++) {
      board[i][j] = createCell();
    }
  }
  randomizeMines(board);
  for (var i = 0; i < gLevel.size; i++) {
    for (var j = 0; j < gLevel.size; j++) {
      board[i][j].minesAroundCount = setMinesNegsCount(board, { i, j });
    }
  }
  return board;
}

function renderBoard() {
  var strHTML = '<table>';
  var boardDimension = gLevel.size * 2;
  for (var i = 0; i < gLevel.size; i++) {
    strHTML += `<tr class="col col${i}">`;
    for (var j = 0; j < gLevel.size; j++) {
      var cell = gBoard[i][j];
      var size = boardDimension / gLevel.size;
      var className = `cell cell-${i}-${j}` + `${cell.isShown ? ' exposed' : ''}`;
      if (!gGame.isOn) className += cell.isMine ? ' mine' : '';
      var style = `width:${size}em; height:${size}em`;
      var clickHandler = `cellClicked(this, ${i}, ${j})`;
      strHTML += `<td><div onclick="${clickHandler}" style = "${style}" class="${className}">${cell.minesAroundCount}</div></td>`;
    }
    strHTML += '</tr>';
  }
  strHTML += '</table>';
  gElBoard.innerHTML = strHTML;
}

function createCell() {
  return {
    minesAroundCount: 0,
    isShown: false,
    isMine: false,
    isMarked: false,
  };
}

function changeLevel(level) {
  gLevel = gLevels[level - 1];
  init();
}
function startCounter() {
  gSecs = gMins = 0;
  gCounter = 0;
  gInterval = setInterval(stopWatch, 10);
}
function stopWatch() {
  gCounter += 0.01;
  if (gCounter >= 1) {
    gSecs++;
    gCounter = 0;
    gElSecs.innerText = '0' + gSecs;
  }
  if (gSecs > 9) gElSecs.innerText = gSecs;
  if (gSecs > 59) {
    gMins++;
    gElMins.innerText = '0' + gMins;
    gSecs = 0;
    gElSecs.innerText = '00';
  }
}

function randomizeMines(board) {
  var count = gLevel.mines;
  while (count) {
    var randI = getRandomIntInclusive(0, gLevel.size - 1);
    var randJ = getRandomIntInclusive(0, gLevel.size - 1);
    if (board[randI][randJ].isMine) continue;
    else {
      board[randI][randJ].isMine = true;
      count--;
    }
  }
}
