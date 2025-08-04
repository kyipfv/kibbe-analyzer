# Deploy to Railway

## Quick Deploy

1. **Sign up at Railway**: https://railway.app/
2. **Connect GitHub**: Link your GitHub account
3. **Push to GitHub**: 
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/kibbe-analyzer.git
   git push -u origin main
   ```
4. **Deploy on Railway**:
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repo
   - Add environment variable: `CLAUDE_API_KEY=your_api_key_here`
   - Deploy!

## Alternative: Deploy to Render

1. **Sign up at Render**: https://render.com/
2. **New Web Service** → Connect GitHub repo
3. **Settings**:
   - Build Command: `cd frontend && npm install && npm run build && cd .. && pip install -r requirements.txt`
   - Start Command: `python combined_app.py`
   - Add Environment Variable: `CLAUDE_API_KEY=your_api_key_here`

## Alternative: Deploy to Heroku

1. **Install Heroku CLI**: https://devcenter.heroku.com/articles/heroku-cli
2. **Deploy**:
   ```bash
   heroku create your-app-name
   heroku config:set CLAUDE_API_KEY=your_api_key_here
   git push heroku main
   ```

Your premium Kibbe analyzer will be live at the provided URL!