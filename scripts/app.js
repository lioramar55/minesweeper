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
  { name: 'easy', size: 4, mines: 2 },
  { name: 'medium', size: 8, mines: 12 },
  { name: 'hard', size: 12, mines: 30 },
];
var gLevel = gLevels[0];
var gBoard;
var gSound = false;
var gElHint,
  gHintMode,
  gHintCells = [];
var gInterval, gCounter, gElSecs, gElMins;
var gSecs, gMins;
var gElBestTime;
var gSevenBoomMode;
var gManualBombCount, gElManualBtn;
var gElBombCount, gElEmoji;
var gElCell, gElBoard;
var gElLiveCount;
var gElUndo, gUndo;
var gFlagImg = `<img src="assets/imgs/flag.png" />`;
var gEmptyImg = `<img src="assets/imgs/empty.png" />`;
var gCoverImg = `<img src="assets/imgs/cover.png" />`;
var gBlackBomb = `<img src="assets/imgs/black-bomb.png" />`;
var gRedBomb = `<img src="assets/imgs/red-bomb.png" />`;
var gLivesImg = `<img class='icon' src="assets/imgs/live.png" />`;
var bombSound = new Audio('assets/sound/bomb-sound.wav');
var flagSound = new Audio('assets/sound/flag-sound.wav');
var uncoverSound = new Audio('assets/sound/uncover-sound.wav');
var unmuteSound = new Audio('assets/sound/sound.wav');

function init() {
  gBoard = buildBoard(gLevel); // building board
  initGame(); // initilize variables, load dom elements
  gElBombCount.innerText = gLevel.mines; // setting num of bomb count
  renderBoard();
}

function initGame() {
  if (gInterval) clearInterval(gInterval); //checking if init was called in the middle of an interval
  if (gSevenBoomMode) loadSevenBoomMode(); // checking if init was called from gSevenBoomMode
  gInterval = null;
  gGame.isOn = true;
  gGame.safeClicks = 3;
  gGame.secsPassed = 0;
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
  gElManualBtn = document.querySelector('.manual');
  gElBestTime = document.querySelector('.best-score');
  gManualBombCount = 0;
  gElManualBtn.innerText = `Manual (${gManualBombCount}/${gLevel.mines})`;
  gElEmoji.src = 'assets/imgs/start.png';
  gElLiveCount.innerHTML = gLivesImg.repeat(gGame.liveCount);
  gElHint.innerText = `Hints: ${gGame.hintsLeft}`;
  gElMins.innerText = '00';
  gElSecs.innerText = '00';
  if (localStorage.getItem(`best-time-${gLevel.name}`)) {
    /*check if local storage for this this time difficulty*/
    gElBestTime.innerText = localStorage.getItem(`best-time-${gLevel.name}`);
  } else {
    gElBestTime.innerText = `Do not exist, try playing :)`;
  }
  gGame.moves.push(clone2DArray(gBoard));
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

function renderBoard() {
  var strHTML = '<table>';
  for (var i = 0; i < gLevel.size; i++) {
    strHTML += `<tr class="col col${i}">`;
    for (var j = 0; j < gLevel.size; j++) {
      var cell = gBoard[i][j];
      var cellContent = gCoverImg;
      var cellId = `cell-${i}-${j}`;
      var className = `cell`;
      var clickHandler = `onclick="cellClicked(this, ${i}, ${j})" oncontextmenu="cellMarked(this, ${i}, ${j})"`;
      var style = '';
      if (cell.isMarked) cellContent = gFlagImg;
      if (cell.isShown) {
        if (gHintMode) {
          cellContent = cell.minesAroundCount
            ? `<img src="assets/imgs/num${cell.minesAroundCount}.png"`
            : gBlackBomb;
        }
        if (!cell.isMine) {
          cellContent = cell.minesAroundCount
            ? `<img src="assets/imgs/num${cell.minesAroundCount}.png"`
            : gEmptyImg;
        } else cellContent = gBlackBomb;
        if (!gGame.isOn && cell.isMine) cellContent = gRedBomb;
      }
      strHTML += `<td><div id=${cellId} ${clickHandler} ${style} class="${className}">${cellContent}</div></td>`;
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
    gGame.secsPassed++;
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

function randomizeMines(i, j) {
  var count = gLevel.mines;
  while (count) {
    var randI = getRandomIntInclusive(0, gLevel.size - 1);
    var randJ = getRandomIntInclusive(0, gLevel.size - 1);
    if (gBoard[randI][randJ].isMine || (randI === i && randJ === j)) continue;
    else {
      gBoard[randI][randJ].isMine = true;
      count--;
    }
  }
}
function revealBombs() {
  for (var i = 0; i < gLevel.size; i++) {
    for (var j = 0; j < gLevel.size; j++) {
      var cell = gBoard[i][j];
      if (cell.isMine && !cell.isShown) {
        cell.isShown = true;
        renderCell(i, j, gRedBomb);
      }
    }
  }
}
function toggleSound(elImg) {
  if (gSound) {
    elImg.src = 'assets/imgs/mute.png';
    gSound = false;
  } else {
    unmuteSound.play();
    elImg.src = 'assets/imgs/sound.png';
    gSound = true;
  }
}
