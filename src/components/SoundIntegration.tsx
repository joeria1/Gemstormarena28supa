
import React, { useEffect } from 'react';
import { playGameSound, pauseGameSound } from '../utils/gameSounds';

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
            playGameSound('mineExplosion');
          } else {
            playGameSound('mineClick');
          }
        });
      });

      // Blackjack Game
      document.querySelectorAll('.blackjack-deal').forEach(button => {
        button.addEventListener('click', () => {
          playGameSound('cardShuffle');
          setTimeout(() => playGameSound('cardDeal'), 500);
        });
      });

      document.querySelectorAll('.blackjack-hit').forEach(button => {
        button.addEventListener('click', () => {
          playGameSound('cardHit');
        });
      });

      // Cases
      document.querySelectorAll('.case-item').forEach(item => {
        item.addEventListener('mouseenter', () => {
          playGameSound('caseHover');
        });
        item.addEventListener('click', () => {
          playGameSound('caseSelect');
        });
      });

      // Horse Racing
      document.querySelectorAll('.race-start-button').forEach(button => {
        button.addEventListener('click', () => {
          playGameSound('raceStart');
        });
      });

      // Lightning Effects
      document.querySelectorAll('.lightning-effect').forEach(effect => {
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.attributeName === 'class') {
              const element = mutation.target as HTMLElement;
              if (element.classList.contains('active')) {
                playGameSound('lightning');
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
                playGameSound('rocketFly');
              } else if (element.classList.contains('crashed')) {
                pauseGameSound('rocketFly');
                playGameSound('rocketCrash');
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
            playGameSound('towerFail');
          } else {
            playGameSound('towerSuccess');
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
