import os
import json
import base64
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import anthropic
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = FastAPI()

# Enable CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalysisResult(BaseModel):
    kibbe_archetype: str
    color_season: str
    palette_description: str

@app.post("/analyze")
async def analyze_image(file: UploadFile = File(...)):
    # Validate file size (5MB limit)
    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large. Maximum size is 5MB.")
    
    # Validate file type
    if file.content_type not in ["image/jpeg", "image/png"]:
        raise HTTPException(status_code=400, detail="Invalid file type. Only JPG/PNG allowed.")
    
    try:
        # Convert to base64
        base64_image = base64.b64encode(contents).decode()
        
        # Initialize Claude client
        api_key = os.getenv("CLAUDE_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="Claude API key not configured")
        
        client = anthropic.Anthropic(api_key=api_key)
        
        # Make API call to Claude Vision
        response = client.messages.create(
            model="claude-3-sonnet-20240229",
            max_tokens=300,
            temperature=0.3,
            system="You are a professional stylist expert in Kibbe body typing and seasonal color analysis.",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": file.content_type,
                                "data": base64_image
                            }
                        },
                        {
                            "type": "text",
                            "text": "Analyze this person's facial features and overall appearance to determine their Kibbe archetype and seasonal color palette. Respond ONLY with valid JSON in this exact format: {\"kibbe_archetype\": \"[archetype]\", \"color_season\": \"[season]\", \"palette_description\": \"[description]\"}"
                        }
                    ]
                }
            ]
        )
        
        # Parse Claude's response
        result_text = response.content[0].text
        result_json = json.loads(result_text)
        
        return JSONResponse(content=result_json)
        
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Failed to parse Claude's response")
    except anthropic.APIError as e:
        raise HTTPException(status_code=500, detail=f"Claude API error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

@app.get("/health")
async def health_check():
    return {"status": "healthy"}