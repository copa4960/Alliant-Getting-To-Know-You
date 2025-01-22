#!/usr/bin/env python3

import sys
import requests
import json

API_KEY = "AIzaSyAHE4dG6_A6RliPn3tLFyV_BNN6I2T7Hm4"
CX = "c1844a91c0f9849e1"

def search(query, image=False):
    r = requests.get("https://customsearch.googleapis.com/customsearch/v1", 
    params={
        "cx": CX,
        "key": API_KEY,
        "q": query,
        # "searchType": "image",            # show only images
        # "siteSearch": "instagram.com",    # filter websites
        # "siteSearchFilter": "i"
    })

    return json.loads(r.text)

if __name__ == '__main__' and len(sys.argv) >= 2:
    res = search(' '.join(sys.argv[1:]))
    for item in res['items']:
        print(item['link'])