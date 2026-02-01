import { useEffect, useMemo, useState } from 'react';
import { SkillMaterialInventory, SKILL_MATERIALS, UncapMaterialInventory, UNCAP_MATERIALS, SkillMaterialType, UncapMaterialType } from '@/types/character.types';
import { DungeonDifficulty, DungeonType } from '@/types/dungeon.types';
import { getEnergyConfig, getEnergyState } from '@/services/energy.service';
import { getSkillMaterialInventory, getUncapMaterialInventory } from '@/services/character.service';
import { getDungeonDifficultyRequirement, getDungeonEnergyCost, isDungeonDifficultyUnlocked, runDungeon } from '@/services/dungeon.service';

interface DungeonModalProps {
  onClose: () => void;
}

const DIFFICULTIES: DungeonDifficulty[] = ['easy', 'medium', 'hard'];

const DungeonModal: React.FC<DungeonModalProps> = ({ onClose }) => {
  const [dungeonType, setDungeonType] = useState<DungeonType>('skill');
  const [difficulty, setDifficulty] = useState<DungeonDifficulty>('easy');
  const [selectedSkillMaterial, setSelectedSkillMaterial] = useState<SkillMaterialType>('spark');
  const [selectedUncapMaterial, setSelectedUncapMaterial] = useState<UncapMaterialType>('crystal');
  const [energyState, setEnergyState] = useState(getEnergyState());
  const [skillInventory, setSkillInventory] = useState<SkillMaterialInventory>(getSkillMaterialInventory());
  const [uncapInventory, setUncapInventory] = useState<UncapMaterialInventory>(getUncapMaterialInventory());
  const [message, setMessage] = useState<string | null>(null);

  const energyConfig = useMemo(() => getEnergyConfig(), []);

  useEffect(() => {
    const interval = setInterval(() => {
      setEnergyState(getEnergyState());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRun = () => {
    const material = dungeonType === 'skill' ? selectedSkillMaterial : selectedUncapMaterial;
    const result = runDungeon(dungeonType, difficulty, material);
    if (!result.success || !result.result) {
      setMessage(result.error || 'Dungeon failed');
      setTimeout(() => setMessage(null), 2500);
      return;
    }

    setEnergyState(getEnergyState());
    setSkillInventory(getSkillMaterialInventory());
    setUncapInventory(getUncapMaterialInventory());

    if (result.result.skillMaterials) {
      const [key, value] = Object.entries(result.result.skillMaterials)[0];
      setMessage(`+${value} ${SKILL_MATERIALS[key as SkillMaterialType].name}`);
    } else if (result.result.uncapMaterials) {
      const [key, value] = Object.entries(result.result.uncapMaterials)[0];
      setMessage(`+${value} ${UNCAP_MATERIALS[key as UncapMaterialType].name}`);
    }

    setTimeout(() => setMessage(null), 2500);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-[10000]">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full relative z-10 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">🏰 Material Dungeon</h2>
            <p className="text-emerald-100 text-sm">Farm upgrade materials with energy</p>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white/20 rounded-lg p-2 transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Energy */}
          <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4 flex items-center justify-between">
            <div>
              <div className="text-sm text-emerald-700">Energy</div>
              <div className="text-2xl font-bold text-emerald-800">
                {energyState.energy}/{energyConfig.maxEnergy}
              </div>
              <div className="text-xs text-emerald-600">+{energyConfig.regenAmount} every {energyConfig.regenIntervalMinutes} min</div>
            </div>
            {message && (
              <div className="px-3 py-2 bg-white text-emerald-700 rounded-lg text-sm font-semibold border border-emerald-200">
                {message}
              </div>
            )}
          </div>

          {/* Type Toggle */}
          <div className="flex gap-3">
            <button
              onClick={() => setDungeonType('skill')}
              className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                dungeonType === 'skill'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-emerald-50 text-emerald-700'
              }`}
            >
              ✨ Skill Materials
            </button>
            <button
              onClick={() => setDungeonType('ascension')}
              className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                dungeonType === 'ascension'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-emerald-50 text-emerald-700'
              }`}
            >
              🌟 Ascension Materials
            </button>
          </div>

          {/* Difficulty */}
          <div>
            <h3 className="font-bold text-gray-800 mb-2">Difficulty</h3>
            <div className="grid grid-cols-3 gap-3">
              {DIFFICULTIES.map((item) => {
                const unlocked = isDungeonDifficultyUnlocked(item);
                const requirement = getDungeonDifficultyRequirement(item);
                const cost = getDungeonEnergyCost(item);

                return (
                  <button
                    key={item}
                    onClick={() => unlocked && setDifficulty(item)}
                    className={`rounded-lg p-3 text-sm font-semibold border transition-all ${
                      difficulty === item && unlocked
                        ? 'bg-emerald-500 text-white border-emerald-500'
                        : unlocked
                          ? 'bg-white text-gray-700 border-gray-200 hover:border-emerald-300'
                          : 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
                    }`}
                  >
                    <div className="capitalize">{item}</div>
                    <div className="text-xs mt-1">⚡ {cost}</div>
                    {!unlocked && (
                      <div className="text-[10px] mt-1">Unlock at Lv.{requirement}</div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Material Selection */}
          <div>
            <h3 className="font-bold text-gray-800 mb-2">Select Material</h3>
            {dungeonType === 'skill' ? (
              <div className="grid grid-cols-3 gap-3">
                {(Object.keys(SKILL_MATERIALS) as SkillMaterialType[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => setSelectedSkillMaterial(key)}
                    className={`rounded-lg p-3 border text-sm font-semibold transition-all ${
                      selectedSkillMaterial === key
                        ? 'bg-orange-500 text-white border-orange-500'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-orange-300'
                    }`}
                  >
                    <div className="text-xl">{SKILL_MATERIALS[key].icon}</div>
                    <div>{SKILL_MATERIALS[key].name}</div>
                    <div className="text-xs text-gray-500">Owned: {skillInventory[key]}</div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {(Object.keys(UNCAP_MATERIALS) as UncapMaterialType[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => setSelectedUncapMaterial(key)}
                    className={`rounded-lg p-3 border text-sm font-semibold transition-all ${
                      selectedUncapMaterial === key
                        ? 'bg-purple-500 text-white border-purple-500'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="text-xl">{UNCAP_MATERIALS[key].icon}</div>
                    <div>{UNCAP_MATERIALS[key].name}</div>
                    <div className="text-xs text-gray-500">Owned: {uncapInventory[key]}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleRun}
            className="w-full py-4 rounded-lg font-bold text-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg transition-all"
          >
            Start Dungeon Run
          </button>
        </div>
      </div>
    </div>
  );
};

export default DungeonModal;
