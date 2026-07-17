import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import type { ElementType } from 'react';
import { playClickSound } from '../audio';
import { ThemeConfig } from '../themes';

interface AvatarSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: 'X' | 'O' | null;
  currentAvatar: string;
  onSelect: (avatar: string) => void;
  theme: ThemeConfig;
}

export function AvatarSelectionModal({ isOpen, onClose, player, currentAvatar, onSelect, theme }: AvatarSelectionModalProps) {
  const handleClose = () => {
    playClickSound();
    onClose();
  };

  const handleSelect = (avatar: string) => {
    playClickSound();
    onSelect(avatar);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={handleClose}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className={`${theme.colors.cardLight} ${theme.colors.cardDark} border rounded-2xl p-6 w-full max-w-md shadow-2xl relative`}
            >
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                aria-label="Close settings"
              >
                <X size={20} />
              </button>
              
              <h2 className={`text-xl font-bold ${theme.colors.textLight} ${theme.colors.textDark} mb-2`}>
                Choose Avatar
              </h2>
              <p className="text-sm opacity-70 mb-6">
                Select an icon for Player {player}
              </p>
              
              <div className="grid grid-cols-4 gap-4">
                {Object.entries(theme.avatars).map(([key, Icon]) => {
                  const isSelected = currentAvatar === key;
                  return (
                    <button
                      key={key}
                      onClick={() => handleSelect(key)}
                      className={`
                        flex flex-col items-center justify-center p-4 rounded-xl transition-all
                        ${isSelected 
                          ? `bg-black/5 dark:bg-white/10 ${player === 'X' ? theme.colors.primaryLight : theme.colors.secondaryLight} ${player === 'X' ? theme.colors.primaryDark : theme.colors.secondaryDark} ring-2` 
                          : `opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5`
                        }
                      `}
                    >
                      <Icon size={32} strokeWidth={isSelected ? 2.5 : 2} />
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
