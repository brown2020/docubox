import Link from "next/link";

export default function Footer() {
  return (
    <div className="h-14 flex-shrink-0 flex items-center justify-center bg-slate-200 dark:bg-slate-600">
      <nav className="flex space-x-4">
        <Link
          href="/"
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          About
        </Link>
        <Link
          href="/terms"
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          Terms
        </Link>
        <Link
          href="/privacy"
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          Privacy
        </Link>
      </nav>
    </div>
  );
}
