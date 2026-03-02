
import React, { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, Check, X, Shield, Trash2, ExternalLink } from 'lucide-react';
import { Language } from '../types';
import { API_KEY_STORAGE, VIDEO_API_KEY_STORAGE } from '../services/geminiService';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onKeyChange?: (hasKey: boolean) => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, lang, onKeyChange }) => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [videoApiKey, setVideoApiKey] = useState('');
  const [showVideoKey, setShowVideoKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [hasKey, setHasKey] = useState(false);

  const isHe = lang === 'he';

  useEffect(() => {
    if (isOpen) {
      const stored = localStorage.getItem(API_KEY_STORAGE) || '';
      const storedVideo = localStorage.getItem(VIDEO_API_KEY_STORAGE) || '';
      setApiKey(stored);
      setVideoApiKey(storedVideo);
      setHasKey(!!stored);
      setSaved(false);
      setShowKey(false);
      setShowVideoKey(false);
    }
  }, [isOpen]);

  const handleSave = () => {
    const trimmed = apiKey.trim();
    if (trimmed) {
      localStorage.setItem(API_KEY_STORAGE, trimmed);
      if (videoApiKey.trim()) {
        localStorage.setItem(VIDEO_API_KEY_STORAGE, videoApiKey.trim());
      } else {
        localStorage.removeItem(VIDEO_API_KEY_STORAGE);
      }
      setHasKey(true);
      setSaved(true);
      onKeyChange?.(true);
      setTimeout(() => {
        setSaved(false);
        onClose();
      }, 1200);
    }
  };

  const handleClear = () => {
    localStorage.removeItem(API_KEY_STORAGE);
    localStorage.removeItem(VIDEO_API_KEY_STORAGE);
    setApiKey('');
    setVideoApiKey('');
    setHasKey(false);
    onKeyChange?.(false);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 space-y-5"
        dir={isHe ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-500/20 p-2.5 rounded-xl">
              <Key className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <h2 className="font-bold text-white text-lg leading-tight">
                {isHe ? 'מפתח Google Gemini API' : 'Google Gemini API Key'}
              </h2>
              <p className="text-xs text-slate-400">
                {isHe ? 'נשמר בדפדפן בלבד — לא נשלח לשרת' : 'Stored in browser only — never sent to any server'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status indicator */}
        <div
          className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border transition-colors ${
            hasKey
              ? 'bg-emerald-900/30 border-emerald-500/30 text-emerald-300'
              : 'bg-red-900/20 border-red-500/20 text-red-400'
          }`}
        >
          <Shield className="w-4 h-4 shrink-0" />
          <span>
            {hasKey
              ? (isHe ? '✓ מפתח שמור בצורה מאובטחת בדפדפן' : '✓ Key saved securely in browser')
              : (isHe ? '✗ אין מפתח — האפליקציה לא תפעל' : '✗ No key — the app will not function')}
          </span>
        </div>

        {/* Primary API Key */}
        <div className="space-y-2">
          <label className="text-sm text-slate-300 font-medium flex items-center gap-2">
            <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded">{isHe ? 'פרומפטים / טקסט' : 'Prompts / Text'}</span>
            {isHe ? 'מפתח API ראשי' : 'Primary API Key'}
          </label>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="AIza..."
              dir="ltr"
              className={`w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all ${isHe ? 'pr-4 pl-12' : 'pl-4 pr-12'}`}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
            />
            <button
              onClick={() => setShowKey(s => !s)}
              className={`absolute top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-1 ${isHe ? 'left-3' : 'right-3'}`}
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <a
            href="https://aistudio.google.com/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            {isHe ? 'קבל מפתח חינמי ב-Google AI Studio' : 'Get a free key at Google AI Studio'}
          </a>
        </div>

        {/* Video API Key */}
        <div className="space-y-2">
          <label className="text-sm text-slate-300 font-medium flex items-center gap-2">
            <span className="bg-purple-500/20 text-purple-300 text-[10px] font-bold px-2 py-0.5 rounded">{isHe ? 'יצירת וידאו' : 'Video Generation'}</span>
            {isHe ? 'מפתח API לוידאו' : 'Video API Key'}
          </label>
          <div className="relative">
            <input
              type={showVideoKey ? 'text' : 'password'}
              value={videoApiKey}
              onChange={e => setVideoApiKey(e.target.value)}
              placeholder={isHe ? 'AIza... (ריק = שימוש במפתח הראשי)' : 'AIza... (empty = use primary key)'}
              dir="ltr"
              className={`w-full bg-slate-800 border border-purple-800/40 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all ${isHe ? 'pr-4 pl-12' : 'pl-4 pr-12'}`}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
            />
            <button
              onClick={() => setShowVideoKey(s => !s)}
              className={`absolute top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-1 ${isHe ? 'left-3' : 'right-3'}`}
            >
              {showVideoKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-[11px] text-slate-500">
            {isHe ? '💡 אם ריק — המפתח הראשי ישמש גם לוידאו' : '💡 If empty — primary key is used for video too'}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={!apiKey.trim()}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/30"
          >
            {saved ? (
              <>
                <Check className="w-4 h-4" />
                {isHe ? 'נשמר!' : 'Saved!'}
              </>
            ) : (
              <>
                <Key className="w-4 h-4" />
                {isHe ? 'שמור מפתח' : 'Save Key'}
              </>
            )}
          </button>
          {hasKey && (
            <button
              onClick={handleClear}
              className="px-4 py-3 bg-red-900/30 hover:bg-red-900/50 text-red-400 hover:text-red-300 rounded-xl border border-red-500/30 transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              {isHe ? 'מחק' : 'Clear'}
            </button>
          )}
        </div>

        {/* Security note */}
        <p className="text-xs text-slate-500 text-center leading-relaxed">
          {isHe
            ? '🔒 המפתח לא מוטמע בקוד המקור ולא נשלח לשרת חיצוני. הוא זמין בדפדפן זה בלבד.'
            : '🔒 Your key is never embedded in source code or transmitted to any external server. It lives in this browser only.'}
        </p>
      </div>
    </div>
  );
};

export default ApiKeyModal;
