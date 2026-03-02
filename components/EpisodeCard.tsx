
import { Episode, Language, Scene, SeriesConfig, Character } from '../types';
import { translations } from '../translations';
import { Play, Loader2, AlertCircle, Wand2, Copy, Check, Languages, MessageSquareQuote, Terminal, Clapperboard, MessageCircle, Sliders, ChevronDown, Image as ImageIcon, RefreshCw, Maximize2, Download, X, ShieldCheck, Minimize2, Volume2, MessageSquareText, Edit3, Sparkles, UserCheck, Film, Link, Headphones } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
import { translateText } from '../services/geminiService';

const POSES = [
    { id: 'standing', label: { en: 'Standing', he: 'עמידה' }, prompt: { en: 'Character is standing still, confident posture.', he: 'הדמות עומדת ללא תנועה, יציבה בטוחה.' } },
    { id: 'sitting', label: { en: 'Sitting', he: 'ישיבה' }, prompt: { en: 'Character is sitting comfortably.', he: 'הדמות יושבת בנוחות.' } },
    { id: 'walking', label: { en: 'Walking', he: 'הליכה' }, prompt: { en: 'Character is walking forward.', he: 'הדמות הולכת קדימה.' } },
    { id: 'running', label: { en: 'Running', he: 'ריצה' }, prompt: { en: 'Character is running fast, dynamic motion.', he: 'הדמות רצה מהר, תנועה דינמית.' } },
    { id: 'talking', label: { en: 'Talking', he: 'דיבור' }, prompt: { en: 'Character is talking expressively.', he: 'הדמות מדברת בהבעתיות.' } },
    { id: 'happy', label: { en: 'Happy', he: 'שמחה' }, prompt: { en: 'Character has a happy smiling expression.', he: 'לדמות הבעה שמחה ומחייכת.' } },
    { id: 'angry', label: { en: 'Angry', he: 'כעס' }, prompt: { en: 'Character has an angry expression, frowning.', he: 'לדמות הבעה כועסת וזועפת.' } },
    { id: 'sad', label: { en: 'Sad', he: 'עצב' }, prompt: { en: 'Character looks sad and melancholic.', he: 'הדמות נראית עצובה ומלנכולית.' } },
    { id: 'surprised', label: { en: 'Surprised', he: 'הפתעה' }, prompt: { en: 'Character looks shocked, eyes wide open.', he: 'הדמות נראית המומה, עיניים פעורות.' } },
];

const SceneItem: React.FC<{ 
    scene: Scene, 
    contentLanguage: Language,
    onGenerate: () => void, 
    onGenerateImage?: () => void,
    onGenerateAudio?: () => void,
    onUpdate: (updates: Partial<Scene>) => void,
    lang: Language,
    config: SeriesConfig
}> = ({ scene, contentLanguage, onGenerate, onGenerateImage, onGenerateAudio, onUpdate, lang, config }) => {
    const t = translations[lang];
    const [isExpanded, setIsExpanded] = useState(false);
    const [showPoses, setShowPoses] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isTranslating, setIsTranslating] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [showFullImage, setShowFullImage] = useState(false);

    const isRtl = contentLanguage === 'he';

    const handleCopy = () => {
        navigator.clipboard.writeText(scene.visualPrompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleGenerateImageWithConfirm = () => {
        if (scene.startImage) {
            if (!window.confirm('Regenerate the scene image? The current image will be replaced.')) return;
        }
        onGenerateImage?.();
    };

    const handleTranslate = async () => {
        if (scene.hebrewVisualPrompt) return;
        setIsTranslating(true);
        try {
            const translated = await translateText(scene.visualPrompt, lang);
            onUpdate({ hebrewVisualPrompt: translated });
        } catch (e) {
            console.error(e);
        } finally {
            setIsTranslating(false);
        }
    };

    const handleSyncDialogue = () => {
        if (!scene.dialogue) return;
        setIsSyncing(true);

        const dialogueText = scene.dialogue.trim();
        const currentPrompt = scene.visualPrompt || '';
        const langLabel = config.contentLanguage === 'he' ? 'Hebrew' : 'English';
        const newSuffix = `The character speaking the following text in ${langLabel}: "${dialogueText}".`;

        // Case-insensitive search using lowercase comparison
        const lowerPrompt = currentPrompt.toLowerCase();

        // Priority markers — find the LAST occurrence of any of these phrases
        // (handles both AI-generated and our own previously-appended tags)
        const candidateMarkers = [
            'the character speaking the following text in',
            'the character says the following text in',
            'speaking the following text in hebrew',
            'speaking the following text in english',
        ];

        let cutIdx = -1;
        for (const m of candidateMarkers) {
            const i = lowerPrompt.lastIndexOf(m);
            if (i !== -1 && i > cutIdx) cutIdx = i;
        }

        // Fallback: regex for AI-embedded pattern like 'says in Hebrew: "..."'
        // Uses explicit Unicode code points so encoding ambiguity doesn't matter
        if (cutIdx === -1) {
            const re = /(?:says?|shouts?|speaks?|speaking|said|utters?)\s+in\s+(?:Hebrew|English)/gi;
            let m: RegExpExecArray | null;
            let lastStart = -1;
            while ((m = re.exec(currentPrompt)) !== null) lastStart = m.index;
            if (lastStart !== -1) cutIdx = lastStart;
        }

        const newPrompt = cutIdx !== -1
            ? currentPrompt.slice(0, cutIdx).trimEnd() + ' ' + newSuffix
            : currentPrompt.trimEnd() + ' ' + newSuffix;

        onUpdate({ visualPrompt: newPrompt });
        setTimeout(() => setIsSyncing(false), 800);
    };

    const handleDownloadImage = () => {
        if (!scene.startImage) return;
        const link = document.createElement('a');
        link.href = `data:${scene.startImageMimeType};base64,${scene.startImage}`;
        link.download = `scene_${scene.id}_frame.png`;
        link.click();
    };

    const handleDownloadAudio = () => {
        if (!scene.audioUrl) return;
        const link = document.createElement('a');
        link.href = scene.audioUrl;
        link.download = `scene_${scene.id}_audio.wav`;
        link.click();
    };

    const applyPose = (posePrompt: { en: string, he: string }) => {
        const additionEn = ` [POSE: ${posePrompt.en}]`;
        const additionHe = ` [תנוחה: ${posePrompt.he}]`;
        
        onUpdate({
            visualPrompt: scene.visualPrompt + additionEn,
            hebrewVisualPrompt: (scene.hebrewVisualPrompt || '') + additionHe
        });
        setShowPoses(false);
    };

    const getStatusBadge = () => {
        switch (scene.status) {
            case 'completed': return <span className="bg-green-500/20 text-green-400 text-[10px] font-bold px-2 py-0.5 rounded border border-green-500/30 flex items-center gap-1"><Check className="w-3 h-3" /> {t.completed}</span>;
            case 'generating': return <span className="bg-indigo-500/20 text-indigo-400 text-[10px] font-bold px-2 py-0.5 rounded border border-indigo-500/30 flex items-center gap-1 animate-pulse"><Loader2 className="w-3 h-3 animate-spin" /> {t.veoWorking}</span>;
            case 'failed': return <span className="bg-red-500/20 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded border border-red-500/30 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {t.errorGenVideo}</span>;
            case 'generating_image': return <span className="bg-amber-500/20 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-500/30 flex items-center gap-1 animate-pulse"><Loader2 className="w-3 h-3 animate-spin" /> {t.generatingImage}</span>;
            case 'generating_audio': return <span className="bg-purple-500/20 text-purple-400 text-[10px] font-bold px-2 py-0.5 rounded border border-purple-500/30 flex items-center gap-1 animate-pulse"><Loader2 className="w-3 h-3 animate-spin" /> {t.generatingAudio}</span>;
            default: return <span className="bg-slate-800 text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-700">Pending</span>;
        }
    };

    return (
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden transition-all hover:border-slate-700">
            {/* Full Image Modal */}
            {showFullImage && scene.startImage && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 animate-in fade-in duration-300">
                    <div className="absolute inset-0 cursor-zoom-out" onClick={() => setShowFullImage(false)}></div>
                    <button onClick={() => setShowFullImage(false)} className="absolute top-6 right-6 p-2 bg-slate-800 rounded-full text-white hover:bg-slate-700 z-10">
                        <X className="w-6 h-6" />
                    </button>
                    <div className="relative max-w-5xl w-full z-10">
                        <img src={`data:${scene.startImageMimeType};base64,${scene.startImage}`} className="w-full h-auto rounded-lg shadow-2xl border border-slate-700" alt="Full Preview" />
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
                             <button onClick={handleDownloadImage} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-full font-bold flex items-center gap-2 shadow-xl transition-all">
                                <Download className="w-5 h-5" /> {t.downloadBtn}
                             </button>
                             <button onClick={() => setShowFullImage(false)} className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-2 rounded-full font-bold flex items-center gap-2 shadow-xl transition-all">
                                {t.close}
                             </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header Area */}
            <div className="p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="bg-slate-800 w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border border-slate-700 shadow-inner">
                        <span className="text-slate-500 font-bold text-sm">#{scene.id}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                             <h4 className="font-bold text-slate-200 text-sm truncate">{scene.description}</h4>
                             {getStatusBadge()}
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-1 italic">{scene.visualPrompt}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
                    {onGenerateImage && (scene.status === 'pending' || scene.status === 'generating_image' || scene.status === 'failed') && (
                        <button 
                            onClick={handleGenerateImageWithConfirm} 
                            disabled={scene.status === 'generating_image'}
                            className={`p-2 rounded-lg transition-colors border group relative ${
                                scene.startImage 
                                ? 'bg-amber-900/20 hover:bg-amber-900/40 text-amber-400 border-amber-800/50' 
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                            }`}
                            title={scene.startImage ? t.regenerateImage : t.genImageBtn}
                        >
                            {scene.status === 'generating_image' ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                scene.startImage ? <RefreshCw className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />
                            )}
                        </button>
                    )}
                    <button 
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-2 rounded-lg transition-colors border border-slate-700"
                    >
                        {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                    <button 
                        onClick={onGenerate}
                        disabled={scene.status === 'generating' || scene.status === 'generating_image' || scene.status === 'generating_audio'}
                        className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-lg ${
                            scene.status === 'completed' 
                            ? 'bg-green-600 hover:bg-green-500 text-white shadow-green-900/20' 
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/30'
                        }`}
                    >
                        {scene.status === 'generating' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                        {scene.status === 'completed' ? t.videoReady : t.generateVideoBtn}
                    </button>
                </div>
            </div>

            {/* Expandable Editor Content */}
            {isExpanded && (
                <div className="p-4 border-t border-slate-800 bg-slate-900/60 space-y-4 animate-in slide-in-from-top-2 duration-300">
                    
                    {/* Visual Media Preview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Start Image / Current Image */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                <ImageIcon className="w-3 h-3" /> {t.startImgLabel}
                            </label>
                            {scene.startImage ? (
                                <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-700 group">
                                    <img 
                                        src={`data:${scene.startImageMimeType};base64,${scene.startImage}`} 
                                        className="w-full h-full object-cover" 
                                        alt="Start Frame"
                                    />
                                    <div className="absolute inset-0 flex items-center gap-2 justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => setShowFullImage(true)} className="bg-indigo-600 text-white p-2 rounded-lg text-xs font-bold hover:bg-indigo-500" title={t.view}>
                                            <Maximize2 className="w-4 h-4" />
                                        </button>
                                        {onGenerateImage && (
                                            <button 
                                                onClick={handleGenerateImageWithConfirm} 
                                                disabled={scene.status === 'generating_image'}
                                                className="bg-amber-600 text-white p-2 rounded-lg text-xs font-bold hover:bg-amber-500 disabled:opacity-50" 
                                                title={t.regenerateImage}
                                            >
                                                {scene.status === 'generating_image' ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                                            </button>
                                        )}
                                        <button onClick={() => handleDownloadImage()} className="bg-slate-800 text-white p-2 rounded-lg text-xs font-bold hover:bg-slate-700" title={t.downloadBtn}>
                                            <Download className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => onUpdate({ startImage: undefined, startImageMimeType: undefined })} className="bg-red-500 text-white p-2 rounded-lg text-xs font-bold hover:bg-red-400" title={t.removeCharacter}>
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="absolute top-2 left-2 bg-indigo-600 text-[9px] font-bold px-1.5 py-0.5 rounded shadow">START FRAME</div>
                                </div>
                            ) : (
                                <div className="aspect-video rounded-lg border-2 border-dashed border-slate-800 flex flex-col items-center justify-center text-slate-600 bg-slate-900/20">
                                    <ImageIcon className="w-8 h-8 opacity-20 mb-2" />
                                    <p className="text-[10px] uppercase">{t.noStartImage}</p>
                                </div>
                            )}
                        </div>

                        {/* Generated Video */}
                        <div className="space-y-2">
                             <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                <Clapperboard className="w-3 h-3" /> {t.videoReady}
                            </label>
                            {scene.videoUrl ? (
                                <div className="relative aspect-video rounded-lg overflow-hidden border border-indigo-500/30 shadow-lg shadow-indigo-900/20">
                                    <video 
                                        src={scene.videoUrl} 
                                        controls 
                                        className="w-full h-full object-cover"
                                        poster={scene.startImage ? `data:${scene.startImageMimeType};base64,${scene.startImage}` : undefined}
                                    />
                                </div>
                            ) : (
                                <div className="aspect-video rounded-lg bg-slate-950 flex flex-col items-center justify-center border border-slate-800">
                                    {scene.status === 'generating' ? (
                                        <div className="text-center">
                                            <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mx-auto mb-3" />
                                            <p className="text-xs text-indigo-400 font-bold animate-pulse uppercase tracking-widest">{t.veoWorking}</p>
                                        </div>
                                    ) : (
                                        <Play className="w-10 h-10 text-slate-800 opacity-50" />
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Manual Editors */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        {/* Prompt Editor */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-slate-400 flex items-center gap-2">
                                    <Edit3 className="w-3.5 h-3.5" /> {t.promptLabelAI}
                                </label>
                                <div className="flex items-center gap-1">
                                    <button 
                                        onClick={handleTranslate}
                                        disabled={isTranslating}
                                        className="text-[10px] bg-indigo-900/40 hover:bg-indigo-900/60 text-indigo-300 px-2 py-1 rounded border border-indigo-500/30 flex items-center gap-1 transition-all"
                                    >
                                        {isTranslating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Languages className="w-3 h-3" />}
                                        {t.translateBtn}
                                    </button>
                                    <button 
                                        onClick={() => setShowPoses(!showPoses)}
                                        className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded border border-slate-700 flex items-center gap-1 transition-all"
                                    >
                                        <Sparkles className="w-3 h-3" /> {t.refineAction}
                                    </button>
                                    <button 
                                        onClick={handleCopy}
                                        className="p-1.5 hover:bg-slate-800 rounded text-slate-500 transition-colors"
                                    >
                                        {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                                    </button>
                                </div>
                            </div>
                            
                            {showPoses && (
                                <div className="grid grid-cols-3 gap-1 bg-slate-800 p-2 rounded-lg border border-slate-700 animate-in fade-in zoom-in-95 duration-200">
                                    {POSES.map(pose => (
                                        <button 
                                            key={pose.id}
                                            onClick={() => applyPose(pose.prompt)}
                                            className="text-[10px] text-slate-400 hover:text-white hover:bg-slate-700 px-2 py-1 rounded transition-colors text-center"
                                        >
                                            {pose.label[lang]}
                                        </button>
                                    ))}
                                </div>
                            )}

                            <textarea 
                                className="w-full bg-slate-950/50 border border-slate-800 rounded-lg p-3 text-xs text-slate-300 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 min-h-[120px] leading-relaxed font-mono"
                                value={scene.visualPrompt}
                                onChange={(e) => onUpdate({ visualPrompt: e.target.value })}
                                placeholder="Edit visual prompt in English..."
                                dir="ltr"
                            />

                            {scene.hebrewVisualPrompt && (
                                <div className="p-3 bg-slate-950/30 rounded-lg border border-slate-800/50 animate-in fade-in duration-300">
                                    <div className="flex items-center justify-between mb-1">
                                         <label className="text-[10px] font-bold text-slate-500 uppercase">{t.promptLabelTrans}</label>
                                         <button onClick={() => onUpdate({ hebrewVisualPrompt: undefined })}><X className="w-3 h-3 text-slate-600" /></button>
                                    </div>
                                    <p className={`text-xs text-slate-400 ${lang === 'he' ? 'text-right' : 'text-left'}`} dir={lang === 'he' ? 'rtl' : 'ltr'}>
                                        {scene.hebrewVisualPrompt}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Dialogue Editor */}
                        {config.includeDialogue && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-slate-400 flex items-center gap-2">
                                        <MessageSquareText className="w-3.5 h-3.5" /> {t.dialogueTitle}
                                    </label>
                                    <button 
                                        onClick={handleSyncDialogue}
                                        disabled={isSyncing}
                                        className="text-[10px] bg-indigo-900/40 hover:bg-indigo-900/60 text-indigo-300 px-2 py-1 rounded border border-indigo-500/30 flex items-center gap-1 transition-all"
                                    >
                                        {isSyncing ? <Check className="w-3 h-3 text-green-400" /> : <Link className="w-3 h-3" />}
                                        {isSyncing ? t.syncSuccess : t.syncDialogueBtn}
                                    </button>
                                </div>
                                <textarea 
                                    className={`w-full bg-slate-950/50 border border-slate-800 rounded-lg p-3 text-xs text-indigo-200 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 min-h-[120px] leading-relaxed ${isRtl ? 'text-right' : 'text-left'}`}
                                    value={scene.dialogue || ''}
                                    onChange={(e) => onUpdate({ dialogue: e.target.value })}
                                    placeholder={isRtl ? 'כתוב כאן את הדיאלוג או המונולוג...' : 'Enter scene dialogue or monologue here...'}
                                    dir={isRtl ? 'rtl' : 'ltr'}
                                />
                                
                                {/* Audio Player & Narration Control */}
                                <div className="bg-slate-950/30 p-4 rounded-xl border border-slate-800/50 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                                            <Headphones className="w-3 h-3" /> {t.audioReady}
                                        </label>
                                        <div className="flex gap-2">
                                            {scene.audioUrl && (
                                                <button 
                                                    onClick={handleDownloadAudio}
                                                    className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-indigo-400 transition-colors"
                                                    title={t.downloadAudio}
                                                >
                                                    <Download className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                            <button 
                                                onClick={onGenerateAudio}
                                                disabled={scene.status === 'generating_audio' || !scene.dialogue}
                                                className={`text-[10px] px-3 py-1 rounded-full font-bold transition-all flex items-center gap-1.5 ${
                                                    scene.audioUrl 
                                                    ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' 
                                                    : 'bg-purple-600 text-white hover:bg-purple-500 shadow-lg shadow-purple-900/20'
                                                }`}
                                            >
                                                {scene.status === 'generating_audio' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Volume2 className="w-3 h-3" />}
                                                {scene.audioUrl ? t.audioReady : t.generateAudioBtn}
                                            </button>
                                        </div>
                                    </div>

                                    {scene.audioUrl && (
                                        <div className="pt-1">
                                            <audio 
                                                src={scene.audioUrl} 
                                                controls 
                                                className="w-full h-8 opacity-80 accent-purple-500" 
                                            />
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2 text-[10px] text-slate-500 pt-1">
                                        <ShieldCheck className="w-3 h-3" />
                                        {isRtl ? 'טקסט זה ישמש לקריינות ולדיוק תנועות השפתיים.' : 'This text will be used for narration and lip-sync precision.'}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

interface EpisodeCardProps {
  episode: Episode;
  config: SeriesConfig;
  onGenerate: (episodeId: number, sceneId: number) => void;
  onGenerateImage?: (episodeId: number, sceneId: number) => void;
  onGenerateAudio?: (episodeId: number, sceneId: number) => void;
  onGenerateAllAudio?: (episodeId: number) => void;
  onUpdateScene: (episodeId: number, sceneId: number, updates: Partial<Scene>) => void;
  lang: Language;
}

const EpisodeCard: React.FC<EpisodeCardProps> = ({ episode, config, onGenerate, onGenerateImage, onGenerateAudio, onGenerateAllAudio, onUpdateScene, lang }) => {
  const t = translations[lang];

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 to-indigo-950/20">
        <div className="flex justify-between items-center mb-4">
             <div className="flex items-center gap-3">
                <div className="bg-indigo-600 w-12 h-12 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-900/50">
                    <Film className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">{episode.title}</h3>
                    <p className="text-sm text-slate-400 line-clamp-1">{episode.description}</p>
                </div>
             </div>
             <div className="hidden sm:flex items-center gap-2 bg-slate-950/50 px-3 py-1.5 rounded-full border border-slate-800">
                <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.consistencyBadge}</span>
             </div>
             {onGenerateAllAudio && config.includeDialogue && episode.scenes.some(s => s.dialogue) && (
                 <button
                     onClick={() => onGenerateAllAudio(episode.id)}
                     className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-900/30 hover:bg-blue-900/50 text-blue-300 border border-blue-800/50 text-xs font-bold transition-colors"
                     title="Generate audio for all scenes in this episode"
                 >
                     <Headphones className="w-3.5 h-3.5" />
                     <span className="hidden sm:inline">All Audio</span>
                 </button>
             )}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {episode.scenes.map((scene) => (
          <SceneItem 
            key={scene.id} 
            scene={scene} 
            contentLanguage={config.contentLanguage}
            onGenerate={() => onGenerate(episode.id, scene.id)}
            onGenerateImage={onGenerateImage ? () => onGenerateImage(episode.id, scene.id) : undefined}
            onGenerateAudio={onGenerateAudio ? () => onGenerateAudio(episode.id, scene.id) : undefined}
            onUpdate={(updates) => onUpdateScene(episode.id, scene.id, updates)}
            lang={lang}
            config={config}
          />
        ))}
      </div>
    </div>
  );
};

export default EpisodeCard;
