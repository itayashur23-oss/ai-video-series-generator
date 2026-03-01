
import React, { useEffect, useState } from 'react';
import { Language } from '../types';
import { translations } from '../translations';
import { fetchTrendingInsights, TrendingResult, TrendItem } from '../services/geminiService';
import { Flame, X, RefreshCw, ExternalLink, ArrowLeft, ArrowRight, Loader2, Check } from 'lucide-react';

interface TrendingModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onSelectTrend: (text: string) => void;
}

const TrendingModal: React.FC<TrendingModalProps> = ({ isOpen, onClose, lang, onSelectTrend }) => {
  const [data, setData] = useState<TrendingResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const t = translations[lang];

  const loadTrends = async () => {
    setIsLoading(true);
    try {
      const result = await fetchTrendingInsights(lang);
      setData(result);
    } catch (error) {
      console.error("Failed to fetch trends", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !data) {
      loadTrends();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUseTrend = (trend: TrendItem, idx: number) => {
    const text = `${trend.title}: ${trend.description}`;
    onSelectTrend(text);
    setCopiedId(idx);
    setTimeout(() => {
        setCopiedId(null);
        onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-red-950 to-slate-900 border-b border-red-900/30 flex justify-between items-start">
            <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Flame className="w-6 h-6 text-red-500 animate-pulse" />
                    {t.trendingTitle}
                </h2>
                <p className="text-red-200/60 text-sm mt-1">
                    {t.trendingSubtitle}
                </p>
            </div>
            <button 
                onClick={onClose}
                className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
            >
                <X className="w-5 h-5" />
            </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-red-500" />
                    <p>{t.generatingIdea}</p>
                </div>
            ) : data && data.trends.length > 0 ? (
                <div className="space-y-4">
                    {data.trends.map((trend, idx) => (
                        <div key={idx} className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 hover:border-red-900/50 transition-all flex flex-col gap-3 group">
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex-1">
                                    <h3 className="font-bold text-indigo-300 text-lg mb-2">{trend.title}</h3>
                                    <p className="text-slate-300 text-sm leading-relaxed">{trend.description}</p>
                                </div>
                                <button
                                    onClick={() => handleUseTrend(trend, idx)}
                                    className={`shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-all shadow-lg ${
                                        copiedId === idx 
                                        ? 'bg-green-600 text-white' 
                                        : 'bg-slate-800 text-slate-300 hover:bg-red-600 hover:text-white'
                                    }`}
                                >
                                    {copiedId === idx ? <Check className="w-4 h-4" /> : (lang === 'he' ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />)}
                                    <span className="hidden sm:inline">{copiedId === idx ? t.copyTrendSuccess : t.selectTrend}</span>
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* Sources */}
                    {data.sources.length > 0 && (
                        <div className="pt-4 border-t border-slate-800 mt-6">
                             <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <ExternalLink className="w-3 h-3" />
                                {t.sources}
                             </h4>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {data.sources.slice(0, 6).map((source, idx) => (
                                    <a 
                                        key={idx}
                                        href={source.uri}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 transition-colors text-xs text-indigo-300 hover:text-indigo-200 truncate"
                                    >
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-600 shrink-0" />
                                        <span className="truncate">{source.title || source.uri}</span>
                                    </a>
                                ))}
                             </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center text-slate-500 py-10">
                    Failed to load trends.
                </div>
            )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/95 flex items-center justify-between gap-4">
            <button 
                onClick={loadTrends}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors"
            >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                {t.refreshTrends}
            </button>
        </div>
      </div>
    </div>
  );
};

export default TrendingModal;
