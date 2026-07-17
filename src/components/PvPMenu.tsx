import { MonitorSmartphone, Globe, ArrowLeft } from 'lucide-react';
import { ThemeConfig } from '../themes';

interface PvPMenuProps {
  onSelectType: (type: 'offline' | 'online') => void;
  onBack: () => void;
  theme: ThemeConfig;
  colorMode: 'light' | 'dark';
}

export function PvPMenu({ onSelectType, onBack, theme, colorMode }: PvPMenuProps) {
  return (
    <div className={`min-h-screen w-full ${theme.colors.bgLight} ${theme.colors.bgDark} flex flex-col items-center justify-center p-4 transition-colors duration-300`}>
      <div className={`max-w-md w-full ${colorMode === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} rounded-3xl shadow-xl overflow-hidden border p-8 space-y-6 animate-in slide-in-from-right-8 duration-300`}>
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={onBack}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="text-left">
            <h1 className="text-2xl font-black tracking-tight mb-1">PvP Mode</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Choose connection type</p>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => onSelectType('offline')}
            className={`w-full p-6 rounded-2xl flex flex-col items-center gap-4 transition-all hover:scale-105 border-2 ${colorMode === 'dark' ? 'border-slate-700 hover:border-indigo-500 bg-slate-800' : 'border-slate-200 hover:border-indigo-500 bg-slate-50'}`}
          >
            <div className={`p-4 rounded-full ${theme.colors.primaryLight} ${theme.colors.primaryDark}`}>
              <MonitorSmartphone size={32} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold">Offline (Local)</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Play together on this device</p>
            </div>
          </button>

          <button
            onClick={() => onSelectType('online')}
            className={`w-full p-6 rounded-2xl flex flex-col items-center gap-4 transition-all hover:scale-105 border-2 ${colorMode === 'dark' ? 'border-slate-700 hover:border-indigo-500 bg-slate-800' : 'border-slate-200 hover:border-indigo-500 bg-slate-50'}`}
          >
            <div className={`p-4 rounded-full ${theme.colors.secondaryLight} ${theme.colors.secondaryDark}`}>
              <Globe size={32} className="text-rose-600 dark:text-rose-400" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold">Online (Party)</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Invite a friend online</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
