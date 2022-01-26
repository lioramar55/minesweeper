// utility functions
function getCellBySelector(i, j, selector) {
  return document.querySelector();
}

function numRange(start, finish, step) {
  var nums = [];
  for (var i = start; i < finish; i += step) {
    nums.push(i);
  }
  return nums;
}

function renderCell(location, value) {
  // Select the elCell and set the value
  var elCell = document.querySelector(`.cell-${location.i}-${location.j}`);
  elCell.innerHTML = value;
}

function getRandomIntInclusive(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function numMapCounter(start, finish, initValue, step) {
  var map = {};
  for (var i = start; i <= finish; i += step) {
    map[i] = initValue;
  }
  return map;
}

function getWord() {
  var length = getRandomInt(2, 4);
  var word = '';
  while (length) {
    word += String.fromCharCode(getRandomInt(97, 123));
    length--;
  }
  return word;
}

function getTime() {
  return new Date().toString().split(' ')[4];
}
