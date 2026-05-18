import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { topics, getTopicBySlug } from "@/lib/topics"

export function generateStaticParams() {
  return topics.map((t) => ({ slug: t.slug }))
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return params.then(({ slug }) => {
    const topic = getTopicBySlug(slug)
    return { title: topic ? `${topic.title} – IMX Showcase` : "Not Found" }
  })
}

export default async function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const topic = getTopicBySlug(slug)

  if (!topic) {
    notFound()
  }

  return (
    <main className="w-full bg-white dark:bg-gray-950 min-h-screen">
      <div className="max-w-[1400px] mx-auto py-6 px-4 md:px-8">
        {/* Back button + title */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/"
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
            Back
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
            {topic.title}
          </h1>
        </div>

        {/* Slides */}
        <div className="flex flex-col gap-6">
          {topic.extraImages?.map((src, i) => (
            <div
              key={`extra-${i}`}
              className="w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm"
            >
              <Image
                src={src}
                alt={`${topic.title} – Overview`}
                width={1440}
                height={810}
                className="w-full h-auto"
                sizes="(max-width: 1400px) 100vw, 1400px"
              />
            </div>
          ))}
          {topic.slides.map((slideNum) => (
            <div
              key={slideNum}
              className="w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm"
            >
              <Image
                src={`/slides/slide-${String(slideNum).padStart(2, "0")}.png`}
                alt={`${topic.title} – Slide ${slideNum}`}
                width={1440}
                height={810}
                className="w-full h-auto"
                sizes="(max-width: 1400px) 100vw, 1400px"
              />
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
