type P = React.SVGProps<SVGSVGElement>;
const base = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" } as const;

export const ArrowUpRight = (p: P) => (<svg viewBox="0 0 24 24" width="1em" height="1em" {...base} {...p}><path d="M7 17 17 7M8 7h9v9" /></svg>);
export const ArrowRight = (p: P) => (<svg viewBox="0 0 24 24" width="1em" height="1em" {...base} {...p}><path d="M5 12h14M13 6l6 6-6 6" /></svg>);
export const Search = (p: P) => (<svg viewBox="0 0 24 24" width="1em" height="1em" {...base} {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>);
export const Heart = ({ filled, ...p }: P & { filled?: boolean }) => (<svg viewBox="0 0 24 24" width="1em" height="1em" {...base} fill={filled ? "currentColor" : "none"} {...p}><path d="M12 20s-7-4.4-9.2-8.6C1.3 8.4 3.2 5 6.6 5c2 0 3.4 1.1 4.4 2.6C12 6.1 13.4 5 15.4 5c3.4 0 5.3 3.4 3.8 6.4C19 15.6 12 20 12 20Z" /></svg>);
export const Star = (p: P) => (<svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" {...p}><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" /></svg>);
export const Pin = (p: P) => (<svg viewBox="0 0 24 24" width="1em" height="1em" {...base} {...p}><path d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.5" /></svg>);
export const Calendar = (p: P) => (<svg viewBox="0 0 24 24" width="1em" height="1em" {...base} {...p}><rect x="3.5" y="5" width="17" height="15" rx="3" /><path d="M3.5 10h17M8 3v4M16 3v4" /></svg>);
export const Users = (p: P) => (<svg viewBox="0 0 24 24" width="1em" height="1em" {...base} {...p}><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c.6-3.5 3.3-5.5 6.5-5.5s5.9 2 6.5 5.5M16 4.8a3.5 3.5 0 0 1 0 6.4M18.5 14.8c1.7.8 2.8 2.6 3 5.2" /></svg>);
export const Clock = (p: P) => (<svg viewBox="0 0 24 24" width="1em" height="1em" {...base} {...p}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></svg>);
export const Plus = (p: P) => (<svg viewBox="0 0 24 24" width="1em" height="1em" {...base} {...p}><path d="M12 5v14M5 12h14" /></svg>);
export const Check = (p: P) => (<svg viewBox="0 0 24 24" width="1em" height="1em" {...base} {...p}><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>);
export const X = (p: P) => (<svg viewBox="0 0 24 24" width="1em" height="1em" {...base} {...p}><path d="M6 6l12 12M18 6 6 18" /></svg>);
export const Mountain = (p: P) => (<svg viewBox="0 0 24 24" width="1em" height="1em" {...base} {...p}><path d="m3 19 6.5-11 4 6.5 2-3L21 19Z" /></svg>);
export const Whatsapp = (p: P) => (<svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" {...p}><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z" /></svg>);
