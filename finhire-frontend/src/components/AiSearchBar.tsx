import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AiSearchBar() {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const aiUrl = import.meta.env.VITE_AI_SEARCH_URL ?? "http://localhost:4001/api/ai-search";

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!q.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(aiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      const data = await res.json();
      // Navigate to search page with AI-structured filters in state.
      navigate("/", { state: { aiSearchResult: data } });
    } catch (err) {
      // ignore for now
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="ml-6 hidden lg:flex items-center">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search (try: 'forecast revenue for next quarter')"
        className="w-72 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-sky-100"
      />
      <button
        type="submit"
        disabled={loading}
        className="ml-2 rounded-full bg-sky-600 px-3 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-60"
      >
        {loading ? "…" : "AI Search"}
      </button>
    </form>
  );
}
