# What is this about
This is a ffxiv blm cast simulator. The main objective is to see how stats(crit, det, dh, sps)
affect pps. The rotation it uses currently:

```
Opener: B3 -> Enochian -> B4 -> T3 -> F3
Rotation: 
	AF: F3 3xF4 F1 3xF4 (T3P if Firestarter available) F3P
	UI: (Foul if close to overwriting) B4 (T3 if duration is less than 12s) Foul (T3P)
```

# How to use it
There are two ways to use this.
1. use the [web interface](https://freehaha.github.io/ffxiv-blm-sim/)
2. clone this repo. update `src/config.json` to your liking and run `node sim.js`

# LL, Swift, Sharpcast?
Not implemented yet. Neither are buffs from external sources.

# Contribution
Feel free to send pull request/bug report!

# Credits
The damage formulas are stolen from  [FFXIV 70 Statistic Intervals](https://docs.google.com/spreadsheets/d/1Y6wP1rq0b-3Oh45Oo1slFQGyKUqrkfGYk5TjNandLqE/edit#gid=782468133) Authored by /u/Nemekh of The TheoryJerks

