import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Sun, Moon, Volume2, VolumeX, Settings2, Palette, Maximize, Minimize, User, Cpu, Trophy, Star, Award, LogOut, ArrowLeft } from 'lucide-react';
import { GameMode, Player, Scores, OpponentType, Difficulty } from './types';
import { calculateWinner, getBestMove } from './utils';
import { Square } from './components/Square';
import { ScoreChart } from './components/ScoreChart';
import { AudioSettingsModal } from './components/AudioSettingsModal';
import { AvatarSelectionModal } from './components/AvatarSelectionModal';
import { SoundVisualizer } from './components/SoundVisualizer';
import { MoveHistorySidebar } from './components/MoveHistorySidebar';
import { AchievementsModal } from './components/AchievementsModal';
import { StatsModal } from './components/StatsModal';
import { AuthPage } from './components/AuthPage';
import { MainMenu } from './components/MainMenu';
import { PvPMenu } from './components/PvPMenu';
import { PartyPage } from './components/PartyPage';
import { playMoveSound, playWinSound, playDrawSound, playClickSound, setMuted } from './audio';
import { Infinity as InfinityIcon } from 'lucide-react';
import { AIProgressPanel } from './components/AIProgressPanel';
import { THEMES, ThemeId } from './themes';

const API_BASE = '/api';

const ACHIEVEMENTS = {
  easy: "Haha Noob",
  medium: "Not Bad, but not better",
  hard: "Have Life Man, touch GRASS"
};

export default function App() {
  const [user, setUser] = useState<{ username: string, isGuest: boolean, userId?: number, guestId?: string } | null>(null);
  const [squares, setSquares] = useState<(Player | null)[]>(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState<boolean>(true);
  const [scores, setScores] = useState<Scores>({ X: 0, O: 0, draws: 0 });
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [rounds, setRounds] = useState<number>(1);
  const [colorMode, setColorMode] = useState<'light' | 'dark'>('dark');
  const [themeId, setThemeId] = useState<ThemeId>('modern');
  const [muted, setMutedState] = useState<boolean>(false);
  const [streaks, setStreaks] = useState<{ X: number, O: number }>({ X: 0, O: 0 });
  const [highscores, setHighscores] = useState<{ pvp: number, pva: number }>({ pvp: 0, pva: 0 });
  const [lastMoveIndex, setLastMoveIndex] = useState<number | null>(null);
  const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  
  const [currentView, setCurrentView] = useState<'menu' | 'pvp_menu' | 'party' | 'game'>('menu');
  const [gameMode, setGameMode] = useState<GameMode>('classic');
  const [opponentType, setOpponentType] = useState<OpponentType>('player');
  const [aiPlayer, setAiPlayer] = useState<Player | null>(null);
  const [aiDifficulty, setAiDifficulty] = useState<Difficulty>('easy');
  const [aiProgress, setAiProgress] = useState<Record<Difficulty, number>>({ easy: 0, medium: 0, hard: 0 });
  
  const [moveHistory, setMoveHistory] = useState<{player: Player, index: number, timestamp?: number}[]>([]);
  
  const [playerNames, setPlayerNames] = useState<{ X: string, O: string }>({ X: 'Player 1', O: 'Player 2' });
  const [editingName, setEditingName] = useState<'X' | 'O' | null>(null);
  const [tempName, setTempName] = useState('');
  
  const [avatars, setAvatars] = useState<{ X: string, O: string }>({ X: 'User', O: 'Smile' });
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isAchievementsModalOpen, setIsAchievementsModalOpen] = useState(false);
  const [selectingPlayer, setSelectingPlayer] = useState<'X' | 'O' | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Party game sync state
  const [partyCode, setPartyCode] = useState<string | null>(null);
  const [isPartyLeader, setIsPartyLeader] = useState(false);
  const [isPartyGame, setIsPartyGame] = useState(false);
  const lastAppliedStateRef = useRef<string>('');

  const currentTheme = THEMES[themeId];
  const isDark = colorMode === 'dark';

  const getUserId = useCallback(() => {
    if (!user) return null;
    if (user.userId) return user.userId;
    if (user.guestId) return null;
    return null;
  }, [user]);

  const getGuestId = useCallback(() => {
    if (!user) return null;
    if (user.guestId) return user.guestId;
    if (user.isGuest) return user.username;
    return null;
  }, [user]);

  const submitRecords = useCallback(async (body?: Record<string, unknown>) => {
    if (!user) return;
    const payload: Record<string, unknown> = body || {};
    
    if (!payload.user_id && !payload.guest_id) {
      if (user.userId) {
        payload.user_id = user.userId;
      } else if (user.guestId) {
        payload.guest_id = user.guestId;
      } else if (user.isGuest) {
        payload.guest_id = user.username;
      } else {
        return;
      }
    }
    
    // Fill in current highscores and AI progress if not explicitly provided
    if (!payload.pvp_highscore) payload.pvp_highscore = highscores.pvp;
    if (!payload.pva_highscore) payload.pva_highscore = highscores.pva;
    if (!payload.ai_progress) payload.ai_progress = aiProgress;

    try {
      const res = await fetch(`${API_BASE}/records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        console.error('Failed to save records:', data.error);
      }
    } catch (err) {
      console.error('Failed to save records:', err);
    }
  }, [user, highscores, aiProgress]);

  const saveSettings = useCallback(async () => {
    if (!user) return;
    const payload: Record<string, unknown> = {};
    if (user.userId) payload.user_id = user.userId;
    else if (user.guestId) payload.guest_id = user.guestId;
    else return;

    payload.theme_id = themeId;
    payload.color_mode = colorMode;
    payload.muted = muted;
    payload.avatar_x = avatars.X;
    payload.avatar_o = avatars.O;
    payload.last_game_mode = gameMode;
    payload.last_ai_difficulty = aiDifficulty;

    try {
      await fetch(`${API_BASE}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
  }, [user, themeId, colorMode, muted, avatars, gameMode, aiDifficulty]);

  const loadRecords = useCallback(async (userId?: number, guestId?: string) => {
    try {
      const params = new URLSearchParams();
      if (userId) params.set('user_id', String(userId));
      else if (guestId) params.set('guest_id', guestId);
      
      const res = await fetch(`${API_BASE}/records?${params.toString()}`);
      const data = await res.json();
      
      if (res.ok) {
        setHighscores({ pvp: data.pvp_highscore || 0, pva: data.pva_highscore || 0 });
        setAiProgress(data.ai_progress || { easy: 0, medium: 0, hard: 0 });
      }
    } catch (err) {
      console.error('Failed to load records:', err);
    }
  }, []);

  const loadSettings = useCallback(async (userId?: number, guestId?: string) => {
    try {
      const params = new URLSearchParams();
      if (userId) params.set('user_id', String(userId));
      else if (guestId) params.set('guest_id', guestId);
      else return;

      const res = await fetch(`${API_BASE}/settings?${params.toString()}`);
      const data = await res.json();

      if (res.ok) {
        setThemeId(data.theme_id as ThemeId);
        setColorMode(data.color_mode as 'light' | 'dark');
        setMutedState(data.muted);
        setMuted(data.muted);
        setAvatars({ X: data.avatar_x, O: data.avatar_o });
        setGameMode(data.last_game_mode as GameMode);
        setAiDifficulty(data.last_ai_difficulty as Difficulty);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  }, []);

  const handleLogin = (username: string, isGuest: boolean, userId?: number, guestId?: string) => {
    const newGuestId = isGuest ? guestId || `guest_${Date.now()}` : undefined;
    setUser({ username, isGuest, userId, guestId: newGuestId });
    setPlayerNames(prev => ({ ...prev, X: username }));
    
    // Load records and settings from backend
    if (!isGuest && userId) {
      loadRecords(userId);
      loadSettings(userId);
    } else if (isGuest) {
      loadRecords(undefined, newGuestId);
      loadSettings(undefined, newGuestId);
    }
  };

  const handleLogout = () => {
    setUser(null);
    resetScores();
  };

  const openAvatarSelection = (player: 'X' | 'O') => {
    playClickSound();
    setSelectingPlayer(player);
    setIsAvatarModalOpen(true);
  };

  const toggleTheme = () => {
    playClickSound();
    setColorMode(t => t === 'light' ? 'dark' : 'light');
    setTimeout(() => saveSettings(), 50);
  };

  const toggleFullscreen = async () => {
    playClickSound();
    if (!document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } catch (err) {
        console.error("Error attempting to enable fullscreen:", err);
      }
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleMute = () => {
    playClickSound();
    setMutedState(m => {
      setMuted(!m);
      return !m;
    });
    setTimeout(() => saveSettings(), 50);
  };

  const openAudioSettings = () => {
    playClickSound();
    setIsAudioModalOpen(true);
  };

  const winnerInfo = calculateWinner(squares);
  const isDraw = !winnerInfo && !squares.includes(null);

  // Party game state polling
  useEffect(() => {
    if (!isPartyGame || !partyCode) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/party/${partyCode}/state`);
        const data = await res.json();
        if (!res.ok) return;

        const gs = data.game_state;
        if (!gs) return;

        const stateKey = JSON.stringify(gs);
        if (stateKey === lastAppliedStateRef.current) return;
        lastAppliedStateRef.current = stateKey;

        // Apply server state to local state
        setSquares(gs.squares);
        setXIsNext(gs.xIsNext);
        setScores(gs.scores);
        setGameOver(gs.gameOver);
        setRounds(gs.rounds);
        setMoveHistory(gs.moveHistory || []);
        setLastMoveIndex(gs.lastMoveIndex);

        // Sync player names and avatars from server
        if (gs.playerNames) {
          setPlayerNames(gs.playerNames);
        }
        if (gs.avatars) {
          setAvatars(gs.avatars);
        }
        // Sync streaks and highscores from server
        if (gs.streaks) {
          setStreaks(gs.streaks);
        }
        if (gs.highscores) {
          setHighscores(prev => ({
            pvp: Math.max(prev.pvp, gs.highscores.pvp || 0),
            pva: Math.max(prev.pva, gs.highscores.pva || 0)
          }));
        }

        // Play sounds for new game-over states
        if (gs.gameOver) {
          if (gs.winnerInfo) {
            playWinSound();
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
              colors: gs.winnerInfo.winner === 'X' ? ['#818cf8', '#c7d2fe'] : ['#fb7185', '#fecdd3']
            });
          } else if (gs.isDraw) {
            playDrawSound();
          }
        }
      } catch {
        // Silently ignore polling errors
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPartyGame, partyCode]);

  // Local game-over effects (only for non-party games)
  useEffect(() => {
    if (isPartyGame) return; // Party games handle this via polling

    if (winnerInfo && !gameOver) {
      setScores(prev => ({ ...prev, [winnerInfo.winner]: prev[winnerInfo.winner] + 1 }));
      
      const newStreakX = winnerInfo.winner === 'X' ? streaks.X + 1 : 0;
      const newStreakO = winnerInfo.winner === 'O' ? streaks.O + 1 : 0;
      setStreaks({ X: newStreakX, O: newStreakO });

      setGameOver(true);
      playWinSound();
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: winnerInfo.winner === 'X' ? ['#818cf8', '#c7d2fe'] : ['#fb7185', '#fecdd3']
      });

      if (opponentType === 'ai' && gameMode === 'classic') {
        const humanPlayer = aiPlayer === 'X' ? 'O' : 'X';
        if (winnerInfo.winner === humanPlayer) {
          setAiProgress(prev => ({
            ...prev,
            [aiDifficulty]: Math.min(prev[aiDifficulty] + 1, 5)
          }));
        }
      }
    } else if (isDraw && !gameOver) {
      setScores(prev => ({ ...prev, draws: prev.draws + 1 }));
      setStreaks({ X: 0, O: 0 }); // Reset streaks on draw
      setGameOver(true);
      playDrawSound();
    }
  }, [winnerInfo, isDraw, gameOver, opponentType, aiPlayer, aiDifficulty, gameMode, streaks.X, streaks.O, isPartyGame]);

  useEffect(() => {
    if (opponentType === 'ai' && aiPlayer && (xIsNext ? 'X' : 'O') === aiPlayer && !gameOver) {
      const timer = setTimeout(() => {
        const level = Math.min(aiProgress[aiDifficulty] + 1, 5);
        const bestMove = getBestMove(squares, aiPlayer, gameMode, moveHistory, aiDifficulty, level);
        if (bestMove !== -1) {
          handleClick(bestMove, true);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [xIsNext, aiPlayer, opponentType, gameOver, squares, gameMode, moveHistory, aiDifficulty, aiProgress]);

  // Synchronize winstreaks and highscores to database when game is over
  useEffect(() => {
    if (!gameOver || !user) return;

    // Determine user's symbol in the game
    let userSymbol: 'X' | 'O' = 'X';
    if (opponentType === 'player') {
      if (isPartyGame) {
        userSymbol = playerNames.X === user.username ? 'X' : 'O';
      } else {
        // In local PvP, logged-in player is always X
        userSymbol = 'X';
      }
    } else {
      // In PvA, user is always X
      userSymbol = 'X';
    }

    const currentStreak = streaks[userSymbol];
    let newHighscores = { ...highscores };
    let hasNew = false;

    if (opponentType === 'ai') {
      if (currentStreak > highscores.pva) {
        newHighscores.pva = currentStreak;
        hasNew = true;
      }
    } else {
      if (currentStreak > highscores.pvp) {
        newHighscores.pvp = currentStreak;
        hasNew = true;
      }
    }

    if (hasNew) {
      setHighscores(newHighscores);
      submitRecords({
        pvp_highscore: newHighscores.pvp,
        pva_highscore: newHighscores.pva
      });
    } else {
      submitRecords({
        pvp_highscore: newHighscores.pvp,
        pva_highscore: newHighscores.pva
      });
    }
  }, [gameOver, streaks.X, streaks.O, opponentType, isPartyGame, playerNames.X, playerNames.O, user, highscores.pvp, highscores.pva, submitRecords]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAudioModalOpen || isAvatarModalOpen || editingName !== null) return;

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'].includes(e.key)) {
        e.preventDefault();

        if (e.key === 'Enter') {
          if (focusedIndex !== null && !squares[focusedIndex] && !gameOver) {
            handleClick(focusedIndex);
          }
          return;
        }

        setFocusedIndex(prev => {
          const current = prev !== null ? prev : 4;
          switch (e.key) {
            case 'ArrowUp':
              return current >= 3 ? current - 3 : current;
            case 'ArrowDown':
              return current <= 5 ? current + 3 : current;
            case 'ArrowLeft':
              return current % 3 !== 0 ? current - 1 : current;
            case 'ArrowRight':
              return current % 3 !== 2 ? current + 1 : current;
            default:
              return current;
          }
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAudioModalOpen, isAvatarModalOpen, editingName, squares, gameOver, xIsNext, focusedIndex]);

  const handleClick = async (i: number, isAiMove: boolean = false) => {
    if (squares[i] || winnerInfo || isDraw) return;
    
    // In party mode, verify it's the current user's turn
    if (isPartyGame && user) {
      const activePlayerName = xIsNext ? playerNames.X : playerNames.O;
      if (user.username !== activePlayerName) return;
    }
    
    const player = xIsNext ? 'X' : 'O';
    if (opponentType === 'ai' && aiPlayer === player && !isAiMove) return;

    // Party game: send move to server
    if (isPartyGame && partyCode && user) {
      try {
        const res = await fetch(`${API_BASE}/party/${partyCode}/move`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ index: i, username: user.username }),
        });
        const data = await res.json();
        if (res.ok && data.game_state) {
          // Apply server state immediately
          const gs = data.game_state;
          lastAppliedStateRef.current = JSON.stringify(gs);
          setSquares(gs.squares);
          setXIsNext(gs.xIsNext);
          setScores(gs.scores);
          setGameOver(gs.gameOver);
          setRounds(gs.rounds);
          setMoveHistory(gs.moveHistory || []);
          setLastMoveIndex(gs.lastMoveIndex);
          playMoveSound(player);

          // Sync player names and avatars from server
          if (gs.playerNames) {
            setPlayerNames(gs.playerNames);
          }
          if (gs.avatars) {
            setAvatars(gs.avatars);
          }
          // Sync streaks and highscores from server
          if (gs.streaks) {
            setStreaks(gs.streaks);
          }
          if (gs.highscores) {
            setHighscores(prev => ({
              pvp: Math.max(prev.pvp, gs.highscores.pvp || 0),
              pva: Math.max(prev.pva, gs.highscores.pva || 0)
            }));
          }

          if (gs.gameOver) {
            if (gs.winnerInfo) {
              playWinSound();
              confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: gs.winnerInfo.winner === 'X' ? ['#818cf8', '#c7d2fe'] : ['#fb7185', '#fecdd3']
              });
            } else if (gs.isDraw) {
              playDrawSound();
            }
          }
        } else {
          console.error('Move rejected:', data.error);
        }
      } catch (err) {
        console.error('Failed to send move:', err);
      }
      return;
    }
    
    // Local game logic
    let nextSquares = squares.slice();
    let nextHistory = [...moveHistory];

    if (gameMode === 'infinite') {
      const playerMoves = nextHistory.filter(m => m.player === player);
      if (playerMoves.length >= 3) {
        const oldestMove = playerMoves[0];
        nextSquares[oldestMove.index] = null;
        nextHistory = nextHistory.filter(m => m !== oldestMove);
      }
    }

    nextSquares[i] = player;
    nextHistory.push({ player, index: i, timestamp: Date.now() });

    setSquares(nextSquares);
    setMoveHistory(nextHistory);
    setXIsNext(!xIsNext);
    setLastMoveIndex(i);
    playMoveSound(player);
  };

  const resetGame = async () => {
    playClickSound();
    
    // Party game: reset via server
    if (isPartyGame && partyCode) {
      try {
        const res = await fetch(`${API_BASE}/party/${partyCode}/reset`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        const data = await res.json();
        if (res.ok && data.game_state) {
          const gs = data.game_state;
          lastAppliedStateRef.current = JSON.stringify(gs);
          setSquares(gs.squares);
          setXIsNext(gs.xIsNext);
          setScores(gs.scores);
          setGameOver(gs.gameOver);
          setRounds(gs.rounds);
          setMoveHistory(gs.moveHistory || []);
          setLastMoveIndex(gs.lastMoveIndex);
          if (gs.playerNames) setPlayerNames(gs.playerNames);
          if (gs.avatars) setAvatars(gs.avatars);
          if (gs.streaks) setStreaks(gs.streaks);
          if (gs.highscores) {
            setHighscores(prev => ({
              pvp: Math.max(prev.pvp, gs.highscores.pvp || 0),
              pva: Math.max(prev.pva, gs.highscores.pva || 0)
            }));
          }
        }
      } catch (err) {
        console.error('Failed to reset party game:', err);
      }
      return;
    }

    setLastMoveIndex(null);
    setSquares(Array(9).fill(null));
    setMoveHistory([]);
    setGameOver(false);
    
    // Alternate starting player: odd rounds start with X, even rounds start with O
    const nextRound = rounds + 1;
    setRounds(nextRound);
    setXIsNext(nextRound % 2 !== 0);
    
    setEditingName(null);
  };

  const resetScores = (type: OpponentType = opponentType) => {
    playClickSound();
    setLastMoveIndex(null);
    setScores({ X: 0, O: 0, draws: 0 });
    setStreaks({ X: 0, O: 0 });
    setRounds(1);
    setSquares(Array(9).fill(null));
    setMoveHistory([]);
    setGameOver(false);
    setXIsNext(true);
    
    if (type === 'ai') {
      setPlayerNames({ X: 'You', O: 'AI' });
      setAiPlayer('O');
      setAvatars({ X: 'User', O: 'Cpu' });
    } else {
      setPlayerNames({ X: 'Player 1', O: 'Player 2' });
      setAiPlayer(null);
      setAvatars({ X: 'User', O: 'Smile' });
    }
  };

  const handleBackToMenu = () => {
    // Close party session if in party game
    if (isPartyGame && partyCode) {
      fetch(`${API_BASE}/party/${partyCode}`, { method: 'DELETE' }).catch(() => {});
      setIsPartyGame(false);
      setPartyCode(null);
    }
    setCurrentView('menu');
  };

  let statusText = `${playerNames[xIsNext ? 'X' : 'O']}'s Turn`;
  let statusClass = "text-lg font-semibold bg-white dark:bg-slate-800 px-6 py-2 rounded-full border border-slate-200 dark:border-slate-700 transition-colors duration-300";
  if (winnerInfo) {
    statusText = `${playerNames[winnerInfo.winner as 'X' | 'O']} Wins!`;
    statusClass = "text-lg font-semibold bg-green-100 dark:bg-green-600 text-green-800 dark:text-white px-6 py-2 rounded-full border border-green-300 dark:border-green-400 transition-colors duration-300";
  } else if (isDraw) {
    statusText = 'Match Draw!';
  }

  const getFadingIndex = () => {
    if (gameMode !== 'infinite' || gameOver) return null;
    const currentPlayer = xIsNext ? 'X' : 'O';
    const playerMoves = moveHistory.filter(m => m.player === currentPlayer);
    if (playerMoves.length >= 3) {
      return playerMoves[0].index;
    }
    return null;
  };
  const handleNameSubmit = (player: 'X' | 'O') => {
    const newName = tempName.trim() || `Player ${player === 'X' ? '1' : '2'}`;
    setPlayerNames(prev => ({ ...prev, [player]: newName }));
    if (user && !user.isGuest && playerNames[player] === user.username) {
      setUser(prev => prev ? { ...prev, username: newName } : null);
    }
    setEditingName(null);
    playClickSound();

    // Sync name to server in party mode
    if (isPartyGame && partyCode && user) {
      fetch(`${API_BASE}/party/${partyCode}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_name: newName, username: user.username }),
      }).catch(() => {});
    }
  };

  const fadingIndex = getFadingIndex();

  if (!user) {
    return <AuthPage onLogin={handleLogin} />;
  }

  if (currentView === 'menu') {
    return (
      <MainMenu 
        onSelectMode={(mode) => {
          if (mode === 'pva') {
            setOpponentType('ai');
            resetScores('ai');
            setCurrentView('game');
          } else {
            setCurrentView('pvp_menu');
          }
        }}
        onLogout={handleLogout}
        theme={currentTheme}
        colorMode={colorMode}
      />
    );
  }

  if (currentView === 'pvp_menu') {
    return (
      <PvPMenu
        onSelectType={(type) => {
          if (type === 'offline') {
            setOpponentType('player');
            resetScores('player');
            setCurrentView('game');
          } else {
            setCurrentView('party');
          }
        }}
        onBack={() => setCurrentView('menu')}
        theme={currentTheme}
        colorMode={colorMode}
      />
    );
  }

  if (currentView === 'party') {
    return (
      <PartyPage
        username={user.username}
        guestId={user.guestId}
        onStartGame={(code, isLeader, memberName) => {
          setPartyCode(code);
          setIsPartyLeader(isLeader);
          setIsPartyGame(true);
          setOpponentType('player');
          resetScores('player');
          // Set correct names AFTER resetScores (leader is always X, member is always O)
          if (isLeader) {
            setPlayerNames({ X: user.username, O: memberName });
          } else {
            setPlayerNames({ X: memberName, O: user.username });
          }
          setCurrentView('game');
        }}
        onBack={() => setCurrentView('pvp_menu')}
        theme={currentTheme}
        colorMode={colorMode}
      />
    );
  }

  return (
    <div className={`${colorMode} min-h-screen w-full ${currentTheme.colors.bgLight} ${currentTheme.colors.bgDark} flex flex-col font-sans ${currentTheme.colors.textLight} ${currentTheme.colors.textDark} select-none overflow-hidden transition-colors duration-300`}>
      {/* Header */}
      <div className={`flex flex-col sm:flex-row items-center justify-between px-4 sm:px-10 py-4 sm:py-6 border-b border-slate-200 dark:border-slate-800 ${currentTheme.colors.cardLight} ${currentTheme.colors.cardDark} shadow-sm gap-4 transition-colors duration-300`}>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleBackToMenu} 
            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors mr-2"
            title="Back to Menu"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-indigo-500/20">#</div>
          <h1 className="text-2xl font-bold tracking-tight">TicTacPro <span className="text-indigo-600 dark:text-indigo-400 font-medium text-sm ml-2 uppercase tracking-widest">{currentTheme.name}</span></h1>
        </div>
        
        <div className={statusClass}>
          {statusText}
        </div>
        
        <div className="flex gap-2 items-center">
          {opponentType === 'ai' && gameMode === 'classic' && (
            <div className="flex gap-2 mr-2">
              <select 
                value={aiDifficulty}
                onChange={(e) => {
                  setAiDifficulty(e.target.value as Difficulty);
                  resetScores('ai');
                  setTimeout(() => saveSettings(), 50);
                }}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm rounded-md px-2 py-1.5 outline-none text-slate-700 dark:text-slate-200"
              >
                <option value="easy">{aiProgress.easy >= 5 ? 'Zen Easy' : 'Easy'}</option>
                <option value="medium">{aiProgress.medium >= 5 ? 'Zen Medium' : 'Medium'}</option>
                <option value="hard">{aiProgress.hard >= 5 ? 'Zen Difficult' : 'Difficult'}</option>
              </select>
              <button
                onClick={() => setIsAchievementsModalOpen(true)}
                className="p-1.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-yellow-500 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                title="AI Achievements"
              >
                <Trophy size={18} />
              </button>
            </div>
          )}
          
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 mr-2">
            <button
              onClick={() => { setGameMode('classic'); resetScores(); setTimeout(() => saveSettings(), 50); }}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${gameMode === 'classic' ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            >
              Classic
            </button>
            <button
              onClick={() => { setGameMode('infinite'); resetScores(); setTimeout(() => saveSettings(), 50); }}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${gameMode === 'infinite' ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            >
              <InfinityIcon size={14} /> Infinite
            </button>
          </div>
          
          <select 
            value={themeId}
            onChange={(e) => {
              const newThemeId = e.target.value as ThemeId;
              setThemeId(newThemeId);
              const newTheme = THEMES[newThemeId];
              const keys = Object.keys(newTheme.avatars);
              setAvatars({ X: keys[0], O: keys[1] || keys[0] });
              setTimeout(() => saveSettings(), 50);
            }}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm rounded-md px-2 py-1 mr-2 outline-none text-slate-700 dark:text-slate-200"
          >
            {Object.values(THEMES).map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>

          {gameMode === 'infinite' && (
            <button onClick={() => setIsStatsModalOpen(true)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors" title="View Highscores">
              <Award size={20} />
            </button>
          )}
          <button onClick={openAudioSettings} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors" title="Audio Settings">
            <Settings2 size={20} />
          </button>
          <button onClick={toggleMute} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors" title={muted ? "Unmute Sound" : "Mute Sound"}>
            {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          <button onClick={toggleFullscreen} className="p-2 mr-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors" title="Toggle Fullscreen">
            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
          </button>
          <button onClick={toggleTheme} className="p-2 mr-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors" title="Toggle Color Mode">
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={() => resetScores()} className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 px-4 py-2 rounded-md font-medium transition-colors border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 text-sm" title="Reset Scores">
            Reset All
          </button>
          {!user.isGuest && (
            <button 
              onClick={() => { submitRecords(); handleLogout(); }} 
              className="p-2 mr-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors" 
              title="Save & Log Out"
            >
              <LogOut size={20} />
            </button>
          )}
          {user.isGuest && (
          <button onClick={handleLogout} className="p-2 mr-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors" title="Log Out">
              <LogOut size={20} />
            </button>
          )}
          <button onClick={() => { submitRecords(); resetGame(); }} className="bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 px-5 py-2 rounded-md font-medium transition-colors border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-white">
            New Match
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Game Area */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 overflow-y-auto">
          
          <div className="flex flex-col xl:flex-row items-center justify-center gap-8 xl:gap-16 w-full">
          {/* Player 1 Panel */}
          <div className="flex flex-row flex-wrap xl:flex-col gap-4 xl:gap-6 w-full xl:w-56 justify-center">
            <div className={`${currentTheme.colors.cardLight} ${currentTheme.colors.cardDark} p-4 sm:p-6 rounded-2xl border shadow-xl text-center ring-2 ring-indigo-500/10 dark:ring-indigo-500/20 flex-1 xl:flex-none transition-colors duration-300`}>
              <div className="flex justify-center mb-2">
                <button 
                  onClick={() => openAvatarSelection('X')}
                  className={`p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 ${currentTheme.colors.primaryLight} ${currentTheme.colors.primaryDark} transition-colors cursor-pointer`}
                  title="Change Player X Avatar"
                >
                  {(() => {
                    const IconX = currentTheme.avatars[avatars.X];
                    return IconX ? <IconX size={24} /> : null;
                  })()}
                </button>
              </div>
              {editingName === 'X' ? (
                <form onSubmit={(e) => { e.preventDefault(); handleNameSubmit('X'); }} className="mb-2">
                  <input
                    autoFocus
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    onBlur={() => handleNameSubmit('X')}
                    className={`w-full text-center bg-black/5 dark:bg-white/5 ${currentTheme.colors.primaryLight} ${currentTheme.colors.primaryDark} text-xs font-bold uppercase tracking-widest border border-black/10 dark:border-white/10 rounded px-2 py-1 outline-none focus:ring-1 focus:ring-indigo-500 transition-colors`}
                    maxLength={15}
                  />
                </form>
              ) : (
                <div 
                  onClick={() => {
                    // In party mode, check if this X slot belongs to the current user
                    if (isPartyGame && playerNames.X !== user?.username) return;
                    setEditingName('X'); setTempName(playerNames.X); playClickSound();
                  }}
                  className={`${currentTheme.colors.primaryLight} ${currentTheme.colors.primaryDark} text-xs font-bold uppercase tracking-widest mb-2 ${isPartyGame && playerNames.X !== user?.username ? '' : 'cursor-pointer hover:opacity-80'} transition-opacity truncate px-2`}
                  title={isPartyGame && playerNames.X !== user?.username ? '' : "Edit name"}
                >
                  {playerNames.X}
                </div>
              )}
              <div className={`text-4xl sm:text-5xl font-black ${currentTheme.colors.textLight} ${currentTheme.colors.textDark} mb-1`}>{scores.X}</div>
              <div className={`${currentTheme.colors.primaryLight} ${currentTheme.colors.primaryDark} opacity-80 text-xl font-bold ${streaks.X >= 2 ? 'mb-2' : ''}`}>X</div>
              {streaks.X >= 2 && (
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 text-xs font-bold px-2 py-1 rounded-md inline-block uppercase tracking-wider"
                >
                  {streaks.X} Win Streak 🔥
                </motion.div>
              )}
            </div>
            <div className="hidden xl:block bg-slate-100 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-sm italic text-slate-500 text-center leading-relaxed transition-colors duration-300">
              {gameMode === 'classic' 
                ? 'Winning players are highlighted in real-time. Local sessions persist until refresh.'
                : 'Infinite Mode: Each player can only have 3 pieces on the board. Oldest pieces fade and disappear!'}
            </div>
            {opponentType === 'ai' && gameMode === 'classic' && (
              <AIProgressPanel difficulty={aiDifficulty} progress={aiProgress} />
            )}
          </div>

          {/* Board */}
          <motion.div 
            key={rounds}
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className={`relative ${currentTheme.colors.boardBgLight} ${currentTheme.colors.boardBgDark} p-2 sm:p-3 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700/50 shrink-0 transition-colors duration-300`}
          >
            <div className="grid grid-cols-3 gap-2 sm:gap-3 w-[280px] h-[280px] sm:w-[420px] sm:h-[420px]">
              {squares.map((square, i) => (
                <Square
                  key={i}
                  value={square}
                  onClick={() => handleClick(i)}
                  isWinningSquare={winnerInfo?.line.includes(i) ?? false}
                  disabled={gameOver || square !== null || (isPartyGame && user?.username !== (xIsNext ? playerNames.X : playerNames.O))}
                  isLastMove={lastMoveIndex === i}
                  isFocused={focusedIndex === i}
                  icon={square ? currentTheme.avatars[avatars[square]] : undefined}
                  isFading={fadingIndex === i}
                  theme={currentTheme}
                />
              ))}
            </div>
          </motion.div>

          {/* Player 2 Panel */}
          <div className="flex flex-row xl:flex-col gap-4 xl:gap-6 w-full xl:w-56 justify-center">
            <div className={`${currentTheme.colors.cardLight} ${currentTheme.colors.cardDark} p-4 sm:p-6 rounded-2xl border shadow-xl text-center ring-2 ring-rose-500/10 dark:ring-rose-500/20 flex-1 xl:flex-none transition-colors duration-300`}>
              <div className="flex justify-center mb-2">
                <button 
                  onClick={() => openAvatarSelection('O')}
                  className={`p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 ${currentTheme.colors.secondaryLight} ${currentTheme.colors.secondaryDark} transition-colors cursor-pointer`}
                  title="Change Player O Avatar"
                >
                  {(() => {
                    const IconO = currentTheme.avatars[avatars.O];
                    return IconO ? <IconO size={24} /> : null;
                  })()}
                </button>
              </div>
              {editingName === 'O' ? (
                <form onSubmit={(e) => { e.preventDefault(); handleNameSubmit('O'); }} className="mb-2">
                  <input
                    autoFocus
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    onBlur={() => handleNameSubmit('O')}
                    className={`w-full text-center bg-black/5 dark:bg-white/5 ${currentTheme.colors.secondaryLight} ${currentTheme.colors.secondaryDark} text-xs font-bold uppercase tracking-widest border border-black/10 dark:border-white/10 rounded px-2 py-1 outline-none focus:ring-1 focus:ring-rose-500 transition-colors`}
                    maxLength={15}
                  />
                </form>
              ) : (
                <div 
                  onClick={() => {
                    // In party mode, check if this O slot belongs to the current user
                    if (isPartyGame && playerNames.O !== user?.username) return;
                    setEditingName('O'); setTempName(playerNames.O); playClickSound();
                  }}
                  className={`${currentTheme.colors.secondaryLight} ${currentTheme.colors.secondaryDark} text-xs font-bold uppercase tracking-widest mb-2 ${isPartyGame && playerNames.O !== user?.username ? '' : 'cursor-pointer hover:opacity-80'} transition-opacity truncate px-2`}
                  title={isPartyGame && playerNames.O !== user?.username ? '' : "Edit name"}
                >
                  {playerNames.O}
                </div>
              )}
              <div className={`text-4xl sm:text-5xl font-black ${currentTheme.colors.textLight} ${currentTheme.colors.textDark} mb-1`}>{scores.O}</div>
              <div className={`${currentTheme.colors.secondaryLight} ${currentTheme.colors.secondaryDark} opacity-80 text-xl font-bold ${streaks.O >= 2 ? 'mb-2' : ''}`}>O</div>
              {streaks.O >= 2 && (
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 text-xs font-bold px-2 py-1 rounded-md inline-block uppercase tracking-wider"
                >
                  {streaks.O} Win Streak 🔥
                </motion.div>
              )}
            </div>
            
            <div className="grid grid-cols-1 gap-2 flex-1 xl:flex-none content-center">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700/50 flex justify-between items-center h-[54px] xl:h-auto transition-colors duration-300">
                <span className="text-xs text-slate-500 dark:text-slate-400">Draws</span>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-200">{scores.draws}</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700/50 flex justify-between items-center h-[54px] xl:h-auto transition-colors duration-300">
                <span className="text-xs text-slate-500 dark:text-slate-400">Round</span>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-200">{rounds}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Score Chart */}
        <div className="mt-8 xl:mt-12 w-full max-w-3xl shrink-0">
          <ScoreChart scores={scores} theme={colorMode} playerNames={playerNames} themeConfig={currentTheme} />
        </div>
        </div>

        {/* Move History Sidebar */}
        <MoveHistorySidebar moveHistory={moveHistory} themeConfig={currentTheme} playerNames={playerNames} />
      </div>

      {/* Footer */}
      <div className="h-16 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-8 bg-slate-50 dark:bg-slate-900/20 text-slate-500 text-xs tracking-widest uppercase font-semibold shrink-0 transition-colors duration-300">
        <div className="flex gap-4 sm:gap-8 flex-wrap items-center">
          <span>Local Multiplayer</span>
          <span className="hidden sm:inline">|</span>
          <span>TicTacPro Engine</span>
        </div>
        <div>
          <SoundVisualizer themeConfig={currentTheme} isDark={isDark} />
        </div>
      </div>
      
      <AudioSettingsModal isOpen={isAudioModalOpen} onClose={() => setIsAudioModalOpen(false)} />
      
      <AvatarSelectionModal 
        isOpen={isAvatarModalOpen} 
        onClose={() => setIsAvatarModalOpen(false)}
        player={selectingPlayer}
        currentAvatar={selectingPlayer ? avatars[selectingPlayer] : 'User'}
        onSelect={(avatar) => {
          if (selectingPlayer) {
            setAvatars(prev => ({ ...prev, [selectingPlayer]: avatar }));
            setTimeout(() => saveSettings(), 50);
            // Sync avatar to server in party mode
            if (isPartyGame && partyCode && user) {
              fetch(`${API_BASE}/party/${partyCode}/settings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ avatar, username: user.username }),
              }).catch(() => {});
            }
          }
        }}
        theme={currentTheme}
      />
      
      <AchievementsModal 
        isOpen={isAchievementsModalOpen} 
        onClose={() => setIsAchievementsModalOpen(false)} 
        progress={aiProgress} 
        theme={colorMode} 
      />
      
      <StatsModal
        isOpen={isStatsModalOpen}
        onClose={() => setIsStatsModalOpen(false)}
        highscores={highscores}
        theme={currentTheme}
        colorMode={colorMode}
      />
    </div>
  );
}