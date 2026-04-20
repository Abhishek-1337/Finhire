import * as React from "react";
import type { Role } from "../../types/auth";
import { cn } from "../../utils/twMerge";

export interface RoleToggleProps {
  value: Role;
  onChange: (role: Role) => void;
}

const ROLES: { value: Role; label: string }[] = [
  { value: "BUSINESS", label: "Business" },
  { value: "EXPERT", label: "Personal" },
];

export const RoleToggle: React.FC<RoleToggleProps> = ({ value, onChange }) => (
  <div className="flex rounded-lg border bg-muted p-1 gap-1">
    {ROLES.map((role) => (
      <button
        key={role.value}
        type="button"
        onClick={() => onChange(role.value)}
        className={cn(
          "flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
          value === role.value
            ? "bg-[#0f766e] shadow text-white"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        {role.label}
      </button>
    ))}
  </div>
);