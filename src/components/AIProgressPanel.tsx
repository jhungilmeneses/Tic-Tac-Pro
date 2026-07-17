import { Trophy, Star } from 'lucide-react';
import { Difficulty } from '../types';

interface AIProgressPanelProps {
  difficulty: Difficulty;
  progress: Record<Difficulty, number>;
}

const ACHIEVEMENTS = {
  easy: "Haha Noob",
  medium: "Not Bad, but not better",
  hard: "Have Life Man, touch GRASS"
};

export function AIProgressPanel({ difficulty, progress }: AIProgressPanelProps) {
  const currentProgress = progress[difficulty];
  const maxLevel = 5;
  const isCompleted = currentProgress >= maxLevel;

  return (
    <div className="w-full bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 mt-4 xl:mt-0 transition-colors duration-300 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
          <Trophy size={14} className="text-indigo-500 dark:text-indigo-400" />
          AI Campaign
        </h3>
        <span className="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded font-mono font-bold capitalize">
          {isCompleted ? 'Zen ' : ''}{difficulty === 'hard' ? 'Difficult' : difficulty}
        </span>
      </div>
      
      <div className="flex gap-1 mb-3">
        {Array.from({ length: maxLevel }).map((_, i) => (
          <div 
            key={i} 
            className={`flex-1 h-2 rounded-full ${i < currentProgress ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]' : 'bg-slate-200 dark:bg-slate-700'}`}
          />
        ))}
      </div>
      
      <div className="flex justify-between items-end">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
          Level {Math.min(currentProgress + 1, maxLevel)} / {maxLevel}
        </span>
        {isCompleted && (
          <div className="flex flex-col items-end animate-in fade-in slide-in-from-bottom-2">
            <span className="text-[10px] text-yellow-600 dark:text-yellow-400 font-bold uppercase tracking-wider mb-0.5 flex items-center gap-1">
              <Star size={10} className="fill-current" />
              Achievement
            </span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 text-right">
              "{ACHIEVEMENTS[difficulty]}"
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
