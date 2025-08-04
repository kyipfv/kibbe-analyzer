import os

# Print environment info for debugging
print(f"PORT environment variable: {os.getenv('PORT', 'NOT SET')}")
print(f"All environment variables: {list(os.environ.keys())}")

# Minimal FastAPI app
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def root():
    return {"message": "Hello World - Kibbe Analyzer is working!", "port": os.getenv("PORT", "8000")}

@app.get("/health")
def health():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    print(f"Starting uvicorn on 0.0.0.0:{port}")
    uvicorn.run(app, host="0.0.0.0", port=port, log_level="info")