import { Player, WinnerInfo } from "./types";

export function calculateWinner(squares: (Player | null)[]): WinnerInfo | null {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
    [0, 4, 8], [2, 4, 6]             // diagonals
  ];
  
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a] as Player, line: lines[i] };
    }
  }
  return null;
}

export function getBestMove(
  squares: (Player | null)[], 
  aiPlayer: Player, 
  gameMode: 'classic' | 'infinite', 
  moveHistory: {player: Player, index: number}[],
  difficulty: 'easy' | 'medium' | 'hard',
  level: number
): number {
  const humanPlayer = aiPlayer === 'X' ? 'O' : 'X';
  const emptySquares = squares.map((val, i) => val === null ? i : null).filter(val => val !== null) as number[];

  if (emptySquares.length === 0) return -1;

  // Determine mistake probability based on difficulty and level
  // level is 1 to 5
  let mistakeProbability = 0;
  if (difficulty === 'easy') {
    mistakeProbability = 0.8 - ((level - 1) * 0.1); // 80% to 40%
  } else if (difficulty === 'medium') {
    mistakeProbability = 0.4 - ((level - 1) * 0.075); // 40% to 10%
  } else if (difficulty === 'hard') {
    mistakeProbability = 0.1 - ((level - 1) * 0.025); // 10% to 0%
  }

  const makeMistake = Math.random() < mistakeProbability;

  if (makeMistake) {
    return emptySquares[Math.floor(Math.random() * emptySquares.length)];
  }

  // Helper to check if a move wins
  const wins = (player: Player, move: number) => {
    let nextSquares = [...squares];
    
    let nextHistory = [...moveHistory];
    if (gameMode === 'infinite') {
      const playerMoves = nextHistory.filter(m => m.player === player);
      if (playerMoves.length >= 3) {
        nextSquares[playerMoves[0].index] = null;
      }
    }
    
    nextSquares[move] = player;
    return calculateWinner(nextSquares) !== null;
  };

  // 1. Can AI win?
  for (let i of emptySquares) {
    if (wins(aiPlayer, i)) return i;
  }

  // 2. Can AI block Human win?
  for (let i of emptySquares) {
    if (wins(humanPlayer, i)) return i;
  }

  // 3. Play center if available
  if (emptySquares.includes(4)) return 4;

  // 4. Play corners if available
  const corners = [0, 2, 6, 8].filter(c => emptySquares.includes(c));
  if (corners.length > 0) {
    return corners[Math.floor(Math.random() * corners.length)];
  }

  // 5. Play random available
  return emptySquares[Math.floor(Math.random() * emptySquares.length)];
}
