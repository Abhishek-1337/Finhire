import * as React from "react";
import { countries } from "../../../utils/countries";
import { Select } from "../Select";

export interface CountryDropdownProps {
  value: string;
  onChange: React.ChangeEventHandler<HTMLSelectElement>;
  onBlur?: React.FocusEventHandler<HTMLSelectElement>;
  error?: boolean;
}

export const CountryDropdown: React.FC<CountryDropdownProps> = ({
  value,
  onChange,
  onBlur,
  error,
}) => (
  <Select
    id="countryCode"
    name="countryCode"
    value={value}
    onChange={onChange}
    onBlur={onBlur}
    error={error}
  >
    <option value="">Select a country…</option>
    {countries.map((c) => (
      <option key={c.code} value={c.code}>
        {c.name}
      </option>
    ))}
  </Select>
);