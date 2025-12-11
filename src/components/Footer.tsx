import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/", label: "About" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
] as const;

/**
 * Application footer with navigation links.
 */
export default function Footer() {
  return (
    <footer className="h-14 shrink-0 sticky bottom-0 flex items-center justify-center bg-slate-200 dark:bg-slate-600">
      <nav className="flex space-x-4" aria-label="Footer navigation">
        {FOOTER_LINKS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="text-blue-600 dark:text-blue-400 hover:underline transition-colors"
          >
            {label}
          </Link>
        ))}
      </nav>
    </footer>
  );
}
