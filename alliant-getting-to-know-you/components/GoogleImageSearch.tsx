import axios from "axios";

const API_KEY = "AIzaSyAbu6ulNt5xaaetWpzbVX0b90XD5UjtZxA";
const CX = "30f34c469c1dd45ca";

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
  let links: string[] = [];
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

  return (
    <div>
      <p className="text-center text-md mt-2">Top social media links found:</p>
      <ul className="mt-4">
        {links.map((link, index) => (
          <li key={index} className="text-center">
            <img src={link} />
          </li>
        ))}
      </ul>
    </div>
  );
}
