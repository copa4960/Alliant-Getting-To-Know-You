#!/usr/bin/env python3
import json
import requests
import os
from concurrent.futures import ThreadPoolExecutor, as_completed, TimeoutError

def check_site(site, username, headers):
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

def generate_html_report(username, found_sites, script_dir):
    # Use absolute path for the HTML file
    report_path = os.path.join(script_dir, f"whatsmyname_report_{username}.html")
    
    html_content = f"""
    <html>
    <head>
        <title>WhatsMyName Report for {username}</title>
        <style>
            body {{
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
            }}
            .container {{
                max-width: 100%;
                margin: 0 auto;
            }}
            table {{
                width: 100%;
                border-collapse: collapse;
                margin-top: 1rem;
                background-color: white;
                border-radius: 0.5rem;
                box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
                overflow: hidden;
            }}
            th, td {{
                padding: 1rem;
                text-align: left;
                border-bottom: 1px solid #e5e7eb;
            }}
            th {{
                background-color: #f3f4f6;
                font-weight: 600;
                color: rgb(31, 41, 55);
                border-bottom: 2px solid #e5e7eb;
            }}
            td {{
                color: rgb(55, 65, 81);
            }}
            tr:last-child td {{
                border-bottom: none;
            }}
            a {{
                color: #3b82f6;
                text-decoration: none;
            }} 
            a:hover {{
                text-decoration: underline;
            }}
            thead {{
                background-color: #f3f4f6;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <table>
                <thead> 
                    <tr>
                        <th>Website Name</th>
                        <th>Profile URL</th>
                    </tr>
                </thead>
                <tbody>"""
    
    for site_name, uri_check in found_sites:
        html_content += f"""
                    <tr>
                        <td>{site_name}</td>
                        <td><a href="{uri_check}" target="_blank">{uri_check}</a></td>
                    </tr>"""
    
    html_content += """
                </tbody>
            </table>
        </div>
    </body>
    </html>"""

    with open(report_path, "w", encoding='utf-8') as report_file:
        report_file.write(html_content)
    
    return report_path

def main(username):
    # Get the directory where this script is located
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    headers = {
        "Accept": "text/html, application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "accept-language": "en-US;q=0.9,en,q=0,8",
        "accept-encoding": "gzip, deflate",
        "user-Agent": "Mozilla/5.0 (Windows NT 10.0;Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36",
    }
    
    # Fetch wmn-data from WhatsMyName repository
    response = requests.get("https://raw.githubusercontent.com/WebBreacher/WhatsMyName/main/wmn-data.json")
    data = response.json()
    
    # Filter out NSFW sites
    data["sites"] = [site for site in data["sites"] if site.get("cat", "") != "xx NSFW xx"]
    # Filter out Total War site (perhaps botted)
    data["sites"] = [site for site in data["sites"] if site.get("name", "") != "TotalWar"]
    sites = data["sites"]
    found_sites = []

    try:
        with ThreadPoolExecutor(max_workers=20) as executor:
            futures = {executor.submit(check_site, site, username, headers): site for site in sites}
            
            for future in as_completed(futures):
                try:
                    result = future.result()
                    if result:
                        site_name, uri_check = result
                        found_sites.append((site_name, uri_check))
                except:
                    pass

    except TimeoutError:
        pass

    # Generate HTML report and return its path
    report_path = generate_html_report(username, found_sites, script_dir)
    print(report_path)  # Print the path so the Node.js process can capture it
    return len(found_sites)

if __name__ == "__main__":
    import sys
    if len(sys.argv) != 2:
        sys.exit(1)
    main(sys.argv[1]) 