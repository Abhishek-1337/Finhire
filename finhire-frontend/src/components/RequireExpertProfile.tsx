import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useQuery } from "@apollo/client/react";

import { getRole } from "../auth/session";
import { EXPERT_PROFILE, ME } from "../graphql/documents";

export function RequireExpertProfile({ children }: { children: ReactNode }) {
  const location = useLocation();
  const role = getRole();
  const isExpert = role === "EXPERT";

  const { data: meData, loading: meLoading, error: meError } = useQuery<{
    me: { id: string };
  }>(ME, { fetchPolicy: "cache-first", skip: !isExpert });

  const userId = meData?.me?.id;

  const {
    data: profileData,
    loading: profileLoading,
    error: profileError,
  } = useQuery<{ expertProfile: unknown }>(EXPERT_PROFILE, {
    variables: { userId },
    skip: !isExpert || !userId,
    fetchPolicy: "cache-first",
  });

  // Only experts are gated by having an expert profile.
  if (!isExpert) return children;

  if (meLoading || profileLoading) {
    return <div className="px-6 py-10 text-slate-500">Loading…</div>;
  }

  if (meError || profileError) {
    return <div className="px-6 py-10 text-slate-500">Unable to load profile.</div>;
  }

  const hasProfile = !!profileData?.expertProfile;
  if (!hasProfile) {
    return <Navigate to="/profile" replace state={{ from: location.pathname }} />;
  }

  return children;
}
