import * as React from "react";
import { Label } from "./Label";

export interface FormFieldProps {
  label: string;
  id: string;
  error?: string;
  touched?: boolean;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({ label, id, error, touched, children }) => (
  <div className="flex flex-col gap-1.5">
    <Label htmlFor={id}>{label}</Label>
    {children}
    {touched && error && (
      <p className="text-xs text-destructive text-red-700" role="alert">
        {error}
      </p>
    )}
  </div>
);