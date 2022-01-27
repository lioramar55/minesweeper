// utility functions
function inBounds(i, j, size) {
  if (i >= 0 && i < size && j >= 0 && j < size) return true;
  return false;
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
