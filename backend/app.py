import sqlite3
import os
import json
import string
import random
from datetime import datetime

from flask import Flask, request, jsonify, g
from flask_cors import CORS
import bcrypt

app = Flask(__name__)
CORS(app)

DB_PATH = os.path.join(os.path.dirname(__file__), 'tic_tac_toe.db')


def get_db():
    """Get a database connection for the current request."""
    if 'db' not in g:
        g.db = sqlite3.connect(DB_PATH)
        g.db.row_factory = sqlite3.Row
        g.db.execute("PRAGMA journal_mode=WAL")
        g.db.execute("PRAGMA foreign_keys=ON")
    return g.db


@app.teardown_appcontext
def close_db(exception):
    """Close the database connection at the end of a request."""
    db = g.pop('db', None)
    if db is not None:
        db.close()


def init_db():
    """Initialize the database schema."""
    db = sqlite3.connect(DB_PATH)
    db.row_factory = sqlite3.Row
    db.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            pvp_highscore INTEGER NOT NULL DEFAULT 0,
            pva_highscore INTEGER NOT NULL DEFAULT 0,
            ai_progress_easy INTEGER NOT NULL DEFAULT 0,
            ai_progress_medium INTEGER NOT NULL DEFAULT 0,
            ai_progress_hard INTEGER NOT NULL DEFAULT 0,
            updated_at TEXT NOT NULL DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE(user_id)
        );

        CREATE TABLE IF NOT EXISTS guest_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            guest_id TEXT UNIQUE NOT NULL,
            pvp_highscore INTEGER NOT NULL DEFAULT 0,
            pva_highscore INTEGER NOT NULL DEFAULT 0,
            ai_progress_easy INTEGER NOT NULL DEFAULT 0,
            ai_progress_medium INTEGER NOT NULL DEFAULT 0,
            ai_progress_hard INTEGER NOT NULL DEFAULT 0,
            updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER UNIQUE,
            guest_id TEXT UNIQUE,
            theme_id TEXT NOT NULL DEFAULT 'modern',
            color_mode TEXT NOT NULL DEFAULT 'dark',
            muted INTEGER NOT NULL DEFAULT 0,
            avatar_x TEXT NOT NULL DEFAULT 'User',
            avatar_o TEXT NOT NULL DEFAULT 'Smile',
            last_game_mode TEXT NOT NULL DEFAULT 'classic',
            last_ai_difficulty TEXT NOT NULL DEFAULT 'easy',
            updated_at TEXT NOT NULL DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS party_sessions (
            code TEXT PRIMARY KEY,
            leader_username TEXT NOT NULL,
            member_username TEXT,
            leader_guest_id TEXT,
            member_guest_id TEXT,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            member_joined_at TEXT,
            status TEXT NOT NULL DEFAULT 'waiting',
            game_state TEXT DEFAULT NULL
        );
    """)
    
    # Migration: add game_state column if missing (for existing databases)
    try:
        db.execute("ALTER TABLE party_sessions ADD COLUMN game_state TEXT DEFAULT NULL")
    except sqlite3.OperationalError:
        pass  # Column already exists
    
    db.commit()
    db.close()


# ─── Party Routes ──────────────────────────────────────────────────────────────

def generate_party_code():
    """Generate a unique 6-character party code."""
    chars = string.ascii_uppercase + string.digits
    while True:
        code = ''.join(random.choices(chars, k=6))
        db = get_db()
        existing = db.execute(
            'SELECT code FROM party_sessions WHERE code = ? AND status != ?',
            (code, 'closed')
        ).fetchone()
        if not existing:
            return code


@app.route('/api/party/create', methods=['POST'])
def create_party():
    """Create a new party session and return the code."""
    data = request.get_json() or {}
    username = data.get('username', 'Player 1')
    guest_id = data.get('guest_id')

    code = generate_party_code()
    db = get_db()
    db.execute(
        'INSERT INTO party_sessions (code, leader_username, leader_guest_id, status) VALUES (?, ?, ?, ?)',
        (code, username, guest_id, 'waiting')
    )
    db.commit()

    return jsonify({
        'code': code,
        'status': 'waiting',
        'leader_username': username,
        'member_username': None
    }), 201


@app.route('/api/party/join', methods=['POST'])
def join_party():
    """Join an existing party by code."""
    data = request.get_json() or {}
    code = data.get('code', '').strip().upper()
    username = data.get('username', 'Player 2')
    guest_id = data.get('guest_id')

    if not code or len(code) != 6:
        return jsonify({'error': 'Invalid party code'}), 400

    db = get_db()
    session = db.execute(
        'SELECT * FROM party_sessions WHERE code = ? AND status = ?',
        (code, 'waiting')
    ).fetchone()

    if not session:
        return jsonify({'error': 'Party not found or already closed'}), 404

    if session['member_username'] is not None:
        return jsonify({'error': 'Party is already full'}), 409

    if session['leader_username'] == username and session['leader_guest_id'] == guest_id:
        return jsonify({'error': 'Cannot join your own party'}), 400

    db.execute("""
        UPDATE party_sessions
        SET member_username = ?, member_guest_id = ?, member_joined_at = datetime('now'), status = 'ready'
        WHERE code = ?
    """, (username, guest_id, code))
    db.commit()

    return jsonify({
        'code': code,
        'status': 'ready',
        'leader_username': session['leader_username'],
        'member_username': username
    }), 200


@app.route('/api/party/<code>', methods=['GET'])
def get_party(code):
    """Get the current status of a party session."""
    code = code.upper()
    db = get_db()
    session = db.execute(
        'SELECT * FROM party_sessions WHERE code = ? AND status != ?',
        (code, 'closed')
    ).fetchone()

    if not session:
        return jsonify({'error': 'Party not found'}), 404

    return jsonify({
        'code': session['code'],
        'status': session['status'],
        'leader_username': session['leader_username'],
        'member_username': session['member_username'],
        'created_at': session['created_at'],
        'member_joined_at': session['member_joined_at']
    }), 200


@app.route('/api/party/<code>', methods=['DELETE'])
def close_party(code):
    """Close/delete a party session."""
    code = code.upper()
    db = get_db()
    session = db.execute(
        'SELECT code FROM party_sessions WHERE code = ? AND status != ?',
        (code, 'closed')
    ).fetchone()

    if not session:
        return jsonify({'error': 'Party not found'}), 404

    db.execute(
        'UPDATE party_sessions SET status = ? WHERE code = ?',
        ('closed', code)
    )
    db.commit()

    return jsonify({'message': 'Party closed'}), 200


# ─── Party Game Sync Routes ──────────────────────────────────────────────────

def calculate_winner(squares):
    """Calculate winner from squares array. Returns dict with winner and line, or None."""
    lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],  # rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8],  # cols
        [0, 4, 8], [2, 4, 6]              # diagonals
    ]
    for line in lines:
        a, b, c = line
        if squares[a] and squares[a] == squares[b] == squares[c]:
            return {'winner': squares[a], 'line': line}
    return None


def get_default_game_state():
    return {
        'squares': [None] * 9,
        'xIsNext': True,
        'scores': {'X': 0, 'O': 0, 'draws': 0},
        'gameOver': False,
        'rounds': 1,
        'moveHistory': [],
        'lastMoveIndex': None,
        'winnerInfo': None,
        'isDraw': False,
        'playerNames': {'X': 'Player 1', 'O': 'Player 2'},
        'avatars': {'X': 'User', 'O': 'Smile'},
        'xPlayer': 'leader',  # 'leader' or 'member' - who plays as X this round
        'streaks': {'X': 0, 'O': 0},
        'highscores': {'pvp': 0, 'pva': 0}
    }


@app.route('/api/party/<code>/start', methods=['POST'])
def start_party_game(code):
    """Start the game for a party. Sets status to 'playing' and initializes game state."""
    code = code.upper()
    db = get_db()
    session = db.execute(
        'SELECT * FROM party_sessions WHERE code = ? AND status = ?',
        (code, 'ready')
    ).fetchone()

    if not session:
        return jsonify({'error': 'Party not ready or not found'}), 400

    game_state = get_default_game_state()
    # Initialize player names with actual account usernames
    game_state['playerNames'] = {
        'X': session['leader_username'],
        'O': session['member_username']
    }
    db.execute(
        'UPDATE party_sessions SET status = ?, game_state = ? WHERE code = ?',
        ('playing', json.dumps(game_state), code)
    )
    db.commit()

    return jsonify({
        'message': 'Game started',
        'code': code,
        'status': 'playing',
        'game_state': game_state
    }), 200


@app.route('/api/party/<code>/move', methods=['POST'])
def make_party_move(code):
    """Submit a move in a party game. Server validates and updates state."""
    code = code.upper()
    data = request.get_json() or {}
    index = data.get('index')
    username = data.get('username')

    if index is None or index < 0 or index > 8:
        return jsonify({'error': 'Invalid move index'}), 400

    db = get_db()
    session = db.execute(
        'SELECT * FROM party_sessions WHERE code = ? AND status = ?',
        (code, 'playing')
    ).fetchone()

    if not session:
        return jsonify({'error': 'Game not active'}), 400

    game_state = json.loads(session['game_state']) if session['game_state'] else get_default_game_state()

    # Determine which player the requesting user is
    is_leader = username == session['leader_username']
    is_member = username == session['member_username']
    if not is_leader and not is_member:
        return jsonify({'error': 'Not a player in this game'}), 403

    # Use xPlayer to determine who is X this round ('leader' or 'member')
    x_player = game_state.get('xPlayer', 'leader')
    if x_player == 'leader':
        player = 'X' if is_leader else 'O'
    else:
        player = 'X' if is_member else 'O'

    # Validate it's this player's turn
    expected_player = 'X' if game_state['xIsNext'] else 'O'
    if player != expected_player:
        return jsonify({'error': 'Not your turn'}), 400

    # Validate the square is empty
    if game_state['squares'][index] is not None:
        return jsonify({'error': 'Square already taken'}), 400

    # Validate game not over
    if game_state['gameOver']:
        return jsonify({'error': 'Game is already over'}), 400

    # Apply the move
    game_state['squares'][index] = player
    game_state['moveHistory'].append({'player': player, 'index': index, 'timestamp': int(datetime.now().timestamp() * 1000)})
    game_state['lastMoveIndex'] = index
    game_state['xIsNext'] = not game_state['xIsNext']

    # Check for win or draw
    winner_info = calculate_winner(game_state['squares'])
    is_draw = not winner_info and None not in game_state['squares']

    if winner_info:
        game_state['gameOver'] = True
        game_state['winnerInfo'] = {'winner': winner_info['winner'], 'line': winner_info['line']}
        game_state['scores'][winner_info['winner']] += 1
        # Track streaks
        if 'streaks' not in game_state:
            game_state['streaks'] = {'X': 0, 'O': 0}
        winner = winner_info['winner']
        loser = 'O' if winner == 'X' else 'X'
        game_state['streaks'][winner] = game_state.get('streaks', {}).get(winner, 0) + 1
        game_state['streaks'][loser] = 0
        # Track highscores (max consecutive wins)
        if 'highscores' not in game_state:
            game_state['highscores'] = {'pvp': 0, 'pva': 0}
        current_streak = game_state['streaks'][winner]
        if current_streak > game_state['highscores'].get('pvp', 0):
            game_state['highscores']['pvp'] = current_streak
    elif is_draw:
        game_state['gameOver'] = True
        game_state['winnerInfo'] = None
        game_state['isDraw'] = True
        game_state['scores']['draws'] += 1
        # Reset streaks on draw
        if 'streaks' not in game_state:
            game_state['streaks'] = {'X': 0, 'O': 0}
        game_state['streaks']['X'] = 0
        game_state['streaks']['O'] = 0

    # Save state
    db.execute(
        'UPDATE party_sessions SET game_state = ? WHERE code = ?',
        (json.dumps(game_state), code)
    )
    db.commit()

    return jsonify({
        'message': 'Move accepted',
        'game_state': game_state
    }), 200


@app.route('/api/party/<code>/state', methods=['GET'])
def get_party_game_state(code):
    """Get the current game state for a party game."""
    code = code.upper()
    db = get_db()
    session = db.execute(
        'SELECT * FROM party_sessions WHERE code = ? AND status != ?',
        (code, 'closed')
    ).fetchone()

    if not session:
        return jsonify({'error': 'Party not found'}), 404

    game_state = json.loads(session['game_state']) if session['game_state'] else get_default_game_state()

    return jsonify({
        'code': code,
        'status': session['status'],
        'leader_username': session['leader_username'],
        'member_username': session['member_username'],
        'game_state': game_state
    }), 200


@app.route('/api/party/<code>/reset', methods=['POST'])
def reset_party_game(code):
    """Reset the game state for a new round."""
    code = code.upper()
    db = get_db()
    session = db.execute(
        'SELECT * FROM party_sessions WHERE code = ? AND status = ?',
        (code, 'playing')
    ).fetchone()

    if not session:
        return jsonify({'error': 'Game not active'}), 400

    current_state = json.loads(session['game_state']) if session['game_state'] else get_default_game_state()

    # Create new round state, preserving scores, names, avatars, streaks, highscores
    new_state = get_default_game_state()
    new_state['scores'] = current_state['scores']
    new_state['rounds'] = current_state['rounds'] + 1
    # Preserve names and avatars (each account keeps their own name)
    new_state['playerNames'] = current_state.get('playerNames', {'X': 'Player 1', 'O': 'Player 2'})
    new_state['avatars'] = current_state.get('avatars', {'X': 'User', 'O': 'Smile'})
    # Preserve streaks and highscores
    new_state['streaks'] = current_state.get('streaks', {'X': 0, 'O': 0})
    new_state['highscores'] = current_state.get('highscores', {'pvp': 0, 'pva': 0})
    
    # Toggle who starts this round: odd rounds start with X, even rounds start with O
    new_state['xIsNext'] = (new_state['rounds'] % 2 != 0)
    
    # Leader is always X, member is always O
    new_state['xPlayer'] = 'leader'

    db.execute(
        'UPDATE party_sessions SET game_state = ? WHERE code = ?',
        (json.dumps(new_state), code)
    )
    db.commit()

    return jsonify({
        'message': 'Game reset',
        'game_state': new_state
    }), 200


@app.route('/api/party/<code>/settings', methods=['POST'])
def update_party_settings(code):
    """Update player names and avatars for a party game."""
    code = code.upper()
    data = request.get_json() or {}
    username = data.get('username')

    db = get_db()
    session = db.execute(
        'SELECT * FROM party_sessions WHERE code = ? AND status = ?',
        (code, 'playing')
    ).fetchone()

    if not session:
        return jsonify({'error': 'Game not active'}), 400

    # Verify the user is a player in this game
    is_leader = username == session['leader_username']
    is_member = username == session['member_username']
    if not is_leader and not is_member:
        return jsonify({'error': 'Not a player in this game'}), 403

    game_state = json.loads(session['game_state']) if session['game_state'] else get_default_game_state()
    player = 'X' if is_leader else 'O'

    # Update fields
    if 'display_name' in data:
        if 'playerNames' not in game_state:
            game_state['playerNames'] = {'X': 'Player 1', 'O': 'Player 2'}
        game_state['playerNames'][player] = data['display_name']

    if 'avatar' in data:
        if 'avatars' not in game_state:
            game_state['avatars'] = {'X': 'User', 'O': 'Smile'}
        game_state['avatars'][player] = data['avatar']

    db.execute(
        'UPDATE party_sessions SET game_state = ? WHERE code = ?',
        (json.dumps(game_state), code)
    )
    db.commit()

    return jsonify({
        'message': 'Settings updated',
        'game_state': game_state
    }), 200


# ─── Auth Routes ──────────────────────────────────────────────────────────────

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Invalid request body'}), 400

    username = data.get('username', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not username or not email or not password:
        return jsonify({'error': 'Username, email, and password are required'}), 400
    if len(password) < 4:
        return jsonify({'error': 'Password must be at least 4 characters'}), 400

    password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    db = get_db()
    try:
        db.execute(
            'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
            (username, email, password_hash)
        )
        # Also create a records row for the new user
        user_id = db.execute('SELECT id FROM users WHERE email = ?', (email,)).fetchone()['id']
        db.execute(
            'INSERT OR IGNORE INTO records (user_id) VALUES (?)',
            (user_id,)
        )
        db.commit()
        return jsonify({'message': 'User created successfully', 'username': username, 'user_id': user_id}), 201
    except sqlite3.IntegrityError as e:
        if 'UNIQUE constraint failed: users.email' in str(e):
            return jsonify({'error': 'Email already registered'}), 409
        if 'UNIQUE constraint failed: users.username' in str(e):
            return jsonify({'error': 'Username already taken'}), 409
        return jsonify({'error': 'Registration failed'}), 500


@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Invalid request body'}), 400

    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    db = get_db()
    user = db.execute(
        'SELECT id, username, email, password_hash FROM users WHERE email = ?',
        (email,)
    ).fetchone()

    if user is None:
        return jsonify({'error': 'Invalid email or password'}), 401

    if not bcrypt.checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8')):
        return jsonify({'error': 'Invalid email or password'}), 401

    return jsonify({
        'message': 'Login successful',
        'username': user['username'],
        'user_id': user['id']
    }), 200


# ─── Records Routes ───────────────────────────────────────────────────────────

@app.route('/api/records', methods=['GET'])
def get_records():
    """Get records for a user or guest."""
    user_id = request.args.get('user_id', type=int)
    guest_id = request.args.get('guest_id')

    db = get_db()
    record = None

    if user_id:
        record = db.execute(
            'SELECT * FROM records WHERE user_id = ?', (user_id,)
        ).fetchone()
    elif guest_id:
        record = db.execute(
            'SELECT * FROM guest_records WHERE guest_id = ?', (guest_id,)
        ).fetchone()

    if record is None:
        return jsonify({
            'pvp_highscore': 0,
            'pva_highscore': 0,
            'ai_progress': {'easy': 0, 'medium': 0, 'hard': 0}
        }), 200

    return jsonify({
        'pvp_highscore': record['pvp_highscore'],
        'pva_highscore': record['pva_highscore'],
        'ai_progress': {
            'easy': record['ai_progress_easy'],
            'medium': record['ai_progress_medium'],
            'hard': record['ai_progress_hard']
        }
    }), 200


@app.route('/api/records', methods=['POST'])
def save_records():
    """Save records for a user or guest."""
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Invalid request body'}), 400

    user_id = data.get('user_id')
    guest_id = data.get('guest_id')
    pvp_highscore = data.get('pvp_highscore', 0)
    pva_highscore = data.get('pva_highscore', 0)
    ai_progress = data.get('ai_progress', {})

    db = get_db()

    if user_id:
        # Verify user exists
        user = db.execute('SELECT id FROM users WHERE id = ?', (user_id,)).fetchone()
        if not user:
            return jsonify({'error': 'User not found'}), 404

        db.execute("""
            INSERT INTO records (user_id, pvp_highscore, pva_highscore, ai_progress_easy, ai_progress_medium, ai_progress_hard, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
            ON CONFLICT(user_id) DO UPDATE SET
                pvp_highscore = MAX(pvp_highscore, ?),
                pva_highscore = MAX(pva_highscore, ?),
                ai_progress_easy = MAX(ai_progress_easy, ?),
                ai_progress_medium = MAX(ai_progress_medium, ?),
                ai_progress_hard = MAX(ai_progress_hard, ?),
                updated_at = datetime('now')
        """, (
            user_id,
            pvp_highscore, pva_highscore,
            ai_progress.get('easy', 0), ai_progress.get('medium', 0), ai_progress.get('hard', 0),
            pvp_highscore, pva_highscore,
            ai_progress.get('easy', 0), ai_progress.get('medium', 0), ai_progress.get('hard', 0)
        ))
        db.commit()
        return jsonify({'message': 'Records saved successfully'}), 200

    elif guest_id:
        db.execute("""
            INSERT INTO guest_records (guest_id, pvp_highscore, pva_highscore, ai_progress_easy, ai_progress_medium, ai_progress_hard, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
            ON CONFLICT(guest_id) DO UPDATE SET
                pvp_highscore = MAX(pvp_highscore, ?),
                pva_highscore = MAX(pva_highscore, ?),
                ai_progress_easy = MAX(ai_progress_easy, ?),
                ai_progress_medium = MAX(ai_progress_medium, ?),
                ai_progress_hard = MAX(ai_progress_hard, ?),
                updated_at = datetime('now')
        """, (
            guest_id,
            pvp_highscore, pva_highscore,
            ai_progress.get('easy', 0), ai_progress.get('medium', 0), ai_progress.get('hard', 0),
            pvp_highscore, pva_highscore,
            ai_progress.get('easy', 0), ai_progress.get('medium', 0), ai_progress.get('hard', 0)
        ))
        db.commit()
        return jsonify({'message': 'Guest records saved successfully'}), 200

    else:
        return jsonify({'error': 'user_id or guest_id is required'}), 400


# ─── Settings Routes ──────────────────────────────────────────────────────────

@app.route('/api/settings', methods=['GET'])
def get_settings():
    """Get settings for a user or guest."""
    user_id = request.args.get('user_id', type=int)
    guest_id = request.args.get('guest_id')

    db = get_db()
    row = None

    if user_id:
        row = db.execute(
            'SELECT * FROM settings WHERE user_id = ?', (user_id,)
        ).fetchone()
    elif guest_id:
        row = db.execute(
            'SELECT * FROM settings WHERE guest_id = ?', (guest_id,)
        ).fetchone()

    if row is None:
        return jsonify({
            'theme_id': 'modern',
            'color_mode': 'dark',
            'muted': False,
            'avatar_x': 'User',
            'avatar_o': 'Smile',
            'last_game_mode': 'classic',
            'last_ai_difficulty': 'easy'
        }), 200

    return jsonify({
        'theme_id': row['theme_id'],
        'color_mode': row['color_mode'],
        'muted': bool(row['muted']),
        'avatar_x': row['avatar_x'],
        'avatar_o': row['avatar_o'],
        'last_game_mode': row['last_game_mode'],
        'last_ai_difficulty': row['last_ai_difficulty']
    }), 200


@app.route('/api/settings', methods=['POST'])
def save_settings():
    """Save settings for a user or guest."""
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Invalid request body'}), 400

    user_id = data.get('user_id')
    guest_id = data.get('guest_id')

    if not user_id and not guest_id:
        return jsonify({'error': 'user_id or guest_id is required'}), 400

    db = get_db()

    # Build the dynamic UPDATE/SET for the UPSERT
    theme_id = data.get('theme_id', 'modern')
    color_mode = data.get('color_mode', 'dark')
    muted = 1 if data.get('muted', False) else 0
    avatar_x = data.get('avatar_x', 'User')
    avatar_o = data.get('avatar_o', 'Smile')
    last_game_mode = data.get('last_game_mode', 'classic')
    last_ai_difficulty = data.get('last_ai_difficulty', 'easy')

    if user_id:
        db.execute("""
            INSERT INTO settings (user_id, theme_id, color_mode, muted, avatar_x, avatar_o, last_game_mode, last_ai_difficulty, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
            ON CONFLICT(user_id) DO UPDATE SET
                theme_id = excluded.theme_id,
                color_mode = excluded.color_mode,
                muted = excluded.muted,
                avatar_x = excluded.avatar_x,
                avatar_o = excluded.avatar_o,
                last_game_mode = excluded.last_game_mode,
                last_ai_difficulty = excluded.last_ai_difficulty,
                updated_at = datetime('now')
        """, (
            user_id, theme_id, color_mode, muted, avatar_x, avatar_o, last_game_mode, last_ai_difficulty
        ))
        db.commit()
        return jsonify({'message': 'Settings saved successfully'}), 200

    elif guest_id:
        db.execute("""
            INSERT INTO settings (guest_id, theme_id, color_mode, muted, avatar_x, avatar_o, last_game_mode, last_ai_difficulty, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
            ON CONFLICT(guest_id) DO UPDATE SET
                theme_id = excluded.theme_id,
                color_mode = excluded.color_mode,
                muted = excluded.muted,
                avatar_x = excluded.avatar_x,
                avatar_o = excluded.avatar_o,
                last_game_mode = excluded.last_game_mode,
                last_ai_difficulty = excluded.last_ai_difficulty,
                updated_at = datetime('now')
        """, (
            guest_id, theme_id, color_mode, muted, avatar_x, avatar_o, last_game_mode, last_ai_difficulty
        ))
        db.commit()
        return jsonify({'message': 'Guest settings saved successfully'}), 200


# ─── Root Redirect ─────────────────────────────────────────────────────────────

@app.route('/')
def index():
    return jsonify({
        'app': 'TicTacToe Pro Backend',
        'status': 'running',
        'api_endpoints': {
            'auth_register': 'POST /api/auth/register',
            'auth_login': 'POST /api/auth/login',
            'get_records': 'GET /api/records?user_id=X',
            'save_records': 'POST /api/records',
            'get_settings': 'GET /api/settings?user_id=X',
            'save_settings': 'POST /api/settings',
            'party_create': 'POST /api/party/create',
            'party_join': 'POST /api/party/join',
            'party_status': 'GET /api/party/<code>',
            'party_close': 'DELETE /api/party/<code>',
            'health': 'GET /api/health'
        },
        'frontend': 'Open http://localhost:3000 in your browser to play the game'
    }), 200


# ─── Health Check ─────────────────────────────────────────────────────────────

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'timestamp': datetime.now().isoformat()}), 200


if __name__ == '__main__':
    init_db()
    print("Flask backend starting on http://localhost:5000")
    print("SQLite database at:", DB_PATH)
    app.run(host='0.0.0.0', port=5000, debug=True)