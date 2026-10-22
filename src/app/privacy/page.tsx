import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <Link href="/" className="text-sm text-muted">TrendPulse</Link>
      <h1 className="font-display mt-6 text-4xl">Privacy</h1>
      <div className="mt-4 space-y-3 text-muted">
        <p>Passwords are stored as Argon2id hashes. Session tokens are stored as hashes. WhatsApp numbers and authenticator secrets are encrypted with AES-256-GCM.</p>
        <p>Trend lists are read from the shared cache. A creator opening the app does not trigger a personal X request.</p>
        <p>Logs keep endpoint, status, and timing. They do not keep passwords, tokens, or API keys.</p>
      </div>
    </main>
  );
}
