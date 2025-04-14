
import React from 'react';
import { toast } from '../hooks/use-toast';
import { CheckCircle, XCircle } from 'lucide-react';
import { playSound } from '../utils/soundEffects';
import { SOUNDS } from '../utils/soundEffects';

interface GameResultProps {
  success: boolean;
  message: string;
  multiplier?: number;
  amount?: number;
}

export const showGameResult = ({ success, message, multiplier, amount }: GameResultProps) => {
  // Play appropriate sound
  if (success) {
    playSound(SOUNDS.CASH_OUT);
  } else {
    playSound(SOUNDS.MINE_HIT);
  }

  toast({
    title: success ? 'Success!' : 'Game Over',
    description: (
      <div className="flex items-center space-x-2">
        {success ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
        <span>{message}</span>
        {multiplier && (
          <span className={`font-bold ${success ? 'text-green-500' : 'text-red-500'}`}>
            {success ? `${multiplier}x` : `${multiplier}x`}
          </span>
        )}
        {amount && (
          <span className={`font-bold ${success ? 'text-green-500' : 'text-red-500'}`}>
            {success ? `+${amount}` : `-${amount}`} gems
          </span>
        )}
      </div>
    ),
    variant: success ? "default" : "destructive",
    duration: 5000,
  });
};
