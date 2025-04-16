
export interface SliderItem {
  id: string;
  name: string;
  image: string;
  rarity: string;
  price: number;
  playerId?: string; // Added playerId as an optional property
  isReroll?: boolean;
  playerName?: string; // Added for displaying player name with items
  playerTeam?: number; // Added for styling based on team
}

export interface SliderProps {
  items: SliderItem[];
  onComplete: (item: SliderItem) => void;
  autoSpin?: boolean;
  isCompact?: boolean;
  playerName?: string;
  highlightPlayer?: boolean;
  options?: {
    duration?: number;
    itemSize?: 'small' | 'medium' | 'large';
  };
  spinDuration?: number;
  isSpinning?: boolean;
  setIsSpinning?: React.Dispatch<React.SetStateAction<boolean>>;
  caseName?: string;
}
