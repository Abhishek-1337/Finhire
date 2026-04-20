export type Role = "BUSINESS" | "EXPERT";

const TOKEN_KEY = "token";
const ROLE_KEY = "userRole";

export const getToken = () => localStorage.getItem(TOKEN_KEY) ?? "";

export const getRole = (): Role | null => {
  const role = localStorage.getItem(ROLE_KEY);
  if (role === "BUSINESS" || role === "EXPERT") return role;
  return null;
};

export const setSession = (token: string, role: Role) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(ROLE_KEY, role);
};

export const getSession = () => {
  return {
    token: getToken(),
    role: getRole()
  };
};

export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
};
