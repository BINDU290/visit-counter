from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import sqlite3
import uuid
import random
from datetime import datetime
import os

app = Flask(__name__, static_folder="../frontend/build", static_url_path="/")
CORS(app, resources={r"/*": {"origins": "*"}})

DB_FILE = "visits.db"

def init_db():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()

    # Base table
    c.execute('''CREATE TABLE IF NOT EXISTS visits (
                    user_id TEXT PRIMARY KEY,
                    count INTEGER
                )''')

    # Ensure "last_visit" column exists (add if missing)
    try:
        c.execute("ALTER TABLE visits ADD COLUMN last_visit TEXT")
    except sqlite3.OperationalError:
        pass  # Column already exists

    conn.commit()
    conn.close()

def get_stats(user_id):
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()

    c.execute("SELECT count, last_visit FROM visits WHERE user_id=?", (user_id,))
    row = c.fetchone()
    user_visits = row[0] if row else 0
    last_visit = row[1] if row else None

    c.execute("SELECT SUM(count) FROM visits")
    total_visits = c.fetchone()[0] or 0

    c.execute("SELECT COUNT(*) FROM visits")
    unique_users = c.fetchone()[0] or 0

    conn.close()

    return {
        "user_id": user_id,
        "user_visits": user_visits,
        "total_visits": total_visits,
        "unique_users": unique_users,
        "last_visit": last_visit
    }

@app.route("/visit", methods=["POST"])
def track_visit():
    user_id = request.json.get("user_id")
    if not user_id:
        user_id = str(uuid.uuid4())

    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()

    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    c.execute("SELECT count FROM visits WHERE user_id=?", (user_id,))
    row = c.fetchone()

    if row:
        count = row[0] + 1
        c.execute("UPDATE visits SET count=?, last_visit=? WHERE user_id=?", (count, now, user_id))
    else:
        count = 1
        c.execute("INSERT INTO visits (user_id, count, last_visit) VALUES (?, ?, ?)", (user_id, count, now))

    conn.commit()
    conn.close()

    return jsonify(get_stats(user_id))

@app.route("/reset", methods=["POST"])
def reset_user():
    old_user_id = request.json.get("user_id")
    new_user_id = str(uuid.uuid4())

    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("INSERT OR REPLACE INTO visits (user_id, count, last_visit) VALUES (?, ?, ?)", (new_user_id, 0, now))
    conn.commit()
    conn.close()

    return jsonify(get_stats(new_user_id))

@app.route("/simulate", methods=["POST"])
def simulate_users():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()

    for _ in range(5):  # simulate 5 new users
        new_id = str(uuid.uuid4())
        visits = random.randint(1, 10)
        now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        c.execute("INSERT INTO visits (user_id, count, last_visit) VALUES (?, ?, ?)", (new_id, visits, now))

    conn.commit()
    conn.close()

    user_id = request.json.get("user_id")
    if not user_id:
        user_id = str(uuid.uuid4())
        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()
        c.execute("INSERT OR REPLACE INTO visits (user_id, count, last_visit) VALUES (?, ?, ?)", (user_id, 0, now))
        conn.commit()
        conn.close()

    return jsonify(get_stats(user_id))

@app.route("/stats", methods=["GET"])
def get_all_stats():
    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify({"error": "user_id required"}), 400
    return jsonify(get_stats(user_id))


# Serve React frontend
@app.route("/")
def serve_react():
    return send_from_directory(app.static_folder, "index.html")

@app.errorhandler(404)
def not_found(e):
    return send_from_directory(app.static_folder, "index.html")

if __name__ == "__main__":
    init_db()
    app.run(debug=True, port=5000)
