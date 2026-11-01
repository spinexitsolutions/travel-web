import type { SubField } from "./fields";

export type FieldDef =
  | { key: string; label: string; type: "text" | "textarea" | "image" | "date" | "richtext"; hint?: string; span?: 2; required?: boolean }
  | { key: string; label: string; type: "number"; hint?: string; span?: 2; step?: number; required?: boolean }
  | { key: string; label: string; type: "boolean"; hint?: string; span?: 2 }
  | { key: string; label: string; type: "select"; options: string[] | "destinations"; hint?: string; span?: 2 }
  | { key: string; label: string; type: "slug"; from: string; hint?: string; span?: 2 }
  | { key: string; label: string; type: "list"; image?: boolean; inputType?: string; hint?: string; span?: 2 }
  | { key: string; label: string; type: "objects"; fields: SubField[]; blank: Record<string, unknown>; hint?: string; span?: 2 };

export type SchemaKey = "tours" | "destinations" | "posts" | "testimonials" | "faqs" | "experiences";

export type Schema = {
  title: string;
  singular: string;
  subtitle: string;
  titleKey: string;
  subtitleKey?: (item: Record<string, unknown>) => string;
  imageKey?: string;
  publishedKey?: string;
  featuredKey?: string;
  layout: "grid" | "list";
  sections: { title: string; fields: FieldDef[] }[];
  blank: Record<string, unknown>;
};

export const SCHEMAS: Record<SchemaKey, Schema> = {
  tours: {
    title: "Journeys",
    singular: "journey",
    subtitle: "Bookable packages — itinerary, pricing, departures and media.",
    titleKey: "title",
    subtitleKey: (i) => `${i.days} days · ${i.category} · ${i.destinationSlug}`,
    imageKey: "image",
    publishedKey: "published",
    featuredKey: "featured",
    layout: "grid",
    sections: [
      {
        title: "Basics",
        fields: [
          { key: "title", label: "Title", type: "text", span: 2, required: true },
          { key: "slug", label: "URL slug", type: "slug", from: "title", span: 2 },
          { key: "destinationSlug", label: "Destination", type: "select", options: "destinations" },
          { key: "category", label: "Category", type: "select", options: ["Adventure", "Luxury", "Wellness", "Culture", "Honeymoon", "Family", "Wildlife"] },
          { key: "summary", label: "Summary", type: "textarea", span: 2 },
        ],
      },
      {
        title: "Pricing & logistics",
        fields: [
          { key: "price", label: "Price per person", type: "number" },
          { key: "oldPrice", label: "Old price (strike-through)", type: "number", hint: "optional" },
          { key: "days", label: "Duration (days)", type: "number" },
          { key: "groupSize", label: "Group size", type: "text" },
          { key: "difficulty", label: "Difficulty", type: "select", options: ["Easy", "Moderate", "Challenging"] },
          { key: "rating", label: "Rating", type: "number", step: 0.1 },
          { key: "reviews", label: "Review count", type: "number" },
          { key: "departures", label: "Departure dates", type: "list", inputType: "date", span: 2 },
        ],
      },
      {
        title: "Media",
        fields: [
          { key: "image", label: "Cover image", type: "image", span: 2 },
          { key: "gallery", label: "Gallery", type: "list", image: true, span: 2 },
        ],
      },
      {
        title: "Details",
        fields: [
          { key: "highlights", label: "Highlights", type: "list", span: 2 },
          { key: "includes", label: "Included", type: "list" },
          { key: "excludes", label: "Not included", type: "list" },
          {
            key: "itinerary",
            label: "Itinerary",
            type: "objects",
            span: 2,
            fields: [
              { key: "title", label: "Day title" },
              { key: "description", label: "Description", type: "textarea" },
            ],
            blank: { title: "", description: "" },
          },
        ],
      },
      {
        title: "Visibility",
        fields: [
          { key: "published", label: "Published", type: "boolean" },
          { key: "featured", label: "Featured on homepage", type: "boolean" },
        ],
      },
    ],
    blank: {
      title: "", slug: "", destinationSlug: "", category: "Adventure", days: 7, price: 100000, rating: 5, reviews: 0, groupSize: "Private · 2–8",
      difficulty: "Easy", image: "", gallery: [], summary: "", highlights: [], includes: [], excludes: [], itinerary: [], departures: [], featured: false, published: true,
    },
  },
  destinations: {
    title: "Destinations",
    singular: "destination",
    subtitle: "Places you sell — shown on the homepage carousel and destination pages.",
    titleKey: "name",
    subtitleKey: (i) => `${i.country} · ${i.region}`,
    imageKey: "image",
    featuredKey: "featured",
    layout: "grid",
    sections: [
      {
        title: "Basics",
        fields: [
          { key: "name", label: "Name", type: "text", required: true },
          { key: "slug", label: "URL slug", type: "slug", from: "name" },
          { key: "country", label: "Country", type: "text" },
          { key: "region", label: "Region", type: "select", options: ["Europe", "Asia", "Indian Ocean", "Africa", "Americas", "Middle East", "Oceania"] },
          { key: "tagline", label: "Tagline", type: "text", span: 2 },
          { key: "description", label: "Description", type: "textarea", span: 2 },
          { key: "bestTime", label: "Best time to visit", type: "text" },
          { key: "startingPrice", label: "Starting price", type: "number" },
        ],
      },
      {
        title: "Media",
        fields: [
          { key: "image", label: "Cover image", type: "image", span: 2 },
          { key: "gallery", label: "Gallery", type: "list", image: true, span: 2 },
        ],
      },
      { title: "Visibility", fields: [{ key: "featured", label: "Featured on homepage", type: "boolean" }] },
    ],
    blank: { name: "", slug: "", country: "", region: "Europe", tagline: "", description: "", image: "", gallery: [], bestTime: "", startingPrice: 100000, featured: true },
  },
  posts: {
    title: "Journal",
    singular: "story",
    subtitle: "Blog posts, guides and inspiration.",
    titleKey: "title",
    subtitleKey: (i) => `${i.category} · ${i.author} · ${i.readTime} min`,
    imageKey: "cover",
    publishedKey: "published",
    layout: "grid",
    sections: [
      {
        title: "Story",
        fields: [
          { key: "title", label: "Title", type: "text", span: 2, required: true },
          { key: "slug", label: "URL slug", type: "slug", from: "title", span: 2 },
          { key: "excerpt", label: "Excerpt", type: "textarea", span: 2 },
          { key: "content", label: "Content", type: "richtext", span: 2, hint: "Blank line = new paragraph" },
          { key: "cover", label: "Cover image", type: "image", span: 2 },
        ],
      },
      {
        title: "Meta",
        fields: [
          { key: "category", label: "Category", type: "select", options: ["Guides", "Inspiration", "Tips", "Philosophy", "News"] },
          { key: "author", label: "Author", type: "text" },
          { key: "readTime", label: "Read time (min)", type: "number" },
          { key: "date", label: "Publish date", type: "date" },
          { key: "published", label: "Published", type: "boolean" },
        ],
      },
    ],
    blank: { title: "", slug: "", excerpt: "", content: "", cover: "", category: "Guides", author: "", readTime: 5, date: new Date().toISOString().slice(0, 10), published: true },
  },
  testimonials: {
    title: "Testimonials",
    singular: "testimonial",
    subtitle: "Guest reviews shown across the site.",
    titleKey: "name",
    subtitleKey: (i) => `${i.location} · ${i.trip}`,
    imageKey: "avatar",
    layout: "list",
    sections: [
      {
        title: "Review",
        fields: [
          { key: "name", label: "Guest name", type: "text", required: true },
          { key: "location", label: "Location", type: "text" },
          { key: "trip", label: "Journey", type: "text" },
          { key: "rating", label: "Rating (1–5)", type: "number" },
          { key: "quote", label: "Quote", type: "textarea", span: 2 },
          { key: "avatar", label: "Photo", type: "image", span: 2 },
        ],
      },
    ],
    blank: { name: "", location: "", avatar: "", quote: "", trip: "", rating: 5 },
  },
  faqs: {
    title: "FAQs",
    singular: "question",
    subtitle: "Frequently asked questions on the homepage.",
    titleKey: "question",
    subtitleKey: (i) => String(i.answer ?? "").slice(0, 110),
    layout: "list",
    sections: [
      {
        title: "Question",
        fields: [
          { key: "question", label: "Question", type: "text", span: 2, required: true },
          { key: "answer", label: "Answer", type: "textarea", span: 2 },
        ],
      },
    ],
    blank: { question: "", answer: "" },
  },
  experiences: {
    title: "Experiences",
    singular: "experience",
    subtitle: "Travel styles shown in the homepage bento grid.",
    titleKey: "title",
    subtitleKey: (i) => `${i.subtitle} · ${i.count}`,
    imageKey: "image",
    layout: "grid",
    sections: [
      {
        title: "Experience",
        fields: [
          { key: "title", label: "Title", type: "text", required: true },
          { key: "count", label: "Count label", type: "text", hint: "e.g. 24 journeys" },
          { key: "subtitle", label: "Subtitle", type: "text", span: 2 },
          { key: "image", label: "Image", type: "image", span: 2 },
        ],
      },
    ],
    blank: { title: "", subtitle: "", image: "", count: "" },
  },
};
