# ✅ Installation Checklist

Follow these steps to get your Real Estate CRM running in less than 15 minutes.

## 🛠️ Prerequisites
- [ ] Node.js (v18+)
- [ ] Python (v3.9+)
- [ ] Gemini API Key (in environment variables)

## 📦 Setup Steps
1. **Prepare Environment**
   - [ ] Ensure `process.env.API_KEY` is set for Gemini access.
2. **Backend Installation**
   - [ ] Run `pip install fastapi uvicorn pandas sqlalchemy`.
   - [ ] Run `python backend_api.py`.
   - [ ] Verify `http://localhost:8000/health` returns success.
3. **Frontend Installation**
   - [ ] Run `npm install`.
   - [ ] Run `npm run dev`.
   - [ ] Open browser at `http://localhost:5173`.

## 🧪 Verification
- [ ] Dashboard displays correct KPI metrics.
- [ ] Lead list loads at least 250 initial mock properties.
- [ ] Clicking a lead row expands to show the scoring breakdown.
- [ ] "Generate AI Sales Strategy" button works (requires API key).
