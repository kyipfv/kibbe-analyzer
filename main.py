import os
import json
import base64
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, HTMLResponse
import anthropic
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="Kibbe & Color Analysis")

# Enable CORS
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

@app.post("/api/analyze")
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
        
        client = anthropic.Anthropic(
            api_key=api_key,
            timeout=60.0  # 60 second timeout
        )
        
        # Make API call to Claude Vision with retry logic
        import time
        max_retries = 2
        for attempt in range(max_retries):
            try:
                response = client.messages.create(
                    model="claude-3-haiku-20240307",  # Use Haiku - faster and more reliable
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
                break  # Success, exit retry loop
            except Exception as retry_error:
                if attempt == max_retries - 1:  # Last attempt
                    raise retry_error
                time.sleep(2)  # Wait 2 seconds before retry
        
        # Parse Claude's response
        result_text = response.content[0].text
        result_json = json.loads(result_text)
        
        return JSONResponse(content=result_json)
        
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Failed to parse Claude's response")
    except anthropic.APIError as e:
        # If Claude API fails, return a demo response for testing
        return JSONResponse(content={
            "kibbe_archetype": "Soft Natural", 
            "color_season": "Warm Autumn",
            "palette_description": "Your warm autumn palette features rich, earthy tones like burnt orange, deep gold, warm browns, and olive greens. These colors complement your natural warmth and bring out your best features. Note: This is a demo response due to API connection issues."
        })
    except Exception as e:
        # Return demo response for any other error
        return JSONResponse(content={
            "kibbe_archetype": "Classic", 
            "color_season": "True Winter",
            "palette_description": "Your true winter palette features bold, clear colors like pure white, black, royal blue, and bright red. These high-contrast colors complement your natural clarity. Note: This is a demo response due to technical issues."
        })

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "api_key_present": bool(os.getenv("CLAUDE_API_KEY"))}

@app.post("/api/test")
async def test_upload(file: UploadFile = File(...)):
    return {
        "message": "File upload working!",
        "filename": file.filename,
        "content_type": file.content_type,
        "api_key_present": bool(os.getenv("CLAUDE_API_KEY"))
    }

@app.get("/", response_class=HTMLResponse)
async def get_frontend():
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>✨ Kibbe & Color Analysis</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
                background: linear-gradient(135deg, #f8fafc 0%, #ffffff 50%, #f1f5f9 100%);
                min-height: 100vh;
            }
            .header {
                background: rgba(255,255,255,0.85);
                backdrop-filter: blur(20px);
                border-bottom: 1px solid rgba(0,0,0,0.08);
                padding: 32px;
                position: sticky;
                top: 0;
                z-index: 50;
            }
            .container { max-width: 800px; margin: 0 auto; padding: 64px 32px; }
            .title {
                font-size: 48px;
                font-weight: bold;
                background: linear-gradient(135deg, #1f2937 0%, #4b5563 50%, #6b7280 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                margin-bottom: 16px;
                text-align: center;
            }
            .subtitle { color: #64748b; font-size: 20px; margin-bottom: 64px; text-align: center; }
            .upload-area {
                background: rgba(255,255,255,0.8);
                backdrop-filter: blur(10px);
                border: 2px dashed rgba(148,163,184,0.5);
                border-radius: 32px;
                padding: 64px;
                text-align: center;
                transition: all 0.5s;
                cursor: pointer;
                margin-bottom: 32px;
            }
            .upload-area:hover { 
                transform: scale(1.02);
                border-color: rgba(148,163,184,0.8);
                background: rgba(255,255,255,0.95);
                box-shadow: 0 20px 60px rgba(0,0,0,0.1);
            }
            .upload-icon {
                width: 120px;
                height: 120px;
                margin: 0 auto 32px;
                background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
                border-radius: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 64px;
                transition: transform 0.3s;
            }
            .upload-area:hover .upload-icon { transform: scale(1.1); }
            .upload-text { font-size: 32px; font-weight: bold; color: #1e293b; margin-bottom: 16px; }
            .upload-desc { color: #64748b; font-size: 18px; margin-bottom: 24px; }
            .upload-details { color: #94a3b8; font-size: 14px; }
            .analyze-btn {
                background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
                color: white;
                border: none;
                padding: 20px 64px;
                border-radius: 20px;
                font-size: 20px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s;
                margin-top: 32px;
                box-shadow: 0 10px 30px rgba(31,41,55,0.3);
            }
            .analyze-btn:hover { 
                transform: translateY(-4px); 
                box-shadow: 0 20px 50px rgba(31,41,55,0.4); 
            }
            .analyze-btn:disabled { 
                opacity: 0.6; 
                cursor: not-allowed; 
                transform: none; 
                box-shadow: none;
            }
            .results {
                background: rgba(255,255,255,0.95);
                backdrop-filter: blur(15px);
                border-radius: 32px;
                padding: 48px;
                margin-top: 48px;
                display: none;
                box-shadow: 0 25px 70px rgba(0,0,0,0.1);
            }
            .results-title {
                font-size: 36px;
                font-weight: bold;
                text-align: center;
                margin-bottom: 48px;
                color: #1f2937;
            }
            .result-item {
                padding: 32px;
                margin-bottom: 24px;
                background: rgba(248,250,252,0.8);
                border-radius: 24px;
                border-left: 6px solid #10b981;
                transition: transform 0.3s;
            }
            .result-item:hover { transform: translateY(-2px); }
            .result-label { font-size: 16px; font-weight: bold; color: #374151; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px; }
            .result-value { font-size: 28px; font-weight: black; color: #1f2937; margin-bottom: 8px; }
            .result-desc { font-size: 16px; color: #6b7280; line-height: 1.6; }
            .error { 
                color: #dc2626; 
                background: rgba(252,165,165,0.2); 
                padding: 20px; 
                border-radius: 16px; 
                margin-top: 24px; 
                border-left: 4px solid #dc2626;
            }
            .hidden { display: none; }
            #preview { 
                max-width: 100%; 
                max-height: 400px; 
                border-radius: 20px; 
                margin: 24px 0;
                box-shadow: 0 15px 40px rgba(0,0,0,0.2);
            }
            .loading { animation: pulse 2s infinite; }
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="title">✨ Kibbe & Color Analysis</div>
            <div class="subtitle">AI-powered style archetype and personal color palette discovery</div>
        </div>
        
        <div class="container">
            <div class="upload-area" onclick="document.getElementById('fileInput').click()">
                <div class="upload-icon">📸</div>
                <div class="upload-text">Upload Your Photo</div>
                <div class="upload-desc">Drag and drop or click to select your image</div>
                <div class="upload-details">Supports JPG, PNG • Maximum 5MB</div>
                <input type="file" id="fileInput" accept="image/jpeg,image/png" style="display: none;" onchange="handleFile(this)">
                <img id="preview" class="hidden">
            </div>
            
            <div style="text-align: center;">
                <button id="analyzeBtn" class="analyze-btn hidden" onclick="analyzeImage()">✨ Begin Analysis</button>
                <button id="testBtn" class="analyze-btn hidden" onclick="testUpload()" style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); margin-left: 16px;">🧪 Test Upload</button>
            </div>
            
            <div id="error" class="error hidden"></div>
            <div id="results" class="results"></div>
        </div>

        <script>
            let selectedFile = null;

            function handleFile(input) {
                const file = input.files[0];
                if (!file) return;

                if (file.size > 5 * 1024 * 1024) {
                    showError('File size exceeds 5MB limit');
                    return;
                }

                selectedFile = file;
                const preview = document.getElementById('preview');
                preview.src = URL.createObjectURL(file);
                preview.classList.remove('hidden');
                document.getElementById('analyzeBtn').classList.remove('hidden');
                document.getElementById('testBtn').classList.remove('hidden');
                hideError();
            }

            async function analyzeImage() {
                if (!selectedFile) return;

                const btn = document.getElementById('analyzeBtn');
                btn.innerHTML = '⏳ Analyzing Your Style...';
                btn.disabled = true;
                btn.classList.add('loading');

                const formData = new FormData();
                formData.append('file', selectedFile);

                try {
                    const response = await fetch('/api/analyze', {
                        method: 'POST',
                        body: formData
                    });

                    console.log('Response status:', response.status);
                    console.log('Response headers:', response.headers);

                    if (!response.ok) {
                        const responseText = await response.text();
                        console.log('Error response:', responseText);
                        
                        try {
                            const error = JSON.parse(responseText);
                            throw new Error(error.detail || 'Analysis failed');
                        } catch (parseError) {
                            throw new Error(`Server error (${response.status}): ${responseText.substring(0, 200)}...`);
                        }
                    }

                    const responseText = await response.text();
                    console.log('Success response:', responseText);
                    
                    try {
                        const data = JSON.parse(responseText);
                        showResults(data);
                    } catch (parseError) {
                        throw new Error(`Invalid response format: ${responseText.substring(0, 200)}...`);
                    }
                } catch (err) {
                    console.error('Full error:', err);
                    showError(err.message);
                } finally {
                    btn.innerHTML = '✨ Begin Analysis';
                    btn.disabled = false;
                    btn.classList.remove('loading');
                }
            }

            function showResults(data) {
                const resultsDiv = document.getElementById('results');
                resultsDiv.innerHTML = `
                    <div class="results-title">🎨 Your Personal Style Profile</div>
                    <div class="result-item">
                        <div class="result-label">Kibbe Body Archetype</div>
                        <div class="result-value">${data.kibbe_archetype}</div>
                    </div>
                    <div class="result-item">
                        <div class="result-label">Seasonal Color Type</div>
                        <div class="result-value">${data.color_season}</div>
                    </div>
                    <div class="result-item">
                        <div class="result-label">Color Palette Description</div>
                        <div class="result-desc">${data.palette_description}</div>
                    </div>
                `;
                resultsDiv.style.display = 'block';
                resultsDiv.scrollIntoView({ behavior: 'smooth' });
                hideError();
            }

            function showError(message) {
                const errorDiv = document.getElementById('error');
                errorDiv.textContent = message;
                errorDiv.classList.remove('hidden');
            }

            function hideError() {
                document.getElementById('error').classList.add('hidden');
            }

            async function testUpload() {
                if (!selectedFile) return;

                const formData = new FormData();
                formData.append('file', selectedFile);

                try {
                    const response = await fetch('/api/test', {
                        method: 'POST',
                        body: formData
                    });

                    const data = await response.json();
                    alert('Test successful: ' + JSON.stringify(data, null, 2));
                } catch (err) {
                    alert('Test failed: ' + err.message);
                }
            }

            // Drag and drop functionality
            document.addEventListener('dragover', (e) => e.preventDefault());
            document.addEventListener('drop', (e) => {
                e.preventDefault();
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    document.getElementById('fileInput').files = files;
                    handleFile(document.getElementById('fileInput'));
                }
            });
        </script>
    </body>
    </html>
    """