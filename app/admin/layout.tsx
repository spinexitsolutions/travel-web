import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Studio console",
  robots: { index: false, follow: false },
};

export default function AdminRoot({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh bg-paper text-ink">{children}</div>;
}
