import { getValue, setValue } from "@/lib/redis";
import axios from "axios";

const API_KEY = "AIzaSyAHE4dG6_A6RliPn3tLFyV_BNN6I2T7Hm4";
const CX = "c1844a91c0f9849e1";

interface GoogleImageSearchProps {
  query: string; // Accept query as a prop
}

interface GAPIImgSearchParams {
  cx: string;
  key: string;
  q: string;
  searchType: string;
}

export default async function GoogleImageSearch({ query }: GoogleImageSearchProps) {
  console.log(`Got q: ${query}`);

  let value = await getValue(`image:${query}`);
  let links: string[] = [];
  if (value == null) {
    console.log("ImageSearch: No value in cache. Searching...");
    const config: GAPIImgSearchParams = {
      cx: CX,
      key: API_KEY,
      q: query,
      searchType: "image"
    };

    await axios.get('https://customsearch.googleapis.com/customsearch/v1', {
      params: config
    })
      .then(res => {
        res.data.items.forEach((item: any) => {
          links.push(item.image.thumbnailLink);
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
          <p className="text-center text-md mt-2">Top images:</p>
          <p className="text-red-500">API quota exceeded. Please try again later.</p>
        </div>
      );
    }

    let repr: string = links.join('|');
    setValue(`image:${query}`, repr);
  } else {
    console.log("ImageSearch: Using cache...");
    links = value.split('|');
  }

  return (
    <div>
      <p className="text-center text-md mt-2">Top images:</p>
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {links.slice(0, 3).map((link, index) => (
          <img key={index} src={link} width="200" className="rounded object-cover" />
        ))}
      </div>
    </div>
  );
}
