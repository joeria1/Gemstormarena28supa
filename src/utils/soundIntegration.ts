
import { playGameSound } from './gameSounds';

// This function will integrate sound effects with existing elements
// without modifying their original code
export const initializeSoundEffects = (volume = 0.5) => {
  // Add event listeners for Mines game
  const addMinesListeners = () => {
    document.querySelectorAll('.mine-cell').forEach(cell => {
      cell.addEventListener('click', () => {
        const isMine = cell.classList.contains('is-mine');
        if (isMine) {
          playGameSound('mineExplosion', volume);
        } else {
          playGameSound('mineClick', volume);
        }
      });
    });
  };

  // Add event listeners for Blackjack game
  const addBlackjackListeners = () => {
    document.querySelectorAll('.deal-button').forEach(button => {
      button.addEventListener('click', () => {
        playGameSound('cardShuffle', volume);
        setTimeout(() => playGameSound('cardDeal', volume), 500);
      });
    });

    document.querySelectorAll('.hit-button').forEach(button => {
      button.addEventListener('click', () => {
        playGameSound('cardHit', volume);
      });
    });
  };

  // Add event listeners for Cases
  const addCasesListeners = () => {
    document.querySelectorAll('.case-item').forEach(item => {
      item.addEventListener('mouseenter', () => {
        playGameSound('caseHover', volume);
      });
      
      item.addEventListener('click', () => {
        playGameSound('caseSelect', volume);
      });
    });
  };

  // Add event listeners for Horse Racing
  const addHorseRacingListeners = () => {
    document.querySelectorAll('.start-race-button').forEach(button => {
      button.addEventListener('click', () => {
        playGameSound('raceStart', volume);
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
              playGameSound('lightning', volume);
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
              playGameSound('rocketFly', volume);
            } else if (target.classList.contains('crashed')) {
              playGameSound('rocketCrash', volume);
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
          playGameSound('towerSuccess', volume);
        } else {
          playGameSound('towerFail', volume);
        }
      });
    });
  };

  // Add event listeners for Cashout buttons (all games)
  const addCashoutListeners = () => {
    document.querySelectorAll('.cashout-button, [data-cashout="true"]').forEach(button => {
      button.addEventListener('click', () => {
        playGameSound('cashout', volume);
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
    addCashoutListeners();
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
