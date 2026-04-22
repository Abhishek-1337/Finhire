import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@apollo/client/react";
import { SEARCH_EXPERTS } from "../graphql/documents";

export function AiSearchPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const aiUrl = import.meta.env.VITE_AI_SEARCH_URL ?? "http://localhost:4001/api/ai-search";

  // Get filters from AI search result if available
  const aiSearchResult = (location.state as any)?.aiSearchResult;
  const initialFilters = aiSearchResult?.structured || {};

  // Use filters from AI result to search
  const filterVariables = initialFilters.filters ? { filters: initialFilters.filters } : {};
  const search = useQuery(SEARCH_EXPERTS, {
    variables: filterVariables,
    skip: !Object.keys(filterVariables).length,
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError("");
    try {
      const res = await fetch(aiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim() }),
      });

      if (!res.ok) {
        throw new Error("AI search failed");
      }

      const data = await res.json();
      // The response contains AI-structured filters. Apply them.
      if (data.structured?.filters) {
        // Refetch with new filters
        const filterVars = { filters: data.structured.filters };
        search.refetch(filterVars);
      }
      setQuery("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  };

  const allExperts = (search.data as any)?.searchExperts ?? [];

  return (
    <>
      <section className="relative overflow-hidden rounded-[30px] border border-slate-200 bg-white text-slate-900 shadow-sm mb-8 p-8">
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-sky-300/30 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 -bottom-20 h-56 w-56 rounded-full bg-violet-200/40 blur-3xl" />

        <div className="relative max-w-3xl space-y-4">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
            AI-powered search
          </span>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-950">
            Find experts with natural language
          </h1>
          <p className="max-w-2xl text-slate-500 leading-7">
            Describe what you need, and our AI will find the best financial experts for your project.
          </p>
        </div>

        <form onSubmit={handleSearch} className="mt-8 flex flex-col gap-3">
          <div className="flex gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., 'CFO with 10+ years of experience in forecasting'"
              className="flex-1 rounded-full border border-slate-300 bg-white px-6 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="rounded-full bg-sky-600 px-6 py-3 text-sm font-semibold text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Searching…" : "Search"}
            </button>
          </div>
          {error && <p className="text-sm text-rose-600">{error}</p>}
          {aiSearchResult?.query && (
            <p className="text-sm text-slate-500">
              Last search: <span className="font-medium text-slate-700">{aiSearchResult.query}</span>
            </p>
          )}
        </form>
      </section>

      {allExperts.length > 0 && (
        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <p className="text-sm font-medium text-slate-500">AI Search Results</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-900">
              {allExperts.length} expert{allExperts.length !== 1 ? "s" : ""} found
            </h2>
          </div>

          <div className="grid gap-4">
            {allExperts.map((expert: any) => (
              <article key={expert.user.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-slate-900">{expert.user.name}</h3>
                    <p className="text-sm text-slate-600">
                      {expert.title} • {expert.expertType}
                    </p>
                    <p className="text-sm text-slate-500">
                      {expert.yearsExperience} years experience • {expert.user.location || "Location unknown"}
                    </p>
                    {expert.hourlyRate && (
                      <p className="text-sm font-medium text-slate-900">${expert.hourlyRate}/hr</p>
                    )}
                    {expert.reviewCount > 0 && (
                      <p className="text-sm text-slate-600">
                        ⭐ {expert.averageRating.toFixed(1)} ({expert.reviewCount} reviews)
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate(`/experts/${expert.user.id}`)}
                    className="rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
                  >
                    View Profile
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {search.loading && (
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm text-center">
          <p className="text-slate-500">Searching experts…</p>
        </div>
      )}

      {!search.loading && query && allExperts.length === 0 && (
        <div className="rounded-[28px] border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
          <p className="text-slate-500">No experts found matching your search. Try a different query.</p>
        </div>
      )}
    </>
  );
}

export default AiSearchPage;
