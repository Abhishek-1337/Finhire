import * as Yup from "yup";
import type { Role } from "../types/auth";

export interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
  countryCode: string;
  role: Role;
}

export interface LoginFormValues {
  email: string;
  password: string;
}

export const RegisterSchema: Yup.ObjectSchema<RegisterFormValues> = Yup.object({
  name: Yup.string()
    .min(2, "Name must be at least 2 characters")
    .required("Name is required"),

  email: Yup.string()
    .email("Enter a valid email address")
    .required("Email is required"),

  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .matches(/[A-Z]/, "Must include at least one uppercase letter")
    .matches(/[0-9]/, "Must include at least one number")
    .required("Password is required"),

  countryCode: Yup.string().required("Please select a country"),

  role: Yup.mixed<Role>()
    .oneOf(["BUSINESS", "EXPERT"] as const)
    .required("Role is required"),
});


export const LoginSchema: Yup.ObjectSchema<LoginFormValues> = Yup.object({

  email: Yup.string()
    .email("Enter a valid email address")
    .required("Email is required"),

  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .matches(/[A-Z]/, "Must include at least one uppercase letter")
    .matches(/[0-9]/, "Must include at least one number")
    .required("Password is required"),

});

export type ExpertType = "ACCOUNTANT" | "CFO" | "AR_REVENUE_SPECIALIST" | "OTHER";

export interface ExpertProfileFormValues {
  title: string;
  expertType: ExpertType;
  yearsExperience: string;
  hourlyRate: string;
  bio: string;
}

export const ExpertProfileSchema: Yup.ObjectSchema<ExpertProfileFormValues> = Yup.object({
  title: Yup.string()
    .min(3, "Title must be at least 3 characters")
    .max(80, "Title must be 80 characters or fewer")
    .required("Title is required"),

  expertType: Yup.mixed<ExpertType>()
    .oneOf(["ACCOUNTANT", "CFO", "AR_REVENUE_SPECIALIST", "OTHER"] as const)
    .required("Expert type is required"),

  yearsExperience: Yup.string()
    .matches(/^\d+$/, "Must be a whole number")
    .test("min", "Cannot be negative", (v) => Number(v) >= 0)
    .required("Years of experience is required"),

  hourlyRate: Yup.string()
    .matches(/^\d*\.?\d{0,2}$/, "Enter a valid rate (e.g. 150 or 99.99)")
    .test("min", "Rate must be greater than 0", (v) => !v || Number(v) > 0),

  bio: Yup.string()
    .min(20, "Bio must be at least 20 characters")
    .max(1000, "Bio must be 1000 characters or fewer")
    .required("Bio is required"),
});