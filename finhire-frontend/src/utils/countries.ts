import { getNames, getCode } from "country-list";

export interface Country {
  code: string;
  name: string;
}

export const countries: Country[] = getNames()
  .map((name) => ({
    name,
    code: getCode(name) || "",
  }))
  .filter((c) => c.code) // remove invalid
  .sort((a, b) => a.name.localeCompare(b.name));