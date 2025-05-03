import axios from "axios";

interface GoogleApiSearchProps {
  name: string;
  company: string;
  username?: string;
  url?: string;
}

export default async function GoogleApiSearch({ name, company, username, url }: GoogleApiSearchProps) {

  let links: string[] = [];
  await axios.get('https://backendgtky-hegnffatf5a3gjdy.centralus-01.azurewebsites.net/corpus/search', {
    params: {
      name: name,
      company: company,
      ...(username ? { username } : {}),
      ...(url ? { url } : {}),
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
