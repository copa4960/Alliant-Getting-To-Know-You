import axios from "axios";

interface AutoScrapeSearchProps {
  name: string;
  company: string;
  username?: string;
  url?: string;
}

export default async function AutoScrapeSearch({ name, company, username, url }: AutoScrapeSearchProps) {
  let summaries: any[] = [];
  let error = null;

  try {
    const response = await axios.get('http://localhost:8000/corpus/search', {
      params: {
        name: name,
        company: company,
        ...(username ? { username } : {}),
        ...(url ? { url } : {}),
        do_find: true
      }
    });
    
    if (response.data?.res?.[0]?.auto_scrape) {
      summaries = response.data.res[0].auto_scrape;
    }
  } catch (err: any) {
    console.error("API Error:", err);
    if (err.response) {
      error = `Server Error: ${err.response.status} - ${err.response.data?.detail || 'Unknown error'}`;
    } else if (err.request) {
      error = "No response from server. Please check if the backend is running.";
    } else {
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

  if (summaries.length === 0) {
    return (
      <div className="text-gray-500 text-center p-4">
        No auto-scraped summaries available.
      </div>
    );
  }

  return (
    <div>
      <ul className="list-none pl-5">
        {summaries.map((item, index) => {
          const displayLink = item.url ? 
            (item.url.length > 80 ? 
              `${item.url.substring(0, 79)}...` : 
              item.url) : 
            '';
          
          return (
            <li key={index} className="text-left mb-4">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">Link:</span>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline break-all"
                  title={item.url}
                >
                  {displayLink}
                </a>
              </div>
              {item.error ? (
                <div className="text-red-500 text-sm mt-1">
                  {item.error}
                </div>
              ) : (
                item.summary?.text && (
                  <div>
                    <p className="mt-1 text-sm text-gray-700">
                      {item.summary.text}
                    </p>
                  </div>
                )
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
} 