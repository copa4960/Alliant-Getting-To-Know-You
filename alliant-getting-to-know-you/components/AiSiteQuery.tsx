import axios from "axios";

interface AiSiteQueryProps {
  name: string;
  company: string;
}

export default async function AiSiteQuery({ name, company }: AiSiteQueryProps) {
  let autoScrapeSummaries: any[] = [];

  try {
    const res = await axios.get("http://localhost:8000/corpus/find_info", {
      params: {
        name,
        company,
      },
    });

    if (res.data.auto_scrape) {
      autoScrapeSummaries = res.data.auto_scrape;
    }
  } catch (error) {
    console.error("Error fetching AI site summaries:", error);
  }

  return (
    <div>
      <h3 className="text-center text-md mt-4 font-semibold">
        AI Summaries from Relevant Sites
      </h3>
      <ul className="mt-4 space-y-6">
        {autoScrapeSummaries.map((item, index) => (
          <li key={index} className="text-left">
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline break-all"
            >
              {item.url}
            </a>
            {item.summary?.text && (
              <p className="mt-2 text-sm text-gray-700">
                {item.summary.text}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
