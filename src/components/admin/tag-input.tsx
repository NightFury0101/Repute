"use client";

import { useState } from "react";
import { X } from "lucide-react";

export function TagInput({
  values,
  onChange,
  placeholder = "Type and press Enter",
}: {
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");

  function commit() {
    const trimmed = draft.trim();
    if (trimmed && !values.includes(trimmed)) {
      onChange([...values, trimmed]);
    }
    setDraft("");
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-line px-3 py-2 min-h-12 focus-within:border-rose-gold">
      {values.map((v) => (
        <span key={v} className="flex items-center gap-1.5 rounded-full bg-ivory px-3 py-1 text-xs text-ink">
          {v}
          <button type="button" onClick={() => onChange(values.filter((x) => x !== v))} className="cursor-pointer text-ink-mute hover:text-ink">
            <X size={11} />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            commit();
          } else if (e.key === "Backspace" && !draft && values.length) {
            onChange(values.slice(0, -1));
          }
        }}
        onBlur={commit}
        placeholder={values.length ? "" : placeholder}
        className="flex-1 min-w-[120px] text-sm outline-none bg-transparent py-1"
      />
    </div>
  );
}
