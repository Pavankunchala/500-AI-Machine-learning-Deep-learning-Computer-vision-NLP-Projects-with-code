export function inr(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export function lastGrindingDate(now = new Date()) {
  const d = new Date(now);
  const day = d.getDay();
  const diff = (day + 6) % 7;
  d.setDate(d.getDate() - diff);
  d.setHours(6, 30, 0, 0);
  return d;
}

export function freshnessLabel(now = new Date()) {
  const ground = lastGrindingDate(now);
  const days = Math.floor((now.getTime() - ground.getTime()) / 86400000);
  if (days <= 1) return "Ground yesterday — at its most fragrant.";
  if (days <= 4) return `Stone-ground ${days} days ago — still sweet.`;
  return "Ground this week — best within 45 days.";
}

export function daysUntilBest(now = new Date()) {
  const packed = lastGrindingDate(now);
  const best = new Date(packed);
  best.setDate(best.getDate() + 45);
  return Math.max(0, Math.ceil((best.getTime() - now.getTime()) / 86400000));
}

export function newOrderId() {
  const n = Math.floor(1000 + Math.random() * 9000);
  const y = new Date().getFullYear();
  return `BC-${y}-${n}`;
}
