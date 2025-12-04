# whoMi Backend - Digital Footprint Scanner API

A Flask-based REST API backend for the whoMi digital footprint scanner. This service provides endpoints for scanning emails/usernames, checking data breaches, and AI-based profile prediction.

## 🚀 Features

- **Digital Footprint Scanning**: Scan emails or usernames for online presence
- **Breach Detection**: Check if emails appear in known data breaches (via Have I Been Pwned API)
- **AI Profile Prediction**: Predict user profiles from text using heuristic analysis or OpenAI
- **RESTful API**: Clean JSON-based API with proper error handling
- **SQLite Storage**: Persistent storage for scan results
- **Docker Support**: Easy deployment with Docker Compose

## 📋 Prerequisites

- Python 3.11+ (for local development)
- Docker & Docker Compose (for containerized deployment)
- Optional: API keys for external services (HIBP, OpenAI)

## 🛠️ Installation & Setup

### Option 1: Local Development with Virtual Environment

1. **Navigate to backend directory**:
   ```bash
   cd /home/othmane/Documents/react\ js/digital\ footprint/digital-footprint/backend
   ```

2. **Create and activate virtual environment**:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables** (optional):
   ```bash
   cp .env.example .env
   # Edit .env and add your API keys if needed
   ```

5. **Run the server**:
   ```bash
   python app.py
   ```

   The server will start on `http://localhost:5000`

### Option 2: Docker Deployment

1. **Build and run with Docker Compose**:
   ```bash
   cd /home/othmane/Documents/react\ js/digital\ footprint/digital-footprint/backend
   docker compose up --build
   ```

   The server will start on `http://localhost:5000`

2. **Run in detached mode**:
   ```bash
   docker compose up -d
   ```

3. **Stop the server**:
   ```bash
   docker compose down
   ```

## 📡 API Endpoints

### Health Check
**GET** `/api/health`

Check if the service is running.

**Response**:
```json
{
  "status": "healthy",
  "service": "whoMi backend"
}
```

---

### Create Scan
**POST** `/api/scan`

Start a new footprint scan for an email or username.

**Request Body**:
```json
{
  "type": "email",      // or "username"
  "value": "test@example.com"
}
```

**Response** (201 Created):
```json
{
  "scan_id": "123e4567-e89b-12d3-a456-426614174000",
  "status": "done"      // or "running" for async scans
}
```

---

### Get Scan Report
**GET** `/api/report/<scan_id>`

Retrieve results for a specific scan.

**Response** (200 OK):
```json
{
  "scan_id": "123e4567-e89b-12d3-a456-426614174000",
  "type": "email",
  "value": "test@example.com",
  "status": "done",
  "results": {
    "breaches": [...],
    "found_profiles": [],
    "prediction": {}
  },
  "created_at": "2025-12-02T17:00:00.000000"
}
```

---

### Check Data Breaches
**POST** `/api/breach-check`

Check if an email appears in known data breaches.

**Request Body**:
```json
{
  "email": "test@example.com"
}
```

**Response** (200 OK):
```json
{
  "email": "test@example.com",
  "breaches": [
    {
      "name": "Adobe",
      "date": "2013-10-04",
      "leaked_data": ["Email addresses", "Passwords"]
    }
  ]
}
```

---

### AI Profile Prediction
**POST** `/api/predict`

Analyze text to predict user profile characteristics.

**Request Body**:
```json
{
  "text": "I love football and spent 10 years coding in Python"
}
```

**Response** (200 OK):
```json
{
  "name_guess": "",
  "age_range": "25-34",
  "interests": ["football", "software development"],
  "risk_score": 0.31,
  "explain": "Heuristic prediction. Add OPENAI_API_KEY for AI-powered analysis"
}
```

## 🔐 Environment Variables

Create a `.env` file based on `.env.example`:

| Variable | Description | Required |
|----------|-------------|----------|
| `FLASK_ENV` | Flask environment (`development` or `production`) | No |
| `DATABASE_URL` | SQLite database path | No (defaults to `sqlite:///whoami.db`) |
| `HIBP_API_KEY` | Have I Been Pwned API key | No (uses mock data without it) |
| `OPENAI_API_KEY` | OpenAI API key for AI predictions | No (uses heuristics without it) |

### Getting API Keys

- **Have I Been Pwned**: Register at [https://haveibeenpwned.com/API/Key](https://haveibeenpwned.com/API/Key)
- **OpenAI**: Get your key at [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)

## 🧪 Testing

### Run Unit Tests

```bash
# With virtual environment activated
pytest tests/ -v
```

Expected output: All 13 tests should pass.

### Run Acceptance Tests

```bash
# Make script executable
chmod +x tests/acceptance_test.sh

# Start the server in one terminal
python app.py

# Run tests in another terminal
./tests/acceptance_test.sh
```

### Manual Testing with cURL

```bash
# Test scan endpoint
curl -X POST http://localhost:5000/api/scan \
  -H "Content-Type: application/json" \
  -d '{"type":"email","value":"test@example.com"}'

# Test breach check
curl -X POST http://localhost:5000/api/breach-check \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Test AI prediction
curl -X POST http://localhost:5000/api/predict \
  -H "Content-Type: application/json" \
  -d '{"text":"I love football and coding"}'
```

## 🔗 Frontend Integration

The React frontend should proxy requests to this backend. Add to `frontend/package.json`:

```json
"proxy": "http://localhost:5000"
```

Use the provided API service module at `frontend/src/services/api.js`:

```javascript
import { startScan, checkBreach, predictProfile } from './services/api';

// Start a scan
const result = await startScan('email', 'test@example.com');

// Check breaches
const breaches = await checkBreach('test@example.com');

// Get AI prediction
const prediction = await predictProfile('Your text here');
```

## 🛡️ Security Considerations

### Current Implementation (MVP)
- ✅ CORS enabled for local development
- ✅ Basic input validation
- ✅ Environment variables for secrets
- ✅ `.gitignore` configured to prevent secret commits

### Production Recommendations
- ⚠️ **Add authentication**: Implement API keys or OAuth
- ⚠️ **Rate limiting**: Use Flask-Limiter or Redis-based throttling
- ⚠️ **HTTPS only**: Deploy behind reverse proxy (nginx) with SSL
- ⚠️ **Database encryption**: Encrypt sensitive data at rest
- ⚠️ **Input sanitization**: Add comprehensive validation
- ⚠️ **Logging**: Implement proper logging (without exposing secrets)
- ⚠️ **GDPR compliance**: Add data retention policies and user consent

## 🐛 Troubleshooting

### Port 5000 already in use
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or change the port in app.py:
app.run(host="0.0.0.0", port=5001, debug=True)
```

### SQLite database locked
```bash
# Stop all Flask instances and restart
pkill -f app.py
python app.py
```

### CORS errors in browser
Ensure:
1. Backend is running on port 5000
2. Frontend `package.json` has `"proxy": "http://localhost:5000"`
3. Both frontend and backend are running

### Import errors
```bash
# Ensure virtual environment is activated
source .venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt
```

## 📁 Project Structure

```
backend/
├── app.py                      # Main Flask application
├── requirements.txt            # Python dependencies
├── .env.example               # Environment variables template
├── .gitignore                 # Git ignore rules
├── Dockerfile                 # Docker container config
├── docker-compose.yml         # Docker Compose setup
├── whoami.db                  # SQLite database (created on first run)
└── tests/
    ├── test_endpoints.py      # Unit tests
    └── acceptance_test.sh     # Acceptance tests
```

## 🚧 Known Limitations (MVP)

- **Synchronous processing**: Scans run synchronously (no async Celery tasks yet)
- **No rate limiting**: Vulnerable to abuse without rate limits
- **Mock breach data**: Without HIBP API key, returns empty results
- **Simple heuristics**: AI prediction uses basic keywords without OpenAI
- **No authentication**: All endpoints are publicly accessible
- **SQLite only**: Not suitable for high-concurrency production use

See `NEXT_STEPS.md` for planned improvements.

## 📝 License

This project is part of the whoMi digital footprint scanner.

## 💬 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the API specification in the implementation plan
3. Check server logs for error messages

---

**Happy scanning! 🔍**
