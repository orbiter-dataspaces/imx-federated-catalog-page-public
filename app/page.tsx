import Image from "next/image"
import Link from "next/link"

type GridItem = {
  image: string
  label: string
  slug?: string
  href?: string
}

const overviewItems: GridItem[] = [
  { image: "/slide9/slide9_Grafik_23.png", label: "International Manufacturing-X", slug: "international-manufacturing-x" },
  { image: "/slide9/slide9_Grafik_29.png", label: "Standards & MX-Port", slug: "standards-mx-port" },
  { image: "/slide9/slide9_Grafik_51.png", label: "Reference Architecture Models", slug: "reference-architecture-models" },
  { image: "/slide9/slide9_Grafik_64.png", label: "The Showcase", slug: "the-showcase" },
]

const useCaseItems: GridItem[] = [
  { image: "/slide9/slide9_Grafik_5.png", label: "Digital Battery Passport", slug: "digital-battery-passport" },
  { image: "/slide9/slide9_Grafik_10.png", label: "Ski Maintenance", slug: "ski-maintenance" },
  { image: "/slide9/slide9_edge_ai.png", label: "Edge AI Management", slug: "edge-ai-management" },
  { image: "/slide9/slide9_Grafik_68.png", label: "Shopfloor Management", slug: "shopfloor-management" },
]

const catalogueItems: GridItem[] = [
  { image: "/slide9/slide9_Grafik_46.png", label: "Service Catalogue", href: "/vc-catalog?useCase=battery-passport" },
  { image: "/slide9/slide9_Grafik_27.png", label: "Service Catalogue", href: "/vc-catalog?useCase=ski-maintenance" },
  { image: "/slide9/slide9_Grafik_66.png", label: "Federated Trust", slug: "/vc-catalog" },
]

const applicationItems: GridItem[] = [
  { image: "/slide9/slide9_Grafik_39.png", label: "DBP Viewer" },
  { image: "/slide9/slide9_Picture_87.png", label: "ONCITE" },
  { image: "/slide9/slide9_Grafik_9.png", label: "Explitia App", href: "https://portal.imx.explitia.com/web-hmi/?inst=1" },
  { image: "/slide9/slide9_Grafik_45.png", label: "Nestfield PCF", href: "http://1.214.117.234:20485/" },
  { image: "/slide9/slide9_Grafik_13.png", label: "R-Strategy App", href: "https://rstrategy.lmsupatras.gr/" },
  { image: "/slide9/slide9_Grafik_31.png", label: "DBP Process Flow", href: "https://lnihm26.cpone.conplement.cloud/" },
  { image: "/slide9/slide9_Grafik_20.png", label: "Ski Maintenance", href: "https://repair.imx.vactory-projects.com/login" },
  { image: "/slide9/slide9_Grafik_33.png", label: "Edge Management System" },
  { image: "/slide9/slide9_Grafik_68.png", label: "Shopfloor Management", href: "https://dataspace.demo-co2monitoring.com/factoryx" },
  { image: "/valeo.png", label: "Valeo", href: "https://portal.valeo.data4industry-x.com/members/login" },
]

function SidebarIcon({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="flex items-center justify-center w-12 h-12 md:w-16 md:h-16">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="w-8 h-8 md:w-10 md:h-10 opacity-60" />
    </div>
  )
}

// GridCard renders a clickable image+label tile. Items with `href` are external or internal links;
// items with `slug` route to /topic/<slug> (or directly if slug starts with "/").
function GridCard({ item }: { item: GridItem }) {
  const content = (
    <div className="flex flex-col items-center gap-2 p-2 md:p-3 rounded-xl transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800 group cursor-pointer">
      <div className="relative w-24 h-16 md:w-36 md:h-24 lg:w-44 lg:h-28">
        <Image
          src={item.image}
          alt={item.label || "grid item"}
          fill
          className="object-contain rounded-lg"
          sizes="(max-width: 768px) 96px, (max-width: 1024px) 144px, 176px"
        />
      </div>
      {item.label && (
        <span className="text-xs md:text-sm text-center font-medium text-gray-700 dark:text-gray-300 leading-tight">
          {item.label}
        </span>
      )}
    </div>
  )

  if (item.href) {
    const isExternal = item.href.startsWith("http")
    if (isExternal) {
      return (
        <a href={item.href} target="_blank" rel="noopener noreferrer">
          {content}
        </a>
      )
    }
    return <Link href={item.href}>{content}</Link>
  }
  if (item.slug) {
    const href = item.slug.startsWith("/") ? item.slug : `/topic/${item.slug}`
    return <Link href={href}>{content}</Link>
  }
  return content
}

function SectionRow({
  icon,
  label,
  items,
  className = "",
}: {
  icon: string
  label: string
  items: GridItem[]
  className?: string
}) {
  return (
    <div className={`grid grid-cols-[60px_1fr] md:grid-cols-[80px_1fr] ${className}`}>
      {/* Sidebar cell */}
      <div className="flex flex-col items-center justify-center gap-1 border-r border-[#76B831] py-4 px-1">
        <SidebarIcon src={icon} alt={label} />
        <span className="text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 text-center leading-tight">
          {label}
        </span>
      </div>
      {/* Content grid */}
      <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 lg:gap-6 py-4 px-2 md:px-6">
        {items.map((item, i) => (
          <GridCard key={i} item={item} />
        ))}
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <main className="w-full bg-white dark:bg-gray-950">
      {/* Banner */}
      <div className="w-full bg-white">
        <Image
          src="/hm26-showcase-logowall.png"
          alt="HM26 Showcase Logowall"
          width={1920}
          height={300}
          priority
          className="w-full h-auto"
        />
      </div>

      <div className="max-w-[1400px] mx-auto border border-[#76B831] rounded-lg overflow-hidden my-4 md:my-8">
        {/* Overview — 4-column grid */}
        <div className="grid grid-cols-[60px_1fr] md:grid-cols-[80px_1fr]">
          <div className="flex flex-col items-center justify-center gap-1 border-r border-[#76B831] py-4 px-1">
            <SidebarIcon src="/slide9/sidebar_icon_31.svg" alt="Overview" />
            <span className="text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 text-center leading-tight">
              Overview
            </span>
          </div>
          <div className="grid grid-cols-4 py-4 px-2 md:px-6">
            {overviewItems.map((item, i) => (
              <div key={i} className="flex items-center justify-center">
                <GridCard item={item} />
              </div>
            ))}
          </div>
        </div>

        <hr className="border-[#76B831]" />

        {/* Use cases — 4-column grid */}
        <div className="grid grid-cols-[60px_1fr] md:grid-cols-[80px_1fr]">
          <div className="flex flex-col items-center justify-center gap-1 border-r border-[#76B831] py-4 px-1">
            <SidebarIcon src="/slide9/sidebar_icon_32.svg" alt="Use cases" />
            <span className="text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 text-center leading-tight">
              Use cases
            </span>
          </div>
          <div className="grid grid-cols-4 py-4 px-2 md:px-6">
            {useCaseItems.map((item, i) => (
              <div key={i} className="flex items-center justify-center">
                <GridCard item={item} />
              </div>
            ))}
          </div>
        </div>

        <hr className="border-[#76B831]" />

        {/* Catalogues — aligned under use cases */}
        <div className="grid grid-cols-[60px_1fr] md:grid-cols-[80px_1fr]">
          <div className="flex flex-col items-center justify-center gap-1 border-r border-[#76B831] py-4 px-1">
            <SidebarIcon src="/slide9/sidebar_icon_33.svg" alt="Catalogues" />
            <span className="text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 text-center leading-tight">
              Catalogues
            </span>
          </div>
          <div className="grid grid-cols-4 py-4 px-2 md:px-6">
            <div className="flex items-center justify-center">
              <GridCard item={catalogueItems[0]} />
            </div>
            <div className="flex items-center justify-center">
              <GridCard item={catalogueItems[1]} />
            </div>
            {/* col-span-2: Federated Trust fills the last 2 columns to balance the 4-column grid */}
            <div className="col-span-2 flex items-center justify-center">
              <GridCard item={catalogueItems[2]} />
            </div>
          </div>
        </div>

        <hr className="border-[#76B831]" />

        {/* Applications */}
        <SectionRow
          icon="/slide9/sidebar_icon_34.svg"
          label="Applications"
          items={applicationItems}
          className="border-b-0"
        />
      </div>
    </main>
  )
}
