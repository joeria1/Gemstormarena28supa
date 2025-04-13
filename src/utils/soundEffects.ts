
import { play } from './sounds';

// Game sounds
export const SOUNDS = {
  TILE_CLICK: '/sounds/click.mp3',
  MINE_HIT: '/sounds/explosion.mp3',
  CASH_OUT: '/sounds/cashout.mp3', 
  TOWER_CORRECT: '/sounds/correct.mp3',
  TOWER_WRONG: '/sounds/wrong.mp3',
  DEPOSIT: '/sounds/deposit.mp3',
  REWARD: '/sounds/reward.mp3',
  LEVEL_UP: '/sounds/levelup.mp3',
  CASE_OPEN: '/sounds/case_open.mp3',
  CARD_DEAL: '/sounds/card_deal.mp3',
  CARD_FLIP: '/sounds/card_flip.mp3',
  BLACKJACK_WIN: '/sounds/blackjack_win.mp3',
  BLACKJACK_LOSE: '/sounds/blackjack_lose.mp3',
  BUTTON_CLICK: '/sounds/button-click.mp3',
  CRASH_TICK: '/sounds/tick.mp3',
  CRASH_EXPLOSION: '/sounds/explosion.mp3',
};

export const playSound = (sound: string) => {
  play(sound);
};
