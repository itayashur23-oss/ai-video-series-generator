
import React, { useRef } from 'react';
import { SavedSeries, Language } from '../types';
import { translations } from '../translations';
import { Clock, Trash2, ChevronLeft, Calendar, FileVideo, AlertTriangle, ChevronRight, ListPlus, Download, Upload, Loader2 } from 'lucide-react';

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  history: SavedSeries[];
  onLoad: (series: SavedSeries) => void;
  onContinue?: (series: SavedSeries) => void;
  onDelete: (id: string) => void;
  onImportHistory?: (newHistory: SavedSeries[]) => void;
  lang: Language;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ 
  isOpen, 
  onClose, 
  history, 
  onLoad, 
  onContinue,
  onDelete,
  onImportHistory,
  lang
}) => {
  const t = translations[lang];
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleExport = () => {
    const dataStr = JSON.stringify(history, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `storystream_history_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    let allImported: SavedSeries[] = [];
    let fileErrors = 0;

    // Fix: Explicitly type 'file' as File to resolve 'unknown' type errors for .text() and .name
    const filePromises = Array.from(files).map(async (file: File) => {
      try {
        const content = await file.text();
        const imported = JSON.parse(content);
        if (Array.isArray(imported)) {
          // Check if it looks like our data structure
          const validItems = imported.filter(item => item.id && item.config && Array.isArray(item.episodes));
          allImported = [...allImported, ...validItems];
        } else if (imported && imported.id && imported.config) {
          // Single item import support
          allImported.push(imported);
        }
      } catch (err) {
        console.error(`Error reading file ${file.name}:`, err);
        fileErrors++;
      }
    });

    await Promise.all(filePromises);

    if (allImported.length > 0) {
      if (onImportHistory) {
        onImportHistory(allImported);
        const successMsg = lang === 'he' 
          ? `יובאו ${allImported.length} פרויקטים בהצלחה!` 
          : `Successfully imported ${allImported.length} projects!`;
        alert(successMsg);
      }
    } else {
      alert(t.importError);
    }

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className={`fixed inset-0 z-50 flex ${lang === 'he' ? 'justify-end' : 'justify-start'}`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className={`relative w-full max-w-md bg-slate-900 border-r border-slate-800 h-full shadow-2xl flex flex-col animate-in ${lang === 'he' ? 'slide-in-from-right' : 'slide-in-from-left'} duration-300`}>
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" />
            {t.historyTitle}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
          >
            {lang === 'he' ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        </div>

        {/* Action Bar */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex gap-2">
            <button 
                onClick={handleExport}
                disabled={history.length === 0}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold text-slate-300 rounded-lg border border-slate-700 transition-all"
            >
                <Download className="w-3.5 h-3.5" />
                {t.exportHistory}
            </button>
            <button 
                onClick={handleImportClick}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-indigo-900/40 hover:bg-indigo-900/60 text-xs font-bold text-indigo-300 rounded-lg border border-indigo-500/30 transition-all"
            >
                <Upload className="w-3.5 h-3.5" />
                {t.importHistory}
            </button>
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".json"
                multiple
                onChange={handleFileImport}
            />
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500 text-center">
              <Clock className="w-12 h-12 mb-3 opacity-20" />
              <p>{t.noHistory}</p>
            </div>
          ) : (
            history.map((item) => (
              <div 
                key={item.id}
                className="bg-slate-800 rounded-xl p-4 border border-slate-700 hover:border-indigo-500/50 transition-all group"
              >
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-slate-200 line-clamp-1 flex-1 pl-2">
                        {item.config.topic || 'Untitled'}
                    </h3>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                        className="text-slate-500 hover:text-red-400 p-1"
                        title={t.delete}
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded">
                        <Calendar className="w-3 h-3" />
                        {new Date(item.createdAt).toLocaleDateString(lang === 'he' ? 'he-IL' : 'en-US')}
                    </span>
                    <span className="bg-indigo-900/30 text-indigo-300 px-2 py-1 rounded border border-indigo-900/50">
                        {item.config.genre}
                    </span>
                    <span className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded">
                         <FileVideo className="w-3 h-3" />
                        {item.episodes.length} {t.episodes}
                    </span>
                </div>

                <div className="grid grid-cols-1 gap-2">
                    <button 
                        onClick={() => onLoad(item)}
                        className="w-full bg-slate-700 hover:bg-slate-600 text-slate-200 hover:text-white py-2 rounded-lg text-sm transition-colors font-medium"
                    >
                        {t.loadSeries}
                    </button>
                    {onContinue && (
                        <button 
                            onClick={() => onContinue(item)}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-lg text-sm transition-colors font-bold flex items-center justify-center gap-2"
                        >
                            <ListPlus className="w-4 h-4" />
                            {t.continueSeriesBtn}
                        </button>
                    )}
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="p-4 border-t border-slate-800 bg-slate-900 text-xs text-slate-500 flex items-start gap-2">
             <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
             <p>{t.historyWarning}</p>
        </div>
      </div>
    </div>
  );
};

export default HistoryPanel;
