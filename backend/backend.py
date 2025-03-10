#!/usr/bin/env python3

from pymongo import MongoClient
from fastapi import FastAPI
from fastapi.responses import RedirectResponse, Response

import finder

from datetime import datetime

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
    people = data.find({
        "name": {
            "$regex": params['name'],
            "$options": "i"
        }
    })

    result = { 'res': [] }
    for person in people:
        person['_id'] = str(person['_id'])
        result['res'].append(person)

    return result

def add_corpus_entry(name: str):
    socials = finder.google_search(name)
    images = finder.google_image_search(name)
    data.insert_one({
        "timestamp": str(datetime.now()),
        "version": VERSION,
        "name": name,
        "images": [{
            "url": image,
            "isRelevant": True
        } for image in images],
        "socials": [{
            "url": url,
            "isRelevant": True
        } for url in socials]
    })

@app.get("/corpus/search")
def search(name: str):
    qparams = {
        "name": name
    }

    result = search_corpus(qparams)

    if len(result['res']) == 0:
        add_corpus_entry(name)
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