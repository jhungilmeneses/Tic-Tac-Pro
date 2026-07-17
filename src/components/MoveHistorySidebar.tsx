import { Player } from '../types';
import { ThemeConfig } from '../themes';

interface MoveHistorySidebarProps {
  moveHistory: { player: Player; index: number; timestamp?: number }[];
  themeConfig: ThemeConfig;
  playerNames: { X: string; O: string };
}

const INDEX_TO_POSITION: Record<number, string> = {
  0: 'top-left',
  1: 'top-center',
  2: 'top-right',
  3: 'middle-left',
  4: 'center',
  5: 'middle-right',
  6: 'bottom-left',
  7: 'bottom-center',
  8: 'bottom-right',
};

export function MoveHistorySidebar({ moveHistory, themeConfig, playerNames }: MoveHistorySidebarProps) {
  return (
    <div className={`w-full lg:w-64 border-l border-slate-200 dark:border-slate-800 ${themeConfig.colors.cardLight} ${themeConfig.colors.cardDark} flex flex-col transition-colors duration-300`}>
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Move History</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3 relative h-48 lg:h-auto">
        {moveHistory.length === 0 ? (
          <div className="text-sm text-slate-400 dark:text-slate-500 text-center italic mt-4">
            No moves yet.
          </div>
        ) : (
          moveHistory.map((move, i) => {
            const timeStr = move.timestamp 
              ? new Date(move.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
              : '';
            const playerName = playerNames[move.player];
            const position = INDEX_TO_POSITION[move.index];
            const colorClass = move.player === 'X' ? themeConfig.colors.primaryLight + ' ' + themeConfig.colors.primaryDark : themeConfig.colors.secondaryLight + ' ' + themeConfig.colors.secondaryDark;

            return (
              <div key={`${move.index}-${move.timestamp || i}`} className="text-sm bg-black/5 dark:bg-white/5 rounded p-2 border border-black/10 dark:border-white/10 flex flex-col gap-1">
                <div className="flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                  <span>Move {i + 1}</span>
                  {timeStr && <span>{timeStr}</span>}
                </div>
                <div>
                  <span className={`font-bold ${colorClass}`}>{playerName}</span> placed at <strong>{position}</strong>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
