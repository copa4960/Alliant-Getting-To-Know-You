"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function SearchBar() {
  const [isFocused, setIsFocused] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [companyQuery, setCompanyQuery] = useState("");
  const [siteQuery, setSiteQuery] = useState("");
  const [usernameQuery, setUsernameQuery] = useState("");

  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const queryParams = new URLSearchParams();
    
    if (searchQuery.trim()) queryParams.append("name", searchQuery);
    if (companyQuery.trim()) queryParams.append("company", companyQuery);
    if (siteQuery.trim()) queryParams.append("site", siteQuery);
    if (usernameQuery.trim()) queryParams.append("username", usernameQuery);

    if (queryParams.toString()) {
      router.push(`/search?${queryParams.toString()}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      {/* Main Search Bar */}
      <div
        className={`relative flex flex-wrap md:flex-nowrap items-center rounded-lg border bg-white transition-shadow duration-200 ${
          isFocused ? "shadow-lg ring-2 ring-primary ring-offset-2" : "shadow"
        } p-3 gap-3`}
      >
        <Search
          className={`h-5 w-5 transition-colors ${
            isFocused ? "text-primary" : "text-slate-400"
          }`}
        />
        {/* Search & Company (Same Line) */}
        <div className="flex flex-1 gap-3">
          <Input
            type="search"
            placeholder="Search by name, John Doe, etc..."
            className="border-0 bg-transparent focus-visible:ring-0 flex-1"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          <Input
            type="text"
            placeholder="Company (optional)"
            className="border-0 bg-transparent focus-visible:ring-0 flex-1"
            value={companyQuery}
            onChange={(e) => setCompanyQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Advanced Search Toggle */}
      <button
        type="button"
        onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
        className="mt-3 flex items-center text-sm font-medium text-blue-600 hover:underline"
      >
        {isAdvancedOpen ? (
          <>
            Hide Advanced Search <ChevronUp className="ml-1 h-4 w-4" />
          </>
        ) : (
          <>
            Advanced Search <ChevronDown className="ml-1 h-4 w-4" />
          </>
        )}
      </button>

      {/* Advanced Search Inputs (Collapsible) */}
      {isAdvancedOpen && (
        <div
          className={`relative flex flex-wrap md:flex-nowrap items-center rounded-lg border bg-white transition-shadow duration-200 p-3 gap-3 mt-4`}
        >
          {/* Known Site */}
          <Input
            type="text"
            placeholder="Known Site (e.g., example.com)"
            className="border-0 bg-transparent focus-visible:ring-0 flex-1"
            value={siteQuery}
            onChange={(e) => setSiteQuery(e.target.value)}
          />
          {/* Known Username */}
          <Input
            type="text"
            placeholder="Known Username(to search on common sites)"
            className="border-0 bg-transparent focus-visible:ring-0 flex-1"
            value={usernameQuery}
            onChange={(e) => setUsernameQuery(e.target.value)}
          />
        </div>
      )}

      {/* Hidden Submit Button for "Enter" Key */}
      <button type="submit" className="hidden" />
    </form>
  );
}
