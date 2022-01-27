'use strict';

var gSound = false;
var gInterval, gCounter, gElSecs, gElMins;
var gSecs, gMins;

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
  return board;
}
function placeAndCountMines() {
  randomizeMines(gBoard);
  for (var i = 0; i < gLevel.size; i++) {
    for (var j = 0; j < gLevel.size; j++) {
      gBoard[i][j].minesAroundCount = setMinesNegsCount(gBoard, { i, j });
    }
  }
}

function renderBoard() {
  var strHTML = '<table>';
  var boardDimension = gLevel.size * 2;
  for (var i = 0; i < gLevel.size; i++) {
    strHTML += `<tr class="col col${i}">`;
    for (var j = 0; j < gLevel.size; j++) {
      var cell = gBoard[i][j];
      var size = boardDimension / gLevel.size;

      var cellId = `cell-${i}-${j}`;
      var className = `cell`;
      var clickHandler = `onclick="cellClicked(this, ${i}, ${j})" oncontextmenu="cellMarked(this)"`;
      var style = `width:${size}em; height:${size}em`;

      if (cell.isMarked) className += ' mark';
      if (cell.isShown) {
        if (!cell.isMine) className += ' exposed';
        else className += ' mine';
      }
      if (!gGame.isOn) className += cell.isMine ? ' mine' : '';

      strHTML += `<td><div id=${cellId} ${clickHandler} style = "${style}" class="${className}">${cell.minesAroundCount}</div></td>`;
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

function getElementByCoord(coord) {
  var selector = `#cell-${coord.i}-${coord.j}`;
  return document.querySelector(selector);
}

function getCoordByElement(el) {
  var i = el.id.split('-')[1];
  var j = el.id.split('-')[2];
  return { i, j };
}
