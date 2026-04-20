import { useState, useEffect, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery } from "@apollo/client/react";
import { getRole } from "../auth/session";
import { QUOTES_FOR_ME, REQUEST_QUOTE, SEARCH_EXPERTS, UPDATE_QUOTE_STATUS, SUBMIT_PROPOSAL, START_ENGAGEMENT } from "../graphql/documents";
import { getGraphqlErrorMessage } from "../utils/graphqlErrors";

export function QuotesPage() {
  const role = getRole();

  const [quoteExpertUserId, setQuoteExpertUserId] = useState("");
  const [quoteProjectDetails, setQuoteProjectDetails] = useState("");
  const [quoteBudget, setQuoteBudget] = useState("");
  const [quoteTimeline, setQuoteTimeline] = useState("");
  const [proposalPrice, setProposalPrice] = useState("");
  const [proposalTimeline, setProposalTimeline] = useState("");
  const [proposalMessage, setProposalMessage] = useState("");
  const [submittingQuoteId, setSubmittingQuoteId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const quotes = useQuery(QUOTES_FOR_ME, { fetchPolicy: "cache-and-network" });
  const { data: expertsData, loading: expertsLoading } = useQuery(SEARCH_EXPERTS, {
    fetchPolicy: "cache-and-network",
  });
  const expertOptions = (expertsData as any)?.searchExperts ?? [];

  useEffect(() => {
    if (!quoteExpertUserId && expertOptions.length > 0) {
      setQuoteExpertUserId(expertOptions[0].user.id);
    }
  }, [expertOptions, quoteExpertUserId]);

  const [requestQuote, { loading }] = useMutation(REQUEST_QUOTE);
  const [updateQuoteStatus, { loading: updatingStatus }] = useMutation(UPDATE_QUOTE_STATUS);
  const [submitProposal, { loading: submittingProposal }] = useMutation(SUBMIT_PROPOSAL);
  const [startEngagement, { loading: startingEngagement }] = useMutation(START_ENGAGEMENT);

  const handleRequestQuote = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    try {
      await requestQuote({
        variables: {
          input: {
            expertUserId: quoteExpertUserId,
            projectDetails: quoteProjectDetails,
            budget: quoteBudget ? Number(quoteBudget) : null,
            timeline: quoteTimeline || null,
          },
        },
      });
      await quotes.refetch();
      setQuoteProjectDetails("");
      setQuoteBudget("");
      setQuoteTimeline("");
    } catch (err) {
      setError(getGraphqlErrorMessage(err));
    }
  };

  const handleUpdateQuoteStatus = async (quoteRequestId: string, status: "ACCEPTED" | "DECLINED") => {
    setError("");
    try {
      await updateQuoteStatus({
        variables: {
          quoteRequestId,
          status,
        },
      });
      await quotes.refetch();
    } catch (err) {
      setError(getGraphqlErrorMessage(err));
    }
  };

  const handleSubmitProposal = async (quoteRequestId: string) => {
    setError("");
    try {
      await submitProposal({
        variables: {
          input: {
            quoteRequestId,
            price: Number(proposalPrice),
            timeline: proposalTimeline,
            message: proposalMessage,
          },
        },
      });
      await quotes.refetch();
      setProposalPrice("");
      setProposalTimeline("");
      setProposalMessage("");
      setSubmittingQuoteId(null);
    } catch (err) {
      setError(getGraphqlErrorMessage(err));
    }
  };

  const handleStartEngagement = async (proposalId: string) => {
    setError("");
    try {
      await startEngagement({
        variables: {
          input: {
            proposalId,
          },
        },
      });
      await quotes.refetch();
    } catch (err) {
      setError(getGraphqlErrorMessage(err));
    }
  };

  const quoteItems = (quotes.data as any)?.quotesForMe ?? [];

  return (
    <>
      <section className="relative overflow-hidden rounded-[30px] border border-slate-200 bg-white text-slate-900 shadow-sm mb-8 p-8">
        <div className="pointer-events-none absolute -left-16 -top-16 h-72 w-72 rounded-full bg-sky-300/30 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 -bottom-16 h-56 w-56 rounded-full bg-slate-200/70 blur-3xl" />

        <div className="relative max-w-3xl space-y-4">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Quotes</span>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-950">Manage incoming requests and send new quotes.</h1>
          <p className="max-w-2xl text-slate-500 leading-7">
            Businesses can request a quote from experts, and experts can review all proposals in one polished view.
          </p>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <section className="rounded-[28px] border border-slate-200 bg-slate-50 p-6 shadow-sm">
          <div className="mb-5">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Request a quote</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-950">Create a new request</h2>
          </div>

          {role === "BUSINESS" ? (
            <form onSubmit={handleRequestQuote} className="grid gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Expert</label>
                <select
                  value={quoteExpertUserId}
                  onChange={(e) => setQuoteExpertUserId(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                >
                  {expertsLoading ? (
                    <option>Loading experts…</option>
                  ) : expertOptions.length ? (
                    expertOptions.map((expert: any) => (
                      <option key={expert.user.id} value={expert.user.id}>
                        {expert.user.name} — {expert.title}
                      </option>
                    ))
                  ) : (
                    <option value="">No experts found</option>
                  )}
                </select>
              </div>
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
                disabled={loading || !quoteExpertUserId}
                className="inline-flex items-center justify-center rounded-full bg-sky-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Request quote
              </button>
              {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}
            </form>
          ) : (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-600">
              Experts can review incoming quote requests below.
            </div>
          )}
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Your quotes</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-950">Recent activity</h2>
          </div>
          {quotes.loading ? <p className="text-slate-500">Loading quotes…</p> : null}
          <div className="grid gap-4">
            {quoteItems.length ? (
              quoteItems.map((quote: any) => (
                <article key={quote.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-slate-900">Status: {quote.status}</p>
                      <p className="text-sm text-slate-500">
                        {role === "BUSINESS"
                          ? `Expert ID: ${quote.expertUserId}`
                          : `Client ID: ${quote.businessUserId}`}
                      </p>
                      {quote.timeline && <p className="text-sm text-slate-500">Timeline: {quote.timeline}</p>}
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                      {quote.budget ? `$${quote.budget}` : "No budget"}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-slate-600">{quote.projectDetails}</p>
                  {quote.proposal && (
                    <div className="mt-3 rounded-lg bg-green-50 p-3">
                      <p className="text-sm font-semibold text-green-800">Proposal Received</p>
                      <p className="text-sm text-green-700">Price: ${quote.proposal.price}</p>
                      <p className="text-sm text-green-700">Timeline: {quote.proposal.timeline}</p>
                      {quote.proposal.message && <p className="text-sm text-green-700">Message: {quote.proposal.message}</p>}
                    </div>
                  )}
                  {role === "EXPERT" && quote.status === "PENDING" ? (
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        type="button"
                        disabled={updatingStatus}
                        onClick={() => handleUpdateQuoteStatus(quote.id, "ACCEPTED")}
                        className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        disabled={updatingStatus}
                        onClick={() => handleUpdateQuoteStatus(quote.id, "DECLINED")}
                        className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Decline
                      </button>
                    </div>
                  ) : null}
                  {role === "EXPERT" && quote.status === "ACCEPTED" && !quote.proposal ? (
                    <div className="mt-4 space-y-3">
                      <p className="text-sm font-semibold text-slate-900">Submit Proposal</p>
                      <div className="grid gap-2">
                        <input
                          value={proposalPrice}
                          onChange={(e) => setProposalPrice(e.target.value)}
                          placeholder="Price"
                          type="number"
                          min="0"
                          step="0.01"
                          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                        />
                        <input
                          value={proposalTimeline}
                          onChange={(e) => setProposalTimeline(e.target.value)}
                          placeholder="Timeline"
                          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                        />
                        <textarea
                          value={proposalMessage}
                          onChange={(e) => setProposalMessage(e.target.value)}
                          placeholder="Message"
                          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                        />
                        <button
                          type="button"
                          disabled={submittingProposal || !proposalPrice || !proposalTimeline}
                          onClick={() => handleSubmitProposal(quote.id)}
                          className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Submit Proposal
                        </button>
                      </div>
                    </div>
                  ) : null}
                  {role === "BUSINESS" && quote.proposal ? (
                    <div className="mt-4">
                      <button
                        type="button"
                        disabled={startingEngagement}
                        onClick={() => handleStartEngagement(quote.proposal.id)}
                        className="rounded-full bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Start Engagement
                      </button>
                    </div>
                  ) : null}
                </article>
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-slate-500">
                No quotes have been created yet.
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
