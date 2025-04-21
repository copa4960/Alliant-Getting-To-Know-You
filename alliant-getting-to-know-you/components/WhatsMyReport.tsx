'use client';

import { useEffect, useState } from 'react';

interface WhatsMyReportProps {
  query: string;
}

export default function WhatsMyReport({ query }: WhatsMyReportProps) {
  const [reportHtml, setReportHtml] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Call API endpoint to run Python script
        const response = await fetch('/api/whatsmyname', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username: query }),
        });

        if (!response.ok) {
          throw new Error('Failed to generate report');
        }

        const data = await response.json();
        setReportHtml(data.html);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      fetchReport();
    }
  }, [query]);

  if (!query) {
    return null;
  }

  // Process the HTML to format URLs
  const processHtml = (html: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Find all links in the document
    const links = doc.querySelectorAll('a');
    links.forEach(link => {
      const url = link.getAttribute('href');
      if (url) {
        // Format the URL display text
        const displayText = url.length > 80 ? `${url.substring(0, 79)}...` : url;
        link.textContent = displayText;
        link.setAttribute('title', url); // Show full URL on hover
        link.setAttribute('class', 'text-blue-500 hover:underline whitespace-nowrap overflow-hidden text-ellipsis');
      }
    });

    // Get only the table content
    const table = doc.querySelector('table');
    if (table) {
      // Remove any content after the last URL
      const rows = table.querySelectorAll('tr');
      let lastUrlRow = 0;
      for (let i = rows.length - 1; i >= 0; i--) {
        if (rows[i].querySelector('a')) {
          lastUrlRow = i;
          break;
        }
      }
      // Remove all rows after the last URL
      for (let i = rows.length - 1; i > lastUrlRow; i--) {
        rows[i].remove();
      }

      // Add table styling
      table.setAttribute('class', 'min-w-full divide-y divide-gray-200');
      const cells = table.querySelectorAll('td, th');
      cells.forEach(cell => {
        cell.setAttribute('class', 'px-4 py-2 text-left text-sm');
      });
    }

    return doc.body.innerHTML;
  };

  return (
    <div className="mt-2">
      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Searching username across platforms...</p>
        </div>
      )}
      {error && (
        <div className="text-red-500 py-4 text-center">
          Error: {error}
        </div>
      )}
      {!loading && !error && reportHtml && (
        <div className="overflow-x-auto">
          <div 
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: processHtml(reportHtml) }} 
          />
        </div>
      )}
    </div>
  );
}
