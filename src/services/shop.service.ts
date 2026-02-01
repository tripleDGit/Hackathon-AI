import { BookTier } from '@/types/character.types';
import { getGachaCurrency, saveGachaCurrency, addBooks, getSkillMaterialInventory, saveSkillMaterialInventory, getUncapMaterialInventory, saveUncapMaterialInventory } from './character.service';
import { loadUserProgress, saveUserProgress } from './missions.service';

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  cost: number;
  currency: 'dust' | 'points';
  reward: {
    type: 'book' | 'skill_material' | 'uncap_material' | 'gems';
    item?: string;
    amount: number;
  };
}

export const DUST_SHOP_ITEMS: ShopItem[] = [
  {
    id: 'dust_book_t1',
    name: 'Basic Training Book',
    description: 'Level up your characters',
    icon: '📘',
    cost: 5,
    currency: 'dust',
    reward: { type: 'book', item: '1', amount: 5 },
  },
  {
    id: 'dust_book_t2',
    name: 'Advanced Training Book',
    description: 'Boost character levels faster',
    icon: '📗',
    cost: 10,
    currency: 'dust',
    reward: { type: 'book', item: '2', amount: 3 },
  },
  {
    id: 'dust_book_t3',
    name: 'Expert Training Book',
    description: 'Maximum experience gain',
    icon: '📕',
    cost: 20,
    currency: 'dust',
    reward: { type: 'book', item: '3', amount: 2 },
  },
  {
    id: 'dust_spark',
    name: 'Skill Spark x10',
    description: 'Basic skill upgrade material',
    icon: '✨',
    cost: 15,
    currency: 'dust',
    reward: { type: 'skill_material', item: 'spark', amount: 10 },
  },
  {
    id: 'dust_core',
    name: 'Skill Core x5',
    description: 'Advanced skill upgrade material',
    icon: '💠',
    cost: 30,
    currency: 'dust',
    reward: { type: 'skill_material', item: 'core', amount: 5 },
  },
  {
    id: 'dust_prism',
    name: 'Skill Prism x2',
    description: 'Elite skill mastery material',
    icon: '🔶',
    cost: 50,
    currency: 'dust',
    reward: { type: 'skill_material', item: 'prism', amount: 2 },
  },
];

export const POINTS_SHOP_ITEMS: ShopItem[] = [
  {
    id: 'points_gems_small',
    name: 'Gem Pack (Small)',
    description: '100 Free Gems',
    icon: '💛',
    cost: 50,
    currency: 'points',
    reward: { type: 'gems', amount: 100 },
  },
  {
    id: 'points_gems_medium',
    name: 'Gem Pack (Medium)',
    description: '300 Free Gems',
    icon: '💛',
    cost: 120,
    currency: 'points',
    reward: { type: 'gems', amount: 300 },
  },
  {
    id: 'points_gems_large',
    name: 'Gem Pack (Large)',
    description: '800 Free Gems',
    icon: '💛',
    cost: 300,
    currency: 'points',
    reward: { type: 'gems', amount: 800 },
  },
  {
    id: 'points_book_t1',
    name: 'Basic Book Bundle',
    description: '10 Tier 1 Books',
    icon: '📘',
    cost: 100,
    currency: 'points',
    reward: { type: 'book', item: '1', amount: 10 },
  },
  {
    id: 'points_book_t2',
    name: 'Advanced Book Bundle',
    description: '5 Tier 2 Books',
    icon: '📗',
    cost: 150,
    currency: 'points',
    reward: { type: 'book', item: '2', amount: 5 },
  },
  {
    id: 'points_book_t3',
    name: 'Expert Book Bundle',
    description: '3 Tier 3 Books',
    icon: '📕',
    cost: 200,
    currency: 'points',
    reward: { type: 'book', item: '3', amount: 3 },
  },
  {
    id: 'points_uncap_bundle',
    name: 'Ascension Material Pack',
    description: '5 of each ascension material',
    icon: '💎',
    cost: 250,
    currency: 'points',
    reward: { type: 'uncap_material', amount: 5 },
  },
  {
    id: 'points_skill_bundle',
    name: 'Skill Material Pack',
    description: '10 Sparks, 5 Cores, 2 Prisms',
    icon: '✨',
    cost: 200,
    currency: 'points',
    reward: { type: 'skill_material', amount: 1 },
  },
];

export const purchaseShopItem = (itemId: string): { success: boolean; error?: string; reward?: string } => {
  const dustItems = DUST_SHOP_ITEMS.find(item => item.id === itemId);
  const pointsItems = POINTS_SHOP_ITEMS.find(item => item.id === itemId);
  const item = dustItems || pointsItems;
  
  if (!item) {
    return { success: false, error: 'Item not found' };
  }
  
  // Check currency
  if (item.currency === 'dust') {
    const currency = getGachaCurrency();
    if ((currency.constellationDust || 0) < item.cost) {
      return { success: false, error: 'Insufficient constellation dust' };
    }
    currency.constellationDust = (currency.constellationDust || 0) - item.cost;
    saveGachaCurrency(currency);
  } else {
    const progress = loadUserProgress();
    if (progress.totalPoints < item.cost) {
      return { success: false, error: 'Insufficient points' };
    }
    progress.totalPoints -= item.cost;
    saveUserProgress(progress);
  }
  
  // Grant reward
  if (item.reward.type === 'book' && item.reward.item) {
    addBooks(parseInt(item.reward.item) as BookTier, item.reward.amount);
  } else if (item.reward.type === 'skill_material' && item.reward.item) {
    const materials = getSkillMaterialInventory();
    materials[item.reward.item as keyof typeof materials] += item.reward.amount;
    saveSkillMaterialInventory(materials);
  } else if (item.reward.type === 'skill_material' && !item.reward.item) {
    // Bundle
    const materials = getSkillMaterialInventory();
    materials.spark += 10;
    materials.core += 5;
    materials.prism += 2;
    saveSkillMaterialInventory(materials);
  } else if (item.reward.type === 'uncap_material') {
    const materials = getUncapMaterialInventory();
    materials.crystal += item.reward.amount;
    materials.essence += item.reward.amount;
    materials.fragment += item.reward.amount;
    materials.tome += item.reward.amount;
    materials.rune += item.reward.amount;
    saveUncapMaterialInventory(materials);
  } else if (item.reward.type === 'gems') {
    const currency = getGachaCurrency();
    currency.freeGems += item.reward.amount;
    saveGachaCurrency(currency);
  }
  
  return { success: true, reward: item.name };
};
