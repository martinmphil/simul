# Simul

TypeScript [tabletop role-playing game](https://en.wikipedia.org/wiki/Tabletop_role-playing_game) aid.

![Example image of Simul JavaScript web app](https://user-images.githubusercontent.com/37618836/38252243-8a4be4ce-374b-11e8-91f2-833ee5f91816.jpg)

## Compile TypeScript

Install TypeScript then, in the top directory, run the TypeScript compiler with the commands `tsc --removeComments simul6p.ts` and `tsc --removeComments simul9p.ts`. Deploy `simul6p.js` and `simul9p.js` with `index.html`, `simul9p.html` and `simul2020.css`.

## Generate Simul data

Install `deno` by following the instructions at [deno.land](https://deno.land/).

Then, in the `simul_data_deno` directory, run
`deno run --allow-write create_simul_data.ts`
to create the `simul_data.json` file.

## Summary

Using real [polyhedral dice](https://en.wikipedia.org/wiki/Dice#Polyhedral_dice), this app typically runs on a tablet-computer lying flat on a gaming-table for all players to see.

Basically:-

- count the people on our side (Us),
- count the opposition (Them),
- enter the number of active players,
- app says which dice to roll.

All players throw dice together after saying "Ready, steady, roll!"

Simulations cover any comparable measure (eg knights in an army, spaceships in opposing fleets, diplomats in rival trade missions, etc.) In this open-ended system "Us" and "Them" values can sum any number of units.

Key features:-

- TypeScript app for tabletop role-playing game
- Player-facing
- Co-operative
- Open-ended
- Simultaneous resolution of action

See web apps at [DanceWith.co.uk/rpg](http://www.dancewith.co.uk/rpg) for tabletop role-playing game adventures eg science-fiction :-

> The Commonwealth spanned a thousand light years. Yet losing the local jump-gate reinvented money. Now even comms cost cash. So the young pilot keeps his message short. "Hi Honey. I miss our life before the Navy. I wish I'd stayed freelance and never 'volunteered' for counter-espionage. Everyone's become so suspicious since The Attack. But reputation still opens doors and I found gangsters plotting to ransom our new gate so I'm trying to stop them. Happy hunting.
>
> Time passes faster for his girlfriend travelling near the speed of light. She'll jump straight home after reaching the next star – assuming nobody blows up the gate again – but he'll still appear decades older. Her ship holds one end of the new wormhole and everyone knows the vital importance of rebuilding the gate. What kind of enemy appears from nowhere, strikes a devastating blow, and then vanishes?
>
> Spy drones slink forward as he copies his brain-state. Via the distant wormhole on his sweetheart's ship his censored message plays. "Hi Honey … beep … Happy hunting."

If new to [tabletop Role-Playing Games](https://en.wikipedia.org/wiki/Tabletop_role-playing_game) (RPGs), consider [Dungeons and Dragons](https://en.wikipedia.org/wiki/Dungeons_%26_Dragons), [Star Wars Roleplaying Game](https://en.wikipedia.org/wiki/Star_Wars_Roleplaying_Game_%28Fantasy_Flight_Games%29), or [Traveller](https://en.wikipedia.org/wiki/Traveller_%28role-playing_game%29) role-playing game.
