import os
from fastapi import FastAPI

# Create the FastAPI app FIRST
app = FastAPI()

# Simple route that MUST work
@app.get("/")
def home():
    return {"message": "SUCCESS! Kibbe Analyzer is working!", "status": "live"}

@app.get("/test")  
def test():
    return {"test": "working", "port": os.getenv("PORT", "not-set")}

# Only run uvicorn if this file is executed directly
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    print(f"Starting on port: {port}")
    uvicorn.run(app, host="0.0.0.0", port=port)