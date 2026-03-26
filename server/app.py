from flask import Flask, request, jsonify, g
from flask_cors import CORS
import sqlite3
import hashlib
import os
import jwt
from datetime import datetime, timedelta
from functools import wraps
import openai

app = Flask(__name__)
CORS(app)

SECRET_KEY = os.environ.get('SECRET_KEY', 'bible-aid-secret-key-change-in-production')
OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY', '')
DATABASE = os.path.join(os.path.dirname(__file__), 'bible_aid.db')

def get_db():
    if 'db' not in g:
        g.db = sqlite3.connect(DATABASE)
        g.db.row_factory = sqlite3.Row
    return g.db

@app.teardown_appcontext
def close_db(exception):
    db = g.pop('db', None)
    if db is not None:
        db.close()

def init_db():
    db = sqlite3.connect(DATABASE)
    db.executescript('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            name TEXT DEFAULT '',
            bio TEXT DEFAULT '',
            daily_goal TEXT DEFAULT '1 chapter',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            book TEXT NOT NULL,
            chapter INTEGER NOT NULL,
            verse INTEGER,
            content TEXT NOT NULL,
            is_public INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            book TEXT NOT NULL,
            chapter INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );

        CREATE INDEX IF NOT EXISTS idx_notes_user ON notes(user_id);
        CREATE INDEX IF NOT EXISTS idx_notes_passage ON notes(book, chapter);
        CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
    ''')
    db.commit()
    db.close()

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

def create_token(user_id):
    payload = {
        'user_id': user_id,
        'exp': datetime.utcnow() + timedelta(days=7)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm='HS256')

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        if not token:
            return jsonify({'error': 'Token required'}), 401
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            g.user_id = payload['user_id']
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
        return f(*args, **kwargs)
    return decorated

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username', '').strip()
    email = data.get('email', '').strip()
    password = data.get('password', '')
    name = data.get('name', username)

    if not username or not email or not password:
        return jsonify({'error': 'Username, email, and password required'}), 400

    if len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters'}), 400

    db = get_db()
    try:
        db.execute(
            'INSERT INTO users (username, email, password_hash, name) VALUES (?, ?, ?, ?)',
            (username, email, hash_password(password), name)
        )
        db.commit()
        user = db.execute('SELECT id FROM users WHERE username = ?', (username,)).fetchone()
        token = create_token(user['id'])
        return jsonify({'token': token, 'user_id': user['id'], 'username': username})
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Username or email already exists'}), 400

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username', '').strip()
    password = data.get('password', '')

    db = get_db()
    user = db.execute(
        'SELECT id, username, password_hash FROM users WHERE username = ? OR email = ?',
        (username, username)
    ).fetchone()

    if not user or user['password_hash'] != hash_password(password):
        return jsonify({'error': 'Invalid credentials'}), 401

    token = create_token(user['id'])
    return jsonify({'token': token, 'user_id': user['id'], 'username': user['username']})

@app.route('/api/me', methods=['GET'])
@token_required
def get_current_user():
    db = get_db()
    user = db.execute(
        'SELECT id, username, email, name, bio, daily_goal, created_at FROM users WHERE id = ?',
        (g.user_id,)
    ).fetchone()

    if not user:
        return jsonify({'error': 'User not found'}), 404

    notes_count = db.execute('SELECT COUNT(*) as count FROM notes WHERE user_id = ?', (g.user_id,)).fetchone()['count']
    sessions_count = db.execute('SELECT COUNT(*) as count FROM sessions WHERE user_id = ?', (g.user_id,)).fetchone()['count']

    streak = 0
    sessions = db.execute(
        'SELECT DISTINCT date(created_at) as session_date FROM sessions WHERE user_id = ? ORDER BY session_date DESC',
        (g.user_id,)
    ).fetchall()

    if sessions:
        today = datetime.now().date()
        for i, session in enumerate(sessions):
            session_date = datetime.strptime(session['session_date'], '%Y-%m-%d').date()
            expected_date = today - timedelta(days=i)
            if session_date == expected_date:
                streak += 1
            else:
                break

    return jsonify({
        'id': user['id'],
        'username': user['username'],
        'email': user['email'],
        'name': user['name'],
        'bio': user['bio'],
        'daily_goal': user['daily_goal'],
        'created_at': user['created_at'],
        'stats': {
            'notes': notes_count,
            'sessions': sessions_count,
            'streak': streak
        }
    })

@app.route('/api/profile', methods=['PUT'])
@token_required
def update_profile():
    data = request.json
    db = get_db()

    updates = []
    params = []

    if 'name' in data:
        updates.append('name = ?')
        params.append(data['name'])
    if 'bio' in data:
        updates.append('bio = ?')
        params.append(data['bio'])
    if 'daily_goal' in data:
        updates.append('daily_goal = ?')
        params.append(data['daily_goal'])
    if 'email' in data:
        updates.append('email = ?')
        params.append(data['email'])

    if updates:
        params.append(g.user_id)
        try:
            db.execute(f'UPDATE users SET {", ".join(updates)} WHERE id = ?', params)
            db.commit()
        except sqlite3.IntegrityError:
            return jsonify({'error': 'Email already in use'}), 400

    return jsonify({'success': True})

@app.route('/api/users', methods=['GET'])
def get_users():
    db = get_db()
    users = db.execute('''
        SELECT u.id, u.username, u.name, u.bio, u.created_at,
               COUNT(DISTINCT n.id) as notes_count
        FROM users u
        LEFT JOIN notes n ON u.id = n.user_id AND n.is_public = 1
        GROUP BY u.id
        ORDER BY u.created_at DESC
    ''').fetchall()

    return jsonify([{
        'id': u['id'],
        'username': u['username'],
        'name': u['name'],
        'bio': u['bio'],
        'created_at': u['created_at'],
        'public_notes': u['notes_count']
    } for u in users])

@app.route('/api/users/<int:user_id>', methods=['GET'])
def get_user_profile(user_id):
    db = get_db()
    user = db.execute(
        'SELECT id, username, name, bio, created_at FROM users WHERE id = ?',
        (user_id,)
    ).fetchone()

    if not user:
        return jsonify({'error': 'User not found'}), 404

    public_notes = db.execute('''
        SELECT id, book, chapter, verse, content, created_at
        FROM notes WHERE user_id = ? AND is_public = 1
        ORDER BY created_at DESC LIMIT 20
    ''', (user_id,)).fetchall()

    return jsonify({
        'id': user['id'],
        'username': user['username'],
        'name': user['name'],
        'bio': user['bio'],
        'created_at': user['created_at'],
        'public_notes': [{
            'id': n['id'],
            'book': n['book'],
            'chapter': n['chapter'],
            'verse': n['verse'],
            'content': n['content'],
            'created_at': n['created_at']
        } for n in public_notes]
    })

@app.route('/api/notes', methods=['GET'])
@token_required
def get_notes():
    db = get_db()
    book = request.args.get('book')
    chapter = request.args.get('chapter')

    query = 'SELECT * FROM notes WHERE user_id = ?'
    params = [g.user_id]

    if book:
        query += ' AND book = ?'
        params.append(book)
    if chapter:
        query += ' AND chapter = ?'
        params.append(int(chapter))

    query += ' ORDER BY created_at DESC'
    notes = db.execute(query, params).fetchall()

    return jsonify([{
        'id': n['id'],
        'book': n['book'],
        'chapter': n['chapter'],
        'verse': n['verse'],
        'content': n['content'],
        'is_public': bool(n['is_public']),
        'created_at': n['created_at'],
        'updated_at': n['updated_at']
    } for n in notes])

@app.route('/api/notes', methods=['POST'])
@token_required
def create_note():
    data = request.json
    book = data.get('book', '').strip()
    chapter = data.get('chapter')
    verse = data.get('verse')
    content = data.get('content', '').strip()
    is_public = data.get('is_public', False)

    if not book or not chapter or not content:
        return jsonify({'error': 'Book, chapter, and content required'}), 400

    db = get_db()
    cursor = db.execute(
        'INSERT INTO notes (user_id, book, chapter, verse, content, is_public) VALUES (?, ?, ?, ?, ?, ?)',
        (g.user_id, book, chapter, verse, content, 1 if is_public else 0)
    )
    db.commit()

    return jsonify({'id': cursor.lastrowid, 'success': True})

@app.route('/api/notes/<int:note_id>', methods=['PUT'])
@token_required
def update_note(note_id):
    data = request.json
    db = get_db()

    note = db.execute('SELECT * FROM notes WHERE id = ? AND user_id = ?', (note_id, g.user_id)).fetchone()
    if not note:
        return jsonify({'error': 'Note not found'}), 404

    content = data.get('content', note['content'])
    is_public = data.get('is_public', note['is_public'])

    db.execute(
        'UPDATE notes SET content = ?, is_public = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        (content, 1 if is_public else 0, note_id)
    )
    db.commit()

    return jsonify({'success': True})

@app.route('/api/notes/<int:note_id>', methods=['DELETE'])
@token_required
def delete_note(note_id):
    db = get_db()
    result = db.execute('DELETE FROM notes WHERE id = ? AND user_id = ?', (note_id, g.user_id))
    db.commit()

    if result.rowcount == 0:
        return jsonify({'error': 'Note not found'}), 404

    return jsonify({'success': True})

@app.route('/api/notes/public', methods=['GET'])
def get_public_notes():
    db = get_db()
    book = request.args.get('book')
    chapter = request.args.get('chapter')

    query = '''
        SELECT n.*, u.username, u.name as user_name
        FROM notes n
        JOIN users u ON n.user_id = u.id
        WHERE n.is_public = 1
    '''
    params = []

    if book:
        query += ' AND n.book = ?'
        params.append(book)
    if chapter:
        query += ' AND n.chapter = ?'
        params.append(int(chapter))

    query += ' ORDER BY n.created_at DESC LIMIT 50'
    notes = db.execute(query, params).fetchall()

    return jsonify([{
        'id': n['id'],
        'user_id': n['user_id'],
        'username': n['username'],
        'user_name': n['user_name'],
        'book': n['book'],
        'chapter': n['chapter'],
        'verse': n['verse'],
        'content': n['content'],
        'created_at': n['created_at']
    } for n in notes])

@app.route('/api/sessions', methods=['POST'])
@token_required
def create_session():
    data = request.json
    book = data.get('book', '').strip()
    chapter = data.get('chapter')

    if not book or not chapter:
        return jsonify({'error': 'Book and chapter required'}), 400

    db = get_db()
    db.execute(
        'INSERT INTO sessions (user_id, book, chapter) VALUES (?, ?, ?)',
        (g.user_id, book, chapter)
    )
    db.commit()

    return jsonify({'success': True})

@app.route('/api/chat', methods=['POST'])
@token_required
def chat():
    if not OPENAI_API_KEY:
        return jsonify({'error': 'OpenAI API key not configured'}), 500

    data = request.json
    messages = data.get('messages', [])
    passage_text = data.get('passage_text', '')
    reference = data.get('reference', '')

    system_prompt = f"""You are a knowledgeable Bible study companion. Your role is to help users understand and reflect on scripture.

When answering questions:
- Briefly summarize what the passage says
- Explain the spiritual significance, themes, and how it points to God
- Connect it to broader Biblical theology and Christian faith
- Apply it to daily Christian life when relevant
- Be reverent, clear, and spiritually insightful

Keep answers concise (2-4 sentences for simple questions, a short paragraph for complex ones).

The current passage is {reference}:

{passage_text}"""

    try:
        client = openai.OpenAI(api_key=OPENAI_API_KEY)

        chat_messages = [{"role": "system", "content": system_prompt}]
        for msg in messages:
            chat_messages.append({
                "role": msg.get("role", "user"),
                "content": msg.get("content", "")
            })

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=chat_messages,
            max_tokens=1024,
            temperature=0.7
        )

        return jsonify({
            'response': response.choices[0].message.content
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    init_db()
    app.run(debug=True, port=5001)
