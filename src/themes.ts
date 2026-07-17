import type { ElementType } from 'react';
import {
  User, Smile, Star, Heart, Zap, Flame, // Modern
  Cpu, Monitor, Terminal, Database, Laptop, Bot, // Cyber
  Crown, Sparkles, Gem, Wand, Scroll, Castle, // Fantasy
  Bone, Mountain, TreePine, Leaf, Sun, Hammer, // Pre-Historic
  Anchor, Fish, Droplet, Ship, Waves, Compass, // Underwater
  Gift, Cake, PartyPopper, Music, Cherry, IceCream, // Birthday
  Ghost, Skull, Moon, Cat, Bug, Eye, // Halloween
  Snowflake, Bell, TreeDeciduous, Candy, Stars, // Christmas
  Bird, Cloud, Flower2, SunMedium, Egg, Rabbit, // Easter
  Crosshair, Shield, Target, Plane, Hexagon, ShieldAlert, // Military
  Flag, Car, Timer, Trophy, Gauge, Navigation // Racing
} from 'lucide-react';

export type ThemeId = 'modern' | 'cyber' | 'fantasy' | 'prehistoric' | 'underwater' | 'birthday' | 'halloween' | 'christmas' | 'easter' | 'military' | 'racing';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  avatars: Record<string, ElementType>;
  colors: {
    bgLight: string;
    bgDark: string;
    cardLight: string;
    cardDark: string;
    textLight: string;
    textDark: string;
    primaryLight: string;
    primaryDark: string;
    secondaryLight: string;
    secondaryDark: string;
    boardBgLight: string;
    boardBgDark: string;
  };
}

export const THEMES: Record<ThemeId, ThemeConfig> = {
  modern: {
    id: 'modern',
    name: 'Modern',
    avatars: { User, Smile, Star, Heart, Zap, Flame },
    colors: {
      bgLight: 'bg-slate-50', bgDark: 'dark:bg-[#0F172A]',
      cardLight: 'bg-white border-slate-200', cardDark: 'dark:bg-slate-900/80 dark:border-slate-800',
      textLight: 'text-slate-900', textDark: 'dark:text-white',
      primaryLight: 'text-indigo-600 ring-indigo-500', primaryDark: 'dark:text-indigo-400 dark:ring-indigo-400',
      secondaryLight: 'text-rose-600 ring-rose-500', secondaryDark: 'dark:text-rose-400 dark:ring-rose-400',
      boardBgLight: 'bg-slate-200', boardBgDark: 'dark:bg-slate-800'
    }
  },
  cyber: {
    id: 'cyber',
    name: 'Cyber',
    avatars: { Cpu, Monitor, Terminal, Database, Laptop, Bot },
    colors: {
      bgLight: 'bg-cyan-50', bgDark: 'dark:bg-slate-950',
      cardLight: 'bg-white border-cyan-200', cardDark: 'dark:bg-slate-900 dark:border-cyan-900/50',
      textLight: 'text-cyan-950', textDark: 'dark:text-cyan-50',
      primaryLight: 'text-cyan-600 ring-cyan-500', primaryDark: 'dark:text-cyan-400 dark:ring-cyan-400',
      secondaryLight: 'text-fuchsia-600 ring-fuchsia-500', secondaryDark: 'dark:text-fuchsia-400 dark:ring-fuchsia-400',
      boardBgLight: 'bg-cyan-200', boardBgDark: 'dark:bg-slate-800/80'
    }
  },
  fantasy: {
    id: 'fantasy',
    name: 'Fantasy',
    avatars: { Crown, Sparkles, Gem, Wand, Scroll, Castle },
    colors: {
      bgLight: 'bg-amber-50', bgDark: 'dark:bg-purple-950',
      cardLight: 'bg-amber-100/50 border-amber-200', cardDark: 'dark:bg-purple-900/50 dark:border-purple-800',
      textLight: 'text-amber-950', textDark: 'dark:text-amber-50',
      primaryLight: 'text-amber-600 ring-amber-500', primaryDark: 'dark:text-amber-400 dark:ring-amber-400',
      secondaryLight: 'text-purple-600 ring-purple-500', secondaryDark: 'dark:text-purple-400 dark:ring-purple-400',
      boardBgLight: 'bg-amber-200', boardBgDark: 'dark:bg-purple-900'
    }
  },
  prehistoric: {
    id: 'prehistoric',
    name: 'Pre-Historic',
    avatars: { Bone, Mountain, TreePine, Leaf, Sun, Hammer },
    colors: {
      bgLight: 'bg-stone-100', bgDark: 'dark:bg-stone-900',
      cardLight: 'bg-stone-200/50 border-stone-300', cardDark: 'dark:bg-stone-800/80 dark:border-stone-700',
      textLight: 'text-stone-900', textDark: 'dark:text-stone-100',
      primaryLight: 'text-orange-700 ring-orange-600', primaryDark: 'dark:text-orange-500 dark:ring-orange-500',
      secondaryLight: 'text-stone-700 ring-stone-600', secondaryDark: 'dark:text-stone-400 dark:ring-stone-400',
      boardBgLight: 'bg-stone-300', boardBgDark: 'dark:bg-stone-800'
    }
  },
  underwater: {
    id: 'underwater',
    name: 'Underwater',
    avatars: { Anchor, Fish, Droplet, Ship, Waves, Compass },
    colors: {
      bgLight: 'bg-blue-50', bgDark: 'dark:bg-blue-950',
      cardLight: 'bg-white border-blue-200', cardDark: 'dark:bg-blue-900/40 dark:border-blue-800',
      textLight: 'text-blue-950', textDark: 'dark:text-blue-50',
      primaryLight: 'text-blue-600 ring-blue-500', primaryDark: 'dark:text-blue-400 dark:ring-blue-400',
      secondaryLight: 'text-teal-600 ring-teal-500', secondaryDark: 'dark:text-teal-400 dark:ring-teal-400',
      boardBgLight: 'bg-blue-200', boardBgDark: 'dark:bg-blue-900/60'
    }
  },
  birthday: {
    id: 'birthday',
    name: 'Birthday',
    avatars: { Gift, Cake, PartyPopper, Music, Cherry, IceCream },
    colors: {
      bgLight: 'bg-pink-50', bgDark: 'dark:bg-fuchsia-950',
      cardLight: 'bg-white border-pink-200', cardDark: 'dark:bg-fuchsia-900/60 dark:border-fuchsia-800',
      textLight: 'text-pink-950', textDark: 'dark:text-fuchsia-50',
      primaryLight: 'text-pink-500 ring-pink-500', primaryDark: 'dark:text-pink-400 dark:ring-pink-400',
      secondaryLight: 'text-yellow-500 ring-yellow-500', secondaryDark: 'dark:text-yellow-400 dark:ring-yellow-400',
      boardBgLight: 'bg-pink-200', boardBgDark: 'dark:bg-fuchsia-900'
    }
  },
  halloween: {
    id: 'halloween',
    name: 'Halloween',
    avatars: { Ghost, Skull, Moon, Cat, Bug, Eye },
    colors: {
      bgLight: 'bg-orange-50', bgDark: 'dark:bg-slate-950',
      cardLight: 'bg-white border-orange-200', cardDark: 'dark:bg-slate-900 border-orange-900/30',
      textLight: 'text-orange-950', textDark: 'dark:text-orange-50',
      primaryLight: 'text-orange-600 ring-orange-500', primaryDark: 'dark:text-orange-500 dark:ring-orange-500',
      secondaryLight: 'text-purple-600 ring-purple-500', secondaryDark: 'dark:text-purple-500 dark:ring-purple-500',
      boardBgLight: 'bg-orange-200', boardBgDark: 'dark:bg-slate-900'
    }
  },
  christmas: {
    id: 'christmas',
    name: 'Christmas',
    avatars: { Snowflake, Bell, TreeDeciduous, Candy, Gift, Stars },
    colors: {
      bgLight: 'bg-red-50', bgDark: 'dark:bg-emerald-950',
      cardLight: 'bg-white border-red-200', cardDark: 'dark:bg-emerald-900/60 dark:border-emerald-800',
      textLight: 'text-red-950', textDark: 'dark:text-emerald-50',
      primaryLight: 'text-red-600 ring-red-500', primaryDark: 'dark:text-red-400 dark:ring-red-400',
      secondaryLight: 'text-emerald-600 ring-emerald-500', secondaryDark: 'dark:text-emerald-400 dark:ring-emerald-400',
      boardBgLight: 'bg-red-200', boardBgDark: 'dark:bg-emerald-900'
    }
  },
  easter: {
    id: 'easter',
    name: 'Easter',
    avatars: { Bird, Cloud, Flower2, SunMedium, Egg, Rabbit },
    colors: {
      bgLight: 'bg-green-50', bgDark: 'dark:bg-teal-950',
      cardLight: 'bg-white border-green-200', cardDark: 'dark:bg-teal-900/40 dark:border-teal-800',
      textLight: 'text-green-950', textDark: 'dark:text-teal-50',
      primaryLight: 'text-pink-400 ring-pink-400', primaryDark: 'dark:text-pink-400 dark:ring-pink-400',
      secondaryLight: 'text-blue-400 ring-blue-400', secondaryDark: 'dark:text-blue-400 dark:ring-blue-400',
      boardBgLight: 'bg-green-200', boardBgDark: 'dark:bg-teal-900/50'
    }
  },
  military: {
    id: 'military',
    name: 'Military',
    avatars: { Crosshair, Shield, Target, Plane, Hexagon, ShieldAlert },
    colors: {
      bgLight: 'bg-stone-200', bgDark: 'dark:bg-stone-950',
      cardLight: 'bg-stone-300 border-stone-400', cardDark: 'dark:bg-stone-900 border-stone-800',
      textLight: 'text-stone-900', textDark: 'dark:text-stone-300',
      primaryLight: 'text-lime-700 ring-lime-600', primaryDark: 'dark:text-lime-500 dark:ring-lime-500',
      secondaryLight: 'text-stone-700 ring-stone-600', secondaryDark: 'dark:text-stone-500 dark:ring-stone-500',
      boardBgLight: 'bg-stone-400', boardBgDark: 'dark:bg-stone-800'
    }
  },
  racing: {
    id: 'racing',
    name: 'Racing',
    avatars: { Flag, Car, Timer, Trophy, Gauge, Navigation },
    colors: {
      bgLight: 'bg-slate-100', bgDark: 'dark:bg-slate-900',
      cardLight: 'bg-white border-red-500', cardDark: 'dark:bg-black border-red-600',
      textLight: 'text-slate-900', textDark: 'dark:text-white',
      primaryLight: 'text-red-600 ring-red-500', primaryDark: 'dark:text-red-500 dark:ring-red-500',
      secondaryLight: 'text-slate-800 ring-slate-800', secondaryDark: 'dark:text-slate-300 dark:ring-slate-300',
      boardBgLight: 'bg-slate-300', boardBgDark: 'dark:bg-slate-800'
    }
  }
};
