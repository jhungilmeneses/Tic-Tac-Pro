import urllib.request, json, sqlite3

BASE = 'http://localhost:5000'

print("=" * 50)
print("1. Test health endpoint...")
try:
    req = urllib.request.Request(f'{BASE}/api/health', method='GET')
    resp = urllib.request.urlopen(req)
    print(f"   OK: {resp.status} - {resp.read().decode()}")
except Exception as e:
    print(f"   FAIL: {e}")

print("=" * 50)
print("2. Test register user...")
data = json.dumps({'username': 'testplayer', 'email': 'test@test.com', 'password': 'test123'}).encode()
try:
    req = urllib.request.Request(f'{BASE}/api/auth/register', data=data, headers={'Content-Type': 'application/json'}, method='POST')
    resp = urllib.request.urlopen(req)
    result = json.loads(resp.read())
    print(f"   OK: {resp.status} - user_id={result['user_id']}, username={result['username']}")
except urllib.error.HTTPError as e:
    print(f"   FAIL: {e.code} - {e.read().decode()}")
except Exception as e:
    print(f"   FAIL: {e}")

print("=" * 50)
print("3. Check database for new user...")
db = sqlite3.connect('backend/tic_tac_toe.db')
users = db.execute('SELECT id, username, email FROM users').fetchall()
print(f"   Users in DB: {users}")
records = db.execute('SELECT * FROM records').fetchall()
print(f"   Records in DB: {records}")
settings = db.execute('SELECT * FROM settings').fetchall()
print(f"   Settings in DB: {settings}")
db.close()

print("=" * 50)
print("4. Test save records...")
data = json.dumps({'user_id': 1, 'pvp_highscore': 3, 'pva_highscore': 2, 'ai_progress': {'easy': 1, 'medium': 0, 'hard': 0}}).encode()
try:
    req = urllib.request.Request(f'{BASE}/api/records', data=data, headers={'Content-Type': 'application/json'}, method='POST')
    resp = urllib.request.urlopen(req)
    print(f"   OK: {resp.status} - {resp.read().decode()}")
except Exception as e:
    print(f"   FAIL: {e}")

print("=" * 50)
print("5. Test load records...")
try:
    req = urllib.request.Request(f'{BASE}/api/records?user_id=1', method='GET')
    resp = urllib.request.urlopen(req)
    print(f"   OK: {resp.status} - {resp.read().decode()}")
except Exception as e:
    print(f"   FAIL: {e}")

print("=" * 50)
print("6. Test save settings...")
data = json.dumps({'user_id': 1, 'theme_id': 'neon', 'color_mode': 'light', 'muted': True, 'avatar_x': 'Cpu', 'avatar_o': 'User'}).encode()
try:
    req = urllib.request.Request(f'{BASE}/api/settings', data=data, headers={'Content-Type': 'application/json'}, method='POST')
    resp = urllib.request.urlopen(req)
    print(f"   OK: {resp.status} - {resp.read().decode()}")
except Exception as e:
    print(f"   FAIL: {e}")

print("=" * 50)
print("7. Test load settings...")
try:
    req = urllib.request.Request(f'{BASE}/api/settings?user_id=1', method='GET')
    resp = urllib.request.urlopen(req)
    print(f"   OK: {resp.status} - {resp.read().decode()}")
except Exception as e:
    print(f"   FAIL: {e}")

print("=" * 50)
print("8. Final database check...")
db = sqlite3.connect('backend/tic_tac_toe.db')
users = db.execute('SELECT id, username, email FROM users').fetchall()
print(f"   Users in DB: {users}")
records = db.execute('SELECT * FROM records').fetchall()
print(f"   Records in DB: {records}")
settings = db.execute('SELECT * FROM settings').fetchall()
print(f"   Settings in DB: {settings}")
db.close()
print("=" * 50)
print("ALL TESTS COMPLETE")