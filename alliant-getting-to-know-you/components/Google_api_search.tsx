import axios from "axios";

interface GoogleApiSearchProps {
  query: string; // Accept query as a prop
}

export default async function GoogleApiSearch({ query }: GoogleApiSearchProps) {
  console.log(`Got q: ${query}`);

  let links: string[] = [];
  await axios.get('http://localhost:8000/corpus/search', {
    params: {
      name: query
    }
  })
  .then(res => {
    res.data.res[0].socials.forEach((item: any) => {
      links.push(item.url);
    });
  });

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
