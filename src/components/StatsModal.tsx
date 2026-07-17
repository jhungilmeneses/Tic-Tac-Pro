import { X, Award, User, Cpu } from 'lucide-react';
import { ThemeConfig } from '../themes';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  highscores: { pvp: number; pva: number };
  theme: ThemeConfig;
  colorMode: 'light' | 'dark';
}

export function StatsModal({ isOpen, onClose, highscores, theme, colorMode }: StatsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className={`w-full max-w-sm ${colorMode === 'dark' ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'} border rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200`}
      >
        <div className={`p-4 border-b ${colorMode === 'dark' ? 'border-slate-800 bg-slate-800/50' : 'border-slate-200 bg-slate-50'} flex justify-between items-center`}>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Award size={20} className="text-indigo-500 dark:text-indigo-400" />
            Infinite Highscores
          </h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div className={`p-4 rounded-xl border ${colorMode === 'dark' ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${theme.colors.primaryLight} ${theme.colors.primaryDark}`}>
                  <User size={20} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-bold">Player vs Player</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Max Win Streak</p>
                </div>
              </div>
              <div className="text-2xl font-bold font-mono text-slate-700 dark:text-slate-200">
                {highscores.pvp}
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-xl border ${colorMode === 'dark' ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${theme.colors.secondaryLight} ${theme.colors.secondaryDark}`}>
                  <Cpu size={20} className="text-rose-600 dark:text-rose-400" />
                </div>
                <div>
                  <h3 className="font-bold">Player vs AI</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Max Win Streak</p>
                </div>
              </div>
              <div className="text-2xl font-bold font-mono text-slate-700 dark:text-slate-200">
                {highscores.pva}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
