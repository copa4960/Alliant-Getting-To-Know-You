import re
import requests
import pandas as pd
import sys  # Import sys to read command-line arguments

def clean_filename(filename):
    filename = re.sub(r'[\\*?:"<>|]', "", filename)
    return filename

def build_payload(query, start=1, num=10, date_restrict="m1", **params): 
    payload = {
        'key': API_KEY,
        'q': query,
        'cx': SEARCH_ENGINE_ID,
        'start': start,
        'num': num,
        'dateRestrict': date_restrict
    }
    payload.update(params)
    return payload

def make_request(payLoad):
    response = requests.get('https://www.googleapis.com/customsearch/v1', params=payLoad)
    if response.status_code != 200:
        raise Exception('Request failed')
    return response.json()

def main(query, result_total=10):
    items = []
    reminder = result_total % 10
    if reminder > 0:
        pages = (result_total // 10) + 1
    else:
        pages = result_total // 10 
    
    for i in range(pages):
        if pages == i + 1 and reminder > 0:
            payload = build_payload(query, start=(i + 1) * 10, num=reminder)
        else: 
            payload = build_payload(query, start=(i + 1) * 10)
        response = make_request(payload)
        items.extend(response['items'])
    
    df = pd.json_normalize(items)
    links = df['link'].tolist()
    return links

if __name__ == '__main__':
    API_KEY = 'AIzaSyAbu6ulNt5xaaetWpzbVX0b90XD5UjtZxA'
    SEARCH_ENGINE_ID = '30f34c469c1dd45ca'
    
    # Get command-line arguments
    if len(sys.argv) < 2:
        print("Usage: python 'google api file.py' '<search_query>'")
        sys.exit(1)

    search_query = sys.argv[1]  # Get the search query from command line arguments
    total_results = 2
    
    links = main(search_query, total_results)
    for index in range(len(links)):
        print(links[index])