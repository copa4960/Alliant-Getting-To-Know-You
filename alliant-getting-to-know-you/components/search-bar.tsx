"use client"

import { useState } from "react"
import { Search } from 'lucide-react'
import { Input } from "@/components/ui/input"

export default function SearchBar() {
  const [isFocused, setIsFocused] = useState(false)

  return (
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
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
    </div>
  )
}

