from fastapi import APIRouter, HTTPException
import google.genai as genai
import os
from pydantic import BaseModel
import datetime
import json
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/api/quote", tags=["quote"])

class QuoteResponse(BaseModel):
    quote: str
    author: str
    date: str

@router.get("/", response_model=QuoteResponse)
async def get_daily_quote():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="Gemini API Key not configured")

    try:
        client = genai.Client(api_key=api_key)
        
        prompt = """
        Generate a short, powerful, and poetic inspirational quote about time, memory, future, or self-growth. 
        It should fit the theme of "DearME" (writing to your future self).
        Focus on hope, resilience, and the passage of time.
        Return ONLY the quote and the author in JSON format like this: {"quote": "The quote text", "author": "Author Name"}. 
        If the author is unknown or it's a generated quote, use "DearME AI".
        """
        
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=prompt
        )
        
        # Clean up the response to ensure it's valid JSON
        text = response.text.replace('```json', '').replace('```', '').strip()
        
        data = json.loads(text)
        
        return {
            "quote": data.get("quote"),
            "author": data.get("author", "DearME AI"),
            "date": datetime.date.today().isoformat()
        }
    except Exception as e:
        print(f"Error generating quote: {e}")
        # Fallback quote in case of API failure
        return {
            "quote": "The future belongs to those who believe in the beauty of their dreams.",
            "author": "Eleanor Roosevelt",
            "date": datetime.date.today().isoformat()
        }
