from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from model_utils import analyze_text, scrape_headline_from_url

app = FastAPI(title="Clickbait Detector API")

# Enable CORS for React (Port 3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class HeadlineRequest(BaseModel):
    headline: str

class UrlRequest(BaseModel):
    url: str

@app.post("/predict")
async def predict(data: HeadlineRequest):
    analysis = analyze_text(data.headline)
    return {"headline": data.headline, **analysis}

@app.post("/analyze-url")
async def analyze_url(data: UrlRequest):
    headline = scrape_headline_from_url(data.url)
    if "Error" in headline:
        return {"error": headline}
    analysis = analyze_text(headline)
    return {"headline": headline, **analysis}