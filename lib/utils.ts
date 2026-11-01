import clsx, { type ClassValue } from "clsx";

export const cn = (...c: ClassValue[]) => clsx(c);

/** Append sizing params to Unsplash URLs; leave other URLs untouched. */
export function img(src: string, w = 1600, q = 75) {
  if (!src) return src;
  if (!src.includes("images.unsplash.com")) return src;
  const base = src.split("?")[0];
  return `${base}?auto=format&fit=crop&w=${w}&q=${q}`;
}

export function money(n: number, currency = "₹", locale = "en-IN") {
  return `${currency}${Math.round(n).toLocaleString(locale)}`;
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function fmtDate(d: string, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }) {
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return d;
  return date.toLocaleDateString("en-GB", opts);
}
