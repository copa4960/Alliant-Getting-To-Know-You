import { Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent } from "@/components/ui/card"
import alliantLogo from '../../public/alliant-logo.png' 
import GoogleApiSearch from '@/components/Google_api_search'
import { totalmem } from 'os'

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
              <GoogleApiSearch query={query} />
            </Suspense>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

