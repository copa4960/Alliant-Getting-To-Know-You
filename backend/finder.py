#!/usr/bin/env python3

from dotenv import dotenv_values
import requests

config = dotenv_values()

def google_search(name: str):
    res = requests.get(
        "https://customsearch.googleapis.com/customsearch/v1",
        {
            "cx": config["GOOGLE_CX"],
            "key": config["GOOGLE_API_KEY"],
            "q": f"{name} (site:instagram.com OR site:tiktok.com OR site:linkedin.com OR site:x.com OR site:instagram.com)"
        }
    )

    links = []
    for item in res.json()["items"]:
        links.append(item["link"])

    return links

def google_image_search(name: str):
    res = requests.get(
        "https://customsearch.googleapis.com/customsearch/v1",
        {
            "cx": config["GOOGLE_CX"],
            "key": config["GOOGLE_API_KEY"],
            "q": f"{name}",
            "searchType": "image"
        }
    )

    links = []
    for item in res.json()["items"]:
        links.append(item["link"])

    return links