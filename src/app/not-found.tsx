import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <h1 className="font-serif text-5xl">That aisle is empty</h1>
      <p className="mt-3 text-muted">The page may have been packed into a different bag.</p>
      <Link href="/" className="mt-6 inline-block text-terracotta underline">
        Back to the mill
      </Link>
    </div>
  );
}
