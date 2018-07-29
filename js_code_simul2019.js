'use strict'
// Pure functions with "n" players, "s" sided dice and target roll "t".
function forceRatio (n, s, t) {
  let p = (1 - Math.pow(((t - 1) / s), n))
  let result = (p < 0.5) ? (2 * p)
    : (p > 0.75) ? (1 / (2 - 2 * p))
      : ((4 * p) - 1)
  return result
}
function rangeT (s) {
  let result = [];
  (function rangeRecur (x) {
    if (x <= 1) { return result }
    result[x - 2] = x
    return rangeRecur(x - 1)
  })(s)
  return result.reverse()
}
function diceSidesTargetPairs (x) {
  return rangeT(x).map((y) => [x, y])
}
function sidesTargetLonglist (x) {
  return x.map((y) => diceSidesTargetPairs(y)).reduce((a, b) => a.concat(b))
}
function posFinitePredicate (x) {
  if (x > 0 && Number.isFinite(x)) {
    return true
  }
}
function calculateUsVsThem (us, them, advUs, advThem) {
  function logarithmicScaling (delta) {
    return 2 * Math.log(Math.abs(delta) + 1)
  }
  let deltaAdv = advUs - advThem
  let forceMultiplier =
  (deltaAdv > 0) ? logarithmicScaling(deltaAdv)
    : (deltaAdv < 0) ? (1 / logarithmicScaling(deltaAdv)) : 1
  return (us / them) * forceMultiplier
}
/*
Impure functions below including:
state closure "e" with: protagonist total, "us"; antagonist total, "them";
advantage us, "advUs"; advantage them, "advThem";
array of polyhedral dice sides, "diceAvailable".
*/
const e = (function () {
  let maxPlayerNbrs = 6
  let playerNbrs = 3
  let us = 10
  let them = 10
  let advUs = 0
  let advThem = 0
  let diceAvailable = [6, 8, 12, 20, 100] // [4, 6, 8, 12, 20, 100]
  let enc = {}
  enc.reset = {n: playerNbrs, u: us, t: them, ua: advUs, ta: advThem}
  enc.change_n = (x) => {
    playerNbrs =
      (Number.isInteger(x) && x > 0 && x <= maxPlayerNbrs) ? x : playerNbrs
  }
  enc.change_us = (x) => {
    us = posFinitePredicate(x) ? x : us
  }
  enc.change_them = (x) => {
    them = posFinitePredicate(x) ? x : them
  }
  enc.change_us_adv = (x) => {
    advUs = Number.isFinite(x) ? x : advUs
  }
  enc.change_them_adv = (x) => {
    advThem = Number.isFinite(x) ? x : advThem
  }
  enc.get_n = () => playerNbrs
  enc.get_us = () => us
  enc.get_them = () => them
  enc.get_us_adv = () => advUs
  enc.get_them_adv = () => advThem
  // fn returning lists of [instruction, forceRatio] in nested array for each n
  // accessed as e.arr1, e.arr2, etc.
  enc.force_ratio_recur = function chances (x = maxPlayerNbrs) {
    if (x < 1) { return }
    let result = sidesTargetLonglist(diceAvailable)
      .map(([y, z]) => [`${x}d${y} target ${z}`, forceRatio(x, y, z)])
    enc['arr' + x] = result.filter(([, k]) => posFinitePredicate(k))
    return chances(x - 1)
  }
  return enc
}())
function instructions (n, usVsThem) {
  let forceRatioArray = e['arr' + n].map(([, y]) => y)
  // find theoretical dice forceRatio (fr) nearest to actual usVsThem value
  let differenceArray = forceRatioArray.map((x) => Math.abs(x - usVsThem))
  let leastDifferent = differenceArray.reduce((x, y) => Math.min(x, y))
  let indexOfLeastDifferent = differenceArray.indexOf(leastDifferent)
  return e['arr' + n][indexOfLeastDifferent][0]
}
function instruct () {
  let usVsThem = calculateUsVsThem(
    e.get_us(), e.get_them(), e.get_us_adv(), e.get_them_adv()
  )
  let ndst = instructions(e.get_n(), usVsThem)
  document.querySelector('#dice_roll_instructions').textContent =
    `Roll ${ndst}.`
  document.querySelector('#we_they_summary').innerHTML =
    `<span class="us_adv_row">${e.get_us()}
    <small>(adv ${e.get_us_adv()})</small></span>
    <span class="them_adv_row">${e.get_them()}
    <small>(adv ${e.get_them_adv()})</small></span>`
}
function preparePlayerNumbersSection () {
  document.querySelector('#pbttn' + e.get_n()).classList.remove('availBttn')
  document.querySelector('#pbttn' + e.get_n()).classList.add('pickedBttn')
  document.querySelectorAll('#pNbrs > input[type=button]').forEach(i => {
    i.addEventListener('click', () => {
      e.change_n(parseInt(i.value))
      instruct()
      document.querySelector('.pickedBttn').classList.add('availBttn')
      document.querySelector('.pickedBttn').classList.remove('pickedBttn')
      i.classList.remove('availBttn')
      i.classList.add('pickedBttn')
    })
  })
}
function usInput () {
  let el = document.querySelector('#us_input')
  e.change_us(Number.parseFloat(el.value))
  el.addEventListener('input', () => {
    e.change_us(Number.parseFloat(el.value))
    instruct()
  })
}
function themInput () {
  let el = document.querySelector('#them_input')
  e.change_them(Number.parseFloat(el.value))
  el.addEventListener('input', () => {
    e.change_them(Number.parseFloat(el.value))
    instruct()
  })
}
function usAdvInput () {
  let el = document.querySelector('#us_adv_input')
  e.change_us_adv(Number.parseFloat(el.value))
  el.addEventListener('input', () => {
    e.change_us_adv(Number.parseFloat(el.value))
    instruct()
  })
}
function themAdvInput () {
  let el = document.querySelector('#them_adv_input')
  e.change_them_adv(Number.parseFloat(el.value))
  el.addEventListener('input', () => {
    e.change_them_adv(Number.parseFloat(el.value))
    instruct()
  })
}
function usKeypadButtonFn (x) {
  let el = document.querySelector('#us_input')
  let resultString = el.value + x
  e.change_us(Number.parseFloat(resultString))
  el.value = resultString
  instruct()
}
function themKeypadButtonFn (x) {
  let el = document.querySelector('#them_input')
  let resultString = el.value + x
  e.change_them(Number.parseFloat(resultString))
  el.value = resultString
  instruct()
}
function prepareKeypads () {
  document.querySelectorAll('.us_nbr_keypad').forEach(i => {
    i.addEventListener('click', () => {
      usKeypadButtonFn(i.value)
    })
  })
  document.querySelectorAll('.them_nbr_keypad').forEach(i => {
    i.addEventListener('click', () => {
      themKeypadButtonFn(i.value)
    })
  })
}
function prepareAdvButtons () {
  document.querySelector('#us_adv_minus_button')
    .addEventListener('click', () => {
      let result = e.get_us_adv() - 1
      e.change_us_adv(result)
      document.querySelector('#us_adv_input').value = result
      instruct()
    }
    )
  document.querySelector('#us_adv_plus_button')
    .addEventListener('click', () => {
      let result = e.get_us_adv() + 1
      e.change_us_adv(result)
      document.querySelector('#us_adv_input').value = result
      instruct()
    }
    )
  document.querySelector('#them_adv_minus_button')
    .addEventListener('click', () => {
      let result = e.get_them_adv() - 1
      e.change_them_adv(result)
      document.querySelector('#them_adv_input').value = result
      instruct()
    }
    )
  document.querySelector('#them_adv_plus_button')
    .addEventListener('click', () => {
      let result = e.get_them_adv() + 1
      e.change_them_adv(result)
      document.querySelector('#them_adv_input').value = result
      instruct()
    }
    )
}
function usClearButton () {
  let el = document.querySelector('#us_input')
  let resultString = el.value.slice(0, -1)
  e.change_us(Number.parseFloat(resultString))
  el.value = resultString
  instruct()
}
function themClearButton () {
  let el = document.querySelector('#them_input')
  let resultString = el.value.slice(0, -1)
  e.change_them(Number.parseFloat(resultString))
  el.value = resultString
  instruct()
}
function resetButton () {
  e.change_n(e.reset.n)
  e.change_us(e.reset.u)
  e.change_them(e.reset.t)
  e.change_us_adv(e.reset.ua)
  e.change_them_adv(e.reset.ta)
  document.querySelector('.pickedBttn').classList.add('availBttn')
  document.querySelector('.pickedBttn').classList.remove('pickedBttn')
  preparePlayerNumbersSection()
  document.querySelector('#us_input').value = e.reset.u
  document.querySelector('#them_input').value = e.reset.t
  document.querySelector('#us_adv_input').value = e.reset.ua
  document.querySelector('#them_adv_input').value = e.reset.ta
  instruct()
}
function main () {
  e.force_ratio_recur()
  preparePlayerNumbersSection()
  usInput()
  themInput()
  usAdvInput()
  themAdvInput()
  prepareKeypads()
  prepareAdvButtons()
  document.querySelector('#us_clear_button')
    .addEventListener('click', usClearButton)
  document.querySelector('#them_clear_button')
    .addEventListener('click', themClearButton)
  document.querySelector('#reset_button')
    .addEventListener('click', resetButton)
  resetButton()
}
main()
