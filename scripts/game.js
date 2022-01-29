'use strict';

function countMinesAround() {
  //this function gets called after randomizeMines function
  //looping through gBoard matrice
  for (var i = 0; i < gLevel.size; i++) {
    for (var j = 0; j < gLevel.size; j++) {
      var cellCoord = { i, j };
      // setting each cell minesAroundCount property to the value that gets return
      // from setMinesNegsCount and the current coord
      gBoard[i][j].minesAroundCount = setMinesNegsCount(cellCoord);
    }
  }
}

function setMinesNegsCount(cellCoord) {
  //this function recieves a cell coordinates and
  // gets called from countMinesAround function
  var count = 0; // initilizing a counter
  // nested loop to loop through a cell neighbor
  for (var i = -1; i <= 1; i++) {
    for (var j = -1; j <= 1; j++) {
      // setting nI and nJ to be the the neighbour cell coordinates
      var nI = cellCoord.i + i;
      var nJ = cellCoord.j + j;
      // if i & j equals to zero it means that it is the recieved cell then continue
      if (i === 0 && j === 0) continue;
      // checking if neighbour cell is in a legal coordinates within the matrice bounds
      if (inBounds(nI, nJ, gLevel.size)) {
        // if it is and it is all a mine than raise the counters value
        if (gBoard[nI][nJ].isMine) count++;
      }
    }
  }
  return count; // return count
}

function cellClicked(elCell, i, j) {
  // this is onclik function that get's called every time a td elements gets left clicked on

  // if the game is not on or the current cell is marked (has flag on) then return
  if (!gGame.isOn || gBoard[i][j].isMarked) return;

  // if the game didn't start yet
  if (!gInterval) {
    // check if the game is in manual mode
    if (gGame.isManual) {
      // if it is in manual and the current cell is not a mine then-
      if (!gBoard[i][j].isMine) {
        // updating the text on the manual button element
        gElManualBtn.innerText = `Manual (${++gManualBombCount}/${gLevel.mines})`;
        // updating the cell to be a mine
        gBoard[i][j].isMine = true;
        // if the user finished to manually put the bombs for the current level then
        if (gManualBombCount === gLevel.mines) {
          // count each cells mines count around him
          countMinesAround();
          //start the counter
          startCounter();
        }
        // return from the function
        return;
      } else return; // if we are in manual but the clicked cell is a mine than return to choose another cell
    } else if (gSevenBoomMode) {
      // if the game is in seven boom mode then
      //start counter and count minest around each cell
      startCounter();
      countMinesAround();
      // setting seven boom mode to be false because it was already triggered
      gSevenBoomMode = false;
    } else {
      // else go default if it is not in seven boom or manual mode
      startCounter();
      // calling randomizeMines and passing the current clicked cell coordinates
      randomizeMines(i, j);
      countMinesAround();
    }
  }

  // if the game is in hint mode then-
  if (gHintMode) {
    gHintCells = []; // initilizing gHintCells to be empty array
    var elBtn = document.querySelector('.hint'); // selecting the hint button element
    elBtn.innerText = `Hints: ${--gGame.hintsLeft}`; // to update it's text content
    revealHint(i, j); // calling reveal hint and passing the clicked on cell coordinates
    setTimeout(revealHint, 1000, i, j, false); // calling for reveal hint again after 1 second
    gHintMode = false; // setting gHint mode to false
    return; // returning from cellClicked
  }
  // if the clicked on cell is not a mine then-
  if (!gBoard[i][j].isMine) {
    // save the last move in the gGame.lastMove property as an array of objects
    gGame.lastMove = [{ i, j }];

    // if this current cell has 0 neighbours that are mine then-
    if (!gBoard[i][j].minesAroundCount) {
      expandShown(i, j); // call expand shown function which recieves i & j
      if (gSound) uncoverSound.play(); // if the sound mode is on the olay the uncoverSound
      gGame.moves.push(gGame.lastMove); // update gGame.moves (an array) by pushing to it the last move
    } else {
      // if the cell has more than 0 neighbours with bombs then

      gGame.moves.push(gGame.lastMove); // update gGame.moves with the last move
      gBoard[i][j].isShown = true; // set the current cell to be shown
      gGame.shownCount++; // update the global gGame.shownCount
    }
  } else {
    // else if the current cell is a mine then

    if (gBoard[i][j].isShown) return; // check if the mine is already shown if yes return
    if (gSound) bombSound.play(); // if the sound is on then play the bombSound
    gElEmoji.src = `assets/imgs/hit.png`; // update the emoji image
    gGame.moves.push({ i, j }); // push the move coordinates to the moves array
    // update the live count of the player and the element that shows it
    gElLiveCount.innerHTML = gLivesImg.repeat(--gGame.liveCount);
    gBoard[i][j].isShown = true; // set the current cell to be shown
  }
  // if the player has 0 lives then it is game over
  if (!gGame.liveCount) gameOver();
  // calling checkGameOver
  checkGameOver();
  // Rendering the board
  renderBoard();
}

function loadSevenBoomMode() {
  // this function get's called from init if the game is in sevenBoomMode
  // nums get initilized to be an array that
  // holds the number from 1 to the length of the size squared, in steps of 1. e.g: [1,2,3,4,5,6...]
  var nums = numRange(1, gLevel.size ** 2, 1);
  var res = [];
  var counter = 0;
  for (var i = 0; i < gLevel.size ** 2; i++) {
    // looping through nums array to check if the current number in the array
    // is a multiplication of 7 or the number contains a seven
    if (nums[i] % 7 === 0 || isNumberContainSeven(nums[i]) !== -1) res.push(nums[i]);
    // if yes push the number value to the res array
  }
  for (var i = 0; i < gLevel.size; i++) {
    for (var j = 0; j < gLevel.size; j++) {
      // a nested loop to loop through each cell in the matrice
      res.forEach((num) => {
        // looping through all the numbers in the res array
        // check if the counter is equal to the current number in the array
        if (counter === num) {
          // if yes set the cell to be a mine
          gBoard[i][j].isMine = true;
        }
      });
      // raise the counter value
      counter++;
    }
  }
}

function checkGameOver() {
  // get's called after each click on the board
  var countShownCells = 0; // a counter to count shown cells
  var countBlownBombs = 0; // a counter to count blown bombs
  for (var i = 0; i < gLevel.size; i++) {
    for (var j = 0; j < gLevel.size; j++) {
      // a nested loop to loop through each cell in the matrice
      // checking if the current cell is shown and it is not a mine
      if (gBoard[i][j].isShown && !gBoard[i][j].isMine) countShownCells++;
      // check if the cell is shown and is a bomb
      if (gBoard[i][j].isShown && gBoard[i][j].isMine) countBlownBombs++;
    }
  }
  // checking if the number of blown bombs is equal to the level's mine number and the player's life is 0
  if (countBlownBombs === gLevel.mines && gGame.liveCount > 0) {
    gElLiveCount.innerHTML = ''; // update dom to include no lives
    gameOver(false); // calling gameover and passing false because the player lost
  }
  // if the number of shown cells + the number of mines is equal to the matrice length squared
  // then call gameOver with true because the player won
  if (countShownCells + gLevel.mines === gLevel.size ** 2) gameOver(true);
}

function gameOver(isPlayerWin) {
  if (isPlayerWin) {
    // if the player won
    clearInterval(gInterval); // clear the interval
    gElEmoji.src = 'assets/imgs/win.png'; // update emoji
    gGame.isOn = false; // gGame.isOn is now false
    // creating a unique key to store in storage
    var bestTimeKey = `best-time-${gLevel.name}`;
    if (!localStorage.getItem(bestTimeKey)) {
      // if the storage has no value for this key then it set one
      localStorage.setItem(bestTimeKey, gGame.secsPassed + ' seconds');
    } else {
      // if it already has value then set lastTime to it's value
      var lastTime = localStorage.getItem(bestTimeKey).split(' ');
      // the returned value is a string which we splitted to find the specific values
      if (gGame.secsPassed < lastTime[0]) {
        // if the current time is lower then the last time then update it
        localStorage.setItem(bestTimeKey, gGame.secsPassed + ' seconds');
      }
    }
  } else {
    // if the player lost, reveal the bombs, clear the interval, update emoji and update gGame.isOn
    revealBombs();
    clearInterval(gInterval);
    gElEmoji.src = `assets/imgs/dead.png`;
    gGame.isOn = false;
  }
}

function cellMarked(elCell, i, j) {
  // this function is called from the oncontextmenu (right-click) click event
  // if the game is not on / or the interval didn't start / or the current cell is already shown then return
  if (!gGame.isOn || !gInterval || gBoard[i][j].isShown) return;
  // get the elemnt coords using a utility function
  var cellCoord = getCoordByElement(elCell);
  //checking if the board at the current location is already marked
  if (gBoard[cellCoord.i][cellCoord.j].isMarked) {
    // if it is mark then-
    if (gSound) flagSound.play(); // play a sound if sound mode is on
    gBoard[cellCoord.i][cellCoord.j].isMarked = false; // updating the cell to be unflagged
    gGame.markedCount--; // update the global marked count
  } else {
    // if the cell is not marked
    if (gSound) flagSound.play(); // play a sound if the sound is on
    gBoard[cellCoord.i][cellCoord.j].isMarked = true; // update cell to be flagged
    gGame.markedCount++; // update the global marked count
  }
  // set the element which holds the bomb count number to it's new value
  gElBombCount.innerText = gLevel.mines - gGame.markedCount;

  renderBoard(); // rendering the board
}

function expandShown(i, j) {
  // this function is called when a cell is clicked and it has 0 neighbours that are mines
  // base cases for recursion
  if (gBoard[i][j].isShown) return; // if the cell is already shown return
  if (gBoard[i][j].isMine) return; // if the cell is a mine then return

  // update the cell to be shown
  gBoard[i][j].isShown = true;
  for (var x = -1; x <= 1; x++) {
    for (var y = -1; y <= 1; y++) {
      // nested loop to go through a cell neighbours
      // initilizing the neighbours coordination
      var nI = x + i;
      var nJ = y + j;
      // checking if the neighbour coords are in the matrice bounds
      if (inBounds(nI, nJ, gLevel.size)) {
        gGame.lastMove.push({ i: nI, j: nJ }); // push the neighbour coordinates to the last move global array
        gGame.shownCount++; // update the shown count number
        // check if the cell is marked
        if (gBoard[nI][nJ].isMarked) {
          // if so it turns it into being not marked
          gBoard[nI][nJ].isMarked = false;
          // reducing marked count
          gGame.markedCount--;
        }
        // if the current neighbour also has 0 neighbours with bombs then the function
        // calls itself with new arguments
        if (gBoard[nI][nJ].minesAroundCount === 0) expandShown(nI, nJ);
        // else set the current cell to be shown
        else gBoard[nI][nJ].isShown = true;
      }
    }
  }
  // update the number of bomb count
  gElBombCount.innerText = gLevel.mines - gGame.markedCount;
}

function undoAction() {
  // this function is called after clicking on the undo button
  // if the game / counter didn't start or there is no shown cell then return
  if (!gInterval || !gGame.isOn || !gGame.shownCount) return;
  // retrives the last move by popping it from the moves global array
  var lastMove = gGame.moves.pop();
  // checking if the last move is a single move or an array of moves(a result of the expandShown function)
  if (!lastMove.length) {
    var cell = gBoard[lastMove.i][lastMove.j]; // cell is a variable which holds the last move cell
    cell.isShown = false; // updating the cell to be hidden
    gGame.shownCount--; // updating shown count
    // if the cell from the last move is a mine then-
    if (cell.isMine) {
      var elCell = getElementByCoord(lastMove); // elCell is now an element of the td element in the coordinates
      gGame.liveCount++; // update live count
      if (gGame.liveCount === 3) gElEmoji.src = `assets/imgs/start.png`; //update the emoji if the player now has 3 lives
      gElLiveCount.innerHTML = gLivesImg.repeat(gGame.liveCount); // update the live count element
    }
    renderBoard(); // render the board
    return; // returning so we don't continue to the other case
  }
  // 2nd case - if the last move is an array of moves
  for (var i = 0; i < lastMove.length; i++) {
    var moveCoord = lastMove[i]; // moveCoord is now an coord object that holds the last move
    var cell = gBoard[moveCoord.i][moveCoord.j]; // geting the last move cell
    cell.isShown = false; // unshowing the cell
    gGame.shownCount--; // updating gGame
  }
  renderBoard();
}

function sevenBoomMode() {
  // this function called from the seven boom button element
  gSevenBoomMode = true; // updating the game to be in seven boom mode
  init(); // calling init
}

function manualMode() {
  // called when the manual button element is pressed
  if (!gGame.isOn || gSevenBoomMode) return; // if the game hasn't start or we are in seven boom mode return
  gGame.isManual = true; // update the game to be manual mode
}

function getHint() {
  // called when the get hine  element is pressed

  if (!gGame.hintsLeft || !gInterval) return; // if the game hasn't start or no hints left then return
  gHintMode = true; // set the game to be in hint mode
}

function revealHint(i, j, toReveal = true) {
  // this function get's called from clickedCell function when hint mode is on
  if (toReveal) {
    // if toReveal is true then change the current cell to be shown
    gBoard[i][j].isShown = true;
    for (var x = -1; x <= 1; x++) {
      for (var y = -1; y <= 1; y++) {
        // a nested loop to loop through the cells neighbors
        var nI = x + i;
        var nJ = j + y;
        if (y === 0 && x === 0) continue; // if it's the cell that the function recieved then contninue
        //if the cell is in the boundaries of the matrice then-
        if (inBounds(nI, nJ, gLevel.size)) {
          if (gBoard[nI][nJ].isShown) continue; // if the current cell is shown then continue
          gBoard[nI][nJ].isShown = true; // update the cell to be shown
          gHintCells.push({ i: nI, j: nJ }); // push the cel to the gHintCells global array
        }
      }
    }
  } else {
    // if to reveal is set to false then-
    gBoard[i][j].isShown = false; // update the cell to be shown
    for (var i = 0; i < gHintCells.length; i++) {
      // loop through the gHintCells array
      var currCoord = gHintCells[i]; // get the current cell coordinates
      gBoard[currCoord.i][currCoord.j].isShown = false; // update that cell to be not shown
    }
  }
  renderBoard();
}

function safeClick(elBtn) {
  // this function get's called when safeclick button element is clicked
  // if the game hasn't started or no more safeclicks available or no more hidden bombs are out there then return
  if (!gInterval || !gGame.safeClicks || !checkForHiddenBombs()) return;
  elBtn.innerText = `Safe Click: ${--gGame.safeClicks}`; // update the btn txt
  var isOk = false; // initilize a boolean variable
  while (!isOk) {
    // looping while isOk is false
    // get random coordinates withing the matrice boundaries
    var randI = getRandomIntInclusive(0, gLevel.size - 1);
    var randJ = getRandomIntInclusive(0, gLevel.size - 1);
    // check the random coordinates
    var currCell = gBoard[randI][randJ];
    // if the current cell is not shown and not a mine then-
    if (!currCell.isShown && !currCell.isMine) {
      isOk = true; // set is ok to be true
      renderCell(randI, randJ, gEmptyImg); // render the cell as an empty array
      setTimeout(renderCell, 1500, randI, randJ, gCoverImg); // render it back to be a coverImg after 1.5 seconds
    }
  }
}

function checkForHiddenBombs() {
  // this function get's called  from the safeClick function
  for (var i = 0; i < gLevel.size; i++) {
    for (var j = 0; j < gLevel.size; j++) {
      // looping through the matrice to check every cell
      // if the current cell is a mine and is not shown then return true
      if (gBoard[i][j].isMine && !gBoard[i][j].isShown) return true;
    }
  }
  return false; // if no hidden mines found return false
}
