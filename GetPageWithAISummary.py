import os
from selenium import webdriver
from selenium.webdriver.firefox.service import Service
from selenium.webdriver.common.by import By
from urllib import robotparser
import google.generativeai as genai
import sys
import time

name = sys.argv[1] 
extracted_text = sys.argv[2]

# Gemini AI key
genai.configure(api_key="AIzaSyB9RW3Q7-qjmBvPLyamN3zgCXJ8SNw0RLc")
model = genai.GenerativeModel("gemini-1.5-flash")

# Function to handle AI request with timeout handling
def get_ai_summary(name, extracted_text):
    try:
        response = model.generate_content(
            f"Summarize this content looking for {name} and some interests and hobbies they could have: {extracted_text}. If no text was provided, just say 'Scraping not allowed or unavailible'."
        )
        return response.text
    except Exception as e:
        print(f"Error calling Gemini AI: {e}")
        return "There was an error processing the AI request."

# Pass the extracted text to Gemini AI for summarization
ai_summary = get_ai_summary(name, extracted_text)
print(ai_summary)
