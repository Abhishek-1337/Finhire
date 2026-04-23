import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { getRole } from "../auth/session";
import { ENGAGEMENTS_FOR_ME, COMPLETE_ENGAGEMENT, ADD_REVIEW } from "../graphql/documents";
import { getGraphqlErrorMessage } from "../utils/graphqlErrors";
import { Link } from "react-router-dom";
import Review from "../components/ui/Review";

export function EngagementsPage() {
  const role = getRole();
  const [reviewRating, setReviewRating] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewingEngagementId, setReviewingEngagementId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const engagements = useQuery(ENGAGEMENTS_FOR_ME, { fetchPolicy: "cache-and-network" });
  const [completeEngagement, { loading: completing }] = useMutation(COMPLETE_ENGAGEMENT);
  const [addReview, { loading: reviewing }] = useMutation(ADD_REVIEW);

  const handleCompleteEngagement = async (engagementId: string) => {
    setError("");
    try {
      await completeEngagement({
        variables: { engagementId },
        refetchQueries: [{ query: ENGAGEMENTS_FOR_ME }],
      });
    } catch (err) {
      setError(getGraphqlErrorMessage(err));
    }
  };

  const handleAddReview = async (engagementId: string) => {
    setError("");
    try {
      await addReview({
        variables: {
          input: {
            engagementId,
            rating: Number(reviewRating),
            comment: reviewComment,
          },
        },
        refetchQueries: [{ query: ENGAGEMENTS_FOR_ME }],
      });
      setReviewRating("");
      setReviewComment("");
      setReviewingEngagementId(null);
    } catch (err) {
      setError(getGraphqlErrorMessage(err));
    }
  };

  const handleReviewChange = (rating: number) => {  
    setReviewRating(String(rating));
  };

  const engagementItems = (engagements.data as any)?.engagementsForMe ?? [];

  return (
    <>
      <section className="relative overflow-hidden rounded-[30px] border border-slate-200 bg-white text-slate-900 shadow-sm mb-8 p-8">
        <div className="pointer-events-none absolute -left-16 -top-16 h-72 w-72 rounded-full bg-sky-300/30 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 -bottom-16 h-56 w-56 rounded-full bg-slate-200/70 blur-3xl" />

        <div className="relative max-w-3xl space-y-4">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Engagements</span>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-950">Manage your active projects.</h1>
          <p className="max-w-2xl text-slate-500 leading-7">
            Track ongoing engagements, complete projects, and leave reviews for completed work.
          </p>
        </div>
      </section>

      <div className="grid gap-6">
        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Your engagements</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-950">Project status</h2>
          </div>

          {engagements.loading ? <p className="text-slate-500">Loading engagements…</p> : null}
          <div className="grid gap-4">
            {engagementItems.length ? (
              engagementItems.map((engagement: any) => (
                <article key={engagement.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-slate-900">Status: {engagement.status}</p>
                      <p className="text-sm text-slate-500">
                        {
                        role === "BUSINESS"
                          ? (
                            <>
                              Expert ID:{" "}
                              <Link to={`/experts/${engagement.expertUserId}`} className="font-medium text-sky-700 hover:underline">
                               {engagement.expertUser?.name}
                              </Link>
                            </>
                            )
                          : (
                              <>
                                Client ID: {" "}
                                <Link to={`/experts/${engagement.expertUserId}`} className="font-medium text-sky-700 hover:underline">
                                  {engagement.expertUser?.name}
                                </Link>
                              </>
                            )
                        }

                      </p>
                      <p className="text-sm text-slate-500">Started: {new Date(engagement.startedAt).toLocaleDateString()}</p>
                      {engagement.completedAt && (
                        <p className="text-sm text-slate-500">Completed: {new Date(engagement.completedAt).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                  {engagement.review && (
                    <div className="mt-3 rounded-lg bg-blue-50 p-3">
                      <p className="text-sm font-semibold text-blue-800">Review Given</p>
                      <p className="text-sm text-blue-700">Rating: {engagement.review.rating}/5</p>
                      {engagement.review.comment && <p className="text-sm text-blue-700">Comment: {engagement.review.comment}</p>}
                    </div>
                  )}
                  {role === "BUSINESS" && engagement.status === "ACTIVE" ? (
                    <div className="mt-4">
                      <button
                        type="button"
                        disabled={completing}
                        onClick={() => handleCompleteEngagement(engagement.id)}
                        className="rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Mark as Completed
                      </button>
                    </div>
                  ) : null}
                  {role === "BUSINESS" && engagement.status === "COMPLETED" && !engagement.review ? (
                    <div className="mt-4 space-y-3">
                      <div className="flex gap-4">
                          <p className="text-sm font-semibold text-slate-900">Leave a Review</p>
                          <Review
                            value={Number(reviewRating)}
                            onChange={handleReviewChange}
                          />
                      </div>
                      <div className="grid gap-2">
                        
                        <textarea
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder="Comment"
                          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                        />
                        <button
                          type="button"
                          disabled={reviewing || !reviewRating}
                          onClick={() => handleAddReview(engagement.id)}
                          className="rounded-full bg-yellow-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-yellow-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Submit Review
                        </button>
                      </div>
                    </div>
                  ) : null}
                </article>
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-slate-500">
                No engagements yet.
              </div>
            )}
          </div>
          {error ? <p className="mt-4 text-sm font-medium text-rose-600">{error}</p> : null}
        </section>
      </div>
    </>
  );
}