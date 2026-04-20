import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { env } from "../config/env";

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
};

export const comparePassword = async (
  password: string,
  passwordHash: string,
): Promise<boolean> => {
  return bcrypt.compare(password, passwordHash);
};

export type AuthPayload = {
  userId: string;
  role: "BUSINESS" | "EXPERT";
};

export const signToken = (payload: AuthPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: "7d" });
};

export const verifyToken = (token: string): AuthPayload | null => {
  try {
    return jwt.verify(token, env.JWT_SECRET) as AuthPayload;
  } catch {
    return null;
  }
};
