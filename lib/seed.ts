import type { Booking, DB, Lead, LeadStatus, BookingStatus } from "./types";

const u = (id: string) => `https://images.unsplash.com/photo-${id}`;

export const IMG = {
  beachSunset: u("1507525428034-b723cf961d3e"),
  vanRoad: u("1469854523086-cc02fe5d8800"),
  braiesBoat: u("1476514525535-07fb3b4ae5f1"),
  turquoiseLake: u("1501785888041-af3ef285b470"),
  aboveClouds: u("1506905925346-21bda4d32df4"),
  cappadocia: u("1530789253388-582c481c54b0"),
  flatlay: u("1488646953014-85cb44e25828"),
  parisBridge: u("1499856871958-5b9627545d1a"),
  eiffel: u("1502602898657-3e91760cbb34"),
  london: u("1513635269975-59663e0ac1ad"),
  baliTemple: u("1537996194471-e657df975ab4"),
  dubai: u("1512453979798-5ea266f8880c"),
  kyoto: u("1493976040374-85c8e12f0c0e"),
  halong: u("1528127269322-539801943592"),
  cinqueTerre: u("1516483638261-f4dbaf036963"),
  venice: u("1523906834658-6e24ef2386f9"),
  hikers: u("1539635278303-d4002c07eae3"),
  taj: u("1524492412937-b28074a5d7da"),
  tajArch: u("1548013146-72479768bada"),
  jaipur: u("1477587458883-47145ed94245"),
  tropicalPool: u("1520250497591-112f2f40a3f4"),
  lodgePool: u("1566073771259-6a8506099945"),
  scuba: u("1544551763-46a013bb70d5"),
  hikerValley: u("1501555088652-021faa106b9b"),
  rockies: u("1464822759023-fed622ff2c3b"),
  highlands: u("1470071459604-3b5ec3a7fe05"),
  tent: u("1504280390367-361c6d9f38f4"),
  santorini: u("1533105079780-92b9be482077"),
  krabi: u("1552465011-b4e21bf6e79a"),
  infinityPool: u("1540541338287-41700207dee6"),
  aerialBoats: u("1506929562872-bb421503ef21"),
  canyonRoad: u("1500530855697-b586d89ba3ee"),
  palmBeach: u("1519046904884-53103b34b206"),
  bigBen: u("1505761671935-60b3a7427bad"),
  alley: u("1527631746610-bca00a040d60"),
  backpackLake: u("1503220317375-aaad61436b1b"),
  airport: u("1530521954074-e64f6810b32d"),
  aurora: u("1531366936337-7c912a4589a7"),
  tanahLot: u("1518548419970-58e3b4079ab2"),
  thaiTemple: u("1528181304800-259b08848526"),
  bigSur: u("1510414842594-a61c69b5ae57"),
  himalaya: u("1526772662000-3f88f10405ff"),
  p1: u("1494790108377-be9c29b29330"),
  p2: u("1507003211169-0a1dd7228f2d"),
  p3: u("1438761681033-6461ffad8d80"),
  p4: u("1500648767791-00dcc994a43e"),
  p5: u("1534528741775-53994a69daeb"),
  p6: u("1517841905240-472988babdf9"),
};

const days = (n: number, titles: string[]) =>
  Array.from({ length: n }, (_, i) => ({
    title: titles[i] ?? `Day ${i + 1} — At your own pace`,
    description:
      titles[i] !== undefined
        ? "Unhurried mornings, a private guide on call, and an evening that ends exactly where it should — with a view."
        : "A deliberately open day. Your concierge holds a short list of reservations should you want them.",
  }));

function rng(seed: number) {
  return () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

function demoCrm(): { leads: Lead[]; bookings: Booking[] } {
  const r = rng(42);
  const names = [
    "Aarav Mehta", "Isha Kapoor", "Rohan Verma", "Ananya Iyer", "Kabir Singh", "Meera Nair",
    "Vikram Rao", "Sara Thomas", "Dev Malhotra", "Priya Shah", "Arjun Menon", "Zoya Khan",
    "Neil D'Souza", "Tara Bhatt", "Rhea Joshi", "Aditya Sinha",
  ];
  const dests = ["Bali", "Santorini", "Maldives", "Kyoto", "Dolomites", "Iceland", "Rajasthan", "Cappadocia"];
  const sources = ["Website", "Instagram", "Referral", "Google Ads", "WhatsApp"];
  const statuses: LeadStatus[] = ["new", "new", "contacted", "qualified", "proposal", "won", "lost", "contacted"];
  const now = Date.now();
  const leads: Lead[] = names.slice(0, 14).map((name, i) => {
    const created = new Date(now - Math.floor(r() * 60) * 864e5 - Math.floor(r() * 864e5));
    const email = name.toLowerCase().replace(/[^a-z]+/g, ".") + "@mail.com";
    return {
      id: `lead_${i + 1}`,
      name,
      email,
      phone: `+91 98${Math.floor(10000000 + r() * 89999999)}`,
      destination: dests[i % dests.length],
      travelers: 1 + Math.floor(r() * 5),
      budget: ["₹1–2L", "₹2–4L", "₹4–8L", "₹8L+"][Math.floor(r() * 4)],
      travelDate: new Date(now + (20 + Math.floor(r() * 150)) * 864e5).toISOString().slice(0, 10),
      message: "Looking for a slow, well-paced itinerary with a couple of special dinners. Flexible on dates.",
      source: sources[Math.floor(r() * sources.length)],
      status: statuses[i % statuses.length],
      value: Math.round((150000 + r() * 650000) / 1000) * 1000,
      notes: i % 3 === 0 ? [{ at: created.toISOString(), text: "Called — prefers boutique stays over large resorts." }] : [],
      createdAt: created.toISOString(),
    };
  });

  const tours = [
    ["bali-slow-island", "Bali, Slowly", 124000],
    ["santorini-caldera-light", "Caldera Light — Santorini", 189000],
    ["maldives-overwater", "Overwater, Undisturbed", 265000],
    ["kyoto-quiet-seasons", "Kyoto in Quiet Seasons", 215000],
    ["dolomites-high-route", "The Dolomites High Route", 178000],
    ["iceland-aurora-circuit", "Aurora Circuit", 232000],
    ["rajasthan-royal-thread", "The Royal Thread", 98000],
    ["cappadocia-first-light", "First Light Over Cappadocia", 112000],
  ] as const;
  const bStatuses: BookingStatus[] = ["confirmed", "paid", "completed", "pending", "paid", "cancelled", "completed", "paid"];
  const bookings: Booking[] = Array.from({ length: 22 }, (_, i) => {
    const t = tours[Math.floor(r() * tours.length)];
    const travelers = 1 + Math.floor(r() * 4);
    const created = new Date(now - Math.floor(r() * 175) * 864e5);
    const name = names[Math.floor(r() * names.length)];
    return {
      id: `bk_${i + 1}`,
      ref: `VJ-${(4821 + i * 37).toString(36).toUpperCase()}`,
      tourSlug: t[0],
      tourTitle: t[1],
      name,
      email: name.toLowerCase().replace(/[^a-z]+/g, ".") + "@mail.com",
      phone: `+91 99${Math.floor(10000000 + r() * 89999999)}`,
      date: new Date(created.getTime() + (30 + Math.floor(r() * 90)) * 864e5).toISOString().slice(0, 10),
      travelers,
      total: t[2] * travelers,
      status: bStatuses[i % bStatuses.length],
      requests: i % 4 === 0 ? "Anniversary — a quiet table at sunset, please." : "",
      createdAt: created.toISOString(),
    };
  });
  return { leads, bookings };
}

export function createSeed(): DB {
  const { leads, bookings } = demoCrm();
  return {
    settings: {
      brand: {
        name: "Voyaj",
        tagline: "Travel, thoughtfully composed.",
        logoMark: "V",
        currency: "₹",
        locale: "en-IN",
        email: "hello@voyaj.travel",
        phone: "+91 98765 43210",
        whatsapp: "919876543210",
        address: "12 Marine Drive, Mumbai 400020, India",
        socials: [
          { label: "Instagram", href: "https://instagram.com" },
          { label: "YouTube", href: "https://youtube.com" },
          { label: "LinkedIn", href: "https://linkedin.com" },
          { label: "Pinterest", href: "https://pinterest.com" },
        ],
      },
      theme: { preset: "postcard", accent: "#0F6E5B", dark: "#1D2B26", paper: "#F4ECE0", radius: 6 },
      intro: {
        enabled: true,
        oncePerSession: true,
        duration: 3.2,
        words: ["Santorini", "Kyoto", "Bali", "Dolomites", "Reykjavík", "Jaipur", "Malé"],
        images: [IMG.santorini, IMG.kyoto, IMG.baliTemple, IMG.braiesBoat, IMG.aurora, IMG.jaipur, IMG.infinityPool],
        tagline: "Please keep your window shade up.",
      },
      hero: {
        layout: "cinematic",
        eyebrow: "Independent travel studio · Mumbai · Est. 2014",
        titleTop: "Leave the",
        titleAccent: "ordinary",
        titleBottom: "behind.",
        subtitle:
          "Private, design-led journeys to 40+ countries. Planned by people who have stood exactly where you'll stand.",
        slides: [
          { image: IMG.braiesBoat, caption: "Lago di Braies, Italy" },
          { image: IMG.santorini, caption: "Oia, Santorini" },
          { image: IMG.tanahLot, caption: "Tanah Lot, Bali" },
          { image: IMG.aurora, caption: "Vík, Iceland" },
          { image: IMG.kyoto, caption: "Higashiyama, Kyoto" },
        ],
        ctaLabel: "Plan my journey",
      },
      announcement: {
        enabled: true,
        text: "Winter departures to Iceland & Japan are open — 12% off till 30 Nov",
        href: "/tours",
      },
      nav: [
        { label: "Destinations", href: "/destinations", image: IMG.santorini },
        { label: "Journeys", href: "/tours", image: IMG.braiesBoat },
        { label: "Journal", href: "/journal", image: IMG.alley },
        { label: "Studio", href: "/about", image: IMG.flatlay },
        { label: "Contact", href: "/contact", image: IMG.airport },
      ],
      sections: {
        marquee: true,
        manifesto: true,
        destinations: true,
        tours: true,
        experiences: true,
        stats: true,
        process: true,
        testimonials: true,
        journal: true,
        faq: true,
        newsletter: true,
      },
      manifesto:
        "We don't sell trips. We compose them — slowly, by hand, around the way you like to wake up, eat, wander and rest. Fewer places, longer stays, better rooms, and someone who picks up the phone at 2 a.m.",
      stats: [
        { value: 12, suffix: "k+", label: "Travellers hosted" },
        { value: 48, suffix: "", label: "Countries composed" },
        { value: 4.9, suffix: "/5", label: "Average rating" },
        { value: 24, suffix: "/7", label: "Human concierge" },
      ],
      seo: {
        title: "Voyaj — Travel, thoughtfully composed",
        description:
          "Private, design-led journeys to Santorini, Kyoto, Bali, the Dolomites, Iceland and beyond. Tailor-made by an independent travel studio.",
      },
    },
    destinations: [
      { id: "d1", slug: "dolomites", name: "Dolomites", country: "Italy", region: "Europe", tagline: "Pale peaks, emerald lakes", description: "Jagged limestone towers glowing pink at dusk, rifugi serving polenta at 2,500 metres, and lakes so green they look edited.", image: IMG.braiesBoat, gallery: [IMG.braiesBoat, IMG.hikers, IMG.turquoiseLake], bestTime: "Jun – Sep", startingPrice: 178000, featured: true },
      { id: "d2", slug: "santorini", name: "Santorini", country: "Greece", region: "Europe", tagline: "White walls, blue hour", description: "Cliffside suites above a drowned volcano, wine from vines woven like baskets, and sunsets the whole island stops for.", image: IMG.santorini, gallery: [IMG.santorini, IMG.aerialBoats, IMG.palmBeach], bestTime: "May – Oct", startingPrice: 189000, featured: true },
      { id: "d3", slug: "bali", name: "Bali", country: "Indonesia", region: "Asia", tagline: "Temples in the mist", description: "Water temples, terraced rice and jungle villas in Ubud — then the slow coast of Uluwatu for the last few days.", image: IMG.baliTemple, gallery: [IMG.baliTemple, IMG.tanahLot, IMG.tropicalPool], bestTime: "Apr – Oct", startingPrice: 124000, featured: true },
      { id: "d4", slug: "kyoto", name: "Kyoto", country: "Japan", region: "Asia", tagline: "Lanterns & lacquer", description: "A thousand temples, ryokan baths, kaiseki counters and lantern-lit lanes in Gion after the crowds go home.", image: IMG.kyoto, gallery: [IMG.kyoto, IMG.alley], bestTime: "Mar – May, Oct – Nov", startingPrice: 215000, featured: true },
      { id: "d5", slug: "maldives", name: "Maldives", country: "Maldives", region: "Indian Ocean", tagline: "Overwater, undisturbed", description: "Seaplane arrivals, villas over a glass-clear lagoon, manta reefs at your doorstep and nothing on the agenda.", image: IMG.infinityPool, gallery: [IMG.infinityPool, IMG.scuba, IMG.lodgePool], bestTime: "Nov – Apr", startingPrice: 265000, featured: true },
      { id: "d6", slug: "iceland", name: "Iceland", country: "Iceland", region: "Europe", tagline: "Fire, ice & aurora", description: "Black-sand beaches, glacier caves, geothermal lagoons and — if the sky agrees — the northern lights overhead.", image: IMG.aurora, gallery: [IMG.aurora, IMG.highlands, IMG.backpackLake], bestTime: "Sep – Mar", startingPrice: 232000, featured: true },
      { id: "d7", slug: "rajasthan", name: "Rajasthan", country: "India", region: "Asia", tagline: "Palaces of the sun", description: "Pink-city bazaars, stepwells, desert camps under the stars and nights in palaces that are still family homes.", image: IMG.jaipur, gallery: [IMG.jaipur, IMG.taj, IMG.tajArch], bestTime: "Oct – Mar", startingPrice: 98000, featured: true },
      { id: "d8", slug: "cappadocia", name: "Cappadocia", country: "Türkiye", region: "Europe", tagline: "A sky full of balloons", description: "Cave hotels carved into fairy chimneys, dawn balloon flights and long lunches in valleys of soft volcanic stone.", image: IMG.cappadocia, gallery: [IMG.cappadocia, IMG.canyonRoad], bestTime: "Apr – Jun, Sep – Oct", startingPrice: 112000, featured: false },
      { id: "d9", slug: "halong-bay", name: "Hạ Long Bay", country: "Vietnam", region: "Asia", tagline: "Limestone & lagoons", description: "Junk-boat nights among 1,600 limestone islands, then lantern-lit Hội An and the food of Hà Nội.", image: IMG.halong, gallery: [IMG.halong, IMG.krabi], bestTime: "Oct – Apr", startingPrice: 89000, featured: false },
      { id: "d10", slug: "paris", name: "Paris", country: "France", region: "Europe", tagline: "The city, slowly", description: "Left-bank hotels, private museum hours and the kind of bistro you only find with a local.", image: IMG.eiffel, gallery: [IMG.eiffel, IMG.parisBridge], bestTime: "Apr – Jun, Sep", startingPrice: 165000, featured: false },
      { id: "d11", slug: "himalaya", name: "Himalaya", country: "Nepal", region: "Asia", tagline: "Above the clouds", description: "Teahouse treks, monasteries hung with prayer flags and the first light on Everest from a lodge balcony.", image: IMG.himalaya, gallery: [IMG.himalaya, IMG.aboveClouds], bestTime: "Mar – May, Oct – Nov", startingPrice: 96000, featured: false },
      { id: "d12", slug: "thailand", name: "Thailand", country: "Thailand", region: "Asia", tagline: "Longtails & golden temples", description: "Chiang Mai temples, Krabi's limestone coves and Bangkok's late-night kitchens.", image: IMG.krabi, gallery: [IMG.krabi, IMG.thaiTemple], bestTime: "Nov – Mar", startingPrice: 79000, featured: false },
    ],
    tours: [
      {
        id: "t1", slug: "dolomites-high-route", title: "The Dolomites High Route", destinationSlug: "dolomites", category: "Adventure", days: 8, price: 178000, oldPrice: 199000, rating: 4.9, reviews: 128, groupSize: "Private · 2–8", difficulty: "Moderate", image: IMG.braiesBoat, gallery: [IMG.braiesBoat, IMG.hikers, IMG.turquoiseLake, IMG.hikerValley],
        summary: "Hut-to-hut hiking with luggage transfers, a mountain guide and dinners in rifugi above the clouds.",
        highlights: ["Sunrise at Tre Cime di Lavaredo", "Row across Lago di Braies before the crowds", "Two nights in a design hotel in Val Gardena", "Private via ferrata session"],
        includes: ["7 nights boutique & rifugi stays", "Certified mountain guide", "Daily breakfast & 5 dinners", "Luggage transfers", "Airport pickup"],
        excludes: ["International flights", "Travel insurance", "Lift passes"],
        itinerary: days(8, ["Arrive in Cortina d'Ampezzo", "Lago di Braies at dawn", "Tre Cime circuit", "Into Alta Badia", "Rifugio Lagazuoi", "Seceda ridgeline", "Val Gardena spa day", "Farewell & depart"]),
        departures: ["2027-06-14", "2027-07-05", "2027-08-02", "2027-09-06"], featured: true, published: true,
      },
      {
        id: "t2", slug: "santorini-caldera-light", title: "Caldera Light — Santorini", destinationSlug: "santorini", category: "Luxury", days: 6, price: 189000, rating: 4.8, reviews: 96, groupSize: "Private · 2", difficulty: "Easy", image: IMG.santorini, gallery: [IMG.santorini, IMG.aerialBoats, IMG.palmBeach, IMG.infinityPool],
        summary: "Cave suites in Oia, a private catamaran to the hot springs and a winemaker's table in Pyrgos.",
        highlights: ["Private sunset catamaran", "Assyrtiko tasting with the winemaker", "Caldera-view cave suite", "Hidden beach day in Milos (optional)"],
        includes: ["5 nights cave suite", "Private transfers", "Catamaran charter", "Wine tasting", "Daily breakfast"],
        excludes: ["Flights", "Lunches & most dinners"],
        itinerary: days(6, ["Arrive into Oia", "Fira to Oia cliff walk", "Catamaran & hot springs", "Pyrgos & vineyards", "Beach day, Perivolos", "Depart"]),
        departures: ["2027-05-10", "2027-06-07", "2027-09-13"], featured: true, published: true,
      },
      {
        id: "t3", slug: "bali-slow-island", title: "Bali, Slowly", destinationSlug: "bali", category: "Wellness", days: 9, price: 124000, oldPrice: 139000, rating: 4.9, reviews: 211, groupSize: "Private · 2–6", difficulty: "Easy", image: IMG.baliTemple, gallery: [IMG.baliTemple, IMG.tanahLot, IMG.tropicalPool, IMG.lodgePool],
        summary: "Jungle villas in Ubud, a water-temple blessing, then the cliffs of Uluwatu for long, slow days.",
        highlights: ["Water purification at Tirta Empul", "Sunrise trek up Mount Batur", "Private chef dinner in a rice field", "Tanah Lot at sunset"],
        includes: ["8 nights villas", "Private driver-guide", "Daily breakfast", "Spa ritual", "Temple blessing"],
        excludes: ["Flights", "Visa on arrival"],
        itinerary: days(9, ["Arrive Denpasar → Ubud", "Rice terraces & Tegallalang", "Mount Batur sunrise", "Tirta Empul blessing", "Free day in Ubud", "To Uluwatu", "Beach clubs & cliffs", "Tanah Lot sunset", "Depart"]),
        departures: ["2027-04-12", "2027-05-17", "2027-07-19", "2027-08-23"], featured: true, published: true,
      },
      {
        id: "t4", slug: "kyoto-quiet-seasons", title: "Kyoto in Quiet Seasons", destinationSlug: "kyoto", category: "Culture", days: 7, price: 215000, rating: 5.0, reviews: 74, groupSize: "Small group · 8", difficulty: "Easy", image: IMG.kyoto, gallery: [IMG.kyoto, IMG.alley],
        summary: "Ryokan nights, a private tea ceremony, kaiseki counters and early temple hours before the city wakes.",
        highlights: ["Private tea ceremony in Uji", "Fushimi Inari at 6 a.m.", "Two nights in a historic ryokan", "Nara day with a deer-park picnic"],
        includes: ["6 nights hotels & ryokan", "JR pass", "Local guides", "3 kaiseki dinners"],
        excludes: ["Flights", "Visa"],
        itinerary: days(7, ["Arrive in Kyoto", "Higashiyama lanes", "Fushimi Inari & Uji tea", "Arashiyama bamboo", "Nara day trip", "Ryokan & onsen", "Depart"]),
        departures: ["2027-03-28", "2027-04-04", "2027-11-07", "2027-11-21"], featured: true, published: true,
      },
      {
        id: "t5", slug: "maldives-overwater", title: "Overwater, Undisturbed", destinationSlug: "maldives", category: "Honeymoon", days: 5, price: 265000, rating: 4.9, reviews: 152, groupSize: "Private · 2", difficulty: "Easy", image: IMG.infinityPool, gallery: [IMG.infinityPool, IMG.scuba, IMG.lodgePool, IMG.beachSunset],
        summary: "Seaplane in, overwater villa, manta snorkelling and a private sandbank dinner under the stars.",
        highlights: ["Seaplane transfer", "Overwater villa with pool", "Sandbank dinner for two", "Manta & turtle snorkel"],
        includes: ["4 nights overwater villa", "Full board", "Seaplane", "Couples spa"],
        excludes: ["International flights", "Green tax"],
        itinerary: days(5, ["Seaplane arrival", "House reef & spa", "Manta snorkel", "Sandbank dinner", "Depart"]),
        departures: ["2027-01-10", "2027-02-14", "2027-03-14"], featured: true, published: true,
      },
      {
        id: "t6", slug: "iceland-aurora-circuit", title: "Aurora Circuit", destinationSlug: "iceland", category: "Adventure", days: 7, price: 232000, rating: 4.8, reviews: 88, groupSize: "Small group · 10", difficulty: "Moderate", image: IMG.aurora, gallery: [IMG.aurora, IMG.highlands, IMG.backpackLake],
        summary: "Ring-road highlights in winter: ice caves, black-sand beaches, lagoons and nightly aurora watches.",
        highlights: ["Crystal ice-cave walk", "Jökulsárlón at golden hour", "Super-jeep aurora hunt", "Sky Lagoon ritual"],
        includes: ["6 nights lodges", "Super-jeep & guide", "Ice cave entry", "Breakfast daily"],
        excludes: ["Flights", "Lunches"],
        itinerary: days(7, ["Reykjavík arrival", "Golden Circle", "South coast & Vík", "Glacier lagoon", "Ice cave", "Lagoon day", "Depart"]),
        departures: ["2026-12-06", "2027-01-17", "2027-02-21"], featured: true, published: true,
      },
      {
        id: "t7", slug: "rajasthan-royal-thread", title: "The Royal Thread", destinationSlug: "rajasthan", category: "Culture", days: 8, price: 98000, rating: 4.7, reviews: 143, groupSize: "Private · 2–10", difficulty: "Easy", image: IMG.jaipur, gallery: [IMG.jaipur, IMG.taj, IMG.tajArch],
        summary: "Jaipur, Jodhpur and Udaipur by palace — with the Taj at sunrise and a night in the Thar dunes.",
        highlights: ["Taj Mahal at sunrise", "Block-printing with artisans", "Thar desert camp", "Lake Pichola boat at dusk"],
        includes: ["7 nights heritage hotels", "Private car & driver", "Expert guides", "Breakfast daily"],
        excludes: ["Flights", "Monument fees"],
        itinerary: days(8, ["Delhi → Agra", "Taj sunrise → Jaipur", "Amber Fort & bazaars", "To Jodhpur", "Mehrangarh & dunes", "To Udaipur", "Lake Pichola", "Depart"]),
        departures: ["2026-11-20", "2026-12-18", "2027-01-22", "2027-02-19"], featured: false, published: true,
      },
      {
        id: "t8", slug: "cappadocia-first-light", title: "First Light Over Cappadocia", destinationSlug: "cappadocia", category: "Honeymoon", days: 5, price: 112000, rating: 4.8, reviews: 67, groupSize: "Private · 2", difficulty: "Easy", image: IMG.cappadocia, gallery: [IMG.cappadocia, IMG.canyonRoad],
        summary: "Cave suites, a dawn balloon flight, pottery in Avanos and long lunches in the Rose Valley.",
        highlights: ["Private balloon basket", "Cave-hotel suite", "Underground city walk", "Sunset in Rose Valley"],
        includes: ["4 nights cave hotel", "Balloon flight", "Private guide", "Transfers"],
        excludes: ["Flights", "Dinners"],
        itinerary: days(5, ["Arrive Kayseri", "Balloon at dawn", "Underground cities", "Avanos & Rose Valley", "Depart"]),
        departures: ["2027-04-18", "2027-05-23", "2027-09-26"], featured: false, published: true,
      },
      {
        id: "t9", slug: "halong-hoi-an-drift", title: "Hạ Long & Hội An Drift", destinationSlug: "halong-bay", category: "Culture", days: 9, price: 89000, rating: 4.7, reviews: 59, groupSize: "Small group · 12", difficulty: "Easy", image: IMG.halong, gallery: [IMG.halong, IMG.krabi],
        summary: "Hà Nội street food, a night on a junk boat in Hạ Long Bay, and lantern-lit Hội An.",
        highlights: ["Overnight junk cruise", "Hà Nội food walk", "Tailor in Hội An", "My Son sanctuary"],
        includes: ["8 nights hotels & cruise", "Domestic flight", "Guides", "Breakfasts"],
        excludes: ["International flights", "Visa"],
        itinerary: days(9, ["Hà Nội arrival", "Old Quarter food", "To Hạ Long", "Bay & caves", "Fly to Đà Nẵng", "Hội An", "My Son", "Beach day", "Depart"]),
        departures: ["2027-02-07", "2027-03-07", "2027-10-10"], featured: false, published: true,
      },
      {
        id: "t10", slug: "everest-view-trek", title: "Everest View Trek", destinationSlug: "himalaya", category: "Adventure", days: 10, price: 96000, rating: 4.9, reviews: 81, groupSize: "Small group · 10", difficulty: "Challenging", image: IMG.himalaya, gallery: [IMG.himalaya, IMG.aboveClouds, IMG.tent],
        summary: "A shorter, gentler Khumbu trek with lodge comforts and Everest views from Tengboche.",
        highlights: ["Flight into Lukla", "Namche Bazaar", "Tengboche monastery", "Everest at sunrise"],
        includes: ["9 nights lodges", "Guide & porters", "Permits", "All meals on trek"],
        excludes: ["Flights to Kathmandu", "Gear"],
        itinerary: days(10, ["Kathmandu", "Fly to Lukla", "To Namche", "Acclimatise", "To Tengboche", "Sunrise views", "Descend", "To Lukla", "Kathmandu", "Depart"]),
        departures: ["2027-04-02", "2027-10-08", "2027-11-05"], featured: false, published: true,
      },
    ],
    posts: [
      { id: "p1", slug: "slow-travel-manifesto", title: "The case for fewer places and longer stays", excerpt: "Why three cities in ten days almost always beats seven — and how to plan a trip around how you want to feel.", content: "Most itineraries fail in the same way: too many beds, too many transfers, too little time to notice anything.\n\nWe build journeys the other way round. We start with how you want to feel on day four — rested, curious, a little lost in the right way — and work backwards.\n\nThat usually means fewer places, longer stays, and a guide who knows when to step back.\n\nTry it once. You'll come home with fewer photos and better stories.", cover: IMG.alley, category: "Philosophy", author: "Ira Sen", readTime: 6, date: "2026-10-12", published: true },
      { id: "p2", slug: "kyoto-before-sunrise", title: "Kyoto before sunrise: a 6 a.m. itinerary", excerpt: "Fushimi Inari, empty lanes in Higashiyama and the best breakfast counter in Nishiki — all before 9.", content: "Kyoto is a different city at 6 a.m.\n\nStart at Fushimi Inari while the gates are still blue with shadow. Walk up past the first viewpoint; most people turn around there.\n\nBy 7:30 head to Higashiyama — Ninenzaka and Sannenzaka will be yours alone.\n\nFinish with breakfast at a counter in Nishiki as the shutters go up.", cover: IMG.kyoto, category: "Guides", author: "Kenji Aoki", readTime: 5, date: "2026-09-28", published: true },
      { id: "p3", slug: "packing-light-luxury", title: "Packing light, travelling well", excerpt: "A carry-on list refined over 300 trips — and the three things we never travel without.", content: "One carry-on, one tote. That's it.\n\nPack around a palette of three colours and everything works together. Bring one excellent layer, not three average ones.\n\nAnd always: a silk eye mask, a universal adapter, and a small notebook.", cover: IMG.flatlay, category: "Tips", author: "Ira Sen", readTime: 4, date: "2026-09-02", published: true },
      { id: "p4", slug: "aurora-chasing-guide", title: "How to actually see the northern lights", excerpt: "Clear skies, dark nights and a little patience — the honest guide to chasing aurora in Iceland.", content: "Aurora forecasts are probabilities, not promises.\n\nGive yourself at least four nights, stay outside the city, and keep a flexible evening schedule.\n\nThe best shows often arrive after midnight — so nap after dinner.", cover: IMG.aurora, category: "Guides", author: "Elin Jóns", readTime: 7, date: "2026-08-19", published: true },
      { id: "p5", slug: "honeymoon-islands", title: "Five islands for a quieter honeymoon", excerpt: "Beyond the obvious: islands where the only queue is for the sunset.", content: "From the Maldives' southern atolls to the Greek islands most people sail past, here are our favourite places to disappear for two.", cover: IMG.palmBeach, category: "Inspiration", author: "Maya Rao", readTime: 5, date: "2026-07-30", published: true },
      { id: "p6", slug: "dolomites-rifugi", title: "A night in a rifugio, explained", excerpt: "Mountain huts, shared tables, polenta and the best sunrise of your life.", content: "Rifugi are mountain huts — but many are closer to tiny inns. Book early, bring a sleeping liner, and order the local wine.", cover: IMG.hikers, category: "Guides", author: "Luca Bern", readTime: 4, date: "2026-07-11", published: true },
    ],
    testimonials: [
      { id: "r1", name: "Ananya & Rohit", location: "Bengaluru", avatar: IMG.p1, quote: "Every single detail was considered — the sunset table in Oia had our names on it before we even asked. It felt like travelling with a friend who knows everyone.", trip: "Caldera Light — Santorini", rating: 5 },
      { id: "r2", name: "Karan Malhotra", location: "Delhi", avatar: IMG.p2, quote: "The Dolomites route was perfectly paced. Hard days, then a spa. I've never been this fit or this well-fed on a holiday.", trip: "The Dolomites High Route", rating: 5 },
      { id: "r3", name: "Sophie Laurent", location: "Paris", avatar: IMG.p3, quote: "Kyoto at 6 a.m. with no one else around — I still think about that morning. Voyaj plans trips the way I wish I could.", trip: "Kyoto in Quiet Seasons", rating: 5 },
      { id: "r4", name: "Arjun Nair", location: "Mumbai", avatar: IMG.p4, quote: "Our flight got cancelled at midnight. By 12:20 we had a new route, a hotel and a car waiting. That's the real luxury.", trip: "Aurora Circuit", rating: 5 },
      { id: "r5", name: "Meher Kapoor", location: "Pune", avatar: IMG.p5, quote: "Honeymoon in the Maldives, zero stress, zero upsells. The sandbank dinner was unreal.", trip: "Overwater, Undisturbed", rating: 5 },
      { id: "r6", name: "Tanya Iyer", location: "Chennai", avatar: IMG.p6, quote: "Bali, slowly — exactly as promised. The rice-field dinner is the best meal I've had anywhere.", trip: "Bali, Slowly", rating: 5 },
    ],
    faqs: [
      { id: "f1", question: "Are all your journeys private?", answer: "Most are fully private and tailor-made. A few — like Kyoto in Quiet Seasons — run as small groups of up to 10, always with a private-trip option." },
      { id: "f2", question: "Can you customise an itinerary?", answer: "Always. Every listed journey is a starting point. Change the dates, pace, hotels or add destinations — your planner rebuilds it within 48 hours." },
      { id: "f3", question: "Do you book flights and visas?", answer: "Yes. We can handle international and domestic flights, and our visa desk guides you through documentation for every destination we cover." },
      { id: "f4", question: "What is your payment and cancellation policy?", answer: "A 20% deposit confirms your journey. The balance is due 45 days before departure. Cancellations up to 60 days before are fully refundable, minus non-refundable supplier costs." },
      { id: "f5", question: "Is travel insurance included?", answer: "Insurance isn't included by default, but we strongly recommend it and can arrange comprehensive cover through our partners." },
      { id: "f6", question: "What happens if something goes wrong mid-trip?", answer: "You'll have a 24/7 concierge on WhatsApp — a real person, not a bot — who can rebook, reroute or rescue at any hour." },
    ],
    experiences: [
      { id: "e1", title: "Honeymoons", subtitle: "Islands, cliffs & candlelight", image: IMG.infinityPool, count: "24 journeys" },
      { id: "e2", title: "Adventure", subtitle: "Peaks, glaciers & trails", image: IMG.hikerValley, count: "31 journeys" },
      { id: "e3", title: "Culture", subtitle: "Temples, palaces & kitchens", image: IMG.tajArch, count: "28 journeys" },
      { id: "e4", title: "Wellness", subtitle: "Retreats & slow stays", image: IMG.tropicalPool, count: "17 journeys" },
      { id: "e5", title: "Wild & remote", subtitle: "Off-grid & under canvas", image: IMG.tent, count: "12 journeys" },
    ],
    leads,
    bookings,
    subscribers: [
      { id: "s1", email: "hello.traveller@mail.com", createdAt: new Date(Date.now() - 5 * 864e5).toISOString() },
      { id: "s2", email: "wander@mail.com", createdAt: new Date(Date.now() - 12 * 864e5).toISOString() },
      { id: "s3", email: "slowtrips@mail.com", createdAt: new Date(Date.now() - 20 * 864e5).toISOString() },
    ],
  };
}
