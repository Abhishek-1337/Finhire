import { useState, useEffect, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery } from "@apollo/client/react";
import { getRole } from "../auth/session";
import { ADD_REVIEW, SEARCH_EXPERTS } from "../graphql/documents";
import { getGraphqlErrorMessage } from "../utils/graphqlErrors";

export function ReviewsPage() {
  const role = getRole();

  const [reviewExpertUserId, setReviewExpertUserId] = useState("");
  const [reviewRating, setReviewRating] = useState("5");
  const [reviewComment, setReviewComment] = useState("");
  const [message, setMessage] = useState("");

  const { data: expertsData, loading: expertsLoading } = useQuery(SEARCH_EXPERTS, {
    fetchPolicy: "cache-and-network",
  });

  const expertOptions = (expertsData as any)?.searchExperts ?? [];

  useEffect(() => {
    if (!reviewExpertUserId && expertOptions.length > 0) {
      setReviewExpertUserId(expertOptions[0].user.id);
    }
  }, [expertOptions, reviewExpertUserId]);

  const [addReview, { loading }] = useMutation(ADD_REVIEW);

  const handleAddReview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    try {
      await addReview({
        variables: {
          input: {
            expertUserId: reviewExpertUserId,
            rating: Number(reviewRating),
            comment: reviewComment,
          },
        },
      });
      setMessage("Review submitted.");
    } catch (error) {
      setMessage(getGraphqlErrorMessage(error));
    }
  };

  return (
    <>
      <section className="relative overflow-hidden rounded-[30px] border border-slate-200 bg-white text-slate-900 shadow-sm mb-8 p-8">
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-sky-300/30 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 -bottom-16 h-56 w-56 rounded-full bg-violet-200/40 blur-3xl" />

        <div className="relative max-w-3xl space-y-4">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Reviews</span>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-950">Leave expert feedback with confidence.</h1>
          <p className="max-w-2xl text-slate-500 leading-7">
            Business users can submit review details and comments in a clean, modern review form.
          </p>
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-slate-50 p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Submit feedback</p>
            <h2 className="text-xl font-semibold text-slate-950">Business reviews</h2>
          </div>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-sky-300 hover:text-slate-900"
          >
            Back to search
          </Link>
        </div>

        {role && role !== "BUSINESS" ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-600">
            Reviews can only be submitted by business accounts.
          </div>
        ) : (
          <form onSubmit={handleAddReview} className="grid gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Expert</label>
              <select
                value={reviewExpertUserId}
                onChange={(e) => setReviewExpertUserId(e.target.value)}
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
                  <option value="">No experts available</option>
                )}
              </select>
            </div>
            <input
              value={reviewRating}
              onChange={(e) => setReviewRating(e.target.value)}
              type="number"
              min="1"
              max="5"
              required
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            />
            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Comment"
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            />
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center rounded-full bg-sky-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Submit review
            </button>
            {message ? (
              <p className={`text-sm font-medium ${message === "Review submitted." ? "text-emerald-600" : "text-rose-600"}`}>
                {message}
              </p>
            ) : null}
          </form>
        )}
      </section>
    </>
  );
}
