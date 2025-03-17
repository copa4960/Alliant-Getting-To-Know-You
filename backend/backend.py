#!/usr/bin/env python3

from pymongo import MongoClient
from fastapi import FastAPI
from fastapi.responses import RedirectResponse, Response

import finder

from datetime import datetime
from typing import Optional

app = FastAPI()

client = MongoClient("mongodb://127.0.0.1")
data = client['appdb']['data']

# Update version when JSON data structure is changed.
VERSION = "0.1.0"
CORPUS_LIST_LIMIT = 20

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

def add_corpus_entry(name: str, username: Optional[str] = None):
    socials = finder.google_search(name)
    images = finder.google_image_search(name)
    doc = {
        "timestamp": str(datetime.now()),
        "version": VERSION,
        "name": name,
        "images": [{
            "url": image,
            "isRelevant": False
        } for image in images],
        "socials": [{
            "url": url,
            "isRelevant": False
        } for url in socials]
    }
    
    if username is not None:
        userAccounts = finder.username_search(username)
        # Group accounts by site name
        sites_dict = {}
        for account in userAccounts:
            site_name = account["site_name"]
            if site_name not in sites_dict:
                sites_dict[site_name] = {
                    "url": account["url"],
                    "isRelevant": False
                }
        
        doc["userAccount"] = {
            username: {
                site["site_name"]: {
                    "url": site["url"],
                    "isRelevant": False
                } for site in userAccounts
            }
        }
    
    data.insert_one(doc)

@app.get("/corpus/search")
def search(name: str, username: Optional[str] = None):
    qparams = {
        "name": name,
        "username": username
    }

    result = search_corpus(qparams)

    if len(result['res']) == 0:
        add_corpus_entry(name, username)
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