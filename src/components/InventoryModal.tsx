import { useEffect, useState } from 'react';
import { BOOK_DATA, SKILL_MATERIALS, UNCAP_MATERIALS, WEEKLY_BOSS_MATERIALS } from '@/types/character.types';
import { getBookInventory, getGachaCurrency, getSkillMaterialInventory, getUncapMaterialInventory, getWeeklyBossMaterialInventory, getConstellationItemInventory, getCharacterInventory } from '@/services/character.service';
import { loadUserProgress } from '@/services/missions.service';

interface InventoryModalProps {
  onClose: () => void;
}

const InventoryModal: React.FC<InventoryModalProps> = ({ onClose }) => {
  const [gachaCurrency, setGachaCurrency] = useState(getGachaCurrency());
  const [bookInventory, setBookInventory] = useState(getBookInventory());
  const [skillMaterials, setSkillMaterials] = useState(getSkillMaterialInventory());
  const [uncapMaterials, setUncapMaterials] = useState(getUncapMaterialInventory());
  const [weeklyBossMaterials, setWeeklyBossMaterials] = useState(getWeeklyBossMaterialInventory());
  const [constellationItems, setConstellationItems] = useState(getConstellationItemInventory());
  const [characterInventory, setCharacterInventory] = useState(getCharacterInventory());
  const [points, setPoints] = useState(loadUserProgress().totalPoints);

  useEffect(() => {
    setGachaCurrency(getGachaCurrency());
    setBookInventory(getBookInventory());
    setSkillMaterials(getSkillMaterialInventory());
    setUncapMaterials(getUncapMaterialInventory());
    setWeeklyBossMaterials(getWeeklyBossMaterialInventory());
    setConstellationItems(getConstellationItemInventory());
    setCharacterInventory(getCharacterInventory());
    setPoints(loadUserProgress().totalPoints);
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-[10000]">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full relative z-10 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-700 to-slate-900 p-6 text-white flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">🎒 Inventory</h2>
            <p className="text-slate-200 text-sm">All items and currency</p>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white/20 rounded-lg p-2 transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Currency */}
          <section className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <h3 className="font-bold text-slate-800 mb-3">Currency</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200 text-center">
                <div className="text-xl font-bold text-yellow-700">{gachaCurrency.freeGems}</div>
                <div className="text-xs text-yellow-700">💛 Gems</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-3 border border-purple-200 text-center">
                <div className="text-xl font-bold text-purple-700">{gachaCurrency.primogems}</div>
                <div className="text-xs text-purple-700">💜 Premium</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200 text-center">
                <div className="text-xl font-bold text-blue-700">{gachaCurrency.wishes}</div>
                <div className="text-xs text-blue-700">🎫 Wishes</div>
              </div>
              <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-200 text-center">
                <div className="text-xl font-bold text-indigo-700">{gachaCurrency.constellationDust || 0}</div>
                <div className="text-xs text-indigo-700">✨ Dust</div>
              </div>
              <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200 text-center">
                <div className="text-xl font-bold text-emerald-700">{points}</div>
                <div className="text-xs text-emerald-700">⭐ Points</div>
              </div>
            </div>
          </section>

          {/* Books */}
          <section className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
            <h3 className="font-bold text-indigo-900 mb-3">Leveling Books</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {(Object.keys(BOOK_DATA) as Array<keyof typeof BOOK_DATA>).map((tier) => (
                <div key={tier} className="bg-white rounded-lg p-3 border border-indigo-200 flex items-center gap-3">
                  <div className="text-2xl">{BOOK_DATA[tier].icon}</div>
                  <div>
                    <div className="font-semibold text-gray-800">{BOOK_DATA[tier].name}</div>
                    <div className="text-xs text-gray-600">Owned: {bookInventory[`tier${tier}` as keyof typeof bookInventory]}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Skill Materials */}
          <section className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <h3 className="font-bold text-emerald-900 mb-3">Skill Materials</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {(Object.keys(SKILL_MATERIALS) as Array<keyof typeof SKILL_MATERIALS>).map((key) => (
                <div key={key} className="bg-white rounded-lg p-3 border border-emerald-200 flex items-center gap-3">
                  <div className="text-2xl">{SKILL_MATERIALS[key].icon}</div>
                  <div>
                    <div className="font-semibold text-gray-800">{SKILL_MATERIALS[key].name}</div>
                    <div className="text-xs text-gray-600">Owned: {skillMaterials[key]}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Ascension Materials */}
          <section className="bg-purple-50 border border-purple-200 rounded-xl p-4">
            <h3 className="font-bold text-purple-900 mb-3">Ascension Materials</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {(Object.keys(UNCAP_MATERIALS) as Array<keyof typeof UNCAP_MATERIALS>).map((key) => (
                <div key={key} className="bg-white rounded-lg p-3 border border-purple-200 flex items-center gap-3">
                  <div className="text-2xl">{UNCAP_MATERIALS[key].icon}</div>
                  <div>
                    <div className="font-semibold text-gray-800">{UNCAP_MATERIALS[key].name}</div>
                    <div className="text-xs text-gray-600">Owned: {uncapMaterials[key]}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Weekly Boss Materials */}
          <section className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <h3 className="font-bold text-yellow-900 mb-3">Weekly Boss Materials</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {(Object.keys(WEEKLY_BOSS_MATERIALS) as Array<keyof typeof WEEKLY_BOSS_MATERIALS>).map((key) => (
                <div key={key} className="bg-white rounded-lg p-3 border border-yellow-200 flex items-center gap-3">
                  <div className="text-2xl">{WEEKLY_BOSS_MATERIALS[key].icon}</div>
                  <div>
                    <div className="font-semibold text-gray-800">{WEEKLY_BOSS_MATERIALS[key].name}</div>
                    <div className="text-xs text-gray-600">Owned: {weeklyBossMaterials[key]}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Constellation Items */}
          <section className="bg-purple-50 border border-purple-300 rounded-xl p-4">
            <h3 className="font-bold text-purple-900 mb-3">⭐ Constellation Items</h3>
            {Object.keys(constellationItems).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(constellationItems).map(([baseId, count]) => {
                  const character = characterInventory.characters.find(c => 
                    (c.baseCharacterId || c.id) === baseId
                  );
                  return (
                    <div key={baseId} className="bg-white rounded-lg p-3 border border-purple-300 flex items-center gap-3">
                      <div className="text-2xl">{character?.icon || '⭐'}</div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800">{character?.name || baseId}</div>
                        <div className="text-xs text-gray-600">Constellation Items</div>
                      </div>
                      <div className="text-2xl font-bold text-purple-700">{count}</div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <div className="text-3xl mb-2">⭐</div>
                <p className="text-sm">No constellation items yet</p>
                <p className="text-xs mt-1">Pull duplicate characters to get constellation items!</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default InventoryModal;
