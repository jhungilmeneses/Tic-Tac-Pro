import React, { useState, useEffect, useCallback } from 'react';
import { Users, Copy, RefreshCw, ArrowLeft, Play, LogIn } from 'lucide-react';
import { ThemeConfig } from '../themes';

const API_BASE = '/api';

interface PartyPageProps {
  onStartGame: (partyCode: string, isLeader: boolean, memberName: string) => void;
  onBack: () => void;
  username: string;
  guestId?: string;
  theme: ThemeConfig;
  colorMode: 'light' | 'dark';
}

export function PartyPage({ onStartGame, onBack, username, guestId, theme, colorMode }: PartyPageProps) {
  const [partyCode, setPartyCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [isLeader, setIsLeader] = useState(true);
  const [member, setMember] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(true);
  const [isStarting, setIsStarting] = useState(false);

  const createParty = useCallback(async () => {
    setIsCreating(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/party/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, guest_id: guestId || null }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create party');
        return;
      }
      setPartyCode(data.code);
      setIsLeader(true);
      setMember(null);
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setIsCreating(false);
    }
  }, [username, guestId]);

  useEffect(() => {
    createParty();
  }, [createParty]);

  // Leader polls for member join
  useEffect(() => {
    if (!isLeader || !partyCode) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/party/${partyCode}`);
        const data = await res.json();
        if (res.ok && data.member_username) {
          setMember(data.member_username);
        }
      } catch {
        // Silently ignore polling errors
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isLeader, partyCode]);

  // Non-leader polls for game start (status = 'playing')
  useEffect(() => {
    if (isLeader || !partyCode) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/party/${partyCode}`);
        const data = await res.json();
        if (res.ok && data.status === 'playing') {
          // Game started! Navigate to game
          onStartGame(partyCode, false, data.leader_username);
        }
      } catch {
        // Silently ignore polling errors
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isLeader, partyCode, onStartGame]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (joinCode.length < 6) return;

    setError(null);
    setIsJoining(true);
    try {
      const res = await fetch(`${API_BASE}/party/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code: joinCode, 
          username, 
          guest_id: guestId || null 
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to join party');
        setIsJoining(false);
        return;
      }
      setIsLeader(false);
      setPartyCode(data.code);
      setMember(data.leader_username);
      setIsJoining(false);
    } catch (err) {
      setError('Failed to connect to server');
      setIsJoining(false);
    }
  };

  const handleStartGame = async () => {
    if (!partyCode) return;
    setIsStarting(true);
    try {
      const res = await fetch(`${API_BASE}/party/${partyCode}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to start game');
        setIsStarting(false);
        return;
      }
      // Navigate to game with the server-confirmed state
      onStartGame(partyCode, true, member || '');
    } catch (err) {
      setError('Failed to connect to server');
      setIsStarting(false);
    }
  };

  const handleBack = () => {
    // Close party session if leader
    if (isLeader && partyCode) {
      fetch(`${API_BASE}/party/${partyCode}`, { method: 'DELETE' }).catch(() => {});
    }
    onBack();
  };

  return (
    <div className={`min-h-screen w-full ${theme.colors.bgLight} ${theme.colors.bgDark} flex flex-col items-center justify-center p-4 transition-colors duration-300`}>
      <div className={`max-w-md w-full ${colorMode === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} rounded-3xl shadow-xl overflow-hidden border p-8 space-y-8 animate-in slide-in-from-right-8 duration-300`}>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={handleBack}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="text-left flex-1">
            <h1 className="text-2xl font-black tracking-tight mb-1">Party Room</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Play with friends online</p>
          </div>
          <div className={`p-3 rounded-xl ${theme.colors.primaryLight} ${theme.colors.primaryDark}`}>
            <Users size={24} className="text-indigo-600 dark:text-indigo-400" />
          </div>
        </div>

        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {isLeader ? (
          <div className="space-y-6">
            <div className={`p-6 rounded-2xl text-center border ${colorMode === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-2 font-medium uppercase tracking-wider">Your Party Code</p>
              {isCreating ? (
                <div className="text-4xl font-mono font-black tracking-widest text-indigo-600 dark:text-indigo-400 mb-4 animate-pulse">
                  CREATING...
                </div>
              ) : (
                <>
                  <div className="text-4xl font-mono font-black tracking-widest text-indigo-600 dark:text-indigo-400 mb-4">
                    {partyCode}
                  </div>
                  <div className="flex justify-center gap-3">
                    <button 
                      onClick={() => navigator.clipboard.writeText(partyCode)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Copy size={16} /> Copy
                    </button>
                    <button 
                      onClick={createParty}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <RefreshCw size={16} /> Regenerate
                    </button>
                  </div>
                </>
              )}
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 px-2">Players (2 Max)</h3>
              <div className="space-y-2">
                <div className={`flex items-center justify-between p-3 rounded-xl border ${colorMode === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                  <span className="font-medium flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    {username} (You)
                  </span>
                  <span className="text-xs bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded font-bold">LEADER</span>
                </div>
                
                {member ? (
                  <div className={`flex items-center justify-between p-3 rounded-xl border ${colorMode === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                    <span className="font-medium flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      {member}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">READY</span>
                  </div>
                ) : (
                  <div className={`flex items-center justify-center p-3 rounded-xl border border-dashed ${colorMode === 'dark' ? 'border-slate-700 bg-slate-800/50 text-slate-500' : 'border-slate-300 bg-slate-50 text-slate-400'}`}>
                    Waiting for player...
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleStartGame}
              disabled={!member || isStarting}
              className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${member && !isStarting ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg' : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'}`}
            >
              <Play size={20} />
              {isStarting ? 'Starting...' : 'Proceed to Game'}
            </button>
            
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
              <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-medium uppercase">Or</span>
              <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
            </div>

            <form onSubmit={handleJoin} className="flex gap-2">
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="Enter party code"
                maxLength={6}
                className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none font-mono uppercase focus:ring-2 focus:ring-indigo-500"
              />
              <button 
                type="submit"
                disabled={joinCode.length < 6 || isJoining}
                className="px-4 py-2 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white rounded-lg font-medium flex items-center gap-2 disabled:opacity-50 transition-colors"
              >
                {isJoining ? 'Joining...' : <><LogIn size={18} /> Join</>}
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-6 text-center">
            <div className={`p-8 rounded-2xl border ${colorMode === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
              <Users size={48} className="mx-auto mb-4 text-indigo-500" />
              <h2 className="text-xl font-bold mb-2">Joined Party</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-2">Leader: <span className="font-bold text-indigo-600 dark:text-indigo-400">{member || 'Unknown'}</span></p>
              <p className="text-slate-500 dark:text-slate-400 mb-6">Waiting for the party leader to start the game.</p>
              
              <div className="inline-block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2">
                <span className="text-xs font-bold text-slate-400 uppercase mr-2">Code:</span>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{partyCode}</span>
              </div>
            </div>
            
            <p className="text-sm text-slate-500 dark:text-slate-400 animate-pulse">
              The game will begin shortly...
            </p>

            <button
              onClick={onBack}
              className="px-6 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Leave Party
            </button>
          </div>
        )}
      </div>
    </div>
  );
}