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
  
  try {
    const response = await axios.get('https://backendgtky-hegnffatf5a3gjdy.centralus-01.azurewebsites.net/corpus/search', {
      params: {
        name: name,
        company: company,
        ...(username ? { username } : {}),
        ...(url ? { url } : {}),
        do_find: true
      }
    });

    // Check if response has the expected structure
    if (response.data && response.data.res && response.data.res[0] && response.data.res[0].images) {
      response.data.res[0].images.forEach((item: any) => {
        if (item && item.url) {
          links.push(item.url);
        }
      });
    } else {
      console.error('Unexpected response structure:', response.data);
    }
  } catch (error) {
    console.error('Error fetching images:', error);
  }

  return (
    <div>
      {links.length > 0 ? (
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          {links.slice(0, 3).map((link, index) => (
            <img key={index} src={link} width="200" className="rounded object-cover" />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">No images found</p>
      )}
    </div>
  );
}
