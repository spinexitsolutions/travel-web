/* eslint-disable @next/next/no-img-element */
import { img } from "@/lib/utils";

type Props = React.ImgHTMLAttributes<HTMLImageElement> & { src: string; w?: number; alt: string; priority?: boolean };

/** Lightweight image: responsive Unsplash srcset, lazy by default, any URL allowed (admin-editable). */
export default function Img({ src, w = 1600, alt, priority, className, ...rest }: Props) {
  const isU = src?.includes("images.unsplash.com");
  const srcSet = isU ? [480, 800, 1200, 1600, 2200].filter((x) => x <= Math.max(w, 480) * 1.4).map((x) => `${img(src, x)} ${x}w`).join(", ") : undefined;
  return (
    <img
      src={img(src, w)}
      srcSet={srcSet}
      sizes={rest.sizes ?? "100vw"}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      draggable={false}
      className={className}
      {...rest}
    />
  );
}
