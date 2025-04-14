
import { playGameSound, pauseGameSound } from './gameSounds';

// This function will integrate sound effects with existing elements
// without modifying their original code
export const initializeSoundEffects = () => {
  // Add event listeners for Mines game
  const addMinesListeners = () => {
    document.querySelectorAll('.mine-cell').forEach(cell => {
      cell.addEventListener('click', () => {
        const isMine = cell.classList.contains('is-mine');
        if (isMine) {
          playGameSound('mineExplosion');
        } else {
          playGameSound('mineClick');
        }
      });
    });
  };

  // Add event listeners for Blackjack game
  const addBlackjackListeners = () => {
    document.querySelectorAll('.deal-button').forEach(button => {
      button.addEventListener('click', () => {
        playGameSound('cardShuffle');
        setTimeout(() => playGameSound('cardDeal'), 500);
      });
    });

    document.querySelectorAll('.hit-button').forEach(button => {
      button.addEventListener('click', () => {
        playGameSound('cardHit');
      });
    });
  };

  // Add event listeners for Cases
  const addCasesListeners = () => {
    document.querySelectorAll('.case-item').forEach(item => {
      item.addEventListener('mouseenter', () => {
        playGameSound('caseHover');
      });
      
      item.addEventListener('click', () => {
        playGameSound('caseSelect');
      });
    });
  };

  // Add event listeners for Horse Racing
  const addHorseRacingListeners = () => {
    document.querySelectorAll('.start-race-button').forEach(button => {
      button.addEventListener('click', () => {
        playGameSound('raceStart');
      });
    });
  };

  // Add event listeners for Lightning effects
  const addLightningListeners = () => {
    const lightningElements = document.querySelectorAll('.lightning-effect');
    
    lightningElements.forEach(element => {
      const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          if (mutation.attributeName === 'class') {
            const target = mutation.target as HTMLElement;
            if (target.classList.contains('active')) {
              playGameSound('lightning');
            }
          }
        });
      });
      
      observer.observe(element, { attributes: true });
    });
  };

  // Add event listeners for Crash game
  const addCrashListeners = () => {
    const rocketElements = document.querySelectorAll('.rocket');
    
    rocketElements.forEach(element => {
      const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          if (mutation.attributeName === 'class') {
            const target = mutation.target as HTMLElement;
            if (target.classList.contains('flying')) {
              playGameSound('rocketFly');
            } else if (target.classList.contains('crashed')) {
              pauseGameSound('rocketFly');
              playGameSound('rocketCrash');
            }
          }
        });
      });
      
      observer.observe(element, { attributes: true });
    });
  };

  // Add event listeners for Tower game
  const addTowerListeners = () => {
    document.querySelectorAll('.tower-tile').forEach(tile => {
      tile.addEventListener('click', () => {
        const isSuccess = !tile.classList.contains('trap');
        if (isSuccess) {
          playGameSound('towerSuccess');
        } else {
          playGameSound('towerFail');
        }
      });
    });
  };

  // Initialize all listeners
  const initializeAllListeners = () => {
    addMinesListeners();
    addBlackjackListeners();
    addCasesListeners();
    addHorseRacingListeners();
    addLightningListeners();
    addCrashListeners();
    addTowerListeners();
  };

  // Set up mutation observer to handle dynamically added elements
  const setupMutationObserver = () => {
    const observer = new MutationObserver((mutations) => {
      initializeAllListeners();
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    return observer;
  };

  // Initial setup
  initializeAllListeners();
  const observer = setupMutationObserver();
  
  return observer;
};
