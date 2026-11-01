"use client";
import { useEffect, useRef, useState } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

/** Airport split-flap board: letters shuffle, then settle left → right. */
export default function Flap({ text, len = 12 }: { text: string; len?: number }) {
  const target = text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .slice(0, len)
    .padEnd(len, " ");
  const [shown, setShown] = useState(target);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      setShown(target);
      return;
    }
    let tick = 0;
    const settle = Array.from({ length: len }, (_, k) => 3 + k * 1.2 + Math.random() * 3);
    const id = setInterval(() => {
      tick++;
      setShown(
        Array.from({ length: len }, (_, k) =>
          tick >= settle[k] ? target[k] : CHARS[Math.floor(Math.random() * CHARS.length)],
        ).join(""),
      );
      if (tick > settle[len - 1] + 4) clearInterval(id);
    }, 55);
    return () => clearInterval(id);
  }, [target, len]);

  return (
    <span className="inline-flex" aria-label={text}>
      {shown.split("").map((c, k) => (
        <span key={k} className="flap" aria-hidden>
          {c === " " ? " " : c}
        </span>
      ))}
    </span>
  );
}
