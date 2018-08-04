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
  return x.map((y) => diceSidesTargetPairs(y)).reduce((a, b) => [...a, ...b])
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
state closure "enc" with: protagonist total, "us"; antagonist total, "them";
advantage us, "advUs"; advantage them, "advThem";
array of polyhedral dice sides, "diceAvailable".
*/
const enc = (function () {
  let maxPlayerNbrs = 6
  let playerNbrs = 3
  let us = 10
  let them = 10
  let advUs = 0
  let advThem = 0
  let diceAvailable = [6, 8, 12, 20, 100] // [4, 6, 8, 12, 20, 100]
  let enclosure = {}
  enclosure.reset = {n: playerNbrs, u: us, t: them, ua: advUs, ta: advThem}
  enclosure.changeN = (x) => {
    playerNbrs =
      (Number.isInteger(x) && x > 0 && x <= maxPlayerNbrs) ? x : playerNbrs
  }
  enclosure.changeUs = (x) => {
    us = posFinitePredicate(x) ? x : us
  }
  enclosure.changeThem = (x) => {
    them = posFinitePredicate(x) ? x : them
  }
  enclosure.changeUsAdv = (x) => {
    advUs = Number.isFinite(x) ? x : advUs
  }
  enclosure.changeThemAdv = (x) => {
    advThem = Number.isFinite(x) ? x : advThem
  }
  enclosure.getN = () => playerNbrs
  enclosure.getUs = () => us
  enclosure.getThem = () => them
  enclosure.getUsAdv = () => advUs
  enclosure.getThemAdv = () => advThem
  // fn returning lists of [instruction, forceRatio] in nested array for each n
  // accessed as enc.arr1, enc.arr2, etc.
  enclosure.forceRatioRecur = function chances (x = maxPlayerNbrs) {
    if (x < 1) { return }
    let result = sidesTargetLonglist(diceAvailable)
      .map(([y, z]) => [`${x}d${y} target ${z}`, forceRatio(x, y, z)])
    enclosure['arr' + x] = result.filter(([, k]) => posFinitePredicate(k))
    return chances(x - 1)
  }
  return enclosure
}())
function instructions (n, usVsThem) {
  let forceRatioArray = enc['arr' + n].map(([, y]) => y)
  // find theoretical dice forceRatio (fr) nearest to actual usVsThem value
  let differenclosureeArray = forceRatioArray.map((x) => Math.abs(x - usVsThem))
  let leastDifferent = differenclosureeArray.reduce((x, y) => Math.min(x, y))
  let indexOfLeastDifferent = differenclosureeArray.indexOf(leastDifferent)
  return enc['arr' + n][indexOfLeastDifferent][0]
}
function instruct () {
  let usVsThem = calculateUsVsThem(
    enc.getUs(), enc.getThem(), enc.getUsAdv(), enc.getThemAdv()
  )
  let ndst = instructions(enc.getN(), usVsThem)
  document.querySelector('#dice_roll_instructions').textContent =
    `Roll ${ndst}.`
  document.querySelector('#we_they_summary').innerHTML =
    `<span class="us_adv_row">${enc.getUs()}
    <small>(adv ${enc.getUsAdv()})</small></span>
    <span class="them_adv_row">${enc.getThem()}
    <small>(adv ${enc.getThemAdv()})</small></span>`
}
function preparePlayerNumbersSection () {
  document.querySelector('#pbttn' + enc.getN()).classList.remove('availBttn')
  document.querySelector('#pbttn' + enc.getN()).classList.add('pickedBttn')
  document.querySelectorAll('#pNbrs > input[type=button]').forEach(i => {
    i.addEventListener('click', () => {
      enc.changeN(parseInt(i.value))
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
  enc.changeUs(Number.parseFloat(el.value))
  el.addEventListener('input', () => {
    enc.changeUs(Number.parseFloat(el.value))
    instruct()
  })
}
function themInput () {
  let el = document.querySelector('#them_input')
  enc.changeThem(Number.parseFloat(el.value))
  el.addEventListener('input', () => {
    enc.changeThem(Number.parseFloat(el.value))
    instruct()
  })
}
function usAdvInput () {
  let el = document.querySelector('#us_adv_input')
  enc.changeUsAdv(Number.parseFloat(el.value))
  el.addEventListener('input', () => {
    enc.changeUsAdv(Number.parseFloat(el.value))
    instruct()
  })
}
function themAdvInput () {
  let el = document.querySelector('#them_adv_input')
  enc.changeThemAdv(Number.parseFloat(el.value))
  el.addEventListener('input', () => {
    enc.changeThemAdv(Number.parseFloat(el.value))
    instruct()
  })
}
function usKeypadButtonFn (x) {
  let el = document.querySelector('#us_input')
  let resultString = el.value + x
  enc.changeUs(Number.parseFloat(resultString))
  el.value = resultString
  instruct()
}
function themKeypadButtonFn (x) {
  let el = document.querySelector('#them_input')
  let resultString = el.value + x
  enc.changeThem(Number.parseFloat(resultString))
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
      let result = enc.getUsAdv() - 1
      enc.changeUsAdv(result)
      document.querySelector('#us_adv_input').value = result
      instruct()
    }
    )
  document.querySelector('#us_adv_plus_button')
    .addEventListener('click', () => {
      let result = enc.getUsAdv() + 1
      enc.changeUsAdv(result)
      document.querySelector('#us_adv_input').value = result
      instruct()
    }
    )
  document.querySelector('#them_adv_minus_button')
    .addEventListener('click', () => {
      let result = enc.getThemAdv() - 1
      enc.changeThemAdv(result)
      document.querySelector('#them_adv_input').value = result
      instruct()
    }
    )
  document.querySelector('#them_adv_plus_button')
    .addEventListener('click', () => {
      let result = enc.getThemAdv() + 1
      enc.changeThemAdv(result)
      document.querySelector('#them_adv_input').value = result
      instruct()
    }
    )
}
function usClearButton () {
  let el = document.querySelector('#us_input')
  let resultString = el.value.slice(0, -1)
  enc.changeUs(Number.parseFloat(resultString))
  el.value = resultString
  instruct()
}
function themClearButton () {
  let el = document.querySelector('#them_input')
  let resultString = el.value.slice(0, -1)
  enc.changeThem(Number.parseFloat(resultString))
  el.value = resultString
  instruct()
}
function resetButton () {
  enc.changeN(enc.reset.n)
  enc.changeUs(enc.reset.u)
  enc.changeThem(enc.reset.t)
  enc.changeUsAdv(enc.reset.ua)
  enc.changeThemAdv(enc.reset.ta)
  document.querySelector('.pickedBttn').classList.add('availBttn')
  document.querySelector('.pickedBttn').classList.remove('pickedBttn')
  preparePlayerNumbersSection()
  document.querySelector('#us_input').value = enc.reset.u
  document.querySelector('#them_input').value = enc.reset.t
  document.querySelector('#us_adv_input').value = enc.reset.ua
  document.querySelector('#them_adv_input').value = enc.reset.ta
  instruct()
}
function main () {
  enc.forceRatioRecur()
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
