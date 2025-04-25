import axios from "axios";

const API_KEY = "";
const CX = "";

interface GoogleImageSearchProps {
  name: string;
  company: string;
  username?: string;
  url?: string;
}

interface GAPIImgSearchParams {
  cx: string;
  key: string;
  q: string;
  searchType: string;
}

export default async function GoogleImageSearch({ name, company, username, url }: GoogleImageSearchProps) {

  let links: string[] = [];
  await axios.get('http://localhost:8000/corpus/search', {
    params: {
      name: name,
      company: company,
      ...(username ? { username } : {}),
      ...(url ? { url } : {}),
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
