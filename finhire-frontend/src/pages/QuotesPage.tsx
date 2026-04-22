import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery } from "@apollo/client/react";
import { getRole } from "../auth/session";
import { QUOTES_FOR_ME, UPDATE_QUOTE_STATUS, SUBMIT_PROPOSAL, START_ENGAGEMENT } from "../graphql/documents";
import { getGraphqlErrorMessage } from "../utils/graphqlErrors";

export function QuotesPage() {
  const role = getRole();

  const [proposalPrice, setProposalPrice] = useState("");
  const [proposalTimeline, setProposalTimeline] = useState("");
  const [proposalMessage, setProposalMessage] = useState("");
  const [error, setError] = useState("");

  const quotes = useQuery(QUOTES_FOR_ME, { fetchPolicy: "cache-and-network" });
  const [updateQuoteStatus, { loading: updatingStatus }] = useMutation(UPDATE_QUOTE_STATUS);
  const [submitProposal, { loading: submittingProposal }] = useMutation(SUBMIT_PROPOSAL);
  const [startEngagement, { loading: startingEngagement }] = useMutation(START_ENGAGEMENT);

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
  console.log(quoteItems);

  return (
    <>
      <section className="relative overflow-hidden rounded-[30px] border border-slate-200 bg-white text-slate-900 shadow-sm mb-8 p-8">
        <div className="pointer-events-none absolute -left-16 -top-16 h-72 w-72 rounded-full bg-sky-300/30 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 -bottom-16 h-56 w-56 rounded-full bg-slate-200/70 blur-3xl" />

	        <div className="relative max-w-3xl space-y-4">
	          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Quotes</span>
	          <h1 className="text-4xl font-semibold tracking-tight text-slate-950">Track your quote requests and proposals.</h1>
	          <p className="max-w-2xl text-slate-500 leading-7">
	            Request quotes from an expert’s profile, then manage all activity here.
	          </p>
	        </div>
	      </section>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
	        <section className="rounded-[28px] border border-slate-200 bg-slate-50 p-6 shadow-sm">
	          <div className="mb-5">
	            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Request a quote</p>
	            <h2 className="mt-2 text-xl font-semibold text-slate-950">Start from search</h2>
	          </div>

	          {role === "BUSINESS" ? (
	            <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-600 space-y-3">
	              <p>Open an expert profile from search to request a quote.</p>
	              <Link
	                to="/"
	                className="inline-flex items-center justify-center rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700"
	              >
	                Go to search
	              </Link>
	            </div>
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
                        {role === "BUSINESS" ? (
                          <>
                            Expert:{" "}
                            <Link to={`/experts/${quote.expertUserId}`} className="font-medium text-sky-700 hover:underline">
                              {quote.expertUser?.name ?? quote.expertUserId}
                            </Link>
                          </>
                        ) : (
                          <>
                            Client:{" "}
                            <span className="font-medium text-slate-700">
                              {quote.businessUser?.name ?? quote.businessUserId}
                            </span>
                            {quote.businessUser?.email ? (
                              <span className="text-slate-400"> • {quote.businessUser.email}</span>
                            ) : null}
                          </>
                        )}
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
