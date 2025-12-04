# whoMi Backend - Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Start the Backend

```bash
cd /home/othmane/Documents/react\ js/digital\ footprint/digital-footprint/backend
source .venv/bin/activate
python app.py
```

Backend will start on **http://localhost:5000**

---

### Step 2: Start the Frontend

In a **new terminal**:

```bash
cd /home/othmane/Documents/react\ js/digital\ footprint/digital-footprint/frontend
npm run dev
```

Frontend will start (usually on **http://localhost:5173**)

---

### Step 3: Use the App

Open your browser to the frontend URL and try:

1. **Scan Feature**: Enter an email or username → Click "Scan"
2. **Breach Check**: Enter an email → Click "Check"
3. **AI Prediction**: Enter some text → Click "Analyze"

---

## 📡 API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/scan` | POST | Start footprint scan |
| `/api/report/<scan_id>` | GET | Get scan results |
| `/api/breach-check` | POST | Check email breaches |
| `/api/predict` | POST | AI profile prediction |
| `/api/health` | GET | Health check |

---

## 🧪 Run Tests

```bash
# Unit tests
cd backend
source .venv/bin/activate
pytest tests/ -v

# Acceptance tests (with server running)
./tests/acceptance_test.sh
```

---

## 🐳 Run with Docker (Alternative)

```bash
cd backend
docker compose up --build
```

---

## 🔑 Add API Keys (Optional)

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add:
   ```
   HIBP_API_KEY=your_haveibeenpwned_key
   OPENAI_API_KEY=your_openai_key
   ```

3. Restart backend

---

## 📚 Full Documentation

- **README.md**: Complete setup guide and API docs
- **NEXT_STEPS.md**: Future improvements roadmap
- **walkthrough.md** (artifact): Implementation details

---

## ❓ Troubleshooting

**Port 5000 already in use?**
```bash
lsof -i :5000
kill -9 <PID>
```

**CORS errors?**
- Ensure both frontend and backend are running
- Check `package.json` has `"proxy": "http://localhost:5000"`

**Import errors?**
```bash
source .venv/bin/activate
pip install -r requirements.txt
```

---

## ✅ All Tests Passing

- ✅ 12 unit tests pass
- ✅ 4 acceptance tests pass
- ✅ Backend running on port 5000
- ✅ Frontend integration complete

**Status**: Ready for development! 🎉
