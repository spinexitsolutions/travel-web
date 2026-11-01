export type PresetKey = "postcard" | "horizon" | "voyage";

export interface Preset {
  key: PresetKey;
  label: string;
  description: string;
  fonts: string;
  accent: string;
  dark: string;
  paper: string;
  radius: number;
  sun: string;
}

/**
 * Each preset is a complete design direction: type pairing, palette,
 * shape language and its own hero layout. Colours stay editable after.
 */
export const PRESETS: Record<PresetKey, Preset> = {
  postcard: {
    key: "postcard",
    label: "Postcard",
    description: "Sunny editorial. A shuffling stack of postcards, stamps & postmarks.",
    fonts: "Bricolage Grotesque + Instrument Sans",
    accent: "#0F6E5B",
    dark: "#1D2B26",
    paper: "#F4ECE0",
    radius: 6,
    sun: "#FFB59A",
  },
  horizon: {
    key: "horizon",
    label: "Horizon",
    description: "Dark ocean. Giant text-mask hero you fly through on scroll.",
    fonts: "Unbounded + Manrope",
    accent: "#3FE0C5",
    dark: "#020E11",
    paper: "#06181C",
    radius: 22,
    sun: "#FFD166",
  },
  voyage: {
    key: "voyage",
    label: "Window Seat",
    description: "Swiss poster. Aircraft-window hero, split-flap board, Klein blue.",
    fonts: "Archivo (width axis)",
    accent: "#2B3DFF",
    dark: "#0B0C14",
    paper: "#F1EFEA",
    radius: 14,
    sun: "#FFC83D",
  },
};

export const PRESET_FONTS: Record<PresetKey, { display: string; body: string }> = {
  postcard: { display: "var(--font-bricolage)", body: "var(--font-instrument-sans)" },
  horizon: { display: "var(--font-unbounded)", body: "var(--font-manrope)" },
  voyage: { display: "var(--font-archivo)", body: "var(--font-archivo)" },
};

function lum(hex: string) {
  const h = hex.replace("#", "");
  const f = h.length === 3 ? h.split("").map((c) => c + c).join("") : h.slice(0, 6);
  const [r, g, b] = [0, 2, 4].map((i) => {
    const v = parseInt(f.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export const isDark = (hex: string) => lum(hex) < 0.18;
export const onColor = (hex: string) => (lum(hex) > 0.45 ? "#0B0C10" : "#FFFFFF");
