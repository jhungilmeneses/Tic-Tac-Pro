import { motion } from "motion/react";
import type { ElementType } from 'react';
import { Player } from "../types";
import { ThemeConfig } from "../themes";

interface SquareProps {
  key?: string | number;
  value: Player | null;
  onClick: () => void;
  isWinningSquare: boolean;
  disabled: boolean;
  isLastMove?: boolean;
  isFocused?: boolean;
  icon?: ElementType;
  isFading?: boolean;
  theme: ThemeConfig;
}

export function Square({ value, onClick, isWinningSquare, disabled, isLastMove, isFocused, icon: Icon, isFading, theme }: SquareProps) {
  return (
    <motion.button
      className={`
        cell w-full h-full relative ${theme.colors.cardLight} ${theme.colors.cardDark} rounded-xl flex items-center justify-center text-5xl sm:text-7xl font-black transition-colors duration-300 border
        ${!value && !disabled ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}
        ${isWinningSquare ? 'ring-4 shadow-md z-10 opacity-100' : ''}
        ${isLastMove && !isWinningSquare ? 'ring-2 ring-slate-300 dark:ring-slate-600 z-10' : ''}
        ${isFocused ? 'ring-4 z-20 outline-none' : 'outline-none'}
        ${value === 'X' ? `${theme.colors.primaryLight} ${theme.colors.primaryDark}` : value === 'O' ? `${theme.colors.secondaryLight} ${theme.colors.secondaryDark}` : ''}
      `}
      onClick={onClick}
      disabled={disabled || value !== null}
      aria-label={value ? `Square occupied by ${value}` : "Empty square"}
      animate={
        isWinningSquare 
          ? { scale: [1, 1.1, 1] } 
          : { scale: 1 }
      }
      transition={
        isWinningSquare 
          ? { duration: 0.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 0.5 } 
          : { duration: 0.2 }
      }
    >
      {isLastMove && !isWinningSquare && (
        <motion.div
          className="absolute inset-0 rounded-xl border-2 border-slate-400 dark:border-slate-500"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: [0.5, 0], scale: [1, 1.15] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
        />
      )}
      {value && (
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: isFading ? 0.3 : 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className={`flex items-center justify-center w-full h-full ${isFading ? 'animate-pulse' : ''}`}
        >
          {Icon ? <Icon className="w-12 h-12 sm:w-16 sm:h-16" strokeWidth={2.5} /> : value}
        </motion.div>
      )}
    </motion.button>
  );
}
