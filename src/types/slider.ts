
export type RarityType = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythical';

export interface SliderItem {
  id: string;
  name: string;
  image: string;
  rarity: RarityType;
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

// Add Battle related types to ensure proper typing throughout the application
export type BattleStatus = 'waiting' | 'active' | 'completed';
export type BattleMode = 'solo' | '1v1' | '2v2' | '4-player';

export interface Participant {
  id: string;
  name: string;
  isBot: boolean;
  items: {caseId: string, item: SliderItem | null}[];
  isSpinning: boolean;
  displaySlider: boolean;
  avatar?: string;
  team?: number;
  totalValue: number;
}

export interface Battle {
  id: string;
  cases: CaseSelection[];
  mode: BattleMode;
  participants: Participant[];
  status: BattleStatus; // This ensures status can only be one of three values
  winner: string | null;
  winningTeam?: number;
  totalValue: number;
  startTime: number;
  currentCaseIndex: number;
  allCasesSpun: boolean;
}
