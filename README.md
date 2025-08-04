# Kibbe & Color Analysis Tool

A single-page web application that analyzes face photos to determine Kibbe body type archetype and seasonal color palette using Claude Vision API.

## Prerequisites

- Python 3.8+
- Node.js 18+
- Anthropic API key

## Setup

1. Clone the repository and navigate to the project directory:
```bash
cd kibbe-analyzer
```

2. Set up your environment variable:
```bash
cp .env.template .env
# Edit .env and add your CLAUDE_API_KEY
```

3. Run the development environment:
```bash
make dev
```

This will:
- Install Python dependencies
- Install Node.js dependencies  
- Start the backend server on http://localhost:8000
- Start the frontend dev server on http://localhost:5173

## Usage

1. Navigate to http://localhost:5173 in your browser
2. Upload a face photo (JPG/PNG, max 5MB)
3. Click "Analyze" to get your Kibbe archetype and color season
4. View your personalized color palette

## Privacy & Security

- Images are processed entirely in memory
- No images are stored on disk or in any database
- Images are not shared with any third parties beyond the Claude API
- All uploads are cleared from memory after processing

## Tech Stack

- Frontend: React + Vite + Tailwind CSS
- Backend: Python FastAPI
- AI: Anthropic Claude Vision API