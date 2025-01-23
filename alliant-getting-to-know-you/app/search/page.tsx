import { Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent } from "@/components/ui/card"
import alliantLogo from '../../public/alliant-logo.png'
import GoogleApiSearch from '@/components/Google_api_search'
import GoogleCompanySearch from '@/components/google_company_search'

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ name: string; company: string }> }) {
  const { name, company } = await searchParams; // Await the searchParams

  const nameQuery = name || ""; // Get the name query
  const companyQuery = company || ""; // Get the company query

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-4">
              <Image
                src={alliantLogo}
                alt="Alliant National Title Insurance Company"
                width={200}
                height={48}
                priority
              />
            </Link>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <Card className="mx-auto max-w-3xl">
          <CardContent className="p-6">
            <h1 className="mb-8 text-center text-3xl font-semibold text-slate-800">
              Search Results
            </h1>
            <p className="text-center text-lg">
              Showing results for: <strong>{nameQuery}</strong>
              {companyQuery && companyQuery !== "" && (
                <> at <strong>{companyQuery}</strong></>
              )}
            </p>
            <Suspense fallback={<p>Loading Social Media results...</p>}>
              <GoogleApiSearch query={nameQuery} />
            </Suspense>
            {companyQuery && companyQuery !== "" && (
              <Suspense fallback={<div>Loading AI Summary results... </div>}>
                <GoogleCompanySearch name={nameQuery} company={companyQuery} />
              </Suspense>
            )}
            <div className="mt-4 text-center">
              <Link href="/" className="inline-block px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600">
                Back to Search
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

