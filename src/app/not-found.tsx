import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-4 text-center">
      <div>
        <h1 className="font-display text-5xl">That page is not in the list</h1>
        <Link href="/" className="mt-6 inline-block text-mint">Go home</Link>
      </div>
    </main>
  );
}
