import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { getRole, getToken } from "../auth/session";

export function GuestOnly({ children }: { children: ReactNode }) {
  const token = getToken();
  if (!token) return children;

  const role = getRole();
  return <Navigate to={role === "EXPERT" ? "/profile" : "/"} replace />;
}
