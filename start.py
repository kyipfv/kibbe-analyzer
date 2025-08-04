#!/usr/bin/env python3
import os
import subprocess
import sys

def main():
    # Set the port from environment or default to 8000
    port = os.getenv("PORT", "8000")
    
    # Build frontend if dist doesn't exist
    if not os.path.exists("frontend/dist"):
        print("Building frontend...")
        try:
            subprocess.run(["npm", "install"], cwd="frontend", check=True)
            subprocess.run(["npm", "run", "build"], cwd="frontend", check=True)
        except subprocess.CalledProcessError as e:
            print(f"Frontend build failed: {e}")
            # Continue anyway, we can serve without frontend
    
    # Start the server
    print(f"Starting server on port {port}...")
    os.execv(sys.executable, [sys.executable, "-m", "uvicorn", "combined_app:app", "--host", "0.0.0.0", "--port", port])

if __name__ == "__main__":
    main()