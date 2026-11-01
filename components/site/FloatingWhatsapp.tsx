"use client";
import { motion } from "motion/react";
import { useSite } from "./SiteContext";
import { Whatsapp } from "./Icons";

export default function FloatingWhatsapp() {
  const { settings, introDone } = useSite();
  if (!settings.brand.whatsapp) return null;
  return (
    <motion.a
      href={`https://wa.me/${settings.brand.whatsapp}?text=${encodeURIComponent("Hi! I'd like help planning a trip.")}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      initial={{ scale: 0 }}
      animate={introDone ? { scale: 1 } : { scale: 0 }}
      transition={{ delay: 1.4, type: "spring", stiffness: 300, damping: 20 }}
      whileHover={{ scale: 1.08 }}
      className="fixed bottom-6 right-6 z-[65] hidden h-14 w-14 place-items-center rounded-full bg-[#25D366] text-2xl text-white shadow-[0_15px_40px_-10px_rgba(37,211,102,.7)] md:grid"
    >
      <Whatsapp />
    </motion.a>
  );
}
