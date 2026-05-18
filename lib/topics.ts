export type Topic = {
  slug: string
  title: string
  // 1-based slide numbers that map to /public/slides/slide{N}.png (extracted from the HM26 deck)
  slides: number[]
  // Optional extra images shown before the slide range — used when a topic needs an image
  // that isn't in the main slide sequence (e.g. a custom intro graphic)
  extraImages?: string[]
}

export const topics: Topic[] = [
  // Overview
  {
    slug: "international-manufacturing-x",
    title: "International Manufacturing-X",
    slides: [10, 11, 12, 13, 14, 15],
  },
  {
    slug: "standards-mx-port",
    title: "Standards & MX-Port",
    slides: [16, 17, 18, 19, 20, 21, 22],
  },
  {
    slug: "reference-architecture-models",
    title: "Reference Architecture Models",
    slides: [23],
  },
  {
    slug: "the-showcase",
    title: "The Showcase",
    slides: [24, 25, 26, 27, 28],
  },
  // Use Cases
  {
    slug: "digital-battery-passport",
    title: "Digital Battery Passport",
    slides: [29, 30, 31, 32],
    extraImages: ["/slides/battery-first-image.png"],
  },
  {
    slug: "ski-maintenance",
    title: "Ski Maintenance",
    slides: [33, 34, 35, 36, 37, 38, 39, 40, 41],
  },
  {
    slug: "edge-ai-management",
    title: "Edge AI Management",
    slides: [42, 43],
  },
  {
    slug: "shopfloor-management",
    title: "Shopfloor Management",
    slides: [43],
  },
  // Catalogues
  {
    slug: "service-catalogue",
    title: "Service Catalogue",
    slides: [45, 46],
  },
  {
    slug: "federated-trust",
    title: "Federated Trust",
    slides: [44, 45, 46, 47],
  },
]

export function getTopicBySlug(slug: string): Topic | undefined {
  return topics.find((t) => t.slug === slug)
}
