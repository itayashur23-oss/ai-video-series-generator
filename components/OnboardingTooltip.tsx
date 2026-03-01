import React, { useState, useEffect } from 'react';
import { translations } from '../translations';
import type { Language } from '../types';

const STORAGE_KEY = 'storystream_onboarded';

interface OnboardingTooltipProps {
  lang: Language;
}

const STEPS = [
  { titleKey: 'onboardingStep1Title', bodyKey: 'onboardingStep1Body', icon: '🎬' },
  { titleKey: 'onboardingStep2Title', bodyKey: 'onboardingStep2Body', icon: '🤖' },
  { titleKey: 'onboardingStep3Title', bodyKey: 'onboardingStep3Body', icon: '🎨' },
  { titleKey: 'onboardingStep4Title', bodyKey: 'onboardingStep4Body', icon: '🚀' },
] as const;

const OnboardingTooltip: React.FC<OnboardingTooltipProps> = ({ lang }) => {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  const t = translations[lang];
  const dir = lang === 'he' ? 'rtl' : 'ltr';

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
  };

  const next = () => {
    if (step < STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      dismiss();
    }
  };

  if (!visible) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" dir={dir}>
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl shadow-indigo-900/30 max-w-sm w-full mx-4 p-6 flex flex-col gap-4 animate-in fade-in zoom-in duration-300">

        {/* Step icon */}
        <div className="text-4xl text-center select-none">{current.icon}</div>

        {/* Title */}
        <h2 className="text-lg font-bold text-white text-center">
          {(t as any)[current.titleKey]}
        </h2>

        {/* Body */}
        <p className="text-sm text-slate-300 text-center leading-relaxed">
          {(t as any)[current.bodyKey]}
        </p>

        {/* Dot indicators */}
        <div className="flex justify-center gap-2 mt-1">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`w-2 h-2 rounded-full transition-all ${
                i === step ? 'bg-indigo-400 w-4' : 'bg-slate-600'
              }`}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="flex justify-between items-center mt-2 gap-2">
          <button
            onClick={dismiss}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors px-2 py-1"
          >
            {t.onboardingSkip}
          </button>
          <button
            onClick={next}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-all shadow-lg shadow-indigo-900/40"
          >
            {isLast ? t.onboardingFinish : t.onboardingNext}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTooltip;
