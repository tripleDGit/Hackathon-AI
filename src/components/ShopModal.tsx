import { useState } from 'react';
import { DUST_SHOP_ITEMS, POINTS_SHOP_ITEMS, purchaseShopItem } from '@/services/shop.service';
import { getGachaCurrency } from '@/services/character.service';
import { loadUserProgress } from '@/services/missions.service';

interface ShopModalProps {
  onClose: () => void;
  onPurchase?: () => void;
}

const ShopModal: React.FC<ShopModalProps> = ({ onClose, onPurchase }) => {
  const [activeTab, setActiveTab] = useState<'dust' | 'points'>('dust');
  const [currency, setCurrency] = useState(getGachaCurrency());
  const [points, setPoints] = useState(loadUserProgress().totalPoints);

  const handlePurchase = (itemId: string) => {
    const result = purchaseShopItem(itemId);
    
    if (result.success) {
      // Refresh currency and points
      setCurrency(getGachaCurrency());
      setPoints(loadUserProgress().totalPoints);
      onPurchase?.();
      alert(`✅ Purchased: ${result.reward}`);
    } else {
      alert(`❌ ${result.error}`);
    }
  };

  const items = activeTab === 'dust' ? DUST_SHOP_ITEMS : POINTS_SHOP_ITEMS;
  const currentCurrency = activeTab === 'dust' ? (currency.constellationDust || 0) : points;

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-[10000]">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full relative z-10 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-6 text-white flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">🏪 Shop</h2>
            <p className="text-amber-100 text-sm">Exchange resources for valuable items</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50">
          <button
            onClick={() => setActiveTab('dust')}
            className={`flex-1 py-4 px-6 font-semibold transition-all ${
              activeTab === 'dust'
                ? 'bg-white text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <span>✨</span>
              <span>Constellation Dust</span>
            </div>
            <div className="text-sm font-normal mt-1">
              Balance: <span className="font-bold">{currency.constellationDust || 0}</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('points')}
            className={`flex-1 py-4 px-6 font-semibold transition-all ${
              activeTab === 'points'
                ? 'bg-white text-emerald-600 border-b-2 border-emerald-600'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <span>⭐</span>
              <span>Game Points</span>
            </div>
            <div className="text-sm font-normal mt-1">
              Balance: <span className="font-bold">{points}</span>
            </div>
          </button>
        </div>

        {/* Shop Items */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => {
              const canAfford = currentCurrency >= item.cost;
              
              return (
                <div
                  key={item.id}
                  className={`bg-gradient-to-br rounded-xl p-4 border-2 transition-all ${
                    canAfford
                      ? activeTab === 'dust'
                        ? 'from-purple-50 to-indigo-50 border-purple-300 hover:shadow-lg'
                        : 'from-emerald-50 to-teal-50 border-emerald-300 hover:shadow-lg'
                      : 'from-gray-50 to-gray-100 border-gray-300 opacity-60'
                  }`}
                >
                  <div className="text-center mb-3">
                    <div className="text-5xl mb-2">{item.icon}</div>
                    <h3 className="font-bold text-gray-800 mb-1">{item.name}</h3>
                    <p className="text-xs text-gray-600">{item.description}</p>
                  </div>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm text-gray-700">
                      <span className="font-semibold">Cost:</span>
                    </div>
                    <div className={`font-bold ${canAfford ? 'text-green-600' : 'text-red-600'}`}>
                      {item.cost} {activeTab === 'dust' ? '✨' : '⭐'}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handlePurchase(item.id)}
                    disabled={!canAfford}
                    className={`w-full py-2 px-4 rounded-lg font-bold transition-all ${
                      canAfford
                        ? activeTab === 'dust'
                          ? 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white'
                          : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {canAfford ? '🛒 Purchase' : '❌ Insufficient'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopModal;
