// $ deno run --allow-write create_simul_data.ts

// n = number of participants
// d = number of sides on polyhedral
// t = target number
// f = force-ratio

interface Encounter {
  n: number;
  d: number;
  t: number;
  f: number;
}

const nArr: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

const polyhedral: number[] = [6, 8, 12, 20, 100];

// create array of target numbers from two to d
const targetArr = (d: number) => {
  return Array.from({ length: d - 1 }, (_, i) => {
    return i + 2;
  });
};

// calculate force-ratio from probability
const forceRatio = (prob: number) => {
  let f: number;
  if (prob > 0.995) {
    // overwhelming 100:1 favourite
    f = 100;
  } else if (prob > 0.75) {
    f = 0.5 * (1 / (1 - prob));
  } else if (prob > 0.5) {
    f = 4 * prob - 1;
  } else {
    f = 2 * prob;
  }
  return parseFloat(f.toPrecision(4));
};

// create data element for one encounter
const encounter = (n: number, d: number, t: number): Encounter => {
  const prob = 1 - ((t - 1) / d) ** n;
  const f = forceRatio(parseFloat(prob.toPrecision(4)));
  return { n, d, t, f };
};

// generate all polyhedral combinations for a specific number of participants
const partyArr = (n: number, polyhedral: number[]): Encounter[] => {
  const everyCombo = polyhedral.flatMap((d) => {
    return targetArr(d).map((t) => {
      return encounter(n, d, t);
    });
  });
  // remove duplicate force-ratios "f"
  const results = everyCombo.filter((x, i, arr) => {
    return arr.map((y) => y.f).indexOf(x.f) === i;
  });
  return results;
};

// generate unique data for full range of participant numbers
const simulData: Encounter[] = nArr.flatMap((n) => {
  return partyArr(n, polyhedral);
});

const encoder = new TextEncoder();
await Deno.writeFile(
  "simul_data.json",
  encoder.encode(JSON.stringify(simulData))
);
