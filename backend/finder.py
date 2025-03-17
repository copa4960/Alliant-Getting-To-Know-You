#!/usr/bin/env python3

from dotenv import dotenv_values
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed

config = dotenv_values()

def google_search(name: str, company: str = None) -> list[str]:
    squery = name if company is None else name + f" {company}"
    res = requests.get(
        "https://customsearch.googleapis.com/customsearch/v1",
        {
            "cx": config["GOOGLE_CX"],
            "key": config["GOOGLE_API_KEY"],
            "q": f"{squery} (site:instagram.com OR site:tiktok.com OR site:linkedin.com OR site:x.com OR site:instagram.com)"
        }
    )

    links = []
    for item in res.json()["items"]:
        links.append(item["link"])

    return links

# TODO: Integrate this function with the above google_search() function.
def google_image_search(name: str, company: str = None) -> list[str]:
    squery = name if company is None else name + f" {company}"
    res = requests.get(
        "https://customsearch.googleapis.com/customsearch/v1",
        {
            "cx": config["GOOGLE_CX"],
            "key": config["GOOGLE_API_KEY"],
            "q": f"{squery}",
            "searchType": "image"
        }
    )

    links = []
    for item in res.json()["items"]:
        links.append(item["link"])

    return links

def username_search(username: str):
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
    
    found_sites = []
    
    def check_site(site):
        site_name = site["name"]
        uri_check = site["uri_check"].format(account=username)
        try:
            res = requests.get(uri_check, headers=headers, timeout=10)
            estring_pos = site["e_string"] in res.text
            estring_neg = site["m_string"] in res.text

            if res.status_code == site["e_code"] and estring_pos and not estring_neg:
                return {"site_name": site_name, "url": uri_check}
        except:
            pass
        return None

    with ThreadPoolExecutor(max_workers=20) as executor:
        futures = {executor.submit(check_site, site): site for site in sites}
        
        for future in as_completed(futures):
            try:
                result = future.result()
                if result:
                    found_sites.append(result)
            except:
                pass

    return found_sites

    