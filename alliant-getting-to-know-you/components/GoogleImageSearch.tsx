import axios from "axios";

const API_KEY = "AIzaSyAHE4dG6_A6RliPn3tLFyV_BNN6I2T7Hm4";
const CX = "c1844a91c0f9849e1";

interface GoogleImageSearchProps {
  name: string;
  company: string;
}

interface GAPIImgSearchParams {
  cx: string;
  key: string;
  q: string;
  searchType: string;
}

export default async function GoogleImageSearch({ name, company }: GoogleImageSearchProps) {

  let links: string[] = [];
  await axios.get('http://localhost:8000/corpus/search', {
    params: {
      name: name,
      company: company,
      do_find: true
    }
  })
  .then(res => {
    res.data.res[0].images.forEach((item: any) => {
      links.push(item.url);
    });
  });

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {links.slice(0, 3).map((link, index) => (
          <img key={index} src={link} width="200" className="rounded object-cover" />
        ))}
      </div>
    </div>
  );
}
