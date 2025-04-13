
import { play } from './sounds';

// Game sounds
export const SOUNDS = {
  TILE_CLICK: 'click',
  MINE_HIT: 'explosion',
  CASH_OUT: 'cashout', 
  TOWER_CORRECT: 'correct',
  TOWER_WRONG: 'wrong',
  DEPOSIT: 'deposit',
  REWARD: 'reward',
  LEVEL_UP: 'levelup',
  CASE_OPEN: 'case_open',
  CARD_DEAL: 'card_deal',
  CARD_FLIP: 'card_flip',
  BLACKJACK_WIN: 'blackjack_win',
  BLACKJACK_LOSE: 'blackjack_lose',
  BUTTON_CLICK: 'button-click',
  CRASH_TICK: 'tick',
  CRASH_EXPLOSION: 'explosion',
  RAKE_JOIN: 'deposit',
  RAKE_START: 'levelup',
  RAKE_WIN: 'big-win',
};

export const playSound = (sound: string) => {
  play(sound);
};
