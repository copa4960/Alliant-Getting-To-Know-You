from selenium import webdriver
from selenium.webdriver.firefox.service import Service
from selenium.webdriver.common.by import By
from urllib import robotparser
import google.generativeai as genai

service = Service("./geckodriver")
driver = webdriver.Firefox(service=service)



url = "https://alliantnational.com/about/our-team/david-sinclair/"
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
    response = model.generate_content(f"Summarize this content: {extracted_text}")
    print("Summary:")
    print(response.text)

driver.quit()

