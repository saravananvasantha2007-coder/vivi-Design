import React, { useEffect } from 'react';
import { useShop } from '../../context/ShopContext';
import { Sparkles, X } from 'lucide-react';

export const RealtimeNotification: React.FC = () => {
  const { recentLiveUpdate, clearLiveUpdateToast } = useShop();

  useEffect(() => {
    if (recentLiveUpdate) {
      const timer = setTimeout(() => {
        clearLiveUpdateToast();
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [recentLiveUpdate, clearLiveUpdateToast]);

  if (!recentLiveUpdate) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-short">
      <div className="bg-brown-900/95 text-champagne-100 border border-champagne-400/50 shadow-2xl backdrop-blur-md px-4 py-3 rounded-2xl flex items-center space-x-3 max-w-sm">
        <div className="w-8 h-8 rounded-full bg-champagne-400/20 text-champagne-300 flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4 animate-spin-slow" />
        </div>
        <div className="flex-1 text-xs leading-snug">
          <p className="font-semibold text-champagne-300">Live Catalogue Update</p>
          <p className="text-cream-200 mt-0.5 line-clamp-2">{recentLiveUpdate}</p>
        </div>
        <button
          onClick={clearLiveUpdateToast}
          className="text-cream-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
