import { PrismaClient } from "@prisma/client";
import { verifyToken, type AuthPayload } from "../utils/auth";

const prisma = new PrismaClient();

export type GraphQLContext = {
  db: typeof prisma;
  auth: AuthPayload | null;
};

export const createContext = ({
  req,
}: {
  req: { headers: Record<string, string | string[] | undefined> };
}): GraphQLContext => {
  const header = req.headers.authorization;
  const token = typeof header === "string" ? header.replace("Bearer ", "") : "";

  return {
    db: prisma,
    auth: token ? verifyToken(token) : null,
  };
};
