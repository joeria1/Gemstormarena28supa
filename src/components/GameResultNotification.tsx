
import React from 'react';
import { toast } from '../hooks/use-toast';
import { CheckCircle, XCircle } from 'lucide-react';

interface GameResultProps {
  success: boolean;
  message: string;
  multiplier?: number;
  amount?: number;
}

export const showGameResult = ({ success, message, multiplier, amount }: GameResultProps) => {
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
