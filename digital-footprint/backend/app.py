# backend/app.py
import os
import uuid
import datetime
from flask import Flask, request, jsonify, abort
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
import requests

# Load environment variables
load_dotenv()

# --- config
app = Flask(__name__)
CORS(app)
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
db_path = os.environ.get("DATABASE_URL", f"sqlite:///{os.path.join(BASE_DIR, 'whoami.db')}")
app.config['SQLALCHEMY_DATABASE_URI'] = db_path
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# --- models
class Scan(db.Model):
    id = db.Column(db.String(36), primary_key=True)
    type = db.Column(db.String(20), nullable=False)
    value = db.Column(db.String(256), nullable=False)
    status = db.Column(db.String(20), default="queued")
    results = db.Column(db.JSON, default={})
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

# --- util: simple predictor heuristic
def simple_predict(text: str):
    """
    Very small heuristic for MVP - analyzes text for common keywords
    """
    text_lower = text.lower()
    interests = []
    
    # Detect interests based on keywords
    if "football" in text_lower or "soccer" in text_lower:
        interests.append("football")
    if "code" in text_lower or "coding" in text_lower or "programming" in text_lower:
        interests.append("software development")
    if "open source" in text_lower or "react" in text_lower or "python" in text_lower:
        interests.append("open source")
    if "music" in text_lower or "guitar" in text_lower or "piano" in text_lower:
        interests.append("music")
    if "travel" in text_lower or "traveling" in text_lower:
        interests.append("travel")
    if "game" in text_lower or "gaming" in text_lower:
        interests.append("gaming")
    if "book" in text_lower or "reading" in text_lower:
        interests.append("reading")
    
    # Age range heuristic
    age = "25-34"
    if any(word in text_lower for word in ["uni", "university", "college", "student"]):
        age = "18-24"
    elif any(word in text_lower for word in ["retired", "grandkids"]):
        age = "55+"
    elif any(word in text_lower for word in ["career", "professional", "experienced"]):
        age = "35-50"
    
    # Risk score based on how much info is shared
    risk_score = 0.15 + 0.08 * len(interests)
    
    # Detect if name might be mentioned
    name_guess = ""
    words = text.split()
    for i, word in enumerate(words):
        if word.lower() in ["my name is", "i'm", "i am", "call me"] and i + 1 < len(words):
            name_guess = words[i + 1].strip(",.!?")
            break
    
    return {
        "name_guess": name_guess,
        "age_range": age,
        "interests": interests if interests else ["general"],
        "risk_score": round(min(risk_score, 0.95), 2),
        "explain": "Heuristic prediction based on keyword analysis. For AI-powered predictions, add OPENAI_API_KEY to .env"
    }

# --- internal breach check (mock or integrate with HIBP)
def breach_check_internal(email):
    """
    Check email against Have I Been Pwned API or return mock data
    """
    hibp_api_key = os.getenv("HIBP_API_KEY")
    
    if hibp_api_key:
        try:
            # HIBP API requires the email to be URL encoded
            # API endpoint: https://haveibeenpwned.com/api/v3/breachedaccount/{account}
            url = f"https://haveibeenpwned.com/api/v3/breachedaccount/{email}"
            headers = {
                "hibp-api-key": hibp_api_key,
                "User-Agent": "whoMi-Digital-Footprint-Scanner"
            }
            
            response = requests.get(url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                breaches_data = response.json()
                # Parse and format the response
                breaches = []
                for breach in breaches_data:
                    breaches.append({
                        "name": breach.get("Name", "Unknown"),
                        "date": breach.get("BreachDate", "Unknown"),
                        "leaked_data": breach.get("DataClasses", [])
                    })
                return breaches
            elif response.status_code == 404:
                # No breaches found - good news!
                return []
            else:
                print(f"HIBP API error: {response.status_code}")
                return []
        except Exception as e:
            print(f"Error calling HIBP API: {e}")
            return []
    
    # Fallback: mock sample data for testing
    # In production without API key, you'd return empty or show a message
    return []

# --- util: device detection from user agent
def parse_user_agent(user_agent_string):
    """
    Parse User-Agent string to extract browser and OS information
    """
    ua = user_agent_string.lower()
    
    # Detect browser
    browser = "Unknown Browser"
    if "edg" in ua:
        browser = "Microsoft Edge"
    elif "chrome" in ua and "edg" not in ua:
        browser = "Google Chrome"
    elif "firefox" in ua:
        browser = "Mozilla Firefox"
    elif "safari" in ua and "chrome" not in ua:
        browser = "Safari"
    elif "opera" in ua or "opr" in ua:
        browser = "Opera"
    
    # Detect OS
    os_name = "Unknown OS"
    if "windows" in ua:
        if "windows nt 10" in ua:
            os_name = "Windows 10/11"
        elif "windows nt 6" in ua:
            os_name = "Windows 7/8"
        else:
            os_name = "Windows"
    elif "mac os x" in ua or "macintosh" in ua:
        os_name = "macOS"
    elif "linux" in ua and "android" not in ua:
        os_name = "Linux"
    elif "android" in ua:
        os_name = "Android"
    elif "iphone" in ua or "ipad" in ua:
        os_name = "iOS"
    
    # Device type
    device_type = "Desktop"
    if "mobile" in ua or "android" in ua or "iphone" in ua:
        device_type = "Mobile"
    elif "tablet" in ua or "ipad" in ua:
        device_type = "Tablet"
    
    return {
        "browser": browser,
        "os": os_name,
        "device_type": device_type,
        "full_ua": user_agent_string
    }

# --- endpoints
@app.route("/api/device-scan", methods=["POST"])
def device_scan():
    """
    Auto-detect device information from request
    POST /api/device-scan
    Returns: Device information including IP, browser, OS
    """
    try:
        # Get advanced data from body
        advanced_data = request.get_json() or {}

        # Get client IP address
        if request.headers.get('X-Forwarded-For'):
            ip_address = request.headers.get('X-Forwarded-For').split(',')[0]
        else:
            ip_address = request.remote_addr
        
        # Get User-Agent
        user_agent = request.headers.get('User-Agent', 'Unknown')
        
        # Parse user agent
        device_info = parse_user_agent(user_agent)
        
        # Generate scan ID
        scan_id = str(uuid.uuid4())
        
        # Prepare results
        results = {
            "ip_address": ip_address,
            "browser": device_info["browser"],
            "os": device_info["os"],
            "device_type": device_info["device_type"],
            "device_name": f"{device_info['browser']} on {device_info['os']}",
            "scan_time": datetime.datetime.utcnow().isoformat(),
            "note": "MAC address cannot be detected from web browser for security reasons"
        }

        # Merge advanced data if present
        if advanced_data:
            results.update(advanced_data)

        # Create scan record
        scan = Scan(
            id=scan_id,
            type="device",
            value=ip_address,
            status="done",
            results=results
        )
        db.session.add(scan)
        db.session.commit()
        
        return jsonify({
            "scan_id": scan_id,
            "device_info": scan.results
        }), 201
        
    except Exception as e:
        return jsonify({"error": f"Device scan failed: {str(e)}"}), 500

@app.route("/api/scan", methods=["POST"])
def create_scan():
    """
    Create a new scan for an email or username
    POST /api/scan
    Body: { "type": "email" | "username", "value": "string" }
    Returns: { "scan_id": "uuid", "status": "done" | "running" }
    """
    data = request.get_json() or {}
    t = data.get("type")
    v = data.get("value")
    
    # Validate input
    if t not in ("email", "username") or not v:
        return jsonify({"error": "invalid payload - type must be 'email' or 'username' and value is required"}), 400
    
    if not v.strip():
        return jsonify({"error": "value cannot be empty"}), 400
    
    # Create new scan
    scan_id = str(uuid.uuid4())
    scan = Scan(id=scan_id, type=t, value=v.strip(), status="running")
    db.session.add(scan)
    db.session.commit()

    # Synchronous small "scan" for MVP:
    result = {}
    
    if t == "email":
        # Call breach check for emails
        breaches = breach_check_internal(v.strip())
        result["breaches"] = breaches
    else:
        result["breaches"] = []
    
    # Mock found_profiles - TODO: implement websearch / social lookup
    result["found_profiles"] = []
    
    # Empty prediction for now (can be populated separately via /api/predict)
    result["prediction"] = {}

    # Mark scan as complete
    scan.status = "done"
    scan.results = result
    db.session.commit()
    
    return jsonify({"scan_id": scan_id, "status": scan.status}), 201

@app.route("/api/report/<scan_id>", methods=["GET"])
def get_report(scan_id):
    """
    Get scan report by ID
    GET /api/report/<scan_id>
    Returns: Full scan details with results
    """
    scan = Scan.query.get(scan_id)
    if not scan:
        return jsonify({"error": "scan not found"}), 404
    
    return jsonify({
        "scan_id": scan.id,
        "type": scan.type,
        "value": scan.value,
        "status": scan.status,
        "results": scan.results,
        "created_at": scan.created_at.isoformat()
    })

@app.route("/api/breach-check", methods=["POST"])
def breach_check():
    """
    Check if an email appears in known data breaches
    POST /api/breach-check
    Body: { "email": "test@example.com" }
    Returns: { "email": "...", "breaches": [...] }
    """
    data = request.get_json() or {}
    email = data.get("email")
    
    if not email:
        return jsonify({"error": "email required"}), 400
    
    if not email.strip():
        return jsonify({"error": "email cannot be empty"}), 400
    
    breaches = breach_check_internal(email.strip())
    return jsonify({"email": email.strip(), "breaches": breaches})

@app.route("/api/predict", methods=["POST"])
def predict():
    """
    AI-based profile prediction from text
    POST /api/predict
    Body: { "text": "I love football and open source..." }
    Returns: { "name_guess": "", "age_range": "18-25", "interests": [...], "risk_score": 0.32, "explain": "..." }
    """
    data = request.get_json() or {}
    text = data.get("text", "")
    
    if not text:
        return jsonify({"error": "text required"}), 400
    
    if not text.strip():
        return jsonify({"error": "text cannot be empty"}), 400
    
    # Check if OpenAI API key is available
    openai_key = os.getenv("OPENAI_API_KEY")
    
    if openai_key:
        # TODO: Implement OpenAI call here for production
        # For now, fall back to heuristic even with key
        # This is where you'd integrate with OpenAI GPT API
        pass
    
    # Use heuristic prediction
    res = simple_predict(text.strip())
    return jsonify(res)

# --- Health check endpoint
@app.route("/api/health", methods=["GET"])
def health_check():
    """Simple health check endpoint"""
    return jsonify({"status": "healthy", "service": "whoMi backend"}), 200

# --- bootstrap
if __name__ == "__main__":
    # Create database tables
    with app.app_context():
        db.create_all()
        print("✓ Database initialized")
    
    print("🚀 Starting whoMi backend server on http://0.0.0.0:5000")
    app.run(host="0.0.0.0", port=5000, debug=True)
