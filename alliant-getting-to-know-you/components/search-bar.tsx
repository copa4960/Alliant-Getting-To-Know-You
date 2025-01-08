"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search } from 'lucide-react'
import { Input } from "@/components/ui/input"

export default function SearchBar() {
  const [isFocused, setIsFocused] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div
        className={`relative flex items-center rounded-lg border bg-white transition-shadow duration-200 ${
          isFocused ? "shadow-lg ring-2 ring-primary ring-offset-2" : "shadow"
        }`}
      >
        <Search
          className={`ml-3 h-5 w-5 transition-colors ${
            isFocused ? "text-primary" : "text-slate-400"
          }`}
        />
        <Input
          type="search"
          placeholder="Search by name, John Doe, etc..."
          className="border-0 bg-transparent pl-2 focus-visible:ring-0"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </div>
    </form>
  )
}

