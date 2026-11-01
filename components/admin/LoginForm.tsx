"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { img } from "@/lib/utils";
import { inputCls } from "./ui";

export default function LoginForm({ brand, image }: { brand: string; image: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      const d = await res.json().catch(() => ({}));
      setError(d.error || "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="relative grid min-h-dvh lg:grid-cols-[1.1fr_1fr]">
      <div className="relative hidden overflow-hidden lg:block">
        {image && (
          // eslint-disable-next-line @next/next/no-img-element
          <motion.img
            src={img(image, 1800)}
            alt=""
            initial={{ scale: 1.15 }}
            animate={{ scale: 1 }}
            transition={{ duration: 2.4, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div className="absolute bottom-10 left-10 right-10 text-white">
          <div className="eyebrow text-white/70">Studio console</div>
          <p className="mt-3 max-w-md text-4xl font-medium leading-[1.05] tracking-[-0.04em]">
            Every journey, every guest, <span className="hl">one calm place.</span>
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-16">
        <motion.form
          onSubmit={submit}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-sm"
        >
          <div className="mb-10 flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-ink text-lg font-semibold text-paper">{brand.slice(0, 1)}</span>
            <div>
              <div className="text-lg font-semibold tracking-tight">{brand}</div>
              <div className="text-xs text-mute">Admin · CMS · CRM</div>
            </div>
          </div>
          <h1 className="text-[34px] font-semibold leading-tight tracking-[-0.04em]">Welcome back.</h1>
          <p className="mt-2 text-sm text-mute">Sign in to manage content, leads and bookings.</p>

          <label className="mt-8 block">
            <span className="mb-1.5 block text-[13px] font-medium">Password</span>
            <input
              type="password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputCls + " h-12 text-base"}
              placeholder="••••••••"
            />
          </label>
          {error && (
            <motion.p initial={{ x: -6 }} animate={{ x: [6, -4, 2, 0] }} className="mt-2 text-sm text-red-600">
              {error}
            </motion.p>
          )}
          <button
            disabled={loading || !password}
            className="mt-5 h-12 w-full rounded-full bg-ink text-sm font-medium text-paper transition hover:bg-ink/85 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
          <p className="mt-6 text-center text-xs text-ink/40">
            Demo password: <code className="rounded bg-ink/5 px-1.5 py-0.5 font-mono">admin123</code>
          </p>
        </motion.form>
      </div>
    </div>
  );
}
