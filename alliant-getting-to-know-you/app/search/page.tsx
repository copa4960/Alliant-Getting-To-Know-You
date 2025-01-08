import { Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent } from "@/components/ui/card"
import alliantLogo from '../../public/alliant-logo.png' 

export default function SearchPage({ searchParams }: { searchParams: { q: string } }) {
  const query = searchParams.q

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
            <Suspense fallback={<p>Loading search results...</p>}>
              <SearchResults query={query} />
            </Suspense>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

function SearchResults({ query }: { query: string }) {
  // In a real application, you would fetch search results here
  return (
    <div>
      <p className="text-center text-lg">
        Showing results for: <strong>{query}</strong>
      </p>
      <p className="mt-4 text-center">
        (This is a placeholder. Implement actual search functionality here.)
      </p>
    </div>
  )
}

