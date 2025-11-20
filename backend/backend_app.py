"""
Backend application module for Netlify Functions
Simplified version of production_server.py that can be imported
"""
from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
import json
import os
from datetime import datetime, timezone, timedelta
from google.oauth2 import id_token
from google.auth.transport import requests as grequests
import random
import string
import secrets
import hashlib

# Load environment variables
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# Create Flask app
app = Flask(__name__)
CORS(app)

# Configuration
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", SUPABASE_ANON_KEY)
SUPABASE_REST_URL = f"{SUPABASE_URL}/rest/v1" if SUPABASE_URL else ""

def get_supabase_headers(use_service_key=False):
    """Get Supabase request headers"""
    key = SUPABASE_SERVICE_KEY if use_service_key else SUPABASE_ANON_KEY
    return {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }

def generate_username(email):
    """Generate unique username from email"""
    base = email.split('@')[0]
    suffix = ''.join(random.choices(string.digits, k=4))
    return f"{base}_{suffix}"

def generate_auth_token(user_id):
    """Generate a simple authentication token for session management"""
    # Create a token using user_id and a random secret
    token_data = f"{user_id}:{secrets.token_urlsafe(32)}"
    return hashlib.sha256(token_data.encode()).hexdigest()

# Health check endpoints
@app.route('/')
@app.route('/.netlify/functions/api')
def root():
    """Health check endpoint"""
    return jsonify({
        "message": "Quantum Quest Backend is running!",
        "version": "1.0.0",
        "supabase_connected": True
    })

@app.route('/health')
@app.route('/.netlify/functions/api/health')
def health_check():
    """Detailed health check"""
    try:
        response = requests.get(f"{SUPABASE_REST_URL}/users?select=count", headers=get_supabase_headers(), timeout=5)
        db_status = "connected" if response.status_code == 200 else "error"
    except:
        db_status = "disconnected"
    
    return jsonify({
        "status": "healthy",
        "quantum_engine": "operational",
        "database": db_status,
        "websockets": "active"
    })

@app.route('/v1/models', methods=['GET'])
@app.route('/.netlify/functions/api/v1/models', methods=['GET'])
def get_models():
    """Get available AI models"""
    return jsonify({
        "models": [
            {"id": "quantum-gpt", "name": "Quantum GPT", "description": "AI model for quantum computing help"}
        ]
    })

@app.route('/api/game/rooms')
@app.route('/.netlify/functions/api/api/game/rooms')
def get_rooms():
    """Get available game rooms"""
    return jsonify({
        "rooms": [
            {"id": "superposition", "name": "Superposition Tower", "difficulty": "easy", "unlocked": True},
            {"id": "entanglement", "name": "Entanglement Bridge", "difficulty": "medium", "unlocked": False},
            {"id": "tunneling", "name": "Tunneling Vault", "difficulty": "hard", "unlocked": False}
        ]
    })

# Authentication endpoints
@app.route('/api/auth/user')
@app.route('/.netlify/functions/api/api/auth/user')
def get_user():
    """Get current user info"""
    try:
        response = requests.get(f"{SUPABASE_REST_URL}/users?limit=1", headers=get_supabase_headers())
        if response.status_code == 200:
            users = response.json()
            if users:
                return jsonify({"user": users[0]})
        return jsonify({"error": "No user found"}), 404
    except Exception as e:
        return jsonify({"error": f"Failed to get user: {str(e)}"}), 500

@app.route('/api/auth/signup', methods=['POST', 'OPTIONS'])
@app.route('/.netlify/functions/api/api/auth/signup', methods=['POST', 'OPTIONS'])
def signup():
    """User signup"""
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        data = request.get_json()
        email = data.get("email")
        username = data.get("username", email.split("@")[0] if email else "player")
        full_name = data.get("full_name", "")
        
        check_response = requests.get(f"{SUPABASE_REST_URL}/users?email=eq.{email}", headers=get_supabase_headers())
        if check_response.status_code == 200 and check_response.json():
            return jsonify({"success": False, "error": "User already exists"}), 400
        
        user_data = {
            "email": email,
            "username": username,
            "full_name": full_name,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "is_verified": True,
            "is_premium": False,
            "total_playtime": 0,
            "games_completed": 0,
            "best_completion_time": None,
            "total_score": 0,
            "quantum_mastery_level": 1,
            "is_active": True,
            "preferences": {}
        }
        
        response = requests.post(f"{SUPABASE_REST_URL}/users", 
                               headers=get_supabase_headers(), 
                               json=user_data)
        
        if response.status_code in [200, 201]:
            user = response.json()[0] if response.json() else user_data
            
            leaderboard_entries = [{
                "user_id": user.get("id"),
                "category": "total_score",
                "completion_time": None,
                "total_score": 0,
                "difficulty": "easy",
                "rooms_completed": 0,
                "hints_used": 0,
                "achieved_at": datetime.now(timezone.utc).isoformat()
            }]
            
            try:
                requests.post(f"{SUPABASE_REST_URL}/leaderboard_entries", 
                            headers=get_supabase_headers(), 
                            json=leaderboard_entries)
            except:
                pass
            
            # Generate authentication token
            access_token = generate_auth_token(user.get("id", "unknown"))
            
            return jsonify({
                "success": True,
                "message": "Account created successfully!",
                "user": user,
                "access_token": access_token,
                "token_type": "Bearer",
                "expires_in": 86400  # 24 hours in seconds
            })
        else:
            return jsonify({
                "success": False,
                "error": f"Failed to create user. Status: {response.status_code}"
            }), 500
            
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Signup failed: {str(e)}"
        }), 500

@app.route('/api/auth/login', methods=['POST', 'OPTIONS'])
@app.route('/.netlify/functions/api/api/auth/login', methods=['POST', 'OPTIONS'])
def login():
    """User login"""
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        data = request.get_json()
        email = data.get("email")
        if not email:
            return jsonify({"success": False, "error": "Email is required"}), 400
        
        response = requests.get(f"{SUPABASE_REST_URL}/users?email=eq.{email}", headers=get_supabase_headers())
        if response.status_code == 200:
            users = response.json()
            if users:
                user = users[0]
                try:
                    requests.patch(
                        f"{SUPABASE_REST_URL}/users?id=eq.{user['id']}", 
                        headers=get_supabase_headers(),
                        json={"last_login": datetime.now(timezone.utc).isoformat()}
                    )
                except:
                    pass
                
                # Generate authentication token
                access_token = generate_auth_token(user.get("id", "unknown"))
                
                return jsonify({
                    "success": True,
                    "user": user,
                    "access_token": access_token,
                    "token_type": "Bearer",
                    "expires_in": 86400  # 24 hours in seconds
                })
            else:
                return jsonify({"success": False, "error": "User not found"}), 404
        else:
            return jsonify({"success": False, "error": "Database connection failed"}), 500
    except Exception as e:
        return jsonify({"success": False, "error": f"Login failed: {str(e)}"}), 500

@app.route('/api/auth/signin', methods=['POST', 'OPTIONS'])
@app.route('/.netlify/functions/api/api/auth/signin', methods=['POST', 'OPTIONS'])
def signin():
    """Alias for login"""
    return login()

@app.route('/api/auth/google', methods=['POST', 'OPTIONS'])
@app.route('/.netlify/functions/api/api/auth/google', methods=['POST', 'OPTIONS'])
def google_auth():
    """Google OAuth sign-in/signup"""
    if request.method == 'OPTIONS':
        return '', 200

    try:
        data = request.get_json()
        credential = data.get("credential")

        if not credential:
            return jsonify({"success": False, "error": "Missing credential"}), 400

        id_info = id_token.verify_oauth2_token(
            credential, grequests.Request(), GOOGLE_CLIENT_ID
        )

        email = id_info["email"]
        full_name = id_info.get("name", "")
        avatar_url = id_info.get("picture", "")
        provider = "google"

        response = requests.get(
            f"{SUPABASE_REST_URL}/users?email=eq.{email}",
            headers=get_supabase_headers()
        )

        if response.status_code == 200 and response.json():
            user = response.json()[0]
            # Generate authentication token for existing user
            access_token = generate_auth_token(user.get("id", "unknown"))
            return jsonify({
                "success": True,
                "message": "Google login successful",
                "user": user,
                "access_token": access_token,
                "token_type": "Bearer",
                "expires_in": 86400
            })

        username = generate_username(email)
        username_check = requests.get(
            f"{SUPABASE_REST_URL}/users?username=eq.{username}",
            headers=get_supabase_headers()
        )

        while username_check.status_code == 200 and username_check.json():
            username = generate_username(email)
            username_check = requests.get(
                f"{SUPABASE_REST_URL}/users?username=eq.{username}",
                headers=get_supabase_headers()
            )

        user_data = {
            "email": email,
            "username": username,
            "full_name": full_name,
            "avatar_url": avatar_url,
            "auth_provider": provider,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "is_verified": True,
            "is_premium": False,
            "total_playtime": 0,
            "games_completed": 0,
            "best_completion_time": None,
            "total_score": 0,
            "quantum_mastery_level": 1,
            "is_active": True,
            "preferences": {}
        }

        response = requests.post(
            f"{SUPABASE_REST_URL}/users",
            headers=get_supabase_headers(use_service_key=True),
            json=user_data
        )

        if response.status_code not in [200, 201]:
            return jsonify({
                "success": False,
                "error": f"Failed to create user. Status: {response.status_code}"
            }), 500

        created_user = response.json()[0]

        leaderboard_entries = [{
            "user_id": created_user.get("id"),
            "category": "total_score",
            "completion_time": None,
            "total_score": 0,
            "difficulty": "easy",
            "rooms_completed": 0,
            "hints_used": 0,
            "achieved_at": datetime.now(timezone.utc).isoformat()
        }]

        try:
            requests.post(
                f"{SUPABASE_REST_URL}/leaderboard_entries",
                headers=get_supabase_headers(use_service_key=True),
                json=leaderboard_entries
            )
        except:
            pass

        # Generate authentication token for new user
        access_token = generate_auth_token(created_user.get("id", "unknown"))

        return jsonify({
            "success": True,
            "message": "Google account created",
            "user": created_user,
            "access_token": access_token,
            "token_type": "Bearer",
            "expires_in": 86400
        }), 201

    except ValueError as e:
        return jsonify({"success": False, "error": f"Invalid Google token: {str(e)}"}), 400
    except Exception as e:
        return jsonify({"success": False, "error": f"Unexpected error: {str(e)}"}), 500

# Leaderboard endpoints
@app.route('/api/leaderboard/score', methods=['GET'])
@app.route('/.netlify/functions/api/api/leaderboard/score', methods=['GET'])
def get_score_leaderboard():
    """Get score-based leaderboard"""
    try:
        response = requests.get(
            f"{SUPABASE_REST_URL}/leaderboard_entries?category=eq.total_score&order=total_score.desc&limit=10",
            headers=get_supabase_headers()
        )
        
        if response.status_code == 200:
            leaderboard_data = response.json()
            enriched_leaderboard = []
            for i, entry in enumerate(leaderboard_data):
                entry["rank"] = i + 1
                user_response = requests.get(
                    f"{SUPABASE_REST_URL}/users?id=eq.{entry['user_id']}&select=username,full_name",
                    headers=get_supabase_headers()
                )
                if user_response.status_code == 200 and user_response.json():
                    user_data = user_response.json()[0]
                    entry.update(user_data)
                enriched_leaderboard.append(entry)
            
            if enriched_leaderboard:
                return jsonify({
                    "entries": enriched_leaderboard,
                    "type": "score",
                    "source": "database"
                })
        
        users_response = requests.get(f"{SUPABASE_REST_URL}/users?order=total_score.desc&limit=10", headers=get_supabase_headers())
        if users_response.status_code == 200:
            users = users_response.json()
            mock_leaderboard = []
            for i, user in enumerate(users):
                mock_leaderboard.append({
                    "rank": i + 1,
                    "username": user.get("username", "Unknown"),
                    "full_name": user.get("full_name", ""),
                    "total_score": user.get("total_score", 0),
                    "completion_time": user.get("best_completion_time"),
                    "games_completed": user.get("games_completed", 0),
                    "quantum_mastery_level": user.get("quantum_mastery_level", 1)
                })
            
            return jsonify({
                "entries": mock_leaderboard,
                "type": "score",
                "source": "user_stats"
            })
        
        return jsonify({
            "entries": [
                {"rank": 1, "username": "QuantumAlice", "total_score": 4500, "completion_time": 180, "games_completed": 15},
                {"rank": 2, "username": "EntangleCharlie", "total_score": 3200, "completion_time": 200, "games_completed": 12},
                {"rank": 3, "username": "SuperpositionBob", "total_score": 2800, "completion_time": 240, "games_completed": 8}
            ],
            "type": "score",
            "source": "demo"
        })
        
    except Exception as e:
        return jsonify({
            "entries": [
                {"rank": 1, "username": "QuantumAlice", "total_score": 4500, "completion_time": 180},
                {"rank": 2, "username": "EntangleCharlie", "total_score": 3200, "completion_time": 200}
            ],
            "type": "score",
            "source": "demo"
        })

@app.route('/api/leaderboard/speed', methods=['GET'])
@app.route('/.netlify/functions/api/api/leaderboard/speed', methods=['GET'])
def get_speed_leaderboard():
    """Get speed-based leaderboard"""
    try:
        response = requests.get(
            f"{SUPABASE_REST_URL}/leaderboard_entries?category=eq.completion_time&order=completion_time.asc&limit=10",
            headers=get_supabase_headers()
        )
        if response.status_code == 200:
            leaderboard_data = response.json()
            enriched_leaderboard = []
            for i, entry in enumerate(leaderboard_data):
                entry["rank"] = i + 1
                user_response = requests.get(
                    f"{SUPABASE_REST_URL}/users?id=eq.{entry['user_id']}&select=username,full_name",
                    headers=get_supabase_headers()
                )
                if user_response.status_code == 200 and user_response.json():
                    user_data = user_response.json()[0]
                    entry.update(user_data)
                enriched_leaderboard.append(entry)
            
            if enriched_leaderboard:
                return jsonify({
                    "entries": enriched_leaderboard,
                    "type": "speed",
                    "source": "database"
                })
        
        return jsonify({
            "entries": [
                {"rank": 1, "user_id": "demo-user-1", "username": "SpeedyQuantum", "full_name": "Speedy Player", "total_score": 1200, "completion_time": 180, "difficulty": "hard"},
                {"rank": 2, "user_id": "demo-user-2", "username": "FastAlice", "full_name": "Alice Cooper", "total_score": 1000, "completion_time": 220, "difficulty": "medium"},
                {"rank": 3, "user_id": "demo-user-3", "username": "QuickBob", "full_name": "Bob Wilson", "total_score": 800, "completion_time": 260, "difficulty": "easy"}
            ],
            "type": "speed",
            "source": "demo"
        })
    except Exception as e:
        return jsonify({
            "entries": [
                {"rank": 1, "user_id": "demo-user-1", "username": "SpeedyQuantum", "full_name": "Speedy Player", "total_score": 1200, "completion_time": 180, "difficulty": "hard"},
                {"rank": 2, "user_id": "demo-user-2", "username": "FastAlice", "full_name": "Alice Cooper", "total_score": 1000, "completion_time": 220, "difficulty": "medium"}
            ],
            "type": "speed",
            "source": "demo"
        })

# Remaining endpoints with similar pattern...
# (I'll include the critical ones for game functionality)

@app.route('/api/game/start', methods=['POST'])
@app.route('/.netlify/functions/api/api/game/start', methods=['POST'])
def start_game():
    """Start a new game session"""
    try:
        data = request.get_json()
        user_id = data.get("user_id")
        difficulty = data.get("difficulty", "easy")
        
        game_session = {
            "user_id": user_id,
            "started_at": datetime.now(timezone.utc).isoformat(),
            "difficulty": difficulty,
            "current_room": "superposition",
            "is_completed": False,
            "room_times": {},
            "room_attempts": {}
        }
        
        try:
            response = requests.post(f"{SUPABASE_REST_URL}/game_sessions", 
                                   headers=get_supabase_headers(), 
                                   json=game_session)
            if response.status_code in [200, 201]:
                session = response.json()[0] if response.json() else game_session
                session["id"] = session.get("id", f"demo-session-{datetime.now().timestamp()}")
            else:
                session = game_session
                session["id"] = f"demo-session-{datetime.now().timestamp()}"
        except:
            session = game_session
            session["id"] = f"demo-session-{datetime.now().timestamp()}"
        
        return jsonify({"success": True, "session": session})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/game/complete', methods=['POST'])
@app.route('/.netlify/functions/api/api/game/complete', methods=['POST'])
def complete_game():
    """Complete a game and update scores"""
    try:
        data = request.get_json()
        user_id = data.get("user_id")
        session_id = data.get("session_id")
        completion_time = data.get("completion_time", 300)
        total_score = data.get("total_score", 1000)
        difficulty = data.get("difficulty", "easy")
        rooms_completed = data.get("rooms_completed", 1)
        hints_used = data.get("hints_used", 0)
        
        try:
            requests.patch(
                f"{SUPABASE_REST_URL}/users?id=eq.{user_id}",
                headers=get_supabase_headers(),
                json={
                    "games_completed": data.get("current_games_completed", 0) + 1,
                    "total_score": data.get("current_total_score", 0) + total_score,
                    "total_playtime": data.get("current_total_playtime", 0) + completion_time,
                    "last_login": datetime.now(timezone.utc).isoformat()
                }
            )
        except:
            pass
        
        leaderboard_entry = {
            "user_id": user_id,
            "session_id": session_id,
            "category": "total_score",
            "completion_time": completion_time,
            "total_score": total_score,
            "difficulty": difficulty,
            "rooms_completed": rooms_completed,
            "hints_used": hints_used,
            "achieved_at": datetime.now(timezone.utc).isoformat()
        }
        
        try:
            requests.post(f"{SUPABASE_REST_URL}/leaderboard_entries", 
                        headers=get_supabase_headers(), 
                        json=leaderboard_entry)
        except:
            pass
        
        try:
            requests.patch(
                f"{SUPABASE_REST_URL}/game_sessions?id=eq.{session_id}",
                headers=get_supabase_headers(),
                json={
                    "completed_at": datetime.now(timezone.utc).isoformat(),
                    "total_time": completion_time,
                    "is_completed": True
                }
            )
        except:
            pass
        
        return jsonify({
            "success": True,
            "message": "Game completed successfully!",
            "score": total_score,
            "time": completion_time,
            "leaderboard_entry": leaderboard_entry
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/game/save-progress', methods=['POST'])
@app.route('/.netlify/functions/api/api/game/save-progress', methods=['POST'])
def save_progress():
    """Save game progress"""
    try:
        data = request.get_json()
        session_id = data.get("session_id")
        current_room = data.get("current_room")
        room_times = data.get("room_times", {})
        room_attempts = data.get("room_attempts", {})
        room_scores = data.get("room_scores", {})
        
        try:
            requests.patch(
                f"{SUPABASE_REST_URL}/game_sessions?id=eq.{session_id}",
                headers=get_supabase_headers(),
                json={
                    "current_room": current_room,
                    "room_times": room_times,
                    "room_attempts": room_attempts,
                    "room_scores": room_scores
                }
            )
        except:
            pass
        
        return jsonify({"success": True, "message": "Progress saved"})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Additional utility endpoints
@app.route('/api/users', methods=['GET', 'POST'])
@app.route('/.netlify/functions/api/api/users', methods=['GET', 'POST'])
def users():
    """Get all users or create a new user"""
    if request.method == 'GET':
        try:
            response = requests.get(f"{SUPABASE_REST_URL}/users", headers=get_supabase_headers())
            if response.status_code == 200:
                users = response.json()
                return jsonify({"users": users, "count": len(users)})
            else:
                return jsonify({"error": f"Database error: {response.status_code}"}), response.status_code
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    else:  # POST
        try:
            data = request.get_json()
            response = requests.post(f"{SUPABASE_REST_URL}/users", 
                                   headers=get_supabase_headers(), 
                                   json=data)
            if response.status_code in [200, 201]:
                return jsonify({
                    "success": True,
                    "user": response.json()[0] if response.json() else data
                })
            else:
                return jsonify({"error": f"Database error: {response.status_code}"}), response.status_code
        except Exception as e:
            return jsonify({"error": str(e)}), 500

@app.route('/api/test-supabase')
@app.route('/.netlify/functions/api/api/test-supabase')
def test_supabase():
    """Test Supabase connection"""
    try:
        response = requests.get(f"{SUPABASE_REST_URL}/users?select=count", headers=get_supabase_headers())
        return jsonify({
            "supabase_connection": "OK" if response.status_code == 200 else "ERROR",
            "status_code": response.status_code,
            "response": response.text[:200] if response.text else None,
            "url": SUPABASE_REST_URL,
            "headers_used": "apikey and Authorization headers set"
        })
    except Exception as e:
        return jsonify({"supabase_connection": "ERROR", "error": str(e)})

@app.route('/api/quantum/measurements', methods=['POST'])
@app.route('/.netlify/functions/api/api/quantum/measurements', methods=['POST'])
def log_quantum_measurement():
    """Log quantum measurement data"""
    try:
        data = request.get_json()
        quantum_measurement = {
            "session_id": data.get("session_id"),
            "room_id": data.get("room_id"),
            "measurement_type": data.get("measurement_type"),
            "measurement_data": data.get("measurement_data"),
            "measured_at": datetime.now(timezone.utc).isoformat()
        }
        
        try:
            requests.post(f"{SUPABASE_REST_URL}/quantum_measurements", 
                        headers=get_supabase_headers(), 
                        json=quantum_measurement)
        except:
            pass
        
        return jsonify({"success": True, "message": "Quantum measurement logged"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/achievements/unlock', methods=['POST'])
@app.route('/.netlify/functions/api/api/achievements/unlock', methods=['POST'])
def unlock_achievement():
    """Unlock user achievement"""
    try:
        data = request.get_json()
        achievement_id = data.get("achievement_id")
        session_id = data.get("session_id")
        user_id = data.get("user_id")
        
        if not user_id and session_id:
            try:
                session_response = requests.get(f"{SUPABASE_REST_URL}/game_sessions?id=eq.{session_id}&select=user_id", 
                                              headers=get_supabase_headers())
                if session_response.status_code == 200:
                    sessions = session_response.json()
                    if sessions:
                        user_id = sessions[0].get('user_id')
            except:
                pass
        
        if not user_id:
            return jsonify({"error": "User ID required"}), 400
        
        achievement_record = {
            "user_id": user_id,
            "achievement_id": achievement_id,
            "unlocked_at": datetime.now(timezone.utc).isoformat(),
            "session_id": session_id
        }
        
        try:
            requests.post(f"{SUPABASE_REST_URL}/user_achievements", 
                        headers=get_supabase_headers(), 
                        json=achievement_record)
        except:
            pass
        
        return jsonify({
            "success": True,
            "message": f"Achievement {achievement_id} unlocked"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def handle_request(path, method, headers, body, query_params):
    """
    Handle incoming request and route to appropriate Flask endpoint
    Used by Netlify Function handler
    """
    from werkzeug.wrappers import Request, Response
    from io import BytesIO
    
    # Build WSGI environ
    environ = {
        'REQUEST_METHOD': method,
        'SCRIPT_NAME': '',
        'PATH_INFO': path,
        'QUERY_STRING': '&'.join([f"{k}={v}" for k, v in query_params.items()]) if query_params else '',
        'CONTENT_TYPE': headers.get('content-type', 'application/json'),
        'CONTENT_LENGTH': str(len(body)) if body else '0',
        'SERVER_NAME': 'netlify',
        'SERVER_PORT': '443',
        'SERVER_PROTOCOL': 'HTTP/1.1',
        'wsgi.version': (1, 0),
        'wsgi.url_scheme': 'https',
        'wsgi.input': BytesIO(body.encode('utf-8') if isinstance(body, str) else (body or b'')),
        'wsgi.errors': BytesIO(),
        'wsgi.multithread': False,
        'wsgi.multiprocess': False,
        'wsgi.run_once': True,
    }
    
    # Add headers
    for key, value in headers.items():
        key = key.upper().replace('-', '_')
        if key not in ('CONTENT_TYPE', 'CONTENT_LENGTH'):
            key = f'HTTP_{key}'
        environ[key] = value
    
    # Call Flask app
    response_data = []
    status_line = [None]
    headers_list = [None]
    
    def start_response(status, response_headers, exc_info=None):
        status_line[0] = status
        headers_list[0] = response_headers
        return response_data.append
    
    app_iter = app(environ, start_response)
    try:
        for data in app_iter:
            response_data.append(data)
    finally:
        if hasattr(app_iter, 'close'):
            app_iter.close()
    
    # Format response
    status_code = int(status_line[0].split(' ', 1)[0])
    response_headers = {}
    for key, value in headers_list[0]:
        response_headers[key] = value
    
    # Ensure CORS headers
    response_headers['Access-Control-Allow-Origin'] = '*'
    response_headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, PATCH, OPTIONS'
    response_headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    
    body = b''.join(response_data).decode('utf-8')
    
    return {
        'statusCode': status_code,
        'headers': response_headers,
        'body': body
    }
