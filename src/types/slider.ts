
export interface SliderItem {
  id: string;
  name: string;
  image: string;
  rarity: string;
  price: number;
  isReroll?: boolean;
  playerId?: string; // Added this field to support CaseBattle functionality
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
