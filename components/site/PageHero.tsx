"use client";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import Img from "./Img";
import { SplitReveal } from "./Reveal";
import { useSite } from "./SiteContext";

export default function PageHero({
  eyebrow,
  title,
  accent,
  sub,
  image,
  children,
}: {
  eyebrow: string;
  title: string;
  accent?: string;
  sub?: string;
  image?: string;
  children?: React.ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const { introDone } = useSite();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.94]);

  if (!image) {
    return (
      <section ref={ref} className="mx-auto max-w-[1400px] px-5 pb-10 pt-16 md:px-10 md:pb-16 md:pt-40">
        <p className="eyebrow text-mute">{eyebrow}</p>
        <h1 className="display mt-5 max-w-[16ch] text-[14vw] md:text-[8vw] xl:text-[7.5rem]">
          <SplitReveal text={title} play={introDone} />
          {accent && <> <span className="serif-i text-accent"><SplitReveal text={accent} play={introDone} delay={0.15} /></span></>}
        </h1>
        {sub && <p className="mt-6 max-w-xl text-lg text-mute">{sub}</p>}
        {children}
      </section>
    );
  }

  return (
    <section ref={ref} className="px-3 pt-3 md:px-6 md:pt-6">
      <motion.div style={{ scale }} className="r-xl relative flex min-h-[78svh] origin-top items-end overflow-hidden bg-night text-white">
        <motion.div style={{ y }} className="absolute inset-0">
          <Img src={image} w={2200} alt="" priority className="h-full w-full object-cover" />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-black/30" />
        <div className="relative mx-auto w-full max-w-[1400px] px-5 pb-24 pt-32 md:px-10 md:pb-14">
          <p className="eyebrow text-white/75">{eyebrow}</p>
          <h1 className="display mt-4 max-w-[14ch] text-[14vw] md:text-[8vw] xl:text-[7.5rem]">
            <SplitReveal text={title} play={introDone} />
            {accent && <> <span className="serif-i text-accent"><SplitReveal text={accent} play={introDone} delay={0.15} /></span></>}
          </h1>
          {sub && <p className="mt-5 max-w-xl text-white/80 md:text-lg">{sub}</p>}
          {children}
        </div>
      </motion.div>
    </section>
  );
}
