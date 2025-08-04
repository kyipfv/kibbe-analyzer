import os
from fastapi import FastAPI
from fastapi.responses import HTMLResponse, JSONResponse

app = FastAPI()

@app.get("/")
def read_root():
    return HTMLResponse("""
    <!DOCTYPE html>
    <html>
    <head>
        <title>🎉 Kibbe Analyzer is LIVE!</title>
    </head>
    <body style="font-family: Arial; padding: 50px; text-align: center; background: linear-gradient(135deg, #f8fafc, #e2e8f0);">
        <h1 style="color: #1f2937; font-size: 48px;">🎉 Kibbe Analyzer is LIVE!</h1>
        <p style="font-size: 24px; color: #4b5563;">Your Railway deployment is working!</p>
        <p style="font-size: 18px; color: #6b7280;">API Key present: <strong>{}</strong></p>
        <div style="margin: 30px;">
            <a href="/api/health" style="background: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px;">Test Health Endpoint</a>
        </div>
    </body>
    </html>
    """.format("YES ✅" if os.getenv("CLAUDE_API_KEY") else "NO ❌"))

@app.get("/api/health")
def health():
    return JSONResponse({
        "status": "healthy", 
        "api_key_present": bool(os.getenv("CLAUDE_API_KEY")),
        "port": os.getenv("PORT", "8000"),
        "env_vars": list(os.environ.keys())[:10]  # First 10 env vars for debugging
    })

@app.get("/test")
def test():
    return {"message": "Test endpoint working!", "api_key": bool(os.getenv("CLAUDE_API_KEY"))}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    print(f"Starting server on port {port}")
    uvicorn.run(app, host="0.0.0.0", port=port)