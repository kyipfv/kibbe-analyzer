#!/usr/bin/env python3
import os
import sys
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Print debug info
logger.info(f"Python version: {sys.version}")
logger.info(f"PORT env var: {os.getenv('PORT', 'NOT SET')}")
logger.info(f"Current working directory: {os.getcwd()}")
logger.info(f"Files in directory: {os.listdir('.')}")

from fastapi import FastAPI
from fastapi.responses import HTMLResponse

app = FastAPI(title="Kibbe Analyzer", debug=True)

@app.get("/")
def read_root():
    logger.info("Root endpoint called")
    return HTMLResponse("""
    <!DOCTYPE html>
    <html>
    <head>
        <title>🎉 Kibbe Analyzer - WORKING!</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; margin: 0; padding: 50px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; min-height: 100vh;">
        <h1 style="font-size: 4em; margin-bottom: 20px;">🎉</h1>
        <h2 style="font-size: 2.5em; margin-bottom: 30px;">Kibbe Analyzer is LIVE!</h2>
        <p style="font-size: 1.5em; margin-bottom: 20px;">Your Railway deployment is working perfectly!</p>
        <div style="background: rgba(255,255,255,0.2); padding: 20px; border-radius: 10px; margin: 30px auto; max-width: 500px;">
            <p><strong>Port:</strong> {}</p>
            <p><strong>API Key:</strong> {}</p>
            <p><strong>Environment:</strong> Railway</p>
        </div>
        <div style="margin-top: 30px;">
            <a href="/health" style="background: #4CAF50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-size: 1.2em; margin: 10px;">Health Check</a>
            <a href="/debug" style="background: #2196F3; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-size: 1.2em; margin: 10px;">Debug Info</a>
        </div>
    </body>
    </html>
    """.format(
        os.getenv('PORT', 'Not Set'),
        'Present ✅' if os.getenv('CLAUDE_API_KEY') else 'Missing ❌'
    ))

@app.get("/health")
def health_check():
    logger.info("Health endpoint called")
    return {
        "status": "healthy",
        "port": os.getenv('PORT'),
        "api_key_present": bool(os.getenv('CLAUDE_API_KEY')),
        "python_version": sys.version,
        "working_directory": os.getcwd()
    }

@app.get("/debug")
def debug_info():
    logger.info("Debug endpoint called")
    return {
        "environment_variables": dict(os.environ),
        "port": os.getenv('PORT'),
        "files": os.listdir('.'),
        "python_path": sys.path
    }

# This is crucial for Railway
if __name__ == "__main__":
    import uvicorn
    
    # Get port from environment (Railway sets this)
    port = int(os.getenv("PORT", 8000))
    
    logger.info(f"Starting server on port {port}")
    logger.info(f"Host: 0.0.0.0")
    
    # Start the server
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=port,
        log_level="info",
        access_log=True
    )