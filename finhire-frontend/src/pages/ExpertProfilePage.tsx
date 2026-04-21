import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery } from "@apollo/client/react";
import { useFormik } from "formik";

import { getRole } from "../auth/session";
import { EXPERT_PROFILE, ME, UPSERT_EXPERT_PROFILE } from "../graphql/documents";
import { getGraphqlErrorMessage } from "../utils/graphqlErrors";

import { Card, CardContent } from "../components/ui/Card";
import { FormField } from "../components/ui/FormField";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Button } from "../components/ui/Button";
import { Alert } from "../components/ui/Alert";
import { Spinner } from "../components/ui/Spinner";
import { ExpertProfileSchema, type ExpertProfileFormValues } from "../utils/validation";
import { Textarea } from "../components/ui/Textarea";

// ─── Expert type options ──────────────────────────────────────────────────────

const EXPERT_TYPES = [
  { value: "ACCOUNTANT", label: "Accountant" },
  { value: "CFO", label: "CFO" },
  { value: "AR_REVENUE_SPECIALIST", label: "AR / Revenue Specialist" },
  { value: "OTHER", label: "Other" },
] as const;

// ─── Stats shown in the hero panel ───────────────────────────────────────────

const STATS = [
  { value: "3,200+", label: "Experts listed" },
  { value: "840+", label: "Businesses hiring" },
  { value: "4.9★", label: "Average rating" },
] as const;

// ─── Hero panel (left side) ───────────────────────────────────────────────────

function HeroPanel() {
  return (
    <div className="hidden lg:flex flex-1 flex-col justify-between bg-white text-slate-900 p-12 rounded-3xl shadow-sm relative overflow-hidden">
      {/* Grid texture */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(15,23,42,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.08) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      {/* Glow orbs */}
      <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-sky-300 opacity-40 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-violet-200 opacity-40 blur-3xl pointer-events-none" />

      {/* Brand */}
      <div className="relative flex items-center gap-2 text-sm font-semibold tracking-widest uppercase text-slate-500">
        <span className="h-px w-8 bg-slate-200" />
        FinHire
      </div>

      {/* Headline */}
      <div className="relative space-y-4">
        <p className="text-4xl font-bold leading-tight tracking-tight">
          Get discovered by
          <br />
          <span className="text-transparent bg-clip-text bg-linear-to-r from-sky-600 to-violet-500">
            businesses that need you.
          </span>
        </p>
        <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
          Build your expert profile once and let FinHire surface you to the right clients — automatically.
        </p>
      </div>

      {/* Stats */}
      <div className="relative grid grid-cols-3 gap-4">
        {STATS.map(({ value, label }) => (
          <div key={label} className="space-y-0.5">
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            <p className="text-xs text-slate-500 leading-snug">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Success banner ───────────────────────────────────────────────────────────

function SuccessBanner({ message }: { message: string }) {
  return (
    <div
      role="status"
      className="flex items-center gap-2 rounded-lg border border-green-500/40 bg-green-500/10 px-4 py-3 text-sm text-green-600"
    >
      <svg className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
          clipRule="evenodd"
        />
      </svg>
      {message}
    </div>
  );
}

// ─── Wrong role guard ─────────────────────────────────────────────────────────

function WrongRoleBanner() {
  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
        <svg className="h-6 w-6 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <p className="text-sm text-muted-foreground">
        This page is for expert accounts only.
        <br />
        You are currently signed in as a{" "}
        <span className="font-medium text-foreground">business user</span>.
      </p>
      <Link to="/" className="text-sm font-medium text-violet-600 hover:underline underline-offset-4">
        Back to search
      </Link>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function ExpertProfilePage() {
  const role = getRole();
  const [serverMessage, setServerMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const { data: meData, loading: meLoading } = useQuery<{ me: { id: string } }>(ME, {
    fetchPolicy: "cache-and-network",
  });

  const userId = meData?.me?.id;

  const {
    data: profileData,
    loading: profileLoading,
    refetch: refetchProfile,
  } = useQuery<{ expertProfile: any }>(EXPERT_PROFILE, {
    variables: { userId },
    skip: !userId,
    fetchPolicy: "cache-and-network",
  });

  const profile = profileData?.expertProfile;
  const [isEditMode, setIsEditMode] = useState(true);

  useEffect(() => {
    if (profile) {
      setIsEditMode(false);
    } else if (userId) {
      setIsEditMode(true);
    }
  }, [profile, userId]);

  const [upsertExpertProfile] = useMutation(UPSERT_EXPERT_PROFILE);

  const formik = useFormik<ExpertProfileFormValues>({
    enableReinitialize: true,
    initialValues: {
      title: profile?.title ?? "",
      expertType: profile?.expertType ?? "ACCOUNTANT",
      yearsExperience: profile?.yearsExperience?.toString() ?? "0",
      hourlyRate: profile?.hourlyRate?.toString() ?? "",
      bio: profile?.bio ?? "",
    },
    validationSchema: ExpertProfileSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setServerMessage(null);
      try {
        await upsertExpertProfile({
          variables: {
            input: {
              title: values.title,
              expertType: values.expertType,
              yearsExperience: Number(values.yearsExperience),
              hourlyRate: values.hourlyRate ? Number(values.hourlyRate) : null,
              bio: values.bio,
            },
          },
        });
        setServerMessage({ type: "success", text: "Profile saved successfully." });
        setIsEditMode(false);
        await refetchProfile?.();
      } catch (error) {
        setServerMessage({ type: "error", text: getGraphqlErrorMessage(error) });
      } finally {
        setSubmitting(false);
      }
    },
  });

  const { values, errors, touched, handleChange, handleBlur, isSubmitting } = formik;

  return (
    <div className="flex min-h-screen w-full -m-10">
      <HeroPanel />

      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md space-y-6">

          {/* Mobile brand */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="h-7 w-7 rounded-lg bg-sky-600" />
            <span className="text-sm font-semibold">FinHire</span>
          </div>

          {/* Header */}
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">Expert Profile</h1>
            <p className="text-sm text-muted-foreground">
              Businesses find you through search.{" "}
            </p>
          </div>

          {/* Role guard or profile panel */}
          {role && role !== "EXPERT" ? (
            <Card>
              <CardContent className="pt-6">
                <WrongRoleBanner />
              </CardContent>
            </Card>
          ) : (
            <>
              {(meLoading || profileLoading) && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-center py-20 text-slate-500">Loading profile…</div>
                  </CardContent>
                </Card>
              )}

              {!meLoading && !profileLoading && profile && !isEditMode ? (
                <Card className="shadow-sm">
                  <CardContent className="pt-6 space-y-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-400">
                          Expert profile
                        </p>
                        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                          {profile.title}
                        </h2>
                        <p className="mt-2 text-sm text-slate-600">
                          {profile.expertType.replaceAll("_", " ")} • {profile.yearsExperience} years experience
                        </p>
                      </div>
                      <Button type="button" onClick={() => setIsEditMode(true)} className="self-start">
                        Edit profile
                      </Button>
                    </div>

	                    <div className="grid gap-4">
	                      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
	                        <p className="text-sm text-slate-500">Bio</p>
	                        <p className="mt-3 text-sm leading-7 text-slate-700">{profile.bio}</p>
	                      </div>
	                      <div className="grid gap-4 sm:grid-cols-2">
	                        <div className="rounded-3xl border border-slate-200 bg-white p-5">
	                          <p className="text-sm text-slate-500">Hourly rate</p>
	                          <p className="mt-2 text-lg font-semibold text-slate-900">
	                            {profile.hourlyRate ? `$${profile.hourlyRate}/hr` : "Not set"}
	                          </p>
	                        </div>
	                        <div className="rounded-3xl border border-slate-200 bg-white p-5">
	                          <p className="text-sm text-slate-500">Rating</p>
	                          <p className="mt-2 text-lg font-semibold text-slate-900">
	                            {profile.averageRating.toFixed(1)} ★
	                          </p>
	                          <p className="text-sm text-slate-500">{profile.reviewCount} review{profile.reviewCount === 1 ? "" : "s"}</p>
	                        </div>
	                      </div>

	                      <div className="rounded-3xl border border-slate-200 bg-white p-5">
	                        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Reviews</p>
	                        {profile.reviews?.length ? (
	                          <div className="mt-4 grid gap-3">
	                            {profile.reviews.map((review: any) => (
	                              <div key={review.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
	                                <div className="flex flex-wrap items-center justify-between gap-2">
	                                  <p className="text-sm font-semibold text-slate-900">
	                                    {review.businessUser?.name ?? "Business"}
	                                  </p>
	                                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
	                                    {review.rating}/5 • {new Date(review.createdAt).toLocaleDateString()}
	                                  </p>
	                                </div>
	                                {review.comment ? (
	                                  <p className="mt-2 text-sm text-slate-700 leading-6">{review.comment}</p>
	                                ) : (
	                                  <p className="mt-2 text-sm text-slate-500">No comment</p>
	                                )}
	                              </div>
	                            ))}
	                          </div>
	                        ) : (
	                          <p className="mt-3 text-sm text-slate-500">No reviews yet.</p>
	                        )}
	                      </div>
	                    </div>
	                  </CardContent>
	                </Card>
	              ) : (
                <Card className="shadow-sm">
                  <CardContent className="pt-6">
                    <form onSubmit={formik.handleSubmit} noValidate className="space-y-5">

                      {/* Title */}
                      <FormField label="Professional title" id="title" error={errors.title} touched={touched.title}>
                        <Input
                          id="title"
                          name="title"
                          placeholder="e.g. Fractional CFO"
                          value={values.title}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={!!(touched.title && errors.title)}
                        />
                      </FormField>

                      {/* Expert type */}
                      <FormField label="Expert type" id="expertType" error={errors.expertType} touched={touched.expertType}>
                        <Select
                          id="expertType"
                          name="expertType"
                          value={values.expertType}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={!!(touched.expertType && errors.expertType)}
                        >
                          {EXPERT_TYPES.map(({ value, label }) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </Select>
                      </FormField>

                      {/* Years + Rate */}
                      <div className="grid grid-cols-2 gap-4">
                        <FormField label="Years of experience" id="yearsExperience" error={errors.yearsExperience} touched={touched.yearsExperience}>
                          <Input
                            id="yearsExperience"
                            name="yearsExperience"
                            type="number"
                            min="0"
                            placeholder="0"
                            value={values.yearsExperience}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={!!(touched.yearsExperience && errors.yearsExperience)}
                          />
                        </FormField>

                        <FormField label="Hourly rate (optional)" id="hourlyRate" error={errors.hourlyRate} touched={touched.hourlyRate}>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none select-none">
                              $
                            </span>
                            <Input
                              id="hourlyRate"
                              name="hourlyRate"
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="150.00"
                              value={values.hourlyRate}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              error={!!(touched.hourlyRate && errors.hourlyRate)}
                              className="pl-7"
                            />
                          </div>
                        </FormField>
                      </div>

                      {/* Bio */}
                      <FormField label="Short bio" id="bio" error={errors.bio} touched={touched.bio}>
                        <Textarea
                          id="bio"
                          name="bio"
                          placeholder="Describe your background, specialisms, and what you can offer clients…"
                          value={values.bio}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={!!(touched.bio && errors.bio)}
                        />
                        <p className="text-xs text-muted-foreground text-right">
                          {values.bio.length} / 1000
                        </p>
                      </FormField>

                      {/* Feedback */}
                      {serverMessage?.type === "error" && <Alert message={serverMessage.text} />}
                      {serverMessage?.type === "success" && <SuccessBanner message={serverMessage.text} />}

                      {/* Submit */}
                      <Button type="submit" disabled={isSubmitting} className="w-full font-semibold">
                        {isSubmitting && <Spinner className="mr-2" />}
                        {isSubmitting ? "Saving…" : "Save expert profile"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          <p className="text-center text-xs text-muted-foreground">
            Your profile is visible to verified businesses on FinHire.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ExpertProfilePage;
