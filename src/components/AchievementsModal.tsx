import { X, Trophy, Lock } from 'lucide-react';
import { Difficulty } from '../types';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: Record<Difficulty, number>;
  theme: 'light' | 'dark';
}

const ACHIEVEMENTS = {
  easy: {
    req: "Clear all 5 levels of Easy Mode",
    title: "Haha Noob"
  },
  medium: {
    req: "Clear all 5 levels of Medium Mode",
    title: "Not Bad, but not better"
  },
  hard: {
    req: "Clear all 5 levels of Difficult Mode",
    title: "Have Life Man, touch GRASS"
  }
};

export function AchievementsModal({ isOpen, onClose, progress, theme }: AchievementsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className={`w-full max-w-md ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'} border rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200`}
      >
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Trophy size={20} className="text-yellow-500" />
            AI Achievements
          </h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          {(['easy', 'medium', 'hard'] as Difficulty[]).map(diff => {
            const isUnlocked = progress[diff] >= 5;
            const data = ACHIEVEMENTS[diff];
            
            return (
              <div key={diff} className={`p-4 rounded-xl border ${isUnlocked ? 'border-yellow-500/50 bg-yellow-50 dark:bg-yellow-900/10' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50'}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold mb-1 flex items-center gap-2">
                      {isUnlocked ? (
                        <span className="text-yellow-600 dark:text-yellow-500">{data.title}</span>
                      ) : (
                        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Lock size={14} /> ???
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Requirement: {data.req}
                    </p>
                    <p className="text-xs mt-2 font-medium">
                      {isUnlocked ? (
                        <span className="text-indigo-600 dark:text-indigo-400">Zen {diff === 'hard' ? 'Difficult' : diff.charAt(0).toUpperCase() + diff.slice(1)} Unlocked!</span>
                      ) : (
                        <span className="text-slate-400">Progress: {progress[diff]} / 5</span>
                      )}
                    </p>
                  </div>
                  {isUnlocked && <Trophy size={24} className="text-yellow-500" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
