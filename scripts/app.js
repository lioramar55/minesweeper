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
var gElSafeBtn;
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
  gElBestTime = document.querySelector('.best-score');
  /*check if local storage for this this time difficulty*/
  if (localStorage.getItem(`best-time-${gLevel.name}`)) {
    gElBestTime.innerText = localStorage.getItem(`best-time-${gLevel.name}`);
  } else {
    gElBestTime.innerText = `Do not exist, try playing :)`;
  }
  // Initilizing global variables and gGame properties
  gGame.isOn = true;
  gGame.isManual = false;
  gInterval = null;
  gGame.lastMove = null;
  gGame.moves = [];
  gGame.moves.push(clone2DArray(gBoard));
  gGame.safeClicks = 3;
  gGame.liveCount = 3;
  gGame.hintsLeft = 3;
  gGame.secsPassed = 0;
  gGame.markedCount = 0;
  gGame.shownCount = 0;
  gManualBombCount = 0;

  // selecting elements from the dom
  gElBombCount = document.querySelector('.bomb-count');
  gElEmoji = document.querySelector('.emoji');
  gElMins = document.querySelector('.minutes');
  gElSecs = document.querySelector('.seconds');
  gElHint = document.querySelector('.hint');
  gElLiveCount = document.querySelector('.live-count');
  gElBoard = document.querySelector('.board');
  gElUndo = document.querySelector('.undo');
  gElManualBtn = document.querySelector('.manual');
  gElSafeBtn = document.querySelector('.safe');

  // setting dom elements to default values
  gElManualBtn.innerText = `Manual (${gManualBombCount}/${gLevel.mines})`;
  gElLiveCount.innerHTML = gLivesImg.repeat(gGame.liveCount);
  gElHint.innerText = `Hints: ${gGame.hintsLeft}`;
  gElSafeBtn.innerText = `Safe Click: ${gGame.safeClicks}`;
  gElMins.innerText = '00';
  gElSecs.innerText = '00';
  gElEmoji.src = 'assets/imgs/start.png';
}

// building board in for the specified level
function buildBoard(level) {
  var board = [];
  for (var i = 0; i < level.size; i++) {
    board[i] = [];
    for (var j = 0; j < level.size; j++) {
      board[i][j] = createCell(); // calling createCell which returns an object
    }
  }
  return board;
}

function renderBoard() {
  // injecting html to the dom
  var strHTML = '<table>'; // creating table element
  for (var i = 0; i < gLevel.size; i++) {
    strHTML += `<tr class="col">`; // creating table row element with a class names 'col'
    for (var j = 0; j < gLevel.size; j++) {
      var cell = gBoard[i][j]; // cell is equal to the current cell in the 2d array
      var cellContent = gCoverImg; // cellContent recieves a default value of the cover image
      var cellId = `cell-${i}-${j}`; // unique cell id for each cell
      // setting each div in the table data element click events
      var clickHandler = `onclick="cellClicked(this, ${i}, ${j})" oncontextmenu="cellMarked(this, ${i}, ${j})"`;
      var style = ''; // initilizing the style of the current cell
      if (cell.isMarked) cellContent = gFlagImg; // if the current cell is marked it's content should be a flag image
      if (cell.isShown) {
        // if the cell is shown then check-
        if (gHintMode) {
          // if its hint mode then reveal the real content value (number)
          cellContent = cell.minesAroundCount
            ? `<img src="assets/imgs/num${cell.minesAroundCount}.png"`
            : gBlackBomb;
        }
        if (!cell.isMine) {
          // if the cell is not a mine than change to its real content (number)
          cellContent = cell.minesAroundCount
            ? `<img src="assets/imgs/num${cell.minesAroundCount}.png"`
            : gEmptyImg;
        } else cellContent = gBlackBomb; // else reveal that it is a bomb
        // if the game ended then change all the bombs color to have red bg-color
        if (!gGame.isOn && cell.isMine) cellContent = gRedBomb;
      }
      // injecting into the table data a div with all the attribute and the content
      strHTML += `<td><div id=${cellId} ${clickHandler} ${style} class="cell">${cellContent}</div></td>`;
    }
    strHTML += '</tr>'; // closing table row elment tag
  }
  strHTML += '</table>'; // closing table elment tag
  gElBoard.innerHTML = strHTML; // setting the board container html to the newly generated board
}

function createCell() {
  // returning an object with default values
  return {
    minesAroundCount: 0,
    isShown: false,
    isMine: false,
    isMarked: false,
  };
}

function changeLevel(level) {
  // this function get's called from an on click event on a button
  gLevel = gLevels[level - 1]; // setting the current game level
  init(); // initilizing game
}

function startCounter() {
  // this function get'called when the first move of the game begins
  // initilizing globar variables
  gSecs = gMins = 0;
  gCounter = 0;
  // setting gInterval to call stopWatch function every 10 miliseconds
  gInterval = setInterval(stopWatch, 10);
}
function stopWatch() {
  gCounter += 0.01; // adding 0.01 to gCounter every 10 miliseconds
  if (gCounter >= 1) {
    // if gCounter reached 1 then do that
    gSecs++; // updating global variable
    gGame.secsPassed++; // updating global game variable
    gCounter = 0;
    gElSecs.innerText = '0' + gSecs; // updating the dom
  }
  if (gSecs > 9) gElSecs.innerText = gSecs; // if the seconds are bigger than 9 then update the dom
  if (gSecs > 59) {
    // when gSecs is bigger than 59 then a whole minute passed
    // update global variable
    gMins++;
    gSecs = 0;
    // update dom
    gElMins.innerText = '0' + gMins;
    gElSecs.innerText = '00';
  }
}

function randomizeMines(i, j) {
  // this function is called after the first click on every cell
  // so it would randomize the places of mines

  var count = gLevel.mines; // initilizing a counter to be the number of this current level mines

  // this while loop would end only after finding the count number of unique mines location
  while (count) {
    // setting randI & randJ to be a random value in the range of 0 to boards length
    var randI = getRandomIntInclusive(0, gLevel.size - 1);
    var randJ = getRandomIntInclusive(0, gLevel.size - 1);

    // if the random value is already a mine or it is equal to the coordinates
    // recieved from the first click of the user then continue to get new randoom numbers
    if (gBoard[randI][randJ].isMine || (randI === i && randJ === j)) continue;
    else {
      // else set this cell to be a mine
      gBoard[randI][randJ].isMine = true;
      // reduce the counter by one
      count--;
    }
  }
}
function revealBombs() {
  // this function get's called at gameOver and it reveals all of the unrevealed bombs
  for (var i = 0; i < gLevel.size; i++) {
    for (var j = 0; j < gLevel.size; j++) {
      // looping through the array to access each cell
      var cell = gBoard[i][j];
      // checking if the cell is a mine and it is not shown
      if (cell.isMine && !cell.isShown) {
        // if yes then set it value to be shown
        cell.isShown = true;
        //update the dom
        renderCell(i, j, gRedBomb);
      }
    }
  }
}

function toggleSound(elImg) {
  // this function gets called when the user click on the sound icon
  // it toggle the sound
  if (gSound) {
    //update model
    gSound = false;
    //update dom
    elImg.src = 'assets/imgs/mute.png';
  } else {
    // play a sound to inform the user about unmute mode
    unmuteSound.play();
    elImg.src = 'assets/imgs/sound.png';
    gSound = true;
  }
}
