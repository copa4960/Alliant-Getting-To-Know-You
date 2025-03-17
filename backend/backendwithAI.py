#!/usr/bin/env python3

from pymongo import MongoClient
from fastapi import FastAPI
from fastapi.responses import RedirectResponse, Response

import finder

from datetime import datetime
from typing import Optional

import google.generativeai as genai
from playwright.async_api import async_playwright

app = FastAPI()

client = MongoClient("mongodb://127.0.0.1")
data = client['appdb']['data']

# Update version when JSON data structure is changed.
VERSION = "0.1.0"
CORPUS_LIST_LIMIT = 20

#helper functions for webscrape and AI summary
async def scrape_website_text(url: str) -> str:
    """Asynchronously extracts and returns text from a given website."""
    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)  # Run headless
            page = await browser.new_page()
            await page.goto(url, timeout=60000)  # Load the page with timeout
            text_content = await page.inner_text("body")  # Extract all visible text
            await browser.close()
        return text_content
    except Exception as e:
        return f"Error scraping website: {str(e)}"
    
async def generate_summary(name: str, text: str) -> str:
    """Generates an AI summary for the scraped text."""
    try:
        model = genai.GenerativeModel("gemini-1.5-pro-latest")
        response = await model.generate_content_async(
            f"Summarize this webpage about {name} into:\n"
            "- A brief summary\n"
            "- Marriage status (true/false/unknown)\n"
            "- Interests\n"
            "- Education"
        )
        return response.text if response and response.text else "AI summary could not be generated."
    except Exception as e:
        return f"AI Error: {str(e)}"


@app.get("/")
def root():
    return RedirectResponse(url="/corpus")

@app.get("/corpus")
def corpus():
    people = data.find().limit(CORPUS_LIST_LIMIT)
    result = { 'res': [] }
    for person in people:
        person['_id'] = str(person['_id'])
        result['res'].append(person)

    return result

def search_corpus(params: dict) -> dict:
    query = {
        "name": {
            "$regex": params['name'],
            "$options": "i"
        }
    }
    
    if 'username' in params and params['username'] is not None:
        query["userAccount." + params['username']] = {"$exists": True}
    
    people = data.find(query)

    result = { 'res': [] }
    for person in people:
        person['_id'] = str(person['_id'])
        result['res'].append(person)

    return result

@app.get("/corpus/find_info")
async def find_info(name: str, company: Optional[str] = None, username: Optional[str] = None, url: Optional[str] = None):
    socials = finder.google_search(name, company=company)
    images = finder.google_image_search(name, company=company)

    doc = {
        "timestamp": str(datetime.now()),
        "version": VERSION,
        "name": name,
        "images": [{"url": image, "isRelevant": False} for image in images],
        "socials": [{"url": url, "isRelevant": False} for url in socials],
    }

    if url:
        scraped_text = await scrape_website_text(url)
        if "Error scraping website" in scraped_text:
            doc["web_scrape"] = {"error": scraped_text}
        else:
            summary = await generate_summary(name, scraped_text)
            doc["web_scrape"] = {"summary": summary}
    if username:
        user_accounts = finder.username_search(username)
        doc["userAccount"] = {
            username: {
                account["site_name"]: {
                    "url": account["url"],
                    "isRelevant": False,
                }
                for account in user_accounts
            }
        }

    if company:
        doc["company"] = company

    data.insert_one(doc)
    doc["_id"] = str(doc["_id"])

    return doc

@app.get("/corpus/search")
def search(name: str, username: Optional[str] = None):
    qparams = {
        "name": name,
        "username": username
    }

    result = search_corpus(qparams)

    return result

@app.get("/corpus/test")
def test():
    data.delete_many({ "isTest": True })

    doc = {
        "timestamp": str(datetime.now()),
        "version": VERSION,
        "name": "John Doe",
        "company": "Doe, Inc.",
        "images": [
            {
                "url": "http://image.url/image.png",
                "isRelevant": True
            }
        ],
        "socials": [
            {
                "url": "https://social.media.site/username",
                "isRelevant": True
            }
        ],
        "summary": "This field contains any generated AI summaries for this document.",
        "isTest": True
    }

    data.insert_one(doc)