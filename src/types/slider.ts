
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
