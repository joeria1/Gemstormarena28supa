
import { play } from './sounds';

// Game sounds
export const SOUNDS = {
  TILE_CLICK: 'tile_click',
  MINE_HIT: 'mine_hit',
  CASH_OUT: 'cash_out', 
  TOWER_CORRECT: 'tower_correct',
  TOWER_WRONG: 'tower_wrong',
  DEPOSIT: 'deposit',
  REWARD: 'reward',
  LEVEL_UP: 'level_up',
  CASE_OPEN: 'case_open',
};

// Sound mapping to actual files
const SOUND_FILES = {
  [SOUNDS.TILE_CLICK]: 'click',
  [SOUNDS.MINE_HIT]: 'explosion',
  [SOUNDS.CASH_OUT]: 'cashout',
  [SOUNDS.TOWER_CORRECT]: 'correct',
  [SOUNDS.TOWER_WRONG]: 'wrong',
  [SOUNDS.DEPOSIT]: 'deposit',
  [SOUNDS.REWARD]: 'reward',
  [SOUNDS.LEVEL_UP]: 'levelup',
  [SOUNDS.CASE_OPEN]: 'case_open',
};

export const playSound = (sound: string) => {
  const soundFile = SOUND_FILES[sound];
  if (soundFile) {
    play(soundFile);
  } else {
    console.warn(`Sound not found: ${sound}`);
  }
};
