import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Imprint | IMX Federated Catalog',
  description: 'Imprint information for the IMX Federated Catalog experience.',
}

export default function ImprintPage() {
  return (
    <div className="container mx-auto max-w-3xl space-y-4 px-4 py-12 text-foreground">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to catalog
      </Link>
      <h1 className="text-3xl font-semibold">Imprint</h1>
      <p>
        Orbiter Dataspaces GmbH
        <br />
        Federated Credential Catalog Team
        <br />
        Sample Street 1
        <br />
        12345 Berlin, Germany
      </p>
      <p>
        Email: <a href="mailto:info@orbiter-dataspaces.example" className="text-primary underline">info@orbiter-dataspaces.example</a>
      </p>
      <p className="text-sm text-muted-foreground">
        This imprint provides legally required information about the owners and operators of the IMX Federated
        Catalog. Replace the placeholder data with the official company information before going to production.
      </p>
    </div>
  )
}
