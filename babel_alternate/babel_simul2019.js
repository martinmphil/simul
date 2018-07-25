'use strict';
// Pure functions with "n" players, "s" sided dice and target roll "t".

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function force_ratio(n, s, t) {
  var p = 1 - Math.pow((t - 1) / s, n);
  var result = p < 0.5 ? 2 * p : p > 0.75 ? 1 / (2 - 2 * p) : 4 * p - 1;
  return result;
}
function range_t(s) {
  var result = [];
  (function range_recur(x) {
    if (x <= 1) {
      return result;
    }
    result[x - 2] = x;
    return range_recur(x - 1);
  })(s);
  return result.reverse();
}
function dice_s_t_pairs(x) {
  return range_t(x).map(function (y) {
    return [x, y];
  });
}
function s_t_longlist(x) {
  return x.map(function (y) {
    return dice_s_t_pairs(y);
  }).reduce(function (a, b) {
    return a.concat(b);
  });
}
function pos_finite_predicate(x) {
  if (x > 0 && Number.isFinite(x)) {
    return true;
  }
}
function realistic_fr_predicate(x) {
  if (x > 0.0001 && x < 10000) {
    return true;
  }
}
function calculate_us_vs_them(us, them, adv_us, adv_them) {
  function logarithmic_scaling(delta) {
    return 2 * Math.log(Math.abs(delta) + 1);
  }
  var delta_adv = adv_us - adv_them;
  var force_multiplier = delta_adv > 0 ? logarithmic_scaling(delta_adv) : delta_adv < 0 ? 1 / logarithmic_scaling(delta_adv) : 1;
  return us / them * force_multiplier;
}
/*
Impure functions below including:
state closure "e" with: protagonist total, "us"; antagonist total, "them";
advantage us, "adv_us"; advantage them, "adv_them";
array of polyhedral dice sides, "dice_available".
*/
var e = function () {
  var max_player_nbrs = 6;
  var player_nbrs = 3;
  var us = 10;
  var them = 10;
  var adv_us = 0;
  var adv_them = 0;
  var dice_available = [6, 8, 12, 20, 100]; // [4, 6, 8, 12, 20, 100]
  var enc = {};
  enc.reset = { n: player_nbrs, u: us, t: them, ua: adv_us, ta: adv_them };
  enc.change_n = function (x) {
    return player_nbrs = Number.isInteger(x) && x > 0 && x <= max_player_nbrs ? x : player_nbrs;
  };
  enc.change_us = function (x) {
    return us = pos_finite_predicate(x) ? x : us;
  };
  enc.change_them = function (x) {
    return them = pos_finite_predicate(x) ? x : them;
  };
  enc.change_us_adv = function (x) {
    return adv_us = Number.isFinite(x) ? x : adv_us;
  };
  enc.change_them_adv = function (x) {
    return adv_them = Number.isFinite(x) ? x : adv_them;
  };
  enc.get_n = function () {
    return player_nbrs;
  };
  enc.get_us = function () {
    return us;
  };
  enc.get_them = function () {
    return them;
  };
  enc.get_us_adv = function () {
    return adv_us;
  };
  enc.get_them_adv = function () {
    return adv_them;
  };
  // fn returning lists of [instruction, force_ratio] in nested array for each n
  // accessed as e.arr1, e.arr2, etc.
  enc.force_ratio_recur = function chances() {
    var x = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : max_player_nbrs;

    if (x < 1) {
      return;
    }
    var result = s_t_longlist(dice_available).map(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2),
          y = _ref2[0],
          z = _ref2[1];

      return [x + 'd' + y + ' target ' + z, force_ratio(x, y, z)];
    });
    enc['arr' + x] = result.filter(function (_ref3) {
      var _ref4 = _slicedToArray(_ref3, 2),
          k = _ref4[1];

      return realistic_fr_predicate(k);
    });
    return chances(x - 1);
  };
  return enc;
}();
function instructions(n, us_vs_them) {
  var fr_array = e['arr' + n].map(function (_ref5) {
    var _ref6 = _slicedToArray(_ref5, 2),
        y = _ref6[1];

    return y;
  });
  // find theoretical dice force_ratio (fr) nearest to actual us_vs_them value
  var difference_array = fr_array.map(function (x) {
    return Math.abs(x - us_vs_them);
  });
  var least_different = difference_array.reduce(function (x, y) {
    return Math.min(x, y);
  });
  var index_of_least_different = difference_array.indexOf(least_different);
  return e['arr' + n][index_of_least_different][0];
}
function instruct() {
  var us_vs_them = calculate_us_vs_them(e.get_us(), e.get_them(), e.get_us_adv(), e.get_them_adv());
  var ndst = instructions(e.get_n(), us_vs_them);
  document.querySelector('#dice_roll_instructions').textContent = 'Roll ' + ndst + '.';
  document.querySelector('#we_they_summary').innerHTML = '<span class="us_adv_row">' + e.get_us() + '\n    <small>(adv ' + e.get_us_adv() + ')</small></span>\n    <span class="them_adv_row">' + e.get_them() + '\n    <small>(adv ' + e.get_them_adv() + ')</small></span>';
}
function prepare_player_numbers_section() {
  document.querySelector('#pbttn' + e.get_n()).classList.remove('availBttn');
  document.querySelector('#pbttn' + e.get_n()).classList.add('pickedBttn');
  document.querySelectorAll('#pNbrs > input[type=button]').forEach(function (i) {
    i.addEventListener('click', function () {
      e.change_n(parseInt(i.value));
      instruct();
      document.querySelector(".pickedBttn").classList.add("availBttn");
      document.querySelector(".pickedBttn").classList.remove("pickedBttn");
      i.classList.remove('availBttn');
      i.classList.add('pickedBttn');
    });
  });
}
function us_input() {
  var el = document.querySelector('#us_input');
  e.change_us(Number.parseFloat(el.value));
  el.addEventListener('input', function () {
    e.change_us(Number.parseFloat(el.value));
    instruct();
  });
}
function them_input() {
  var el = document.querySelector('#them_input');
  e.change_them(Number.parseFloat(el.value));
  el.addEventListener('input', function () {
    e.change_them(Number.parseFloat(el.value));
    instruct();
  });
}
function us_adv_input() {
  var el = document.querySelector('#us_adv_input');
  e.change_us_adv(Number.parseFloat(el.value));
  el.addEventListener('input', function () {
    e.change_us_adv(Number.parseFloat(el.value));
    instruct();
  });
}
function them_adv_input() {
  var el = document.querySelector('#them_adv_input');
  e.change_them_adv(Number.parseFloat(el.value));
  el.addEventListener('input', function () {
    e.change_them_adv(Number.parseFloat(el.value));
    instruct();
  });
}
function us_keypad_button_fn(x) {
  var el = document.querySelector('#us_input');
  var result_string = el.value + x;
  e.change_us(Number.parseFloat(result_string));
  el.value = result_string;
  instruct();
}
function them_keypad_button_fn(x) {
  var el = document.querySelector('#them_input');
  var result_string = el.value + x;
  e.change_them(Number.parseFloat(result_string));
  el.value = result_string;
  instruct();
}
function prepare_keypads() {
  document.querySelectorAll('.us_nbr_keypad').forEach(function (i) {
    i.addEventListener('click', function () {
      us_keypad_button_fn(i.value);
    });
  });
  document.querySelectorAll('.them_nbr_keypad').forEach(function (i) {
    i.addEventListener('click', function () {
      them_keypad_button_fn(i.value);
    });
  });
}
function prepare_adv_buttons() {
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
function us_clear_button() {
  var el = document.querySelector('#us_input');
  var result_string = el.value.slice(0, -1);
  e.change_us(Number.parseFloat(result_string));
  el.value = result_string;
  instruct();
}
function them_clear_button() {
  var el = document.querySelector('#them_input');
  var result_string = el.value.slice(0, -1);
  e.change_them(Number.parseFloat(result_string));
  el.value = result_string;
  instruct();
}
function reset_button() {
  e.change_n(e.reset.n);
  e.change_us(e.reset.u);
  e.change_them(e.reset.t);
  e.change_us_adv(e.reset.ua);
  e.change_them_adv(e.reset.ta);
  document.querySelector('.pickedBttn').classList.add('availBttn');
  document.querySelector('.pickedBttn').classList.remove('pickedBttn');
  prepare_player_numbers_section();
  document.querySelector('#us_input').value = e.reset.u;
  document.querySelector('#them_input').value = e.reset.t;
  document.querySelector('#us_adv_input').value = e.reset.ua;
  document.querySelector('#them_adv_input').value = e.reset.ta;
  instruct();
}
function main() {
  e.force_ratio_recur();
  prepare_player_numbers_section();
  us_input();
  them_input();
  us_adv_input();
  them_adv_input();
  prepare_keypads();
  prepare_adv_buttons();
  document.querySelector('#us_clear_button').addEventListener('click', us_clear_button);
  document.querySelector('#them_clear_button').addEventListener('click', them_clear_button);
  document.querySelector('#reset_button').addEventListener('click', reset_button);
  reset_button();
}
main();