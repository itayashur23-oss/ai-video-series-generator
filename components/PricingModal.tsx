
import React, { useState } from 'react';
import { Language, PlanTier, User } from '../types';
import { translations } from '../translations';
import { Check, X, Star, Zap, Crown, Loader2, AlertTriangle, Coins, Gem } from 'lucide-react';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan: (plan: PlanTier) => Promise<void>;
  onBuyTokens?: (amount: number) => Promise<void>;
  currentUser: User | null;
  lang: Language;
}

const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose, onSelectPlan, onBuyTokens, currentUser, lang }) => {
  const [isYearly, setIsYearly] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<PlanTier | null>(null);
  const [loadingTokens, setLoadingTokens] = useState<number | null>(null);
  const t = translations[lang];

  if (!isOpen) return null;

  const features = {
    free: [t.feat1, t.feat2, t.feat3, t.feat4],
    pro: [t.feat6, t.feat7, t.feat8, t.feat9, t.feat5],
    studio: [t.feat10, t.feat8, t.feat9, t.feat11, t.feat12, t.feat13]
  };

  const handleSelect = async (tier: PlanTier) => {
    setLoadingPlan(tier);
    await onSelectPlan(tier);
    setLoadingPlan(null);
  };

  const handleBuyTokens = async (amount: number) => {
    if (onBuyTokens) {
        setLoadingTokens(amount);
        await onBuyTokens(amount);
        setLoadingTokens(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative w-full max-w-6xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* HEADER */}
        <div className="p-8 text-center bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800 sticky top-0 z-10 backdrop-blur-md bg-opacity-95">
             <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors rtl:right-auto rtl:left-4"
              >
                <X className="w-5 h-5" />
              </button>

            <h2 className="text-3xl font-bold text-white mb-2">{t.pricingTitle}</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">{t.pricingSubtitle}</p>
        </div>

        <div className="p-8 space-y-12">
            
            {/* DISCLAIMER / WARNING */}
            <div className="bg-amber-950/30 border border-amber-500/30 rounded-xl p-4 flex items-start gap-4">
                <div className="bg-amber-500/20 p-2 rounded-lg shrink-0">
                    <AlertTriangle className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                    <h4 className="text-amber-400 font-bold mb-1">{t.pricingDisclaimerTitle}</h4>
                    <p className="text-amber-200/80 text-sm leading-relaxed">
                        {t.pricingDisclaimerBody}
                    </p>
                </div>
            </div>

            {/* SUBSCRIPTION PLANS */}
            <div>
                <div className="flex items-center justify-center mb-8 gap-3">
                    <span className={`text-sm font-medium ${!isYearly ? 'text-white' : 'text-slate-500'}`}>{t.monthly}</span>
                    <button 
                        onClick={() => setIsYearly(!isYearly)}
                        className={`relative w-12 h-6 rounded-full transition-colors ${isYearly ? 'bg-indigo-500' : 'bg-slate-700'}`}
                    >
                        <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${isYearly ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                    <span className={`text-sm font-medium ${isYearly ? 'text-white' : 'text-slate-500'}`}>{t.yearly}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* FREE PLAN */}
                    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 flex flex-col hover:border-slate-600 transition-all">
                        <div className="mb-4">
                            <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                                <Star className="w-4 h-4 text-slate-400" /> {t.planFree}
                            </h3>
                            <div className="mt-2 flex items-baseline gap-1">
                                <span className="text-3xl font-bold text-white">{t.priceFree}</span>
                                <span className="text-sm text-slate-500">{t.perMonth}</span>
                            </div>
                        </div>
                        <ul className="space-y-3 mb-8 flex-1">
                            {features.free.map((feat, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                                    <Check className="w-4 h-4 text-slate-500 shrink-0" /> {feat}
                                </li>
                            ))}
                            <li className="flex items-center gap-2 text-sm text-slate-600 line-through decoration-slate-600">
                                <X className="w-4 h-4 shrink-0" /> {t.feat9}
                            </li>
                        </ul>
                        <button 
                            onClick={() => handleSelect('free')}
                            disabled={currentUser?.plan === 'free' || loadingPlan === 'free'}
                            className={`w-full py-3 rounded-lg font-bold text-sm transition-all border ${
                                currentUser?.plan === 'free' 
                                ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-default' 
                                : 'bg-slate-800 hover:bg-slate-700 text-white border-slate-600'
                            }`}
                        >
                            {loadingPlan === 'free' ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : (currentUser?.plan === 'free' ? t.currentPlan : t.selectPlan)}
                        </button>
                    </div>

                    {/* PRO PLAN */}
                    <div className="bg-slate-900 rounded-xl border-2 border-indigo-500 p-6 flex flex-col relative shadow-lg shadow-indigo-900/20 transform md:-translate-y-4">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
                            {t.mostPopular}
                        </div>
                        <div className="mb-4">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Zap className="w-4 h-4 text-indigo-400" /> {t.planPro}
                            </h3>
                            <div className="mt-2 flex items-baseline gap-1">
                                <span className="text-4xl font-bold text-white">{t.pricePro}</span>
                                <span className="text-sm text-slate-400">{t.perMonth}</span>
                            </div>
                        </div>
                        <ul className="space-y-3 mb-8 flex-1">
                            {features.pro.map((feat, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm text-white">
                                    <Check className="w-4 h-4 text-indigo-400 shrink-0" /> {feat}
                                </li>
                            ))}
                        </ul>
                        <button 
                            onClick={() => handleSelect('pro')}
                            disabled={currentUser?.plan === 'pro' || loadingPlan === 'pro'}
                            className={`w-full py-3 rounded-lg font-bold text-sm transition-all shadow-lg ${
                                currentUser?.plan === 'pro'
                                ? 'bg-indigo-900/50 text-indigo-300 border border-indigo-800 cursor-default'
                                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/50'
                            }`}
                        >
                            {loadingPlan === 'pro' ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : (currentUser?.plan === 'pro' ? t.currentPlan : t.selectPlan)}
                        </button>
                    </div>

                    {/* STUDIO PLAN */}
                    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 flex flex-col hover:border-slate-600 transition-all">
                        <div className="mb-4">
                            <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                                <Crown className="w-4 h-4 text-yellow-400" /> {t.planStudio}
                            </h3>
                            <div className="mt-2 flex items-baseline gap-1">
                                <span className="text-3xl font-bold text-white">{t.priceStudio}</span>
                                <span className="text-sm text-slate-500">{t.perMonth}</span>
                            </div>
                        </div>
                        <ul className="space-y-3 mb-8 flex-1">
                            {features.studio.map((feat, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                                    <Check className="w-4 h-4 text-yellow-500 shrink-0" /> {feat}
                                </li>
                            ))}
                        </ul>
                        <button 
                            onClick={() => handleSelect('studio')}
                            disabled={currentUser?.plan === 'studio' || loadingPlan === 'studio'}
                            className={`w-full py-3 rounded-lg font-bold text-sm transition-all border ${
                                currentUser?.plan === 'studio' 
                                ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-default' 
                                : 'bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white border-slate-600'
                            }`}
                        >
                            {loadingPlan === 'studio' ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : (currentUser?.plan === 'studio' ? t.currentPlan : t.selectPlan)}
                        </button>
                    </div>
                </div>
            </div>

            {/* TOKEN STORE */}
            <div className="border-t border-slate-800 pt-8">
                <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                        <Coins className="w-6 h-6 text-yellow-400" />
                        {t.tokenStoreTitle}
                    </h3>
                    <p className="text-slate-400">{t.tokenStoreSubtitle}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Small Pack */}
                    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 flex flex-col items-center text-center hover:bg-slate-800 transition-colors">
                        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 text-yellow-200">
                             <Coins className="w-8 h-8" />
                        </div>
                        <h4 className="text-white font-bold text-lg mb-1">{t.packSmall}</h4>
                        <span className="text-3xl font-bold text-white mb-2">100</span>
                        <span className="text-xs text-slate-500 mb-6">{t.tokens}</span>
                        
                        <div className="mt-auto w-full">
                            <p className="text-xs text-slate-400 mb-3">{t.tokenCost}</p>
                            <button 
                                onClick={() => handleBuyTokens(100)}
                                disabled={loadingTokens !== null}
                                className="w-full bg-slate-700 hover:bg-white hover:text-slate-900 text-white font-bold py-2 rounded-lg transition-colors"
                            >
                                {loadingTokens === 100 ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : `${t.buyFor} $15`}
                            </button>
                        </div>
                    </div>

                    {/* Medium Pack (Best Value) */}
                    <div className="bg-gradient-to-b from-indigo-900/40 to-slate-900 p-6 rounded-xl border border-indigo-500/30 flex flex-col items-center text-center relative hover:border-indigo-500 transition-colors">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-yellow-500 text-black text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                            BEST VALUE
                        </div>
                        <div className="w-16 h-16 bg-indigo-900/50 rounded-full flex items-center justify-center mb-4 text-indigo-200">
                             <Gem className="w-8 h-8" />
                        </div>
                        <h4 className="text-white font-bold text-lg mb-1">{t.packMedium}</h4>
                        <span className="text-3xl font-bold text-white mb-2">500</span>
                        <span className="text-xs text-slate-500 mb-6">{t.tokens}</span>
                        
                        <div className="mt-auto w-full">
                             <p className="text-xs text-slate-400 mb-3">{t.tokenCost}</p>
                            <button 
                                onClick={() => handleBuyTokens(500)}
                                disabled={loadingTokens !== null}
                                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-lg transition-colors shadow-lg shadow-indigo-900/50"
                            >
                                {loadingTokens === 500 ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : `${t.buyFor} $60`}
                            </button>
                        </div>
                    </div>

                     {/* Large Pack */}
                     <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 flex flex-col items-center text-center hover:bg-slate-800 transition-colors">
                        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 text-yellow-400">
                             <Crown className="w-8 h-8" />
                        </div>
                        <h4 className="text-white font-bold text-lg mb-1">{t.packLarge}</h4>
                        <span className="text-3xl font-bold text-white mb-2">1200</span>
                        <span className="text-xs text-slate-500 mb-6">{t.tokens}</span>
                        
                        <div className="mt-auto w-full">
                            <p className="text-xs text-slate-400 mb-3">{t.tokenCost}</p>
                            <button 
                                onClick={() => handleBuyTokens(1200)}
                                disabled={loadingTokens !== null}
                                className="w-full bg-slate-700 hover:bg-white hover:text-slate-900 text-white font-bold py-2 rounded-lg transition-colors"
                            >
                                {loadingTokens === 1200 ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : `${t.buyFor} $130`}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default PricingModal;
