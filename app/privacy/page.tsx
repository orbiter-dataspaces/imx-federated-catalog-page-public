import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Privacy Policy | IMX Federated Catalog',
  description: 'Privacy information for the IMX Federated Catalog experience.',
}

export default function PrivacyPage() {
  return (
    <div className="container mx-auto max-w-3xl space-y-4 px-4 py-12 text-foreground">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to catalog
      </Link>
      <h1 className="text-3xl font-semibold">Privacy Policy</h1>
      <p>
        We collect only the minimum technical information required to deliver the IMX Federated Catalog experience.
        No personal data is persisted unless explicitly stated otherwise. Analytics events are aggregated and
        anonymized through Vercel Analytics to improve product quality.
      </p>
      <p>
        For data access requests or additional questions, contact us at{' '}
        <a href="mailto:privacy@orbiter-dataspaces.example" className="text-primary underline">
          privacy@orbiter-dataspaces.example
        </a>
        .
      </p>
      <p className="text-sm text-muted-foreground">
        Replace the placeholder messaging with your official privacy policy text to comply with regional regulations
        before launching to production.
      </p>
    </div>
  )
}
