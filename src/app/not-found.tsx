import Link from "next/link";

export const metadata = {
  title: "Page not found · Equity Education Portal",
};

export default function NotFound() {
  return (
    <main>
      <div className="mx-auto max-w-2xl px-6 py-16 md:px-10 md:py-24">
        <p
          className="text-xs font-medium uppercase tracking-[0.32em]"
          style={{ color: "var(--accent)" }}
        >
          404
        </p>
        <h1 className="mt-4 text-3xl font-medium tracking-tight md:text-4xl">
          This page does not exist.
        </h1>
        <p
          className="mt-5 text-base leading-7 md:text-lg"
          style={{ color: "var(--muted)" }}
        >
          Either the URL is off, or I built something and unbuilt it.
          Either way, here&rsquo;s a way back.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/" className="btn btn-primary">
            Back to Learn
          </Link>
        </div>
      </div>
    </main>
  );
}
