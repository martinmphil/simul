'use strict';
// Pure functions with "n" players, "s" sided dice and target roll "t".
function force_ratio(n, s, t) {
  let p = ( 1 - Math.pow( (( t - 1) / s), n) );
  let result
    = (p < 0.5) ? (2 * p)
    : (p > 0.75) ? (1 / (2 - 2 * p))
    : ((4 * p) - 1);
  return result;
}
function range_t(s) {
  let result = [];
  (function range_recur(x) {
    if (x <= 1) {return result;}
    result[x - 2] = x;
    return range_recur(x - 1);
  })(s);
  return result.reverse();
}
function dice_s_t_pairs(x) {
  return range_t(x).map( (y) => [x, y] );
}
function s_t_longlist(x) {
  return x.map( (y) => dice_s_t_pairs(y) ).reduce((a, b) => a.concat(b));
}
function pos_finite_predicate(x) {
  if (x > 0 && Number.isFinite(x)) {
    return true;
  }
}
function calculate_us_vs_them(us, them, adv_us, adv_them) {
  function logarithmic_scaling(delta) {
    return 2 * Math.log(Math.abs(delta) + 1);
  }
  let delta_adv = adv_us - adv_them;
  let force_multiplier =
  (delta_adv > 0) ? logarithmic_scaling(delta_adv) :
    (delta_adv < 0) ? ( 1 / logarithmic_scaling(delta_adv) ) : 1;
  return (us / them) * force_multiplier;
}
/*
Impure functions below including:
state closure "e" with: protagonist total, "us"; antagonist total, "them";
advantage us, "adv_us"; advantage them, "adv_them";
array of polyhedral dice sides, "dice_available".
*/
const e = (function () {
  let max_player_nbrs = 6;
  let player_nbrs = 3;
  let us = 10;
  let them = 10;
  let adv_us = 0;
  let adv_them = 0;
  let dice_available = [6, 8, 12, 20, 100]; // [4, 6, 8, 12, 20, 100]
  let enc = {};
  enc.reset = {n:player_nbrs, u:us, t:them, ua:adv_us, ta:adv_them};
  enc.change_n = (x) => player_nbrs =
    (Number.isInteger(x) && x > 0 && x <= max_player_nbrs) ? x : player_nbrs;
  enc.change_us = (x) => us = pos_finite_predicate(x) ? x : us;
  enc.change_them = (x) => them = pos_finite_predicate(x) ? x : them;
  enc.change_us_adv = (x) => adv_us = Number.isFinite(x) ? x : adv_us;
  enc.change_them_adv = (x) => adv_them = Number.isFinite(x) ? x : adv_them;
  enc.get_n = () => player_nbrs;
  enc.get_us = () => us;
  enc.get_them = () => them;
  enc.get_us_adv = () => adv_us;
  enc.get_them_adv = () => adv_them;
  // fn returning lists of [instruction, force_ratio] in nested array for each n
  // accessed as e.arr1, e.arr2, etc.
  enc.force_ratio_recur = function chances(x = max_player_nbrs) {
    if (x < 1) {return;}
    let result = s_t_longlist(dice_available)
      .map ( ([y, z]) => [`${x}d${y} target ${z}`, force_ratio(x, y, z)] );
    enc['arr' + x] = result.filter( ([, k]) => pos_finite_predicate(k) );
    return chances(x - 1);
  };
  return enc;
}());
function instructions(n, us_vs_them) {
  let fr_array = e['arr' + n].map( ([,y]) => y );
  // find theoretical dice force_ratio (fr) nearest to actual us_vs_them value
  let difference_array = fr_array.map( (x) => Math.abs(x - us_vs_them) );
  let least_different = difference_array.reduce( (x, y) => Math.min(x, y) );
  let index_of_least_different = difference_array.indexOf(least_different);
  return e['arr' + n][index_of_least_different][0];
}
function instruct() {
  let us_vs_them = calculate_us_vs_them(
    e.get_us(), e.get_them(), e.get_us_adv(), e.get_them_adv()
  );
  let ndst = instructions(e.get_n(), us_vs_them);
  document.querySelector('#dice_roll_instructions').textContent =
    `Roll ${ndst}.`;
  document.querySelector('#we_they_summary').innerHTML =
    `<span class="us_adv_row">${e.get_us()}
    <small>(adv ${e.get_us_adv()})</small></span>
    <span class="them_adv_row">${e.get_them()}
    <small>(adv ${e.get_them_adv()})</small></span>`;
}
function prepare_player_numbers_section() {
  document.querySelector('#pbttn' + e.get_n()).classList.remove('availBttn');
  document.querySelector('#pbttn' + e.get_n()).classList.add('pickedBttn');
  document.querySelectorAll('#pNbrs > input[type=button]').forEach( i => {
    i.addEventListener('click', () => {
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
  let el = document.querySelector('#us_input');
  e.change_us(Number.parseFloat(el.value));
  el.addEventListener('input', () => {
    e.change_us(Number.parseFloat(el.value));
    instruct();
  });
}
function them_input() {
  let el = document.querySelector('#them_input');
  e.change_them(Number.parseFloat(el.value));
  el.addEventListener('input', () => {
    e.change_them(Number.parseFloat(el.value));
    instruct();
  });
}
function us_adv_input() {
  let el = document.querySelector('#us_adv_input');
  e.change_us_adv(Number.parseFloat(el.value));
  el.addEventListener('input', () => {
    e.change_us_adv(Number.parseFloat(el.value));
    instruct();
  });
}
function them_adv_input() {
  let el = document.querySelector('#them_adv_input');
  e.change_them_adv(Number.parseFloat(el.value));
  el.addEventListener('input', () => {
    e.change_them_adv(Number.parseFloat(el.value));
    instruct();
  });
}
function us_keypad_button_fn(x) {
  let el = document.querySelector('#us_input');
  let result_string = el.value + x;
  e.change_us(Number.parseFloat(result_string));
  el.value = result_string;
  instruct();
}
function them_keypad_button_fn(x) {
  let el = document.querySelector('#them_input');
  let result_string = el.value + x;
  e.change_them(Number.parseFloat(result_string));
  el.value = result_string;
  instruct();
}
function prepare_keypads() {
  document.querySelectorAll('.us_nbr_keypad').forEach( i => {
    i.addEventListener('click', () => {
        us_keypad_button_fn(i.value);
      });
  });
  document.querySelectorAll('.them_nbr_keypad').forEach( i => {
    i.addEventListener('click', () => {
        them_keypad_button_fn(i.value);
      });
  });
}
function prepare_adv_buttons() {
  document.querySelector('#us_adv_minus_button')
    .addEventListener('click', () =>
      {let result = e.get_us_adv() - 1;
      e.change_us_adv(result);
      document.querySelector('#us_adv_input').value = result;
      instruct();
      }
    );
  document.querySelector('#us_adv_plus_button')
    .addEventListener('click', () =>
      {let result = e.get_us_adv() + 1;
      e.change_us_adv(result);
      document.querySelector('#us_adv_input').value = result;
      instruct();
      }
    );
  document.querySelector('#them_adv_minus_button')
    .addEventListener('click', () =>
      {let result = e.get_them_adv() - 1;
      e.change_them_adv(result);
      document.querySelector('#them_adv_input').value = result;
      instruct();
      }
    );
  document.querySelector('#them_adv_plus_button')
    .addEventListener('click', () =>
      {let result = e.get_them_adv() + 1;
      e.change_them_adv(result);
      document.querySelector('#them_adv_input').value = result;
      instruct();
      }
    );
}
function us_clear_button() {
  let el = document.querySelector('#us_input');
  let result_string =  el.value.slice(0, -1);
  e.change_us(Number.parseFloat(result_string));
  el.value = result_string;
  instruct();
}
function them_clear_button() {
  let el = document.querySelector('#them_input');
  let result_string =  el.value.slice(0, -1);
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
  document.querySelector('#us_clear_button')
    .addEventListener( 'click', us_clear_button );
  document.querySelector('#them_clear_button')
    .addEventListener( 'click', them_clear_button );
  document.querySelector('#reset_button')
    .addEventListener( 'click', reset_button );
  reset_button();
}
main();
