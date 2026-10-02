import Link from "next/link";
import type { ReactNode } from "react";

type ActionLinkProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
};

export function ActionLink({ href, children, variant = "primary" }: ActionLinkProps) {
  const variantClasses = variant === "primary"
    ? "border-teal-300 bg-teal-300 text-zinc-950 hover:border-teal-200 hover:bg-teal-200"
    : "border-zinc-700 bg-zinc-900 text-zinc-100 hover:border-zinc-500 hover:bg-zinc-800";

  return (
    <Link href={href} className={`inline-flex min-h-12 items-center justify-center rounded-lg border px-6 text-sm font-semibold ${variantClasses}`}>
      {children}
    </Link>
  );
}
