// in html <script src="ramda.min.js"></script>
"use strict";
function s_t_longlist(x) {
  return R.uniqBy( ([s,t]) => (1 - ((t-1)/s)),
    x.map( y => dice_s_t_pairs(y) ).reduce((a, b) => a.concat(b)) );
}
// removing duplicate probabilities slightly reduces performance
