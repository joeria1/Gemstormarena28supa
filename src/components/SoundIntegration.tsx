import React, { useEffect } from 'react';
import { playGameSound } from '../utils/gameSounds';
import { useSound } from './ui/sound-context';

// This component is responsible for integrating sounds into the existing games
// without modifying their core functionality
const SoundIntegration: React.FC = () => {
  const { isMuted, volume } = useSound();
  
  useEffect(() => {
    if (isMuted) return;
    
    // Function to add click handlers for different game elements
    const addSoundHandlers = () => {
      // Mines Game
      document.querySelectorAll('.mines-tile').forEach(tile => {
        tile.addEventListener('click', (e) => {
          const target = e.currentTarget as HTMLElement;
          if (target.classList.contains('mine')) {
            playGameSound('mineExplosion', volume);
          } else {
            playGameSound('mineClick', volume);
          }
        });
      });

      // Cashout buttons for all games
      document.querySelectorAll('.cashout-button, [data-cashout="true"]').forEach(button => {
        button.addEventListener('click', () => {
          playGameSound('cashout', volume);
        });
      });

      // Blackjack Game
      document.querySelectorAll('.blackjack-deal').forEach(button => {
        button.addEventListener('click', () => {
          playGameSound('cardShuffle', volume);
          setTimeout(() => playGameSound('cardDeal', volume), 500);
        });
      });

      document.querySelectorAll('.blackjack-hit').forEach(button => {
        button.addEventListener('click', () => {
          playGameSound('cardHit', volume);
        });
      });

      // Cases
      document.querySelectorAll('.case-item').forEach(item => {
        item.addEventListener('mouseenter', () => {
          playGameSound('caseHover', volume);
        });
        item.addEventListener('click', () => {
          playGameSound('caseSelect', volume);
        });
      });

      // Horse Racing
      document.querySelectorAll('.race-start-trigger, [data-sound="race-start"]').forEach(button => {
        button.addEventListener('click', () => {
          playGameSound('raceStart', volume);
        });
      });

      document.querySelectorAll('.race-in-progress, [data-sound="race-galloping"]').forEach(element => {
        element.addEventListener('mouseenter', () => {
          playGameSound('raceGalloping', volume);
        });
      });

      // Lightning Effects
      document.querySelectorAll('.lightning-effect').forEach(effect => {
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.attributeName === 'class') {
              const element = mutation.target as HTMLElement;
              if (element.classList.contains('active')) {
                playGameSound('lightning', volume);
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
                playGameSound('rocketFly', volume);
              } else if (element.classList.contains('crashed')) {
                playGameSound('rocketCrash', volume);
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
            playGameSound('towerFail', volume);
          } else {
            playGameSound('towerSuccess', volume);
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
  }, [isMuted, volume]);

  return null; // This component doesn't render anything
};

export default SoundIntegration;
