export function Spark({ values, className = "h-10 w-28" }: { values: number[]; className?: string }) {
  if (values.length < 2) return null;
  const width = 120;
  const height = 36;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const line = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = height - ((value - min) / span) * (height - 4) - 2;
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={className} role="img" aria-label="Volume shape in this snapshot">
      <path d={`${line} L${width} ${height} L0 ${height} Z`} fill="rgba(93,255,176,0.14)" />
      <path d={line} fill="none" stroke="#5dffb0" strokeWidth="2" />
    </svg>
  );
}

export function Ring({ value }: { value: number }) {
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.max(0, Math.min(100, value)) / 100) * circumference;
  return (
    <svg viewBox="0 0 60 60" className="h-16 w-16" role="img" aria-label={`Creator opportunity ${value} out of 100`}>
      <circle cx="30" cy="30" r={radius} stroke="rgba(255,255,255,0.08)" strokeWidth="5" fill="none" />
      <circle
        cx="30"
        cy="30"
        r={radius}
        stroke="#5dffb0"
        strokeWidth="5"
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 30 30)"
      />
      <text x="30" y="35" textAnchor="middle" fontSize="14" fill="#f5f7ff" fontFamily="inherit">
        {value}
      </text>
    </svg>
  );
}

export function Meter({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs text-muted">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-mint" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
