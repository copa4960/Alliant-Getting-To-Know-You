from fastapi import FastAPI
from pydantic import BaseModel
import json
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed, TimeoutError
import os

app = FastAPI()

class DataProcessor:
    def __init__(self):
        self.cache = {}
        
    def check_site(self, site, username, headers):
        site_name = site["name"]
        uri_check = site["uri_check"].format(account=username)
        try:
            res = requests.get(uri_check, headers=headers, timeout=10)
            estring_pos = site["e_string"] in res.text
            estring_neg = site["m_string"] in res.text

            if res.status_code == site["e_code"] and estring_pos and not estring_neg:
                return site_name, uri_check
        except:
            pass
        return None
        
    def process(self, username):
        # Check cache first
        if username in self.cache:
            return self.cache[username]
            
        headers = {
            "Accept": "text/html, application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "accept-language": "en-US;q=0.9,en,q=0,8",
            "accept-encoding": "gzip, deflate",
            "user-Agent": "Mozilla/5.0 (Windows NT 10.0;Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36",
        }
        
        # Fetch wmn-data from WhatsMyName repository
        response = requests.get("https://raw.githubusercontent.com/WebBreacher/WhatsMyName/main/wmn-data.json")
        data = response.json()
        
        # Filter out NSFW sites and TotalWar
        data["sites"] = [site for site in data["sites"] if site.get("cat", "") != "xx NSFW xx"]
        data["sites"] = [site for site in data["sites"] if site.get("name", "") != "TotalWar"]
        sites = data["sites"]
        
        found_sites = {}
        
        try:
            with ThreadPoolExecutor(max_workers=20) as executor:
                futures = {executor.submit(self.check_site, site, username, headers): site for site in sites}
                
                for future in as_completed(futures):
                    try:
                        result = future.result()
                        if result:
                            site_name, uri_check = result
                            found_sites[site_name] = {"profile_url": uri_check}
                    except:
                        pass
        except TimeoutError:
            pass
            
        # Create the final JSON structure
        result = {
            username: found_sites
        }
        
        # Store in cache
        self.cache[username] = result
        
        return result

processor = DataProcessor()

class RequestData(BaseModel):
    username: str

@app.post("/process")
async def process_endpoint(request_data: RequestData):
    return processor.process(request_data.username)