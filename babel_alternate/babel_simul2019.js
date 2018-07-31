'use strict';
var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function forceRatio(n, s, t) {
  var p = 1 - Math.pow((t - 1) / s, n);
  var result = p < 0.5 ? 2 * p : p > 0.75 ? 1 / (2 - 2 * p) : 4 * p - 1;
  return result;
}
function rangeT(s) {
  var result = [];
  (function rangeRecur(x) {
    if (x <= 1) {
      return result;
    }
    result[x - 2] = x;
    return rangeRecur(x - 1);
  })(s);
  return result.reverse();
}
function diceSidesTargetPairs(x) {
  return rangeT(x).map(function (y) {
    return [x, y];
  });
}
function sidesTargetLonglist(x) {
  return x.map(function (y) {
    return diceSidesTargetPairs(y);
  }).reduce(function (a, b) {
    return a.concat(b);
  });
}
function posFinitePredicate(x) {
  if (x > 0 && Number.isFinite(x)) {
    return true;
  }
}
function calculateUsVsThem(us, them, advUs, advThem) {
  function logarithmicScaling(delta) {
    return 2 * Math.log(Math.abs(delta) + 1);
  }
  var deltaAdv = advUs - advThem;
  var forceMultiplier = deltaAdv > 0 ? logarithmicScaling(deltaAdv) : deltaAdv < 0 ? 1 / logarithmicScaling(deltaAdv) : 1;
  return us / them * forceMultiplier;
}
var e = function () {
  var maxPlayerNbrs = 6;
  var playerNbrs = 3;
  var us = 10;
  var them = 10;
  var advUs = 0;
  var advThem = 0;
  var diceAvailable = [6, 8, 12, 20, 100]; // [4, 6, 8, 12, 20, 100]
  var enc = {};
  enc.reset = { n: playerNbrs, u: us, t: them, ua: advUs, ta: advThem };
  enc.change_n = function (x) {
    playerNbrs = Number.isInteger(x) && x > 0 && x <= maxPlayerNbrs ? x : playerNbrs;
  };
  enc.change_us = function (x) {
    us = posFinitePredicate(x) ? x : us;
  };
  enc.change_them = function (x) {
    them = posFinitePredicate(x) ? x : them;
  };
  enc.change_us_adv = function (x) {
    advUs = Number.isFinite(x) ? x : advUs;
  };
  enc.change_them_adv = function (x) {
    advThem = Number.isFinite(x) ? x : advThem;
  };
  enc.get_maxPlayerNbrs = function () {
    return maxPlayerNbrs;
  };
  enc.get_n = function () {
    return playerNbrs;
  };
  enc.get_us = function () {
    return us;
  };
  enc.get_them = function () {
    return them;
  };
  enc.get_us_adv = function () {
    return advUs;
  };
  enc.get_them_adv = function () {
    return advThem;
  };
  enc.force_ratio_recur = function chances() {
    var x = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : maxPlayerNbrs;

    if (x < 1) {
      return;
    }
    var result = sidesTargetLonglist(diceAvailable).map(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2),
          y = _ref2[0],
          z = _ref2[1];

      return [x + 'd' + y + ' target ' + z, forceRatio(x, y, z)];
    });
    enc['arr' + x] = result.filter(function (_ref3) {
      var _ref4 = _slicedToArray(_ref3, 2),
          k = _ref4[1];

      return posFinitePredicate(k);
    });
    return chances(x - 1);
  };
  return enc;
}();
function instructions(n, usVsThem) {
  var forceRatioArray = e['arr' + n].map(function (_ref5) {
    var _ref6 = _slicedToArray(_ref5, 2),
        y = _ref6[1];

    return y;
  });
  var differenceArray = forceRatioArray.map(function (x) {
    return Math.abs(x - usVsThem);
  });
  var leastDifferent = differenceArray.reduce(function (x, y) {
    return Math.min(x, y);
  });
  var indexOfLeastDifferent = differenceArray.indexOf(leastDifferent);
  return e['arr' + n][indexOfLeastDifferent][0];
}
function instruct() {
  var usVsThem = calculateUsVsThem(e.get_us(), e.get_them(), e.get_us_adv(), e.get_them_adv());
  var ndst = instructions(e.get_n(), usVsThem);
  document.querySelector('#dice_roll_instructions').textContent = 'Roll ' + ndst + '.';
  document.querySelector('#we_they_summary').innerHTML = '<span class="us_adv_row">' + e.get_us() + '\n    <small>(adv ' + e.get_us_adv() + ')</small></span>\n    <span class="them_adv_row">' + e.get_them() + '\n    <small>(adv ' + e.get_them_adv() + ')</small></span>';
}
function preparePlayerNumbersSection() {
  document.querySelector('#pbttn' + e.get_n()).classList.remove('availBttn');
  document.querySelector('#pbttn' + e.get_n()).classList.add('pickedBttn');

  var _loop = function _loop(i) {
    var el = document.querySelector('#pbttn' + i);
    el.addEventListener('click', function () {
      document.querySelector('#pbttn' + e.get_n()).classList.remove('pickedBttn');
      document.querySelector('#pbttn' + e.get_n()).classList.add('availBttn');
      e.change_n(parseInt(i));
      instruct();
      document.querySelector('#pbttn' + i).classList.remove('availBttn');
      document.querySelector('#pbttn' + i).classList.add('pickedBttn');
    });
  };

  for (var i = 1; i <= e.get_maxPlayerNbrs(); i++) {
    _loop(i);
  }
}
function usInput() {
  var el = document.querySelector('#us_input');
  e.change_us(Number.parseFloat(el.value));
  el.addEventListener('input', function () {
    e.change_us(Number.parseFloat(el.value));
    instruct();
  });
}
function themInput() {
  var el = document.querySelector('#them_input');
  e.change_them(Number.parseFloat(el.value));
  el.addEventListener('input', function () {
    e.change_them(Number.parseFloat(el.value));
    instruct();
  });
}
function usAdvInput() {
  var el = document.querySelector('#us_adv_input');
  e.change_us_adv(Number.parseFloat(el.value));
  el.addEventListener('input', function () {
    e.change_us_adv(Number.parseFloat(el.value));
    instruct();
  });
}
function themAdvInput() {
  var el = document.querySelector('#them_adv_input');
  e.change_them_adv(Number.parseFloat(el.value));
  el.addEventListener('input', function () {
    e.change_them_adv(Number.parseFloat(el.value));
    instruct();
  });
}
function usKeypadButtonFn(x) {
  var el = document.querySelector('#us_input');
  var resultString = el.value + x;
  e.change_us(Number.parseFloat(resultString));
  el.value = resultString;
  instruct();
}
function themKeypadButtonFn(x) {
  var el = document.querySelector('#them_input');
  var resultString = el.value + x;
  e.change_them(Number.parseFloat(resultString));
  el.value = resultString;
  instruct();
}
function prepareKeypads() {
  var _loop2 = function _loop2(i) {
    var el = document.querySelector('#usNbrKey' + i);
    el.addEventListener('click', function () {
      usKeypadButtonFn(i);
    });
  };

  for (var i = 1; i <= 9; i++) {
    _loop2(i);
  }

  var _loop3 = function _loop3(i) {
    var el = document.querySelector('#themNbrKey' + i);
    el.addEventListener('click', function () {
      themKeypadButtonFn(i);
    });
  };

  for (var i = 1; i <= 9; i++) {
    _loop3(i);
  }
}
function prepareAdvButtons() {
  document.querySelector('#us_adv_minus_button').addEventListener('click', function () {
    var result = e.get_us_adv() - 1;
    e.change_us_adv(result);
    document.querySelector('#us_adv_input').value = result;
    instruct();
  });
  document.querySelector('#us_adv_plus_button').addEventListener('click', function () {
    var result = e.get_us_adv() + 1;
    e.change_us_adv(result);
    document.querySelector('#us_adv_input').value = result;
    instruct();
  });
  document.querySelector('#them_adv_minus_button').addEventListener('click', function () {
    var result = e.get_them_adv() - 1;
    e.change_them_adv(result);
    document.querySelector('#them_adv_input').value = result;
    instruct();
  });
  document.querySelector('#them_adv_plus_button').addEventListener('click', function () {
    var result = e.get_them_adv() + 1;
    e.change_them_adv(result);
    document.querySelector('#them_adv_input').value = result;
    instruct();
  });
}
function usClearButton() {
  var el = document.querySelector('#us_input');
  var resultString = el.value.slice(0, -1);
  e.change_us(Number.parseFloat(resultString));
  el.value = resultString;
  instruct();
}
function themClearButton() {
  var el = document.querySelector('#them_input');
  var resultString = el.value.slice(0, -1);
  e.change_them(Number.parseFloat(resultString));
  el.value = resultString;
  instruct();
}
function resetButton() {
  document.querySelector('#pbttn' + e.get_n()).classList.remove('pickedBttn');
  document.querySelector('#pbttn' + e.get_n()).classList.add('availBttn');
  e.change_n(e.reset.n);
  e.change_us(e.reset.u);
  e.change_them(e.reset.t);
  e.change_us_adv(e.reset.ua);
  e.change_them_adv(e.reset.ta);
  preparePlayerNumbersSection();
  document.querySelector('#us_input').value = e.reset.u;
  document.querySelector('#them_input').value = e.reset.t;
  document.querySelector('#us_adv_input').value = e.reset.ua;
  document.querySelector('#them_adv_input').value = e.reset.ta;
  instruct();
}
function main() {
  e.force_ratio_recur();
  preparePlayerNumbersSection();
  usInput();
  themInput();
  usAdvInput();
  themAdvInput();
  prepareKeypads();
  prepareAdvButtons();
  document.querySelector('#us_clear_button').addEventListener('click', usClearButton);
  document.querySelector('#them_clear_button').addEventListener('click', themClearButton);
  document.querySelector('#reset_button').addEventListener('click', resetButton);
  resetButton();
}
main();
