
import React, { useEffect } from 'react';
import gameSounds from '../utils/gameSounds';

// This component is responsible for integrating sounds into the existing games
// without modifying their core functionality
const SoundIntegration: React.FC = () => {
  useEffect(() => {
    // Function to add click handlers for different game elements
    const addSoundHandlers = () => {
      // Mines Game
      document.querySelectorAll('.mines-tile').forEach(tile => {
        tile.addEventListener('click', (e) => {
          const target = e.currentTarget as HTMLElement;
          if (target.classList.contains('mine')) {
            gameSounds.mineExplosion.play();
          } else {
            gameSounds.mineClick.play();
          }
        });
      });

      // Blackjack Game
      document.querySelectorAll('.blackjack-deal').forEach(button => {
        button.addEventListener('click', () => {
          gameSounds.cardShuffle.play();
          setTimeout(() => gameSounds.cardDeal.play(), 500);
        });
      });

      document.querySelectorAll('.blackjack-hit').forEach(button => {
        button.addEventListener('click', () => {
          gameSounds.cardHit.play();
        });
      });

      // Cases
      document.querySelectorAll('.case-item').forEach(item => {
        item.addEventListener('mouseenter', () => {
          gameSounds.caseHover.play();
        });
        item.addEventListener('click', () => {
          gameSounds.caseSelect.play();
        });
      });

      // Horse Racing
      document.querySelectorAll('.race-start-button').forEach(button => {
        button.addEventListener('click', () => {
          gameSounds.raceStart.play();
        });
      });

      // Lightning Effects
      document.querySelectorAll('.lightning-effect').forEach(effect => {
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.attributeName === 'class') {
              const element = mutation.target as HTMLElement;
              if (element.classList.contains('active')) {
                gameSounds.lightning.play();
              }
            }
          });
        });
        
        observer.observe(effect, { attributes: true });
      });

      // Crash Game
      document.querySelectorAll('.rocket-flying').forEach(rocket => {
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.attributeName === 'class') {
              const element = mutation.target as HTMLElement;
              if (element.classList.contains('active')) {
                gameSounds.rocketFly.play();
              } else if (element.classList.contains('crashed')) {
                gameSounds.rocketFly.pause();
                gameSounds.rocketCrash.play();
              }
            }
          });
        });
        
        observer.observe(rocket, { attributes: true });
      });

      // Towers Game
      document.querySelectorAll('.tower-tile').forEach(tile => {
        tile.addEventListener('click', (e) => {
          const target = e.currentTarget as HTMLElement;
          if (target.classList.contains('bomb')) {
            gameSounds.towerFail.play();
          } else {
            gameSounds.towerSuccess.play();
          }
        });
      });
    };

    // Initial setup
    addSoundHandlers();

    // Setup a MutationObserver to handle dynamically added elements
    const bodyObserver = new MutationObserver(() => {
      addSoundHandlers();
    });

    bodyObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      bodyObserver.disconnect();
    };
  }, []);

  return null; // This component doesn't render anything
};

export default SoundIntegration;
