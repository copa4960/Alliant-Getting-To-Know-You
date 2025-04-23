#!/usr/bin/env python3

from pymongo import MongoClient
from fastapi import FastAPI
from fastapi.responses import RedirectResponse

import finder
import re

from datetime import datetime, timedelta
from typing import Optional

import google.generativeai as genai
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import requests
from urllib.parse import urlencode

from dotenv import load_dotenv
import os

app = FastAPI()

try:
    print("Attempting to connect to MongoDB...")
    client = MongoClient("mongodb://127.0.0.1")
    # Force a connection attempt to verify it works
    client.admin.command('ping')
    print("Successfully connected to MongoDB")
    data = client['appdb']['data']
except Exception as e:
    print(f"Failed to connect to MongoDB: {str(e)}")
    raise e

genai.configure(api_key="AIzaSyB9RW3Q7-qjmBvPLyamN3zgCXJ8SNw0RLc")

# Update version when JSON data structure is changed.
VERSION = "0.1.0"
CORPUS_LIST_LIMIT = 100

#helper functions for webscrape and AI summary
async def scrape_website_text(url: str) -> str:
    """Asynchronously extracts and returns text from a given website using Selenium."""
    options = Options()
    options.add_argument("--headless=new")  
    service = Service()  # Adjust this if a specific driver path is needed
    
    try:
        driver = webdriver.Chrome(service=service, options=options)
        driver.get(url)
        
        # Wait until the body tag is present
        WebDriverWait(driver, 60).until(EC.presence_of_element_located((By.TAG_NAME, "body")))
        
        text_content = driver.find_element(By.TAG_NAME, "body").text
        driver.quit()
        return text_content
    except Exception as e:
        return f"Error scraping website: {str(e)}"
    
import re

async def generate_summary(name: str, text: str) -> list:
    """Generates an AI summary for the scraped text."""
    try:
        model = genai.GenerativeModel("gemini-1.5-pro-latest")
        response = await model.generate_content_async(
            f"{text}\n"
            "- Summarize this webpage about {name} into:\n"
            "- A brief summary\n"
            "- Marriage status (true/false/unknown)\n"
            "- Interests\n"
            "- Education"
        )
        text = response.text if response and response.text else "AI summary could not be generated."

        # Print raw output for debugging
        #print("Raw AI Output:", text)

        summary_match = re.search(r"\*\*Brief Summary:\*\*\s*(.*?)(?=\n\*\*Marriage Status:|\Z)", text, re.DOTALL)
        marriage_match = re.search(r"\*\*Marriage Status:\*\*\s*(.*?)(?=\n\*\*Interests:|\Z)", text, re.DOTALL)
        interests_match = re.search(r"\*\*Interests:\*\*\s*(.*?)(?=\n\*\*Education:|\Z)", text, re.DOTALL)
        education_match = re.search(r"\*\*Education:\*\*\s*(.*)", text, re.DOTALL)

        # Handle cases where sections are missing
        summary = summary_match.group(1).strip() if summary_match else "No summary available"
        marriage = marriage_match.group(1).strip() if marriage_match else "Unknown"
        interests = interests_match.group(1).strip() if interests_match else "No interests found"
        education = education_match.group(1).strip() if education_match else "No education information found"
        
        result = [summary, marriage, interests, education]
        return result

    except Exception as e:
        return ["AI Error: " + str(e), "Unknown", "No interests found", "No education information found"]
#helper function 
async def generate_summary2(name: str, extracted_text: str) -> list:
    """Generates an AI summary for the scraped text."""
    try:
        model = genai.GenerativeModel("gemini-1.5-pro-latest")
        response = model.generate_content(
            f"Summarize this content looking for {name} and some interests and hobbies they could have: {extracted_text}. If no text was provided, just say 'Scraping not allowed or unavailible'."
        )
        text = response.text if response and response.text else "AI summary could not be generated."
        return text

    except Exception as e:
        return [f"AI Error: {str(e)}"]
#helper function(google search to get links for scraping):
def get_google_links(query: str, cx: str, key: str) -> list[str]:
    """Use Google Custom Search API to fetch page links (not images)."""
    base_url = "https://customsearch.googleapis.com/customsearch/v1"
    params = {
        "q": f"{query} -site:instagram.com -site:tiktok.com -site:linkedin.com -site:x.com",
        "cx": cx,
        "key": key
    }

    try:
        response = requests.get(base_url, params=params)
        response.raise_for_status()
        data = response.json()
        return [item["link"] for item in data.get("items", [])]
    except Exception as e:
        print("Google Search Error:", e)
        return []

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
    # Calculate the date one month ago
    one_month_ago = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
    
    # Name is required for all queries
    query = {
        "name": {
            "$regex": params['name'].strip(),
            "$options": "i"
        },
        "timestamp": {
            "$gte": one_month_ago
        }
    }
    
    # Add URL condition if provided
    if 'url' in params and params['url'] is not None:
        query["$or"] = [
            {"web_scrape.url.text": params['url']},
            {"auto_scrape": {
                "$elemMatch": {
                    "url": params['url']
                }
            }}
        ]
    
    # Add username condition if provided
    if 'username' in params and params['username'] is not None:
        query["userAccount." + params['username']] = {"$exists": True}
    
    # Add company condition if provided
    if 'company' in params and params['company'] is not None:
        query["company"] = {
            "$regex": params['company'].strip(),
            "$options": "i"
        }
    
    # Sort by timestamp in descending order to get most recent first
    people = data.find(query).sort("timestamp", -1)
    result = { 'res': [] }
    for person in people:
        person['_id'] = str(person['_id'])
        
        # Verify the result has all required sections based on input parameters
        is_valid = True
        
        # Always should have auto_scrape section
        if 'auto_scrape' not in person:
            is_valid = False
            
        # If URL provided, must have web_scrape section
        if is_valid and params.get('url') and 'web_scrape' not in person:
            is_valid = False
            
        # If username provided, must have userAccount section
        if is_valid and params.get('username') and 'userAccount' not in person:
            is_valid = False
        
        if is_valid:
            result['res'].append(person)
            break  # Take only the most recent valid result
    
    return result

@app.get("/corpus/find_info")
async def find_info(name: str, company: Optional[str] = None, username: Optional[str] = None, url: Optional[str] = None):
    doc = {
        "timestamp": str(datetime.now()),
        "version": VERSION,
        "name": name,
    }
    if company:
        doc["Company"] = company

    # Handle socials and images search
    try:
        socials = finder.google_search(name, company=company)
        images = finder.google_image_search(name, company=company)
        doc["images"] = [{"url": image, "isRelevant": False} for image in images]
        doc["socials"] = [{"url": url, "isRelevant": False} for url in socials]
    except Exception as e:
        print(f"Error in socials/images search: {str(e)}")
        doc["images"] = []
        doc["socials"] = []

    # Handle auto-scraping for name
    if name:
        try:
            load_dotenv()
            GOOGLE_CX = os.getenv("GOOGLE_CX")
            GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

            if GOOGLE_CX and GOOGLE_API_KEY:
                combined_query = f"{name} {company}" if company else name
                links = get_google_links(combined_query, GOOGLE_CX, GOOGLE_API_KEY)

                summaries = []
                for link in links[:5]:  # Limit to top 5 for performance
                    try:
                        scraped_text = await scrape_website_text(link)
                        if "Error scraping website" in scraped_text:
                            summaries.append({"url": link, "error": scraped_text})
                            continue

                        ai = await generate_summary2(name, scraped_text)
                        summaries.append({
                            "url": link,
                            "summary": {"text": ai, "isRelevant": False},
                        })
                    except Exception as e:
                        print(f"Error processing link {link}: {str(e)}")
                        summaries.append({"url": link, "error": str(e)})

                doc["auto_scrape"] = summaries
            else:
                doc["auto_scrape"] = [{"error": "Missing Google API credentials"}]
        except Exception as e:
            print(f"Error in auto-scraping: {str(e)}")
            doc["auto_scrape"] = [{"error": str(e)}]

    if url:
        try:
            scraped_text = await scrape_website_text(url)
            if "Error scraping website" in scraped_text:
                doc["web_scrape"] = {"error": scraped_text}
            else:
                summary = await generate_summary(name, scraped_text)
                doc["web_scrape"] = {
                    "url": {"text": url, "isRelevant": False},
                    "summary": {"text": summary[0], "isRelevant": False},
                    "marriage_status": {"text": summary[1], "isRelevant": False},
                    "interests": {"text": summary[2], "isRelevant": False},
                    "education": {"text": summary[3], "isRelevant": False},
                }
        except Exception as e:
            print(f"Error in URL scraping: {str(e)}")
            doc["web_scrape"] = {"error": str(e)}

    if username:
        try:
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
        except Exception as e:
            print(f"Error in username search: {str(e)}")
            doc["userAccount"] = {username: {"error": str(e)}}

    try:
        print(f"Attempting to insert document for {name}...")
        print(f"Document structure: {doc}")
        insert_result = data.insert_one(doc)
        print(f"Document inserted successfully. Insert ID: {insert_result.inserted_id}")
        doc["_id"] = str(doc["_id"])
    except Exception as e:
        print(f"Error inserting document: {str(e)}")
        print(f"Full error details: {repr(e)}")
        # Still return the document even if insertion fails
        doc["_id"] = "error"
    return doc

@app.get("/corpus/search")
async def search(name: str, company: Optional[str] = None, username: Optional[str] = None, url: Optional[str] = None, do_find = False):
    try:
        qparams = {
            "name": name,
            "company": company,
            "username": username,
            "url": url
        }

        result = search_corpus(qparams)
        if result['res'] == [] and do_find:
            print("Nothing in corpus. Finding info...")
            try:
                found_info = await find_info(name, company, username, url)
                result['res'] = [found_info]
            except Exception as e:
                print(f"Error in find_info: {str(e)}")
                result['res'] = [{
                    "error": str(e),
                    "name": name,
                    "company": company,
                    "url": url,
                    "username": username
                }]

        return result
    except Exception as e:
        print(f"Error in search: {str(e)}")
        return {
            "res": [{
                "error": str(e),
                "name": name,
                "company": company,
                "url": url,
                "username": username
            }]
        }

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