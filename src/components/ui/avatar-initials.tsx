const PALETTE = ["#E3BDB6", "#B98A72", "#D9C5A0", "#A9B79A", "#C7A6C4", "#9FB4C7"];

function hashString(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function AvatarInitials({ name, size = 40 }: { name: string; size?: number }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
  const color = PALETTE[hashString(name) % PALETTE.length];

  return (
    <div
      className="flex items-center justify-center rounded-full font-serif text-ink shrink-0"
      style={{ width: size, height: size, background: color, fontSize: size * 0.4 }}
    >
      {initials || "?"}
    </div>
  );
}
