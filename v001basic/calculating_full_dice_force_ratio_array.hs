{- Martin.MPhil@gmail.com
Theoretical force_ratio is analogous to an Us-vs-Them ratio created by specific user scenarios.
Assuming: (i) the whole party succeeds if any player meets or beats a target number, and
(ii) every participating player rolls one dice each and these rolled dice all have equal number of sides,
derive force_ratio values for all possible dice combinations.

Given force-ratio "f" is a function of dice probabilities "p" in three domains
"low" (ie pl and fl), "medium" (ie pm and fm), and "high" (ie ph and fh),
"fl" is a function of "pl" in the domain {0≤"pl"≤0.5} and
"fm" is a function of "pm" in the domain {0.5≤"pm"≤0.75} and
"fh" is a function of "ph" in the domain {0.75≤"ph"≤1}
where ("fl" < 1), and (1 ≤ "fm" ≤ 2), and ("fh" > 2),
the following relationships apply:
fl = 2*pl
fm = (4*pm)-1
fh = 1/(2-2*ph)

Game probabilities follow
p(success) = 1 - p(all_miss)
with populations of "n" participating players {n∈ℤ|1≤n≤9}.

When rolling low succeeds,
chances of a miss by rolling over target number t
on a dice with s sides is (s-t)/s
thus p(miss) = ((s-t)/s)
and with "n" players all rolling the same type of polyhedral dice,
p(all_miss) = (((s-t)/s)**n)
therefore p(success) = 1 - (((s-t)/s)**n)

When rolling high succeeds,
chances of a miss by rolling under target number t
on a dice with s sides is (t-1)/s
thus p(miss) = ((t-1)/s)
and with "n" players all rolling the same type of polyhedral dice,
p(all_miss) = (((t-1)/s)**n)
therefore p(success) = 1 - (((t-1)/s)**n)

In order to mitigate decimal rounding errors (potentially ^9),
force-ratios are multiplied by *1e6.

"vs" returns a force-ratio for "n" players
rolling dice with "s" sides
attempting to meet or beat a target "t".

"e" presents thirty one possible polyhedral dice combinations.

"r" multiplexes for one to nine players
and applies function "vs"

"d" presents data for output
in the order of one through to nine players.
-}

vs :: [Double] -> Double
vs x | p <= 0.5 = (2*p)*1e6
     | p > 0.75 = (1/(2-2*p))*1e6
     | otherwise = ((4*p)-1)*1e6
       where n = head x
             s = head (tail x)
             t = last x
             p = (1 - (((t-1)/s)**n))
e :: [[Double]]
e = [[6,2],[6,3],[6,4],[6,5],[6,6],
     [8,2],[8,3],[8,4],[8,6],[8,7],[8,8],[12,2],[12,6],[12,8],[12,12],
     [20,2],[20,3],[20,4],[20,5],[20,7],[20,8],[20,9],[20,10],
     [20,12],[20,13],[20,14],[20,15],[20,17],[20,18],[20,19],[20,20]]
r :: Double -> [Double]
r x = map (vs) (map (x:) e)
a :: Double -> t -> [[Double]]
a m z | m <= 0  = []
      | otherwise = r m : a (m-1) z
d :: [[Double]]
d = reverse (a 9 r)
main :: IO ()
main = putStr "full_dice_force_ratio_arr = " >> print d
