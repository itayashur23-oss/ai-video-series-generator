
import React, { useState, useEffect } from 'react';
import { CameraAngle, Episode, SeriesConfig, VisualStyle, Genre, SavedSeries, Language, Character, TargetEngine, User, PlanTier, Scene } from './types';
import SetupForm from './components/SetupForm';
import EpisodeCard from './components/EpisodeCard';
import HistoryPanel from './components/HistoryPanel';
import PricingModal from './components/PricingModal';
import AuthModal from './components/AuthModal';
import TrendingModal from './components/TrendingModal';
import ApiKeyModal from './components/ApiKeyModal';
import ErrorBoundary from './components/ErrorBoundary';
import OnboardingTooltip from './components/OnboardingTooltip';
import { generateSeriesStructureStream, generateEpisodeVideo, generateSceneImage, generateSceneAudio, extractImagePrompt, API_KEY_STORAGE } from './services/geminiService';
import { onAuthChange, getCurrentSession, signOut as supabaseSignOut, supabaseUserToAppUser, saveUserPrefs } from './services/supabaseService';
import { Film, Sparkles, Key, History, Globe, User as UserIcon, LogOut, CreditCard, Coins, Flame, CheckCircle, XCircle } from 'lucide-react';
import { translations } from './translations';

const HISTORY_KEY = 'storystream_history';

// Strips heavy binary fields (base64 images, blob URLs) from scenes before
// persisting to localStorage. Text data (prompts, dialogue) is always kept.
const stripForStorage = (item: SavedSeries): SavedSeries => ({
  ...item,
  episodes: item.episodes.map(ep => ({
    ...ep,
    scenes: ep.scenes.map(sc => ({
      ...sc,
      startImage: undefined,
      startImageMimeType: undefined,
      lastFrame: undefined,
      lastFrameMimeType: undefined,
      videoUrl: undefined,
      audioUrl: undefined,
    }))
  }))
});

const App: React.FC = () => {
  const [config, setConfig] = useState<SeriesConfig>({
    topic: '',
    genre: Genre.SciFi,
    targetEngine: TargetEngine.Veo,
    contentLanguage: 'he',
    episodeCount: 1,
    scenesPerEpisode: 3,
    style: VisualStyle.Cinematic,
    camera: CameraAngle.Wide,
    aspectRatio: '16:9',
    videoDuration: 5,
    includeDialogue: false,
    embedDialogueInPrompt: false, 
    showSubtitles: false, 
    characters: [{ id: '1', name: '', description: '' }],
    characterInstructions: '',
    negativePrompt: '',
    colorPalette: [],
    sceneMood: ''
  });

  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [previousEpisodesContext, setPreviousEpisodesContext] = useState<Episode[] | undefined>(undefined);
  const [loadingStep, setLoadingStep] = useState<string | null>(null);
  const [history, setHistory] = useState<SavedSeries[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isTrendingOpen, setIsTrendingOpen] = useState(false);
  const [isApiKeyOpen, setIsApiKeyOpen] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(() => !!localStorage.getItem(API_KEY_STORAGE));
  const [lang, setLang] = useState<Language>('he');
  const [user, setUser] = useState<User | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);

  const t = translations[lang];

  useEffect(() => {
    document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY);
      if (saved) setHistory(JSON.parse(saved));
    } catch (e) {
      console.error("Failed to load local storage", e);
    }
    // Restore Supabase session on mount (handles page refresh + OAuth redirect)
    getCurrentSession().then(session => {
      if (session?.user) setUser(supabaseUserToAppUser(session.user));
    });
  }, []);

  // Listen to auth state changes (sign-in, sign-out, Google OAuth redirect)
  useEffect(() => {
    const unsubscribe = onAuthChange((_event, sbUser) => {
      if (sbUser) {
        setUser(supabaseUserToAppUser(sbUser));
        setIsAuthOpen(false);
      } else {
        setUser(null);
      }
    });
    return unsubscribe;
  }, []);

  const saveToHistory = (newConfig: SeriesConfig, newEpisodes: Episode[]) => {
    try {
      const fullEpisodes = previousEpisodesContext ? [...previousEpisodesContext, ...newEpisodes] : newEpisodes;
      const newItem: SavedSeries = {
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        config: newConfig,
        episodes: fullEpisodes
      };
      const newHistory = [newItem, ...history];
      if (newHistory.length > 50) newHistory.pop();
      setHistory(newHistory);
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory.map(stripForStorage)));
      } catch {
        // If storage is still full after stripping, silently ignore — state is still updated
      }
    } catch (e) {
      console.error("Failed to save history", e);
    }
  };

  const deleteFromHistory = (id: string) => {
    const newHistory = history.filter(item => item.id !== id);
    setHistory(newHistory);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
  };

  const handleImportHistory = (newlyImported: SavedSeries[]) => {
    setHistory(prevHistory => {
      // Create a map of existing IDs for quick lookup
      const existingIds = new Set(prevHistory.map(item => item.id));
      
      // Filter out items that are already in history
      const uniqueNewItems = newlyImported.filter(item => !existingIds.has(item.id));
      
      // Merge and sort by creation date descending
      const mergedHistory = [...uniqueNewItems, ...prevHistory].sort((a, b) => b.createdAt - a.createdAt);
      
      // Limit total items (e.g., 100)
      const finalHistory = mergedHistory.slice(0, 100);

      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(finalHistory.map(stripForStorage)));
      } catch {
        // Storage quota exceeded — try saving just the newest 20 items
        try {
          localStorage.setItem(HISTORY_KEY, JSON.stringify(finalHistory.slice(0, 20).map(stripForStorage)));
        } catch { /* ignore */ }
      }
      return finalHistory;
    });
  };

  const loadFromHistory = (item: SavedSeries) => {
    setConfig(item.config);
    setEpisodes(item.episodes);
    setPreviousEpisodesContext(undefined);
    setIsHistoryOpen(false);
  };

  const handleContinueSeries = (item: SavedSeries) => {
      const oldConfig = { ...item.config };
      setEpisodes([]);
      setPreviousEpisodesContext(item.episodes);
      const currentTopic = oldConfig.topic;
      const continuationPrefix = lang === 'he' ? "המשך לעלילה קודמת: " : "Continuation of: ";
      const cleanTopic = currentTopic.startsWith(continuationPrefix) ? currentTopic : `${continuationPrefix}${currentTopic}`;
      setConfig({ ...oldConfig, topic: cleanTopic });
      setIsHistoryOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
      supabaseSignOut(); // fire-and-forget; onAuthChange will clear state
      setUser(null);
  };

  const handleUpdatePlan = async (tier: PlanTier) => {
      if (!user) { setIsAuthOpen(true); return; }
      await new Promise(resolve => setTimeout(resolve, 1000));
      const updatedUser = { ...user, plan: tier };
      setUser(updatedUser);
      saveUserPrefs(updatedUser);
      setIsPricingOpen(false);
  };

  const handleBuyTokens = async (amount: number) => {
      if (!user) { setIsAuthOpen(true); return; }
      await new Promise(resolve => setTimeout(resolve, 1500));
      const updatedUser = { ...user, tokens: (user.tokens || 0) + amount };
      setUser(updatedUser);
      saveUserPrefs(updatedUser);
      alert(`${amount} Tokens purchased!`);
  };

  const handleSelectTrend = (text: string) => {
      setConfig(prev => ({ ...prev, topic: text, genre: Genre.Documentary }));
      setPreviousEpisodesContext(undefined);
  };

  const handleCreatePlan = async () => {
    setLoadingStep('creating_plan');
    setEpisodes([]);
    let finalEpisodes: Episode[] = [];
    
    try {
      const stream = generateSeriesStructureStream(config, lang, previousEpisodesContext);
      let cumulativeText = "";

      for await (const chunk of stream) {
          cumulativeText = chunk;
          try {
              // Clean text of potential markdown code blocks
              let cleaned = cumulativeText.replace(/```json|```/g, '').trim();
              
              // Find first '[' and last ']' to extract the actual JSON array
              const firstIndex = cleaned.indexOf('[');
              const lastIndex = cleaned.lastIndexOf(']');
              
              if (firstIndex !== -1 && lastIndex !== -1 && lastIndex > firstIndex) {
                  const jsonSubString = cleaned.substring(firstIndex, lastIndex + 1);
                  const parsed = JSON.parse(jsonSubString);
                  if (Array.isArray(parsed)) {
                      const processed = parsed.map((ep: any) => ({
                          ...ep,
                          scenes: ep.scenes.map((s: any) => ({ ...s, status: s.status || 'pending' }))
                      }));
                      setEpisodes(processed);
                      finalEpisodes = processed;
                  }
              }
          } catch (e) {
              // Partial JSON, ignore
          }
      }

      if (finalEpisodes.length > 0) {
          saveToHistory(config, finalEpisodes);
      } else {
          throw new Error("Failed to generate structure: Invalid or empty output from model.");
      }
    } catch (error: any) {
      console.error("Generation error:", error);
      const errorStr = JSON.stringify(error).toLowerCase();
      if (errorStr.includes('quota') || errorStr.includes('resource_exhausted') || errorStr.includes('429')) {
          alert(t.quotaExceeded);
      } else {
          alert(t.errorGeneral);
      }
    } finally {
      setLoadingStep(null);
    }
  };

  const handleUpdateScene = (episodeId: number, sceneId: number, updates: Partial<Scene>) => {
    setEpisodes(prev => prev.map(ep => {
        if (ep.id !== episodeId) return ep;
        return { ...ep, scenes: ep.scenes.map(s => s.id === sceneId ? { ...s, ...updates } : s) };
    }));
  };

  const handleGenerateSceneImage = async (episodeId: number, sceneId: number) => {
      const episode = episodes.find(e => e.id === episodeId);
      if (!episode) return;
      const scene = episode.scenes.find(s => s.id === sceneId);
      if (!scene || scene.status === 'generating_image') return;

      // Extract the [IMG]...[/IMG] static block from visualPrompt (no extra API call)
      const promptToUse = extractImagePrompt(scene.visualPrompt);

      handleUpdateScene(episodeId, sceneId, { status: 'generating_image' });
      try {
          const { data, mimeType } = await generateSceneImage(promptToUse, config.aspectRatio, config.characters);
          handleUpdateScene(episodeId, sceneId, { status: 'pending', startImage: data, startImageMimeType: mimeType });
      } catch (error: any) {
          const errorStr = JSON.stringify(error).toLowerCase();
          const errorMsg = (errorStr.includes('quota') || errorStr.includes('resource_exhausted')) ? t.quotaExceeded : "Failed to generate image";
          handleUpdateScene(episodeId, sceneId, { status: 'failed', error: errorMsg });
      }
  };

  const handleGenerateAudio = async (episodeId: number, sceneId: number) => {
      const episode = episodes.find(e => e.id === episodeId);
      if (!episode) return;
      const scene = episode.scenes.find(s => s.id === sceneId);
      if (!scene || !scene.dialogue || scene.status === 'generating_audio') return;

      handleUpdateScene(episodeId, sceneId, { status: 'generating_audio' });
      try {
          const firstCharVoice = config.characters.find(c => c.voiceName)?.voiceName;
          const audioUrl = await generateSceneAudio(scene.dialogue, config.contentLanguage, firstCharVoice);
          handleUpdateScene(episodeId, sceneId, { status: 'pending', audioUrl });
      } catch (error: any) {
          const errorStr = JSON.stringify(error).toLowerCase();
          const errorMsg = (errorStr.includes('quota') || errorStr.includes('resource_exhausted')) ? t.quotaExceeded : "Failed to generate audio";
          handleUpdateScene(episodeId, sceneId, { status: 'failed', error: errorMsg });
      }
  };

  const handleGenerateAllAudioForEpisode = async (episodeId: number) => {
    const episode = episodes.find(e => e.id === episodeId);
    if (!episode) return;
    for (const scene of episode.scenes) {
      if (scene.dialogue && !scene.audioUrl && scene.status !== 'generating_audio') {
        await handleGenerateAudio(episodeId, scene.id);
      }
    }
  };

  const handleGenerateVideo = async (episodeId: number, sceneId: number) => {
    if (!user && history.length >= 2) { setIsAuthOpen(true); return; }
    if (user && user.tokens < 10) { setIsPricingOpen(true); return; }

    const episode = episodes.find(e => e.id === episodeId);
    if (!episode) return;
    const scene = episode.scenes.find(s => s.id === sceneId);
    if (!scene) return;

    handleUpdateScene(episodeId, sceneId, { status: 'generating', error: undefined });

    try {
      const characterImages = config.characters
        .filter(c => c.image && c.imageMimeType)
        .map(c => ({ data: c.image!, mimeType: c.imageMimeType! }));

      let startImageContext = undefined;
      if (scene.startImage && scene.startImageMimeType) {
          startImageContext = { data: scene.startImage, mimeType: scene.startImageMimeType };
      } else if (config.startImage && config.startImageMimeType) {
          startImageContext = { data: config.startImage, mimeType: config.startImageMimeType };
      }

      // Check for last frame (continuity)
      let lastFrameContext = undefined;
      if (scene.lastFrame && scene.lastFrameMimeType) {
          lastFrameContext = { data: scene.lastFrame, mimeType: scene.lastFrameMimeType };
      }

      const promptToUse = (config.contentLanguage === 'he' && scene.hebrewVisualPrompt) ? scene.hebrewVisualPrompt : scene.visualPrompt;

      // Start video generation
      const videoUrlPromise = generateEpisodeVideo(
        promptToUse,
        config.aspectRatio,
        config.videoDuration,
        () => {},
        lang,
        characterImages,
        startImageContext,
        lastFrameContext
      );

      // Start audio generation if needed and doesn't already exist
      let audioUrl: string | undefined = scene.audioUrl;
      if (config.includeDialogue && scene.dialogue && !audioUrl) {
          const firstCharVoice = config.characters.find(c => c.voiceName)?.voiceName;
          audioUrl = await generateSceneAudio(scene.dialogue, config.contentLanguage, firstCharVoice);
      }

      const videoUrl = await videoUrlPromise;

      if (user) {
          const updatedUser = { ...user, tokens: Math.max(0, user.tokens - 10) };
          setUser(updatedUser);
          saveUserPrefs(updatedUser);
      }

      handleUpdateScene(episodeId, sceneId, { status: 'completed', videoUrl, audioUrl });
      
      const currentEpisodes = episodes.map(ep => ep.id === episodeId 
        ? {...ep, scenes: ep.scenes.map(s => s.id === sceneId ? {...s, videoUrl, audioUrl, status: 'completed' as const} : s)} 
        : ep
      );
      saveToHistory(config, currentEpisodes);

    } catch (error: any) {
      const errorStr = JSON.stringify(error).toLowerCase();
      const errorMsg = (errorStr.includes('quota') || errorStr.includes('resource_exhausted')) ? t.quotaExceeded : (error.message || t.errorGenVideo);
      handleUpdateScene(episodeId, sceneId, { status: 'failed', error: errorMsg });
    }
  };

  const handleChangeKey = () => {
    setIsApiKeyOpen(true);
  };

  const toggleLanguage = () => setLang(prev => prev === 'he' ? 'en' : 'he');

  return (
    <ErrorBoundary>
    <OnboardingTooltip lang={lang} />
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} lang={lang} />
      <PricingModal isOpen={isPricingOpen} onClose={() => setIsPricingOpen(false)} onSelectPlan={handleUpdatePlan} onBuyTokens={handleBuyTokens} currentUser={user} lang={lang} />
      <TrendingModal isOpen={isTrendingOpen} onClose={() => setIsTrendingOpen(false)} lang={lang} onSelectTrend={handleSelectTrend} />
      <ApiKeyModal isOpen={isApiKeyOpen} onClose={() => setIsApiKeyOpen(false)} lang={lang} onKeyChange={setHasApiKey} />

      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40">
        <div className="w-full px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-900/50">
                <Film className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white hidden sm:block">
              {t.appTitle} <span className="text-indigo-400 font-light">AI</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
             <button onClick={toggleLanguage} className="text-slate-300 hover:text-white text-sm flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors">
                <Globe className="w-4 h-4" />
                <span>{lang === 'he' ? 'EN' : 'עב'}</span>
              </button>
             <div className="h-6 w-px bg-slate-700 mx-1"></div>
             <button onClick={() => setIsTrendingOpen(true)} className="text-red-400 hover:text-white text-sm flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-900/30 transition-colors border border-transparent hover:border-red-500/30">
                <Flame className="w-4 h-4" />
                <span className="hidden sm:inline">{t.trendingBtn}</span>
              </button>
             <button onClick={() => setIsHistoryOpen(true)} className="text-slate-300 hover:text-white text-sm flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors">
                <History className="w-4 h-4" />
                <span className="hidden sm:inline">{t.historyBtn}</span>
              </button>
              <div className="h-6 w-px bg-slate-700 mx-1"></div>
              {user ? (
                  <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 bg-slate-800 rounded-full px-3 py-1 border border-slate-700 mx-1 cursor-pointer hover:bg-slate-700 transition-colors" onClick={() => setIsPricingOpen(true)}>
                          <Coins className="w-3 h-3 text-yellow-400" />
                          <span className="text-xs font-bold text-yellow-100">{user.tokens}</span>
                      </div>
                      <div className="flex flex-col items-end mr-2 rtl:mr-0 rtl:ml-2">
                           <span className="text-xs text-slate-400 font-bold">{user.name}</span>
                           <button onClick={() => setIsPricingOpen(true)} className="text-[10px] bg-indigo-900/50 text-indigo-300 px-1.5 rounded border border-indigo-500/30 uppercase hover:bg-indigo-900 transition-colors">
                            {user.plan === 'free' ? t.planFree : user.plan === 'pro' ? t.planPro : t.planStudio}
                           </button>
                      </div>
                      <button onClick={handleLogout} className="p-2 hover:bg-red-900/20 text-slate-400 hover:text-red-400 rounded-full transition-colors">
                          <LogOut className="w-4 h-4" />
                      </button>
                  </div>
              ) : (
                  <button onClick={() => setIsAuthOpen(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold px-4 py-2 rounded-lg shadow-lg shadow-indigo-900/30 transition-all flex items-center gap-2">
                      <UserIcon className="w-4 h-4" />
                      <span className="hidden sm:inline">{t.loginBtn}</span>
                  </button>
              )}
              <div className="h-6 w-px bg-slate-700 mx-1"></div>
              <button
                onClick={handleChangeKey}
                title={hasApiKey ? (lang === 'he' ? 'מפתח API שמור — לחץ לשינוי' : 'API key saved — click to change') : (lang === 'he' ? 'לא הוגדר מפתח API' : 'No API key set')}
                className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-colors text-xs ${
                  hasApiKey
                    ? 'text-emerald-400 hover:bg-emerald-900/20 hover:text-emerald-300'
                    : 'text-red-400 hover:bg-red-900/20 hover:text-red-300 animate-pulse'
                }`}
              >
                <Key className="w-3.5 h-3.5" />
                {hasApiKey
                  ? <CheckCircle className="w-3 h-3" />
                  : <XCircle className="w-3 h-3" />
                }
              </button>
          </div>
        </div>
      </header>

      <HistoryPanel 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
        history={history} 
        onLoad={loadFromHistory} 
        onContinue={handleContinueSeries} 
        onDelete={deleteFromHistory} 
        onImportHistory={handleImportHistory}
        lang={lang} 
      />

      <main className="w-full px-6 py-8 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-8">
          <div className="space-y-6">
            {previousEpisodesContext && (
                <div className="bg-indigo-950/40 border border-indigo-500/30 p-4 rounded-xl flex items-start gap-3 animate-in slide-in-from-top-4">
                    <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-1" />
                    <div>
                        <h4 className="text-sm font-bold text-indigo-200">{t.sequelModeTitle}</h4>
                        <p className="text-xs text-indigo-300/80">{lang === 'he' ? `ממשיך עלילה עם ${previousEpisodesContext.length} פרקים קודמים כהקשר.` : `Continuing story with ${previousEpisodesContext.length} existing episodes as context.`}</p>
                        <button onClick={() => setPreviousEpisodesContext(undefined)} className="text-[10px] underline mt-2 text-indigo-400 hover:text-white">{t.cancelSequel}</button>
                    </div>
                </div>
            )}
            <SetupForm config={config} setConfig={setConfig} onSubmit={handleCreatePlan} isLoading={loadingStep === 'creating_plan'} lang={lang} />
            <div className="bg-indigo-900/20 border border-indigo-900/50 p-4 rounded-xl">
                <h4 className="flex items-center gap-2 text-indigo-300 font-bold mb-2">
                    <Sparkles className="w-4 h-4" />
                    {t.tipTitle}
                </h4>
                <p className="text-sm text-indigo-200/70">{t.tipBody}</p>
            </div>
          </div>

          <div className="space-y-6">
            {episodes.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-20 bg-slate-900/30 rounded-3xl border border-dashed border-slate-800 text-slate-500">
                <Film className="w-16 h-16 mb-4 opacity-20" />
                <h3 className="text-xl font-medium">{t.noEpisodesTitle}</h3>
                <p>{t.noEpisodesBody}</p>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white">{t.episodeList}</h2>
                    <span className="text-slate-400 text-sm">{episodes.length} {t.planned}</span>
                </div>
                <div className="space-y-4">
                  {episodes.map((ep) => (
                    <EpisodeCard 
                        key={ep.id} 
                        episode={ep} 
                        config={config} 
                        onGenerate={handleGenerateVideo} 
                        onGenerateImage={handleGenerateSceneImage} 
                        onGenerateAudio={handleGenerateAudio}
                        onGenerateAllAudio={handleGenerateAllAudioForEpisode}
                        onUpdateScene={handleUpdateScene} 
                        lang={lang} 
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="w-full text-center py-6 text-slate-500 text-xs border-t border-slate-900 bg-slate-950">
          <p>{t.footerCredit}</p>
      </footer>
    </div>
    </ErrorBoundary>
  );
};

export default App;
