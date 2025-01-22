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


from selenium import webdriver
from selenium.webdriver.firefox.service import Service
from selenium.webdriver.common.by import By
from urllib import robotparser
import google.generativeai as genai

service = Service("./geckodriver")
driver = webdriver.Firefox(service=service)


for item in res['items']:
    url = item['link']
    driver.get(url)

    dotCom = url.split(".com")
    dotComSplit = dotCom[0] + ".com/robots.txt"

    rp = robotparser.RobotFileParser()
    rp.set_url(dotComSplit)
    rp.read()

    # Gemini AI key
    genai.configure(api_key="AIzaSyB9RW3Q7-qjmBvPLyamN3zgCXJ8SNw0RLc")
    model = genai.GenerativeModel("gemini-1.5-flash")
        
    if not rp.can_fetch("*", dotComSplit):
        print("robot says no")
    else: 
        #turn paragraphs into summary
        paragraphs = driver.find_elements(By.TAG_NAME, "p")
        extracted_text = "\n".join([paragraph.text for paragraph in paragraphs])
        # Pass the extracted text to Gemini AI for summarization
        response = model.generate_content(f"Summarize this content, if it does not seem relevent to insurance,only say the quote: 'this is not important': {extracted_text}")
        print("Summary:")
        print(response.text)

driver.quit()



