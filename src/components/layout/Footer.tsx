import Link from "next/link";
import { SITE, NAV } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-sand bg-brown text-cream">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-serif text-2xl">Bharatiya Chakki</p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-cream/75">
            A family mill in Jaipur, stone-grinding wheat and millets the slow way since {SITE.founded}.
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-wheat">Visit</p>
          <ul className="mt-3 space-y-2 text-sm text-cream/80">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="hover:text-wheat">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-wheat">Trust</p>
          <ul className="mt-3 space-y-2 text-sm text-cream/80">
            <li>FSSAI {SITE.fssai}</li>
            <li>India Organic (select lots)</li>
            <li>Freshness guarantee · 7 days</li>
            <li>
              <Link href="/privacy" className="hover:text-wheat">
                Privacy
              </Link>
              {" · "}
              <Link href="/terms" className="hover:text-wheat">
                Terms
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-wheat">Mill</p>
          <p className="mt-3 text-sm leading-relaxed text-cream/80">{SITE.address}</p>
          <p className="mt-2 text-sm">
            <a href={`mailto:${SITE.email}`} className="hover:text-wheat">
              {SITE.email}
            </a>
          </p>
          <p className="text-sm">
            <a href={`tel:${SITE.phone.replace(/\s/g, "")}`} className="hover:text-wheat">
              {SITE.phone}
            </a>
          </p>
        </div>
      </div>
      <div className="border-t border-cream/10 px-4 py-4 text-center text-xs text-cream/55">
        © {new Date().getFullYear()} {SITE.legalName}. Stone-ground in Rajasthan.
      </div>
    </footer>
  );
}
