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
    });

    let repr: string = links.join('|');
    setValue(`image:${query}`, repr);
  } else {
    console.log("ImageSearch: Using cache...");
    links = value.split('|');
  }

  return (
    <div>
      <p className="text-center text-md mt-2">Top images:</p>
      {links.slice(0, 3).map((link, index) => (
        <img key={index} src={link} width="200" className="rounded" />
      ))}
    </div>
  );
}
