import {CAST} from "./cast.js";
// Paths are relative to public/. Replace one asset without changing the other layers.
export const ASSETS={player:{url:(import.meta.env?.BASE_URL??'/')+'assets/player/yechan.glb',height:1.85,rotation:0},environment:{url:null,scale:1},characters:CAST};
