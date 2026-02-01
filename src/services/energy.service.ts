const ENERGY_KEY = 'energy_state';

const MAX_ENERGY = 120;
const REGEN_INTERVAL_MINUTES = 5;
const REGEN_AMOUNT = 1;

export interface EnergyState {
  energy: number;
  lastUpdated: number;
}

const getInitialEnergyState = (): EnergyState => ({
  energy: MAX_ENERGY,
  lastUpdated: Date.now(),
});

const applyRegen = (state: EnergyState): EnergyState => {
  const now = Date.now();
  const elapsedMinutes = Math.floor((now - state.lastUpdated) / (1000 * 60));
  if (elapsedMinutes < REGEN_INTERVAL_MINUTES) {
    return state;
  }

  const ticks = Math.floor(elapsedMinutes / REGEN_INTERVAL_MINUTES);
  if (ticks <= 0) {
    return state;
  }

  const regenerated = ticks * REGEN_AMOUNT;
  const nextEnergy = Math.min(MAX_ENERGY, state.energy + regenerated);
  const remainderMinutes = elapsedMinutes % REGEN_INTERVAL_MINUTES;
  const nextUpdated = now - remainderMinutes * 60 * 1000;

  return {
    energy: nextEnergy,
    lastUpdated: nextUpdated,
  };
};

export const getEnergyState = (): EnergyState => {
  const stored = localStorage.getItem(ENERGY_KEY);
  const baseState: EnergyState = stored ? JSON.parse(stored) : getInitialEnergyState();
  const updated = applyRegen(baseState);
  if (updated.energy !== baseState.energy || updated.lastUpdated !== baseState.lastUpdated) {
    saveEnergyState(updated);
  }
  return updated;
};

export const saveEnergyState = (state: EnergyState) => {
  localStorage.setItem(ENERGY_KEY, JSON.stringify(state));
};

export const spendEnergy = (amount: number): { success: boolean; state: EnergyState; error?: string } => {
  const state = getEnergyState();
  if (state.energy < amount) {
    return { success: false, state, error: 'Not enough energy' };
  }

  const updated: EnergyState = {
    energy: state.energy - amount,
    lastUpdated: state.lastUpdated,
  };
  saveEnergyState(updated);
  return { success: true, state: updated };
};

export const addEnergy = (amount: number) => {
  const state = getEnergyState();
  const updated: EnergyState = {
    energy: Math.min(MAX_ENERGY, state.energy + amount),
    lastUpdated: state.lastUpdated,
  };
  saveEnergyState(updated);
  return updated;
};

export const getEnergyConfig = () => ({
  maxEnergy: MAX_ENERGY,
  regenIntervalMinutes: REGEN_INTERVAL_MINUTES,
  regenAmount: REGEN_AMOUNT,
});
