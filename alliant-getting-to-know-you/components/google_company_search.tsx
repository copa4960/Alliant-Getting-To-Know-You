import axios from "axios";

import puppeteer from "puppeteer";
import fetch from "node-fetch";
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const API_KEY = "AIzaSyAbu6ulNt5xaaetWpzbVX0b90XD5UjtZxA";
const CX = "c1844a91c0f9849e1";

interface GoogleCompanySearchProps {
    query: string;
}

interface GAPISearchParams {
    cx: string;
    key: string;
    q: string;
}

// Check robots.txt to see if scraping is allowed
async function checkRobots(url: string): Promise<boolean> {
    const baseUrl = url.split(".com")[0] + ".com"; // Get the base domain
    const robotsUrl = `${baseUrl}/robots.txt`;

    try {
        const response = await fetch(robotsUrl);
        if (!response.ok) {
            console.log(`No robots.txt found at ${robotsUrl}`);
            return true; // Default to allow if no robots.txt is present
        }

        const robotsText = await response.text();
        return robotsText.includes("User-agent: *"); // Basic check for Disallow rule
    } catch (error) {
        console.error("Error fetching robots.txt:", error);
        return true; // Default to allow if there's an error
    }
}

export default async function GoogleCompanySearch({ query }: GoogleCompanySearchProps) {
    console.log(`Got q: ${query}`);
    let links: string[] = [];
    const name = query.match(/^[^\s]+/);
    const aiSummary = "../GetPageWithAISummary.py";

    const config: GAPISearchParams = {
        cx: CX,
        key: API_KEY,
        q: `${query} -site:instagram.com -site:tiktok.com -site:linkedin.com -site:x.com -site:instagram.com`
    };

    // Fetch company page links from Google Custom Search
    await axios.get('https://customsearch.googleapis.com/customsearch/v1', {
        params: config
    })
        .then(res => {
            res.data.items.forEach((item: any) => {
                links.push(item.link);
            });
        })
        .catch(error => {
            if (error.response?.status === 429 || error.response?.data?.error?.code === 429) {
                console.error("Google API quota exceeded");
                return [];
            }
            console.error("Google API error:", error);
            return [];
        });

    if (links.length === 0) {
        return (
            <div className="text-center mt-4">
                <p className="text-red-500">API quota exceeded. Please try again later.</p>
            </div>
        );
    }

    // Start Puppeteer to extract content from the links
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    let aiText: string[] = [];

    for (const link of links) {
        // Check robots.txt first
        const canScrape = await checkRobots(link);
        if (!canScrape) {
            console.log(`Scraping not allowed for ${link}`);
            aiText.push("Scraping not allowed or unavailable.")
            continue; // Skip this link if scraping is not allowed
        }

        try {
            await page.goto(link, { waitUntil: 'domcontentloaded', timeout: 60000 });
            const paragraphs = await page.$$eval('p', (paragraphs: Element[]) =>
                paragraphs.map(p => p.textContent).join("\n")
            );

            const sanitizedParagraphs = paragraphs
                .replace(/[\r\n]+/g, ' ')  // Replace newlines with spaces
                .replace(/(["'\\$`!])/g, '\\$1') // Escape special characters
                .replace(/^\ufeff/, '') // Remove BOM character if it exists
                .replace(/[^\x00-\x7F]/g, '');  // Remove non-ASCII characters (if needed)

            const { stdout: aiResults, stderr: aiError } = await execAsync(
                `python ${aiSummary} "${name}" "${sanitizedParagraphs}"`,
            );

            if (aiError) {
                console.error("Google API Script Error:", aiError);
                return <p>Error executing ai summary</p>;
            }

            aiText.push(aiResults)

        } catch (error) {
            console.error(`Error extracting content from ${link}:`, error);
        }
    }

    await browser.close();

    return (
        <div>
          <ul className="list-none pl-5">
            {links.map((link, index) => {
              const displayLink = link.length > 80 ? `${link.substring(0, 79)}...` : link;
              return (
                <li key={index} className="text-left mb-4"> {/* spacing between blocks */}
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">Link:</span>
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline break-all"
                      title={link}
                    >
                      {displayLink}
                    </a>
                  </div>
                  {aiText[index] && (
                    <div>
                      <p className="mt-1 text-sm text-gray-700">
                        {aiText[index]}
                      </p>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      );
      
}