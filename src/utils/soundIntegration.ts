import { playGameSound } from './gameSounds';
import { enhancedPlaySound } from './soundTestUtility';

// This function will integrate sound effects with existing elements
// without modifying their original code
export const initializeSoundEffects = (volume = 0.5) => {
  // Add event listeners for Mines game
  const addMinesListeners = () => {
    document.querySelectorAll('.mine-cell').forEach(cell => {
      cell.addEventListener('click', () => {
        const isMine = cell.classList.contains('is-mine');
        if (isMine) {
          enhancedPlaySound('/sounds/mine-explosion.mp3', volume);
        } else {
          enhancedPlaySound('/sounds/mine-click.mp3', volume);
        }
      });
    });
  };

  // Add event listeners for Blackjack game
  const addBlackjackListeners = () => {
    document.querySelectorAll('.deal-button').forEach(button => {
      button.addEventListener('click', () => {
        enhancedPlaySound('/sounds/card-shuffle.mp3', volume);
        setTimeout(() => enhancedPlaySound('/sounds/card-deal.mp3', volume), 500);
      });
    });

    document.querySelectorAll('.hit-button').forEach(button => {
      button.addEventListener('click', () => {
        enhancedPlaySound('/sounds/card-hit.mp3', volume);
      });
    });
  };

  // Add event listeners for Cases
  const addCasesListeners = () => {
    document.querySelectorAll('.case-item').forEach(item => {
      item.addEventListener('mouseenter', () => {
        enhancedPlaySound('/sounds/case-hover.mp3', volume);
      });
      
      item.addEventListener('click', () => {
        enhancedPlaySound('/sounds/case-select.mp3', volume);
      });
    });
  };

  // Add event listeners for Horse Racing
  const addHorseRacingListeners = () => {
    document.querySelectorAll('.start-race-button').forEach(button => {
      button.addEventListener('click', () => {
        enhancedPlaySound('/sounds/race-start.mp3', volume);
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
              enhancedPlaySound('/sounds/lightning.mp3', 0.6);
              console.log("Lightning effect detected, playing sound");
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
              enhancedPlaySound('/sounds/rocket-fly.mp3', volume);
            } else if (target.classList.contains('crashed')) {
              enhancedPlaySound('/sounds/rocket-crash.mp3', volume);
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
          enhancedPlaySound('/sounds/tower-success.mp3', volume);
          console.log("Tower success, playing sound");
        } else {
          enhancedPlaySound('/sounds/tower-fail.mp3', 0.6);
          console.log("Tower fail, playing sound");
        }
      });
    });
  };

  // Add event listeners for Cashout buttons (all games)
  const addCashoutListeners = () => {
    document.querySelectorAll('.cashout-button, [data-cashout="true"]').forEach(button => {
      button.addEventListener('click', () => {
        enhancedPlaySound('/sounds/cashout.mp3', 0.6);
        console.log("Cashout button clicked, playing sound");
      });
    });
  };

  // Initialize all listeners
  const initializeAllListeners = () => {
    console.log("Initializing sound listeners...");
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
