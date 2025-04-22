import axios from "axios";

interface AiSiteQueryProps {
  name: string;
  company: string;
  url: string
}

export default async function AiSiteQuery({ name, company, url}: AiSiteQueryProps) {
  let summary: any[] = [];
  let error = null;

  try {
    const response = await axios.get('http://localhost:8000/corpus/search', {
      params: {
        name: name,
        company: company,
        url: url,
        do_find: true
      }
    });
    
    if (response.data?.res?.[0]) {
      summary = [response.data.res[0]];
    }
  } catch (err: any) {
    console.error("API Error:", err);
    if (err.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      error = `Server Error: ${err.response.status} - ${err.response.data?.detail || 'Unknown error'}`;
    } else if (err.request) {
      // The request was made but no response was received
      error = "No response from server. Please check if the backend is running.";
    } else {
      // Something happened in setting up the request that triggered an Error
      error = `Request Error: ${err.message}`;
    }
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        {error}
      </div>
    );
  }

  if (summary.length === 0) {
    return (
      <div className="text-gray-500 text-center p-4">
        No summary available for this website.
      </div>
    );
  }

  return (
    <div>
      <ul className="list-none pl-5">
        {summary.map((item, index) => {
          const displayLink = item.web_scrape?.url?.text ? 
            (item.web_scrape.url.text.length > 80 ? 
              `${item.web_scrape.url.text.substring(0, 79)}...` : 
              item.web_scrape.url.text) : 
            '';
          
          return (
            <li key={index} className="text-left mb-4">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">Link:</span>
                <a
                  href={item.web_scrape?.url?.text}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline break-all"
                  title={item.web_scrape?.url?.text}
                >
                  {displayLink}
                </a>
              </div>
              {item.web_scrape?.summary?.text && (
                <div>
                  <p className="mt-1 text-sm text-gray-700">
                    {item.web_scrape.summary.text}
                  </p>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}