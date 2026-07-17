import { Cpu, Users, LogOut } from 'lucide-react';
import { ThemeConfig } from '../themes';

interface MainMenuProps {
  onSelectMode: (mode: 'pva' | 'pvp') => void;
  onLogout: () => void;
  theme: ThemeConfig;
  colorMode: 'light' | 'dark';
}

export function MainMenu({ onSelectMode, onLogout, theme, colorMode }: MainMenuProps) {
  return (
    <div className={`min-h-screen w-full ${theme.colors.bgLight} ${theme.colors.bgDark} flex flex-col items-center justify-center p-4 transition-colors duration-300`}>
      <div className={`max-w-md w-full ${colorMode === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} rounded-3xl shadow-xl overflow-hidden border p-8 space-y-6 animate-in zoom-in-95 duration-300`}>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black tracking-tight mb-2">Select Game Mode</h1>
          <p className="text-slate-500 dark:text-slate-400">Choose your opponent to begin.</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => onSelectMode('pva')}
            className={`w-full p-6 rounded-2xl flex flex-col items-center gap-4 transition-all hover:scale-105 border-2 ${colorMode === 'dark' ? 'border-slate-700 hover:border-indigo-500 bg-slate-800' : 'border-slate-200 hover:border-indigo-500 bg-slate-50'}`}
          >
            <div className={`p-4 rounded-full ${theme.colors.secondaryLight} ${theme.colors.secondaryDark}`}>
              <Cpu size={32} className="text-rose-600 dark:text-rose-400" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold">Player vs AI</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Challenge the computer</p>
            </div>
          </button>

          <button
            onClick={() => onSelectMode('pvp')}
            className={`w-full p-6 rounded-2xl flex flex-col items-center gap-4 transition-all hover:scale-105 border-2 ${colorMode === 'dark' ? 'border-slate-700 hover:border-indigo-500 bg-slate-800' : 'border-slate-200 hover:border-indigo-500 bg-slate-50'}`}
          >
            <div className={`p-4 rounded-full ${theme.colors.primaryLight} ${theme.colors.primaryDark}`}>
              <Users size={32} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold">Player vs Player</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Play with a friend</p>
            </div>
          </button>
        </div>

        <div className="pt-6 mt-6 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium"
          >
            <LogOut size={20} />
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
