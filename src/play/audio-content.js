// Original music and synthesis instructions for Vigo After Dark.
// No recordings, external samples, quotations, or third-party composition.
export const SCORE = Object.freeze({
  bpm: 88,
  // Eight bars: Dm9, Bbmaj7, Gm9, C6, Dm9, Bbmaj9, Gm9, A7sus4.
  chords: [[50,57,60,64],[46,53,57,62],[43,50,57,58],[48,55,57,64],
    [50,57,60,65],[46,53,60,62],[43,50,57,62],[45,52,55,62]],
  bass: [38,34,31,36,38,34,31,33],
  // An authored, syncopated contour; harmony supplies the actual pitches.
  pluckSteps: [2,7,10,14],
  pluckDegrees: [2,1,3,1,0,2,3,2],
  districts: [
    {name:'AI Alley',cutoff:1300,pan:-.16,hum:73.42,air:300,texture:0},
    {name:'Cloud Kitchen',cutoff:1750,pan:.14,hum:98,air:460,texture:1},
    {name:'Data Market',cutoff:1100,pan:-.10,hum:82.41,air:380,texture:2},
    {name:'Agent Arcade',cutoff:1900,pan:-.12,hum:146.83,air:420,texture:4},
    {name:'Parallel Works',cutoff:1000,pan:.08,hum:65.41,air:250,texture:5},
    {name:'Vision Street',cutoff:2150,pan:.18,hum:110,air:560,texture:3}
  ]
});

export const EVENT_COOLDOWNS = Object.freeze({
  start:900,footstep:235,jump:160,land:150,pickup:90,approach:1100,
  interact:130,machine:85,retry:600,success:1300,evidence:500,
  restore:1300,nav:85,open:200,close:200,rain:500,complete:4000
});
