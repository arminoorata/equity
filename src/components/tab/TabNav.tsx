"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Tab nav. Renders below the sticky header on every tab route. Each
 * tab is a real Next.js route (not tab-state inside `/`). Active state
 * is determined from the current pathname.
 *
 * Six tabs in display order, per spec/02-FEATURES.md:
 *   Learn (`/`) · Vesting · Calculators · Exercise · Ask · Glossary
 *
 * Horizontally scrollable on narrow screens.
 */
const tabs = [
  { href: "/", label: "Learn", icon: "📚" },
  { href: "/vesting", label: "Vesting", icon: "📅" },
  { href: "/calculators", label: "Calculators", icon: "🧮" },
  { href: "/exercise", label: "Exercise", icon: "🧭" },
  { href: "/ask", label: "Ask", icon: "💬" },
  { href: "/glossary", label: "Glossary", icon: "📖" },
];

export default function TabNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Equity portal sections"
      className="border-b"
      style={{ borderColor: "var(--line)" }}
    >
      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <ul
          className="flex gap-6 overflow-x-auto"
          style={{ scrollbarWidth: "none" }}
        >
          {tabs.map((tab) => {
            const active = isActive(pathname, tab.href);
            return (
              <li key={tab.href}>
                <Link
                  href={tab.href}
                  aria-current={active ? "page" : undefined}
                  className="flex items-center gap-2 whitespace-nowrap py-3 text-sm transition-colors"
                  style={{
                    color: active ? "var(--text)" : "var(--text-muted)",
                    fontWeight: active ? 700 : 500,
                    borderBottom: active
                      ? "2px solid var(--accent)"
                      : "2px solid transparent",
                    marginBottom: "-1px",
                  }}
                >
                  <span aria-hidden>{tab.icon}</span>
                  <span>{tab.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

function isActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
