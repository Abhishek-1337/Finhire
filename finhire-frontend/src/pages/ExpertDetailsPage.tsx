import { useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@apollo/client/react";

import { getRole } from "../auth/session";
import { EXPERT_PROFILE, REQUEST_QUOTE } from "../graphql/documents";
import { getGraphqlErrorMessage } from "../utils/graphqlErrors";

export function ExpertDetailsPage() {
  const navigate = useNavigate();
  const role = getRole();
  const { expertUserId } = useParams<{ expertUserId: string }>();

  const [quoteProjectDetails, setQuoteProjectDetails] = useState("");
  const [quoteBudget, setQuoteBudget] = useState("");
  const [quoteTimeline, setQuoteTimeline] = useState("");
  const [error, setError] = useState("");

  const { data, loading, error: loadError } = useQuery(EXPERT_PROFILE, {
    variables: { userId: expertUserId },
    skip: !expertUserId,
    fetchPolicy: "cache-and-network",
  });

  const expertProfile = (data as any)?.expertProfile;

  const [requestQuote, { loading: requestingQuote }] = useMutation(REQUEST_QUOTE);

  const handleRequestQuote = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (!expertUserId) return;

    try {
      await requestQuote({
        variables: {
          input: {
            expertUserId,
            projectDetails: quoteProjectDetails,
            budget: quoteBudget ? Number(quoteBudget) : null,
            timeline: quoteTimeline || null,
          },
        },
      });
      navigate("/quotes", { replace: true });
    } catch (err) {
      setError(getGraphqlErrorMessage(err));
    }
  };

  if (!expertUserId) {
    return (
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-slate-600">Expert not found.</p>
        <Link to="/" className="mt-4 inline-block text-sm font-medium text-sky-700 hover:underline">
          Back to search
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Expert profile</p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-950">
              {loading ? "Loading…" : expertProfile?.user?.name ?? "Unknown expert"}
            </h1>
            <p className="text-sm text-slate-500">
              {expertProfile?.title ? expertProfile.title : "—"}{" "}
              {expertProfile?.expertType ? `• ${expertProfile.expertType}` : ""}
            </p>
          </div>
          <Link
            to="/"
            className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Back
          </Link>
        </div>

        {loadError ? (
          <div className="mt-6 rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            Unable to load this profile.
          </div>
        ) : null}

        <div className="mt-6 grid gap-2 text-sm text-slate-700">
          <p>
            <span className="font-medium">Location:</span> {expertProfile?.user?.location || "Unknown"}
          </p>
          <p>
            <span className="font-medium">Experience:</span>{" "}
            {typeof expertProfile?.yearsExperience === "number"
              ? `${expertProfile.yearsExperience} years`
              : "—"}
          </p>
          <p>
            <span className="font-medium">Hourly rate:</span>{" "}
            {expertProfile?.hourlyRate ? `$${expertProfile.hourlyRate}` : "—"}
          </p>
          <p>
            <span className="font-medium">Rating:</span>{" "}
            {typeof expertProfile?.averageRating === "number"
              ? `${expertProfile.averageRating.toFixed(1)} ★`
              : "—"}
            {typeof expertProfile?.reviewCount === "number" ? ` (${expertProfile.reviewCount} reviews)` : ""}
          </p>
        </div>

        {expertProfile?.bio ? (
          <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">About</p>
            <p className="mt-3 text-sm leading-7 text-slate-700">{expertProfile.bio}</p>
          </div>
        ) : null}
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-slate-50 p-6 shadow-sm">
        <div className="mb-5">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Request a quote</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-950">Send project details</h2>
        </div>

        {role !== "BUSINESS" ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-600">
            Only business accounts can request quotes.
          </div>
        ) : (
          <form onSubmit={handleRequestQuote} className="grid gap-4">
            <textarea
              value={quoteProjectDetails}
              onChange={(e) => setQuoteProjectDetails(e.target.value)}
              placeholder="Project details"
              required
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            />
            <input
              value={quoteBudget}
              onChange={(e) => setQuoteBudget(e.target.value)}
              placeholder="Budget"
              type="number"
              min="0"
              step="0.01"
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            />
            <input
              value={quoteTimeline}
              onChange={(e) => setQuoteTimeline(e.target.value)}
              placeholder="Timeline (e.g., 2 weeks)"
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            />
            <button
              type="submit"
              disabled={requestingQuote}
              className="inline-flex items-center justify-center rounded-full bg-sky-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Request quote
            </button>
            {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}
          </form>
        )}
      </section>
    </div>
  );
}

export default ExpertDetailsPage;

