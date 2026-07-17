import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { volumes, setVolume, startAmbience, playClickSound } from '../audio';

interface AudioSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AudioSettingsModal({ isOpen, onClose }: AudioSettingsModalProps) {
  const [localVolumes, setLocalVolumes] = useState({ ...volumes });

  useEffect(() => {
    if (isOpen) {
      setLocalVolumes({ ...volumes });
      startAmbience(); // Ensure ambience is running so they can hear changes
    }
  }, [isOpen]);

  const handleChange = (type: keyof typeof volumes, val: number) => {
    setLocalVolumes(prev => ({ ...prev, [type]: val }));
    setVolume(type, val);
  };

  const handleClose = () => {
    playClickSound();
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
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl relative"
            >
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                aria-label="Close settings"
              >
                <X size={20} />
              </button>
              
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6">Audio Settings</h2>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Background Ambience</label>
                    <span className="text-xs text-slate-500">{Math.round(localVolumes.ambience * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={localVolumes.ambience}
                    onChange={(e) => handleChange('ambience', parseFloat(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Move Sounds</label>
                    <span className="text-xs text-slate-500">{Math.round(localVolumes.moves * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={localVolumes.moves}
                    onChange={(e) => handleChange('moves', parseFloat(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Celebration Effects</label>
                    <span className="text-xs text-slate-500">{Math.round(localVolumes.celebration * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={localVolumes.celebration}
                    onChange={(e) => handleChange('celebration', parseFloat(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
