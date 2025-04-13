
export interface SliderItem {
  id: string;
  name: string;
  image: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythical';
  price: number;
}

export interface CaseSelection {
  caseId: string;
  quantity: number;
}

export interface SliderOptions {
  duration?: number;
  itemSize?: 'small' | 'medium' | 'large';
}

export interface SliderProps {
  items: SliderItem[];
  onComplete: (item: SliderItem) => void;
  autoSpin?: boolean;
  isCompact?: boolean;
  playerName?: string;
  highlightPlayer?: boolean;
  options?: SliderOptions;
  spinDuration?: number;
  isSpinning?: boolean;
  setIsSpinning?: React.Dispatch<React.SetStateAction<boolean>>;
}
