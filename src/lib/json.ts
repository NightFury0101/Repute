export function toJsonArray(arr: string[] | undefined | null): string | null {
  if (!arr || arr.length === 0) return null;
  return JSON.stringify(arr);
}

export function fromJsonArray(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : [];
  } catch {
    return [];
  }
}
