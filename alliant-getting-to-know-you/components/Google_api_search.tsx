import axios from "axios";

interface GoogleApiSearchProps {
  query: string; // Accept query as a prop
}

export default async function GoogleApiSearch({ query }: GoogleApiSearchProps) {
  console.log(`Got q: ${query}`);

  let links: string[] = [];
  await axios.get('http://localhost:8000/corpus/search', {
    params: {
      name: query,
      do_find: true
    }
  })
  .then(res => {
    res.data.res[0].socials.forEach((item: any) => {
      links.push(item.url);
    });
  });

  return (
    <div>
      <ul className="list-none pl-5"> {/* Or use list-decimal for numbers */}
        {links.map((link, index) => {
          const displayLink = link.length > 50 ? `${link.substring(0, 47)}...` : link;
          return (
            <li key={index} className="text-left">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">{index + 1}.</span>
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
            </li>
          );
        })}
      </ul>
    </div>
  );  
}
