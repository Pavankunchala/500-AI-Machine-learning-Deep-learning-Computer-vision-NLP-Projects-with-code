import Link from "next/link";

type Props = {
  href?: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
};

const styles = {
  primary:
    "bg-terracotta text-cream hover:bg-clay shadow-[0_8px_24px_-12px_rgba(156,66,33,0.7)]",
  secondary:
    "bg-brown text-cream hover:bg-ink",
  ghost:
    "bg-transparent text-brown border border-brown/20 hover:border-terracotta hover:text-terracotta",
};

export function Button({
  href,
  children,
  variant = "primary",
  className = "",
  type = "button",
  onClick,
  disabled,
}: Props) {
  const cls = `inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium tracking-wide transition duration-200 disabled:opacity-50 ${styles[variant]} ${className}`;
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls}>
      {children}
    </button>
  );
}
