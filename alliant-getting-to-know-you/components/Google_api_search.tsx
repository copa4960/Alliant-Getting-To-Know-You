import { getValue, setValue } from "@/lib/redis";
import axios from "axios";

const API_KEY = "AIzaSyAHE4dG6_A6RliPn3tLFyV_BNN6I2T7Hm4";
const CX = "c1844a91c0f9849e1";

interface GoogleApiSearchProps {
  query: string; // Accept query as a prop
}

interface GAPISearchParams {
  cx: string;
  key: string;
  q: string;
}

export default async function GoogleApiSearch({ query }: GoogleApiSearchProps) {
  console.log(`Got q: ${query}`);

  let value = await getValue(query);
  let links: string[] = [];
  if (value == null) {
    console.log("GoogleSearch: No value in cache. Searching...");
    const config: GAPISearchParams = {
      cx: CX,
      key: API_KEY,
      q: `${query} (site:instagram.com OR site:tiktok.com OR site:linkedin.com OR site:x.com OR site:instagram.com)`
    };

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
          <p className="text-center text-md mt-2">Top social media links found:</p>
          <p className="text-red-500">API quota exceeded. Please try again later.</p>
        </div>
      );
    }

    let repr: string = links.join('|');
    setValue(query, repr);
  } else {
    console.log("GoogleSearch: Using cache...");
    links = value.split('|');
  }

  return (
    <div>
      <p className="text-center text-md mt-2">Top social media links found:</p>
      <ul className="mt-4">
        {links.map((link, index) => (
          <li key={index} className="text-center">
            <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-500">
              {link}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
