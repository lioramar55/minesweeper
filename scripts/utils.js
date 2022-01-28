// utility functions

function renderCell(i, j, value) {
  var selector = `#cell-${i}-${j}`;
  var cell = document.querySelector(selector);
  console.log('value', value);
  cell.innerHTML = `<img ${value} />`;
}
function inBounds(i, j, size) {
  if (i >= 0 && i < size && j >= 0 && j < size) return true;
  return false;
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
function clone2DArray(mat) {
  return mat.map((inner) => inner.slice());
}

function numRange(start, finish, step) {
  var nums = [];
  for (var i = start; i < finish; i += step) {
    nums.push(i);
  }
  return nums;
}

function getRandomIntInclusive(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function isNumberContainSeven(n) {
  var s = n + '';
  return s.split('').indexOf('7');
}
