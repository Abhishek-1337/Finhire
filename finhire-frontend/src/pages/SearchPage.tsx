import { useMemo, useState, type ChangeEvent } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { Link } from "react-router-dom";
import { SEARCH_EXPERTS, TOGGLE_FAVORITE, FAVORITES_FOR_ME } from "../graphql/documents";
import { CountryDropdown } from "../components/ui/Auth/CountryDropdown";

export function SearchPage() {
  const [searchLocation, setSearchLocation] = useState("");
  const [searchExpertType, setSearchExpertType] = useState("");
  const [searchMinRating, setSearchMinRating] = useState("");
  const [searchMinExperience, setSearchMinExperience] = useState("");

  const filterVariables = useMemo(() => {
    const filters: Record<string, unknown> = {};
    if (searchLocation.trim()) filters.location = searchLocation.trim();
    if (searchExpertType.trim()) filters.expertType = searchExpertType;

    if (searchMinRating.trim()) {
      const minRating = Number(searchMinRating);
      if (Number.isFinite(minRating)) filters.minRating = minRating;
    }

    if (searchMinExperience.trim()) {
      const minYearsExperience = Number(searchMinExperience);
      if (Number.isFinite(minYearsExperience)) filters.minYearsExperience = minYearsExperience;
    }

    return Object.keys(filters).length > 0 ? { filters } : {};
  }, [searchLocation, searchExpertType, searchMinRating, searchMinExperience]);

  const search = useQuery(SEARCH_EXPERTS, { variables: filterVariables });
  const favorites = useQuery(FAVORITES_FOR_ME);
  const [toggleFavorite] = useMutation(TOGGLE_FAVORITE);
  const allExperts = (search.data as any)?.searchExperts ?? [];
  console.log(allExperts);

  const filteredExperts = useMemo(() => {
    if (Object.keys(filterVariables).length === 0) return allExperts;

    return allExperts.filter((expert: any) => {
      if (searchLocation.trim() && !expert.user.location?.toLowerCase().includes(searchLocation.toLowerCase())) return false;
      if (searchExpertType.trim() && expert.expertType !== searchExpertType) return false;
      if (searchMinRating.trim()) {
        const minRating = Number(searchMinRating);
        if (Number.isFinite(minRating) && expert.averageRating < minRating) return false;
      }
      if (searchMinExperience.trim()) {
        const minYears = Number(searchMinExperience);
        if (Number.isFinite(minYears) && expert.yearsExperience < minYears) return false;
      }
      return true;
    });
  }, [allExperts, searchLocation, searchExpertType, searchMinRating, searchMinExperience]);

  const handleCountryChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSearchLocation(event.target.value);
  };

  return (
    <>
      <section className="relative overflow-hidden rounded-[30px] border border-slate-200 bg-white text-slate-900 shadow-sm mb-8 p-8">
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-sky-300/30 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 -bottom-20 h-56 w-56 rounded-full bg-violet-200/40 blur-3xl" />

        <div className="relative max-w-3xl space-y-4">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
            Explore experts
          </span>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-950">
            Find the right financial talent for your next project.
          </h1>
          <p className="max-w-2xl text-slate-500 leading-7">
            Search by country, specialty, rating, and experience in one clean, modern workspace.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Available experts</p>
            <p className="mt-3 text-2xl font-semibold text-slate-900">{allExperts.length}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Best fit</p>
            <p className="mt-3 text-2xl font-semibold text-slate-900">Accountants, CFOs, AR Specialists</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Trusted process</p>
            <p className="mt-3 text-2xl font-semibold text-slate-900">Fast matching, transparent results</p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <section className="rounded-[28px] border border-slate-200 bg-slate-50 p-6 shadow-sm max-h-min">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Refine filters</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-950">Search criteria</h2>
          </div>
          <div className="grid gap-4 ">
            <CountryDropdown value={searchLocation} onChange={handleCountryChange} />
            <select
              value={searchExpertType}
              onChange={(e) => setSearchExpertType(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            >
              <option value="">All expertise</option>
              <option value="ACCOUNTANT">Accountant</option>
              <option value="CFO">CFO</option>
              <option value="AR_REVENUE_SPECIALIST">AR/Revenue Specialist</option>
              <option value="OTHER">Other</option>
            </select>
            <input
              value={searchMinRating}
              onChange={(e) => setSearchMinRating(e.target.value)}
              placeholder="Min rating"
              type="number"
              min="0"
              max="5"
              step="0.1"
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            />
            <input
              value={searchMinExperience}
              onChange={(e) => setSearchMinExperience(e.target.value)}
              placeholder="Min years exp"
              type="number"
              min="0"
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            />
          </div>
        </section>

        <section className="space-y-6">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Search results</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">{filteredExperts.length} experts found</p>
              </div>
              {search.loading ? (
                <span className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-600">Searching…</span>
              ) : null}
            </div>
            <div className="mt-6 grid gap-4">
              {filteredExperts.length ? (
                filteredExperts.map((expert: any) => (
                  <article key={expert.user.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">{expert.user.name}</h3>
                        <p className="text-sm text-slate-500">{expert.title} • {expert.expertType}</p>
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                        {expert.averageRating.toFixed(1)} ★
                      </span>
                    </div>
                    <div className="mt-4 grid gap-2 text-sm text-slate-600">
                      <p>{expert.user.location || "Unknown location"}</p>
                      <p>{expert.yearsExperience} years experience</p>
                      <p>{expert.reviewCount} reviews</p>
                      <p>{expert.bio}</p>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <Link
                        to={`/experts/${expert.user.id}`}
                        className="inline-flex items-center justify-center rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700"
                      >
                        View profile & request quote
                      </Link>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-slate-500">
                  No experts match the current filters. Adjust your criteria to find more talent.
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
