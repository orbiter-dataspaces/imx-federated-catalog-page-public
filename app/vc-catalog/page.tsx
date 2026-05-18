"use client"

import { Suspense, useEffect, useState, useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter, useSearchParams } from "next/navigation"

const countryFlags: Record<string, string> = {
  DE: "de", FR: "fr", JP: "jp", KR: "kr", CA: "ca", US: "us",
  CN: "cn", GB: "gb", IT: "it", ES: "es", NL: "nl", SE: "se",
  AT: "at", CH: "ch", AU: "au", BR: "br", IN: "in", PL: "pl",
}

function CountryFlag({ code, country }: { code: string; country: string }) {
  if (!code) return <span>{country}</span>
  return (
    <span className="inline-flex items-center gap-1">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://flagcdn.com/20x15/${code}.png`}
        srcSet={`https://flagcdn.com/40x30/${code}.png 2x`}
        width={20}
        height={15}
        alt={country}
        className="inline-block"
      />
      {country}
    </span>
  )
}

type CredRow = {
  name: string
  country: string
  flag: string
  credType: string
  issuer: string
  endpoint: string
  useCase: string
}

function extractCredType(types: unknown, filename: string): string {
  if (Array.isArray(types)) {
    const imxType = (types as string[]).find(t => t.startsWith("imx:"))
    if (imxType) return imxType.replace("imx:", "").replace("Credential", "")
  }
  // fallback: extract from filename (e.g. "Nestfield.Provider.json" -> "Provider")
  const parts = filename.replace(".json", "").split(".")
  if (parts.length >= 2) return parts[parts.length - 1]
  return ""
}

// Duplicated from components/credential-catalog.tsx — same logic, keep in sync when adding use cases.
function getUseCase(c: Record<string, unknown>): string {
  const cs = (c.credentialSubject as Record<string, unknown>) ?? {}
  const useCases = cs["imx:supportedUseCases"] as string[] | undefined
  if (useCases?.includes("imx:SkiMaintenanceUseCase")) return "ski-maintenance"
  if (useCases?.includes("imx:BatteryPassportUseCase")) return "battery-passport"
  // Fallback heuristics for older credentials without imx:supportedUseCases
  const uid = ((c.__uid as string) ?? (c.__source as string) ?? "").toLowerCase()
  const id = ((c.id as string) ?? "").toLowerCase()
  if (uid.startsWith("skimaintenance") || id.includes("ski-maintenance")) return "ski-maintenance"
  if (uid.startsWith("nestfield") || uid.startsWith("data4industryx") || uid.startsWith("rcei") || uid.startsWith("toshiba") || uid.startsWith("fujitsu") || uid.startsWith("nttdomocobusiness") || id.includes("battery") || id.includes("dpp") || id.includes("pcf")) return "battery-passport"
  return "other"
}

function TablePageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [rows, setRows] = useState<CredRow[]>([])
  const initialUseCase = searchParams.get("useCase") ?? "all"
  const [useCaseFilter, setUseCaseFilter] = useState<string>(initialUseCase)

  useEffect(() => {
    let mounted = true
    fetch("/api/credentials")
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return
        const creds: Array<Record<string, unknown>> = Array.isArray(data.credentials) ? data.credentials : []

        // Provider credentials contain gx:registrationNumber with a countryCode.
        // Build an issuer DID → country code map so that Application/Service credentials
        // issued by the same DID can also display a flag without repeating the field.
        const issuerCountry: Record<string, string> = {}
        for (const c of creds) {
          const cs = (c.credentialSubject as Record<string, unknown>) ?? {}
          const reg = (cs["gx:registrationNumber"] as Record<string, unknown>) ?? {}
          const cc = (reg["gx:countryCode"] as string) ?? ""
          const iss = typeof c.issuer === "string" ? c.issuer : ""
          if (cc && iss) issuerCountry[iss] = cc
        }

        const built: CredRow[] = creds.map((c) => {
          const filename = (c.__source as string) ?? ""
          const cs = (c.credentialSubject as Record<string, unknown>) ?? {}
          const name = (cs["schema:name"] as string) ?? (cs["name"] as string) ?? filename.replace(".json", "")
          const reg = (cs["gx:registrationNumber"] as Record<string, unknown>) ?? {}
          const countryCode = (reg["gx:countryCode"] as string) || (typeof c.issuer === "string" ? issuerCountry[c.issuer] ?? "" : "")
          const flag = countryFlags[countryCode] ?? ""
          const credType = extractCredType(c.type, filename)
          const issuer = typeof c.issuer === "string" ? c.issuer : ""
          const rawEp = (cs["imx:endPoint"] as string) ?? ""
          // Exclude placeholder values: URLs containing "example." and the literal "anyurl"
          const endpoint = /^https?:\/\/(?!.*example\.)/.test(rawEp) && rawEp.toLowerCase() !== "anyurl" ? rawEp : ""
          const useCase = getUseCase(c)
          return { name, country: countryCode, flag, credType, issuer, endpoint, useCase }
        }).filter((r) => r.credType !== "Compliance" && r.credType !== "ComplianceCredential")
        setRows(built)
      })
      .catch(() => {})
    return () => { mounted = false }
  }, [])

  const filteredRows = useMemo(() => {
    if (useCaseFilter === "all") return rows
    return rows.filter((r) => r.useCase === useCaseFilter)
  }, [rows, useCaseFilter])

  return (
    <main className="w-full min-h-screen bg-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            onClick={() => router.push("/")}
            className="text-black border-gray-300"
          >
            ← Back
          </Button>
          <h1 className="text-xl md:text-3xl font-bold text-black">Trusted Services & Devices Catalog</h1>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <span className="text-sm font-medium text-black">Use Case:</span>
          <Select value={useCaseFilter} onValueChange={setUseCaseFilter}>
            <SelectTrigger className="w-[220px] bg-white text-black border-gray-300">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="battery-passport">Digital Battery Passport</SelectItem>
              <SelectItem value="ski-maintenance">Ski Maintenance</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow className="bg-white">
                <TableHead className="text-black font-semibold">Name</TableHead>
                <TableHead className="text-black font-semibold">Country</TableHead>
                <TableHead className="text-black font-semibold">Type</TableHead>
                <TableHead className="text-black font-semibold">Issuer</TableHead>
                <TableHead className="text-black font-semibold">Endpoint</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRows.map((row, index) => (
                <TableRow key={index} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                  <TableCell className="text-black font-medium">{row.name}</TableCell>
                  <TableCell className="text-black text-lg" title={row.country}>
                    <CountryFlag code={row.flag} country={row.country} />
                  </TableCell>
                  <TableCell className="text-black">{row.credType}</TableCell>
                  <TableCell className="text-black text-sm break-all">{row.issuer}</TableCell>
                  <TableCell className="text-black text-sm">
                    {row.endpoint ? (
                      <a
                        href={row.endpoint}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline break-all"
                      >
                        {row.endpoint}
                      </a>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden flex flex-col gap-3">
          {filteredRows.map((row, index) => (
            <div key={index} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-black">{row.name}</span>
                <span className="text-lg" title={row.country}><CountryFlag code={row.flag} country={row.country} /></span>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <div><span className="font-medium text-black">Type:</span> {row.credType}</div>
                <div className="break-all"><span className="font-medium text-black">Issuer:</span> {row.issuer}</div>
                <div className="break-all">
                  <span className="font-medium text-black">Endpoint:</span>{" "}
                  {row.endpoint ? (
                    <a href={row.endpoint} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {row.endpoint}
                    </a>
                  ) : "—"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}

export default function TablePage() {
  return (
    <Suspense fallback={<main className="w-full min-h-screen bg-white p-8"><p className="text-black">Loading catalog…</p></main>}>
      <TablePageContent />
    </Suspense>
  )
}
