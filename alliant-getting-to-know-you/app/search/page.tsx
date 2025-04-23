import { Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import alliantLogo from '../../public/alliant-logo.png'
import GoogleApiSearch from '@/components/Google_api_search'
import GoogleCompanySearch from '@/components/google_company_search'
import GoogleImageSearch from '@/components/GoogleImageSearch'
import WhatsMyReport from '@/components/WhatsMyReport'
import AiSiteQuery from '@/components/AiSiteQuery'
import AutoScrapeSearch from '@/components/AutoScrapeSearch'

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ name: string; company: string; username: string; site: string }> }) {
  const { name, company, username, site } = await searchParams; // Await the searchParams

  const nameQuery = name || ""; // Get the name query
  const companyQuery = company || ""; // Get the company query
  const usernameQuery = username || ""; // Get the username query
  const siteQuery = site || ""; // Get the site query
  const combineQuery = companyQuery + ' ' + nameQuery;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src={alliantLogo}
                alt="Alliant National Title Insurance Company"
                width={150}
                height={36}
                priority
              />
            </Link>
            <Link href="/" className="inline-block px-3 py-1.5 text-sm text-white bg-blue-500 rounded hover:bg-blue-600 transition-colors">
              Back to Search
            </Link>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-4">
        <div className="flex flex-col items-center space-y-2 mb-4">
          <h1 className="text-2xl font-semibold text-slate-800">
            Search Results
          </h1>
          <p className="text-center text-sm text-slate-600">
            Showing results for: <strong>{nameQuery}</strong>
            {companyQuery && companyQuery !== "" && (
              <> at <strong>{companyQuery}</strong></>
            )}
            {usernameQuery && usernameQuery !== "" && (
              <>, username: <strong>{usernameQuery}</strong></>
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 max-w-[2000px] mx-auto">
          {/* Left Column - Images */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-2">Top Images</h2>
              <Suspense fallback={<p className="text-sm">Loading images...</p>}>
                <GoogleImageSearch name={nameQuery} company={companyQuery} />
              </Suspense>
            </div>
          </div>

          {/* Middle Column - AI Summary and Company Info */}
          <div className="lg:col-span-6 space-y-4">
            {siteQuery && siteQuery !== "" && (
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h2 className="text-lg font-semibold mb-2">Known Site AI Summary</h2>
                <Suspense fallback={<div className="text-sm">Loading AI Summary...</div>}>
                  <AiSiteQuery name={nameQuery} company={companyQuery} url={siteQuery} />
                </Suspense>
              </div>
            )}

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-2">AI Article Summaries</h2>
              <Suspense fallback={<div className="text-sm">Loading company information...</div>}>
                <AutoScrapeSearch name={nameQuery} company={companyQuery} username={usernameQuery} />
              </Suspense>
            </div>

          </div>

          {/* Right Column - Username Search Results */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-2">Top Social Media Links</h2>
              <Suspense fallback={<p className="text-sm">Loading social media results...</p>}>
                <GoogleApiSearch name={nameQuery} company={companyQuery} />
              </Suspense>
            </div>
            {usernameQuery && usernameQuery !== "" && (
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h2 className="text-lg font-semibold mb-2">Username Search</h2>
                <Suspense fallback={<div className="text-sm">Loading username results...</div>}>
                  <WhatsMyReport query={usernameQuery} />
                </Suspense>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 text-center">
          <Link href="/" className="inline-block px-3 py-1.5 text-sm text-white bg-blue-500 rounded hover:bg-blue-600">
            Back to Search
          </Link>
        </div>
      </main>
    </div>
  )
}

