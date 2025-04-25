from fastapi import FastAPI
from pydantic import BaseModel
import google.generativeai as genai
from playwright.async_api import async_playwright  # Import Async Playwright

# Initialize FastAPI app
app = FastAPI()

# Configure Gemini AI with API Key (Replace with your actual key)
genai.configure(api_key="")  

#  Add Root Endpoint
@app.get("/")
async def root():
    return {"message": "Welcome to the AI Web Scraper API! Visit /docs for API documentation."}

#  AI Summarization Request Model
class WebScrapeRequest(BaseModel):
    url: str  # URL to scrape
    name: str  # Entity or person the summary is about

#  Function to Scrape Website Text Using Async Playwright
async def scrape_website_text(url: str) -> str:
    """Asynchronously extracts and returns text from a given website."""
    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)  # Run browser in headless mode
            page = await browser.new_page()
            await page.goto(url, timeout=60000)  # Load the page with a timeout
            text_content = await page.inner_text("body")  # Extract all visible text
            await browser.close()
        return text_content
    except Exception as e:
        return f"Error scraping website: {str(e)}"

#  Function to Generate AI Summary
async def generate_summary(name: str, text: str) -> str:
    """Calls Gemini AI to generate a summary for the given text."""
    try:
        model = genai.GenerativeModel("gemini-1.5-pro-latest")  # Correct model name
        response = await model.generate_content_async(f"Summarize this webpage about {name}:\n{text} into a brief summary, Marriage-status as true false or unknow, interests as Interests, and education under Eduaction")
        return response.text if response and response.text else "AI summary could not be generated."
    except Exception as e:
        return f"AI Error: {str(e)}"

#  FastAPI Endpoint: Scrape Website & Generate AI Summary
@app.post("/ai-web-summary")
async def ai_web_summary(request: WebScrapeRequest):
    """Scrapes a webpage and generates an AI summary of its content."""
    scraped_text = await scrape_website_text(request.url)
    
    if "Error scraping website" in scraped_text:
        return {"error": scraped_text}

    summary = await generate_summary(request.name, scraped_text)
    return {"url": request.url, "summary": summary}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)
