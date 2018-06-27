"use strict";
/* 1000000=1e6 coefficient assisting floating point accuracy
 * NB For n players, 31 force-ratios MUST exactly match array order
 * of 31 dice instuctions.
*/

// closure holding long-lived variable for player numbers
var players_enclosure = (function () {
    "use strict";
    var player_numbers = 3;
        //NB coordinate with html style class on bttn3
    return {
        change_player_numbers: function (x) {
            player_numbers = x;
        },
        get_player_numbers: function () {
            return player_numbers;
        }
    };
}());

// measure difference (delta) in advantages from user input
function actual_delta_adv(advUs, advThem) {
    "use strict";
    return (!isNaN(advUs) && !isNaN(advThem))
        ? advUs - advThem
        : 0;
}
// general force-multiplier for each advantage
function adv_force_multiplier(delta_adv) {
    "use strict";
    return 2 * Math.log(Math.abs(delta_adv) + 1);
}
// advantages applying specific force multiplier
function force_ratio_coefficient_from_adv(delta_adv) {
    "use strict";
    return delta_adv > 0
        ? adv_force_multiplier(delta_adv)
        : delta_adv < 0
            ? 1 / adv_force_multiplier(delta_adv)
            : 1;
}
// user input arguments to calculate force-ratio actual
function force_ratio_actual(userUs, userThem, advUsInput, advThemInput) {
    "use strict";
    var us = 10;
    var them = 10;
    us = userUs > 0
        ? userUs
        : 10;
    them = userThem > 0
        ? userThem
        : 10;
    // calculate actual force ratio with coefficients 1e6 and coefficient_from_adv
    return 1e6 * (us / them) * (
        force_ratio_coefficient_from_adv(
            actual_delta_adv(advUsInput, advThemInput)
        )
    );
}
// calculate dice instructions
function calculate_instructions(nbr_of_players, usInput, themInput, advUsInput, advThemInput) {
    "use strict";
    var dice_target_arr = ["d6t2", "d6t3", "d6t4", "d6t5", "d6t6", "d8t2", "d8t3", "d8t4", "d8t6", "d8t7", "d8t8", "d12t2", "d12t6", "d12t8", "d12t12", "d20t2", "d20t3", "d20t4", "d20t5", "d20t7", "d20t8", "d20t9", "d20t10", "d20t12", "d20t13", "d20t14", "d20t15", "d20t17", "d20t18", "d20t19", "d20t20"];
    // array of arrays holding force ratios for all dice and all targets
    var full_dice_force_ratio_arr = [
        [3000000, 1666666.666667, 1000000, 666666.666667, 333333.333333, 4000000, 2000000, 1500000, 750000, 500000, 250000, 6000000, 1333333.333333, 833333.333333, 166666.666667, 10000000, 5000000, 3333333.333333, 2500000, 1800000, 1600000, 1400000, 1200000, 900000, 800000, 700000, 600000, 400000, 300000, 200000, 100000.0],
        [18000000, 4500000, 2000000, 1222222.222222, 611111.111111, 32000000, 8000000, 3555555.555556, 1437500, 875000, 468750, 72000000, 2880000, 1638888.888889, 319444.444444, 200000000, 50000000, 22222222.222222, 12500000, 5555555.555556, 4081632.653061, 3125000, 2469135.802469, 1790000, 1560000, 1310000, 1040000, 720000, 555000, 380000, 195000.0],
        [108000000, 13500000, 4000000, 1814814.814815, 842592.592593, 256000000, 32000000, 9481481.481481, 2048000, 1312500, 660156.25, 864000000, 6912000, 2518950.437318, 459490.740741, 4000000000, 500000000, 148148148.148148, 62500000, 18518518.518519, 11661807.580175, 7812500, 5486968.449931, 3005259.203606, 2314814.814815, 1901500, 1628000, 976000, 771750, 542000, 285250.0],
        [648000000, 40500000, 8000000, 2531250, 1070987.654321, 2048000000, 128000000, 25283950.617284, 3276800, 1734375, 827636.71875, 10368000000, 16588800, 4318200.749688, 587866.512346, 80000000000, 5000000000, 987654320.987654, 312500000, 61728395.061728, 33319450.229071, 19531250, 12193263.22207, 5464107.642921, 3858024.691358, 2801022.373166, 2082465.639317, 1361600, 955987.5, 687800, 370987.5],
        [3888000000, 121500000, 16000000, 3796875, 1392489.711934, 16384000000, 512000000, 67423868.312757, 5242880, 2106995.884774, 974182.128906, 124416000000, 39813120, 7402629.856607, 705544.302984, 1600000000000, 50000000000, 6584362139.917695, 1562500000, 205761316.872428, 95198429.225918, 48828125, 27096140.493488, 9934741.168946, 6430041.152263, 4309265.189486, 2974950.91331, 1689280, 1225178.75, 819020, 452438.125],
        [23328000000, 364500000, 32000000, 5695312.5, 1660408.093278, 131072000000, 2048000000, 179796982.167353, 8388608, 2809327.846365, 1204818.725586, 1492992000000, 95551488, 12690222.611327, 813415.611068, 32000000000000, 500000000000, 43895747599.4513, 7812500000, 685871056.241427, 271995512.074051, 122070312.5, 60213645.541085, 18063165.761721, 10716735.253772, 6629638.753056, 4249929.876157, 1951424, 1491401.9375, 937118, 529816.21875],
        [139968000000, 1093500000, 64000000, 8542968.75, 1883673.411065, 1048576000000, 8192000000, 479458619.11294, 13421772.8, 3745770.46182, 1429216.384888, 17915904000000, 229323571.2, 21754667.333703, 912297.643479, 640000000000000, 5000000000000, 292638317329.67535, 39062500000, 2286236854.138089, 777130034.497288, 305175781.25, 133808101.202412, 32842119.566765, 17861225.422954, 10199444.235471, 6071328.39451, 2384185.791016, 1717691.646875, 1086812.4, 603325.407813],
        [839808000000, 3280500000, 128000000, 12814453.125, 2149908.48, 8388608000000, 32768000000, 1278556317.634507, 21474836.48, 4994360.61576, 1625564.336777, 214990848000000, 550376570.88, 37293715.429206, 1005879.013045, 1.28e+16, 50000000000000, 1950922115531.169, 195312500000, 7620789513.793629, 2220371527.135108, 762939453.125, 297351336.00536, 59712944.666846, 29768709.038256, 15691452.669955, 8673326.277872, 2980232.23877, 1910037.899844, 1278131.16, 673159.137422],
        [5038848000000, 9841500000, 256000000, 19221679.6875, 2579890.176, 67108864000000, 131072000000, 3409483513.692019, 34359738.368, 6659147.48768, 1797368.79468, 2579890176000000, 1320903770.112, 63932083.592924, 1172055.761958, 2.56e+17, 500000000000000, 13006147436874.46, 976562500000, 25402631712.64543, 6343918648.957453, 1907348632.8125, 660780746.678578, 108568990.303356, 49614515.063761, 24140696.415316, 12390466.111245, 3725290.298462, 2158736.690141, 1450318.044, 739501.180551]
    ];
    var difference_array = [];
    var least_difference = 0;
    var index_of_nearest = 0;
    var cut = 1;
    // calculate array of differences between force_ratio_actual and dice force ratios
    difference_array = full_dice_force_ratio_arr[nbr_of_players - 1].map(function (s) {
        return Math.abs(s - force_ratio_actual(usInput, themInput, advUsInput, advThemInput));
    });
    // find least different value
    least_difference = difference_array.reduce(function (a, b) {
        return Math.min(a, b);
    });
    // find index of dice force-ratio least different to force_ratio_actual
    index_of_nearest = difference_array.indexOf(least_difference);
    // generate dice instructions for players
    cut = dice_target_arr[index_of_nearest].indexOf("t");
    return "Roll " + nbr_of_players + dice_target_arr[index_of_nearest].slice(0, cut) +
            " target " + dice_target_arr[index_of_nearest].slice(cut + 1);
}
// impure fuction updating html elements including clicking "calculate button"
function update_display() {
    "use strict";
    // display rounded off force-ratio note
    document.getElementById("fRnote").innerHTML = parseFloat(
        Math.round(force_ratio_actual(
            document.getElementById("usInput").value,
            document.getElementById("themInput").value,
            document.getElementById("advUsInput").value,
            document.getElementById("advThemInput").value
        ) / 1e4) / 100
    ).toFixed(2);
    // display dice roll instructions
    document.getElementById("dice_roll_instructions").innerHTML =
            calculate_instructions(
        players_enclosure.get_player_numbers(),
        document.getElementById("usInput").value,
        document.getElementById("themInput").value,
        document.getElementById("advUsInput").value,
        document.getElementById("advThemInput").value
    );
}
// adjust player numbers
function adjust_player_numbers(upcoming_party_size) {
    "use strict";
    var p = players_enclosure.get_player_numbers(); // old party size
    var q = upcoming_party_size;                    // new party size
    // clear style on player number buttons
    document.getElementById("bttn" + p).classList.remove("selectedBttn");
    document.getElementById("bttn" + p).classList.add("unselectedBttn");
    // update colusre with new party size
    players_enclosure.change_player_numbers(upcoming_party_size);
    // update style on player number buttons
    document.getElementById("bttn" + q).classList.remove("unselectedBttn");
    document.getElementById("bttn" + q).classList.add("selectedBttn");
    update_display();
}
// reset button
function initial_settings() {
    "use strict";
    document.getElementById("usInput").value = 10;
    document.getElementById("advUsInput").value = 0;
    document.getElementById("themInput").value = 10;
    document.getElementById("advThemInput").value = 0;
    adjust_player_numbers(3);
    update_display();
}
// populate buttons for player numbers with click event listeners
document.getElementById("bttn1").addEventListener("click", function () {
    "use strict";
    adjust_player_numbers(1);
});
document.getElementById("bttn2").addEventListener("click", function () {
    "use strict";
    adjust_player_numbers(2);
});
document.getElementById("bttn3").addEventListener("click", function () {
    "use strict";
    adjust_player_numbers(3);
});
document.getElementById("bttn4").addEventListener("click", function () {
    "use strict";
    adjust_player_numbers(4);
});
document.getElementById("bttn5").addEventListener("click", function () {
    "use strict";
    adjust_player_numbers(5);
});
document.getElementById("bttn6").addEventListener("click", function () {
    "use strict";
    adjust_player_numbers(6);
});
/*
document.getElementById("bttn7").addEventListener("click", function () {
    "use strict";
    adjust_player_numbers(7);
});
document.getElementById("bttn8").addEventListener("click", function () {
    "use strict";
    adjust_player_numbers(8);
});
document.getElementById("bttn9").addEventListener("click", function () {
    "use strict";
    adjust_player_numbers(9);
});
*/
// click event listener on calculate button
document.getElementById("calculateBttn").addEventListener("click", function () {
    "use strict";
    update_display();
});
// click event listener on reset button
document.getElementById("resetBttn").addEventListener("click", function () {
    "use strict";
    initial_settings();
});
// change event listener on user input number fields
document.getElementById("usInput").addEventListener("change", function () {
    "use strict";
    update_display();
});
document.getElementById("advUsInput").addEventListener("change", function () {
    "use strict";
    update_display();
});
document.getElementById("themInput").addEventListener("change", function () {
    "use strict";
    update_display();
});
document.getElementById("advThemInput").addEventListener("change", function () {
    "use strict";
    update_display();
});
// end of script
