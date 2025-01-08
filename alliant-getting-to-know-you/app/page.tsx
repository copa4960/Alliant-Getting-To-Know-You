import Image from 'next/image'
import SearchBar from "../components/search-bar"
import { Card, CardContent } from "@/components/ui/card"
import alliantLogo from '../public/alliant-logo.png' 

export default function Page() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
            <Image
              src={alliantLogo}
              alt="Alliant National Title Insurance Company"
              width={200}
              height={80}
              className="w-auto h-auto"  // This allows the image to scale
            />
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <Card className="mx-auto max-w-3xl">
          <CardContent className="p-6">
            <h1 className="mb-8 text-center text-3xl font-semibold text-slate-800">
              Getting to Know You
            </h1>
            <SearchBar />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

