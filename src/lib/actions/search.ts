"use server";

import { getSearchSuggestions } from "@/lib/data/products";

export async function fetchSearchSuggestions(query: string) {
  return getSearchSuggestions(query);
}
