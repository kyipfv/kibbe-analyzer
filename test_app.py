import os
from fastapi import FastAPI
from fastapi.responses import HTMLResponse

app = FastAPI()

@app.get("/")
async def root():
    return HTMLResponse("""
    <html>
    <body style="font-family: Arial; padding: 50px; text-align: center;">
        <h1>🎉 Kibbe Analyzer is LIVE!</h1>
        <p>Your Railway deployment is working!</p>
        <p>API Key present: {}</p>
    </body>
    </html>
    """.format("YES" if os.getenv("CLAUDE_API_KEY") else "NO"))

@app.get("/api/health")
async def health():
    return {"status": "healthy", "api_key_present": bool(os.getenv("CLAUDE_API_KEY"))}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)