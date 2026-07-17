import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Scores } from '../types';
import { ThemeConfig } from '../themes';

interface ScoreChartProps {
  scores: Scores;
  theme: 'light' | 'dark';
  playerNames: { X: string, O: string };
  themeConfig: ThemeConfig;
}

export function ScoreChart({ scores, theme, playerNames, themeConfig }: ScoreChartProps) {
  const isDark = theme === 'dark';
  const data = [
    { name: playerNames.X, score: scores.X, fill: isDark ? '#818cf8' : '#4f46e5' },
    { name: 'Draws', score: scores.draws, fill: isDark ? '#94a3b8' : '#64748b' },
    { name: playerNames.O, score: scores.O, fill: isDark ? '#fb7185' : '#e11d48' },
  ];

  return (
    <div className={`w-full h-48 ${themeConfig.colors.cardLight} ${themeConfig.colors.cardDark} border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col transition-colors duration-300`}>
      <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center mb-2 shrink-0">Total Score Distribution</h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
            <XAxis type="number" hide />
            <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }} width={80} />
            <Tooltip 
              cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }} 
              contentStyle={{ 
                backgroundColor: isDark ? '#1e293b' : '#ffffff', 
                border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`, 
                borderRadius: '0.5rem', 
                color: isDark ? '#f8fafc' : '#0f172a',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
              }}
              itemStyle={{ color: isDark ? '#f8fafc' : '#0f172a' }}
            />
            <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={24}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
