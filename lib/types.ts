export type ID = string;

export interface NavLink {
  label: string;
  href: string;
  image: string;
}

export interface SiteSettings {
  brand: {
    name: string;
    tagline: string;
    logoMark: string; // short glyph shown in the navbar pill
    currency: string;
    locale: string;
    email: string;
    phone: string;
    whatsapp: string;
    address: string;
    socials: { label: string; href: string }[];
  };
  theme: {
    accent: string;
    dark: string;
    paper: string;
    radius: number; // px
  };
  intro: {
    enabled: boolean;
    oncePerSession: boolean;
    duration: number; // seconds
    words: string[];
    images: string[];
    tagline: string;
  };
  hero: {
    eyebrow: string;
    titleTop: string;
    titleAccent: string;
    titleBottom: string;
    subtitle: string;
    slides: { image: string; caption: string }[];
    ctaLabel: string;
  };
  announcement: { enabled: boolean; text: string; href: string };
  nav: NavLink[];
  sections: Record<HomeSectionKey, boolean>;
  manifesto: string;
  stats: { value: number; suffix: string; label: string }[];
  seo: { title: string; description: string };
}

export type HomeSectionKey =
  | "marquee"
  | "manifesto"
  | "destinations"
  | "tours"
  | "experiences"
  | "stats"
  | "process"
  | "testimonials"
  | "journal"
  | "faq"
  | "newsletter";

export interface Destination {
  id: ID;
  slug: string;
  name: string;
  country: string;
  region: string;
  tagline: string;
  description: string;
  image: string;
  gallery: string[];
  bestTime: string;
  startingPrice: number;
  featured: boolean;
}

export interface ItineraryDay {
  title: string;
  description: string;
}

export interface Tour {
  id: ID;
  slug: string;
  title: string;
  destinationSlug: string;
  category: string;
  days: number;
  price: number;
  oldPrice?: number;
  rating: number;
  reviews: number;
  groupSize: string;
  difficulty: "Easy" | "Moderate" | "Challenging";
  image: string;
  gallery: string[];
  summary: string;
  highlights: string[];
  includes: string[];
  excludes: string[];
  itinerary: ItineraryDay[];
  departures: string[];
  featured: boolean;
  published: boolean;
}

export interface Post {
  id: ID;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover: string;
  category: string;
  author: string;
  readTime: number;
  date: string;
  published: boolean;
}

export interface Testimonial {
  id: ID;
  name: string;
  location: string;
  avatar: string;
  quote: string;
  trip: string;
  rating: number;
}

export interface Faq {
  id: ID;
  question: string;
  answer: string;
}

export interface Experience {
  id: ID;
  title: string;
  subtitle: string;
  image: string;
  count: string;
}

export type LeadStatus = "new" | "contacted" | "qualified" | "proposal" | "won" | "lost";

export interface Note {
  at: string;
  text: string;
}

export interface Lead {
  id: ID;
  name: string;
  email: string;
  phone: string;
  destination: string;
  travelers: number;
  budget: string;
  travelDate: string;
  message: string;
  source: string;
  status: LeadStatus;
  value: number;
  notes: Note[];
  createdAt: string;
}

export type BookingStatus = "pending" | "confirmed" | "paid" | "completed" | "cancelled";

export interface Booking {
  id: ID;
  ref: string;
  tourSlug: string;
  tourTitle: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  travelers: number;
  total: number;
  status: BookingStatus;
  requests: string;
  createdAt: string;
}

export interface Subscriber {
  id: ID;
  email: string;
  createdAt: string;
}

export interface DB {
  settings: SiteSettings;
  destinations: Destination[];
  tours: Tour[];
  posts: Post[];
  testimonials: Testimonial[];
  faqs: Faq[];
  experiences: Experience[];
  leads: Lead[];
  bookings: Booking[];
  subscribers: Subscriber[];
}

export type CollectionKey = Exclude<keyof DB, "settings">;
