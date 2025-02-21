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

  return (
    <div className="mt-6">
      <p className="text-center text-md mt-2 mb-4">Username Search Results:</p>
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
        <div 
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: reportHtml }} 
        />
      )}
    </div>
  );
}
