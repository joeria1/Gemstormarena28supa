import React from 'react';
import { toast } from 'sonner';
import { CheckCircle, XCircle } from 'lucide-react';
import { playSound } from '../utils/soundEffects';
import { getSoundPath } from '../utils/soundConfig';

interface GameResultProps {
  success: boolean;
  message: string;
  multiplier?: number;
  amount?: number;
  duration?: number;
}

export const showGameResult = ({ success, message, multiplier, amount, duration = 5000 }: GameResultProps) => {
  // Play appropriate sound
  if (success) {
    // Show balance change notification for successful games
    if (amount && amount > 0 && window.showBalanceChange) {
      window.showBalanceChange(amount);
    } else {
      playSound(getSoundPath('cashout'));
    }
  } else {
    playSound(getSoundPath('lose'));
  }

  const toastMessage = (
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
  );

  if (success) {
    toast.success(toastMessage, { duration });
  } else {
    toast.error(toastMessage, { duration });
  }
};
