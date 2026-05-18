"use client"

import { useState, useEffect, useMemo, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Search, Shield, CheckCircle2, Clock, ExternalLink, Copy, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ThemeToggle } from "@/components/theme-toggle"

type VC = {
  id?: string
  type?: string[] | string
  issuer?: Record<string, unknown> | string
  credentialSubject?: Record<string, unknown>
  status?: string
  validFrom?: string | null
  validUntil?: string | null
  rawCredential?: Record<string, unknown>
  [key: string]: unknown
}

function CredentialCatalogContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [useCaseFilter, setUseCaseFilter] = useState<string>("all")
  const [credentials, setCredentials] = useState<VC[] | null>(null)

  useEffect(() => {
    let mounted = true
    fetch("/api/credentials")
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return
        const creds = Array.isArray(data.credentials) ? data.credentials : []
        const normalized = creds.map((c: unknown, i: number) => {
          if (!c || typeof c === "string") return { id: `cred-${i}`, __uid: `file-${i}`, rawCredential: c }
          const obj = c as Record<string, unknown>
          const issuerObj = (obj.issuer as Record<string, unknown> | undefined)
          const credSubObj = (obj.credentialSubject as Record<string, unknown> | undefined)
          const id = (obj.id as string) || (obj["@id"] as string) || (issuerObj && (issuerObj["id"] as string)) || (credSubObj && (credSubObj["id"] as string)) || `cred-${i}`
          // prefer API-supplied __uid (filename) when available
          const uid = (obj.__uid as string) || (obj.__source as string) || `file-${i}`
          return { ...(obj as Record<string, unknown>), id, __uid: uid }
        })
        setCredentials(normalized)
      })
      .catch(() => setCredentials([]))
    return () => { mounted = false }
  }, [])

  // derive selected credential from URL + loaded credentials at render time

  // ?filterId= locks the view to a single credential by its in-content id. Used when
  // an external page deep-links to a specific credential (different from ?credentialId=
  // which selects a credential for the detail view using __uid / filename).
  const activeFilterId = searchParams.get("filterId")
  const issuerToString = (iss: Record<string, unknown> | string | undefined) => {
    if (!iss) return ""
    if (typeof iss === "string") return iss
    const maybeName = iss["name"] as string | undefined
    if (maybeName) return maybeName
    try { return JSON.stringify(iss) } catch { return "" }
  }

  const getSubjectId = (vc: VC) => {
    if (!vc) return undefined
    const sub = vc.credentialSubject as Record<string, unknown> | undefined
    return (sub && (sub["id"] as string | undefined)) || undefined
  }

  const getSubjectName = (vc: VC) => {
    if (!vc) return undefined
    const sub = vc.credentialSubject as Record<string, unknown> | undefined
    return (sub && ((sub["schema:name"] as string | undefined) || (sub["name"] as string | undefined))) || undefined
  }

  const getUseCase = (vc: VC): string => {
    const sub = vc.credentialSubject as Record<string, unknown> | undefined
    const useCases = sub?.["imx:supportedUseCases"] as string[] | undefined
    // Prefer the structured field when present
    if (useCases?.includes("imx:SkiMaintenanceUseCase")) return "ski-maintenance"
    if (useCases?.includes("imx:BatteryPassportUseCase")) return "battery-passport"
    // Older credentials may lack imx:supportedUseCases; fall back to filename/id heuristics.
    // The specific filename prefixes below are the known IMX participant credential files.
    const uid = (vc.__uid as string) || ""
    const id = (vc.id as string) || ""
    if (uid.toLowerCase().startsWith("skimaintenance") || id.toLowerCase().includes("ski-maintenance")) return "ski-maintenance"
    if (uid.toLowerCase().startsWith("nestfield") || uid.toLowerCase().startsWith("data4industryx") || uid.toLowerCase().startsWith("rcei") || uid.toLowerCase().startsWith("toshiba") || uid.toLowerCase().startsWith("fujitsu") || uid.toLowerCase().startsWith("nttdomocobusiness") || id.toLowerCase().includes("battery") || id.toLowerCase().includes("dpp") || id.toLowerCase().includes("pcf")) return "battery-passport"
    return "other"
  }

  

  const filteredCredentials = (credentials || []).filter((vc) => {
    if (activeFilterId) return vc.id === activeFilterId
    const q = searchQuery.toLowerCase()

    const matchesSearch =
      (vc.id || "").toString().toLowerCase().includes(q) ||
      issuerToString(vc.issuer).toLowerCase().includes(q) ||
      ((getSubjectId(vc)) || "").toString().toLowerCase().includes(q) ||
      (Array.isArray(vc.type) ? vc.type.join(" ") : vc.type || "").toString().toLowerCase().includes(q)

    const matchesStatus = statusFilter === "all" || vc.status === statusFilter
    const matchesType = typeFilter === "all" || (vc.type && (Array.isArray(vc.type) ? vc.type.includes(typeFilter) : vc.type === typeFilter))
    const matchesUseCase = useCaseFilter === "all" || getUseCase(vc) === useCaseFilter
    return matchesSearch && matchesStatus && matchesType && matchesUseCase
  })

  // ?credentialId= switches to the detail view. The value is the __uid (filename, preferred)
  // or the in-content id; we try both because older links may use the content id directly.
  const detailId = searchParams.get("credentialId")
  const selectedCredential = useMemo(() => {
    if (!credentials) return null
    if (!detailId) return null
    const decoded = (() => {
      try { return decodeURIComponent(detailId) } catch { return detailId }
    })()
    return credentials.find((c) => (c.__uid as string | undefined) === detailId || (c.__uid as string | undefined) === decoded || c.id === detailId || c.id === decoded) ?? null
  }, [credentials, detailId])

  const getStatusBadge = (status: string | undefined) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-primary/20 text-primary hover:bg-primary/30">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Active
          </Badge>
        )
      case "expiring-soon":
        return (
          <Badge className="bg-accent/20 text-accent hover:bg-accent/30">
            <Clock className="h-3 w-3 mr-1" />
            Expiring Soon
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status ?? "unknown"}</Badge>
    }
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "No expiration"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const copyToClipboard = (text: string) => void navigator.clipboard.writeText(text)

  if (!credentials) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Loading credentials…</p></div>

  if (selectedCredential) {
    const subject = (selectedCredential.credentialSubject as Record<string, unknown>) || ((selectedCredential.rawCredential as Record<string, unknown> | undefined)?.["credentialSubject"] as Record<string, unknown> | undefined) || {}
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-6 lg:px-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Button variant="ghost" size="sm" onClick={() => { router.push('/catalog') }} className="mr-2">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Catalog
                  </Button>
                  <Shield className="h-8 w-8 text-primary" />
                  <h1 className="text-3xl font-semibold text-foreground">Credential Details</h1>
                </div>
                <p className="text-muted-foreground text-sm">Issuer: {typeof selectedCredential.issuer === 'string' ? selectedCredential.issuer : ((selectedCredential.issuer as Record<string, unknown>)?.['name'] as string | undefined) || JSON.stringify(selectedCredential.issuer || {})}</p>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 lg:px-8 space-y-6">
          <Card className="p-6 bg-card border-border">
            <div className="flex items-start gap-4 mb-4">
              <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-semibold text-foreground mb-1">{getSubjectName(selectedCredential) || (Array.isArray(selectedCredential.type) ? selectedCredential.type[selectedCredential.type.length - 1] : selectedCredential.type) || 'Credential'}</h2>
                <p className="text-sm text-muted-foreground mb-1">Subject: <span className="text-foreground font-medium">{((subject && (subject as Record<string, unknown>)['id']) as string | undefined) || selectedCredential.id || '—'}</span></p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {getStatusBadge(selectedCredential.status)}
                  <Badge variant="outline" className="text-xs">{selectedCredential.id}</Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Issuer DID</p>
                <p className="text-xs font-mono text-foreground break-all">{typeof selectedCredential.issuer === 'string' ? selectedCredential.issuer : ((selectedCredential.issuer as Record<string, unknown>)?.['did'] as string | undefined) || JSON.stringify(selectedCredential.issuer || {})}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Valid From</p>
                <p className="text-sm font-medium text-foreground">{formatDate(selectedCredential.validFrom)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Valid Until</p>
                <p className="text-sm font-medium text-foreground">{formatDate(selectedCredential.validUntil)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Raw Credential JSON</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(JSON.stringify(selectedCredential.rawCredential || selectedCredential, null, 2))}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy JSON
                </Button>
                <Button size="sm" variant="ghost" onClick={() => window.open(selectedCredential.id || undefined, '_blank') as unknown as void}>
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <pre className="bg-muted/30 p-4 rounded-lg overflow-x-auto text-xs max-h-[500px]"><code className="text-foreground">{JSON.stringify(selectedCredential.rawCredential || selectedCredential, null, 2)}</code></pre>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-semibold text-foreground">Credential Catalog</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 lg:px-8">
        <div className="flex flex-wrap items-end gap-4 mb-6">
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="catalog-search" className="text-sm font-medium text-foreground mb-2 block">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="catalog-search" type="text" placeholder="Search credentials..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 bg-background border-border text-foreground" />
            </div>
          </div>

          <div className="w-[200px]">
            <label htmlFor="catalog-usecase" className="text-sm font-medium text-foreground mb-2 block">Use Case</label>
            <Select value={useCaseFilter} onValueChange={setUseCaseFilter}>
              <SelectTrigger id="catalog-usecase" aria-label="Filter credentials by use case">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="battery-passport">Digital Battery Passport</SelectItem>
                <SelectItem value="ski-maintenance">Ski Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-[200px]">
            <label htmlFor="catalog-type" className="text-sm font-medium text-foreground mb-2 block">Type</label>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger id="catalog-type" aria-label="Filter credentials by type">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="imx:ParticipantCredential">Participant</SelectItem>
                <SelectItem value="imx:ApplicationCredential">Application</SelectItem>
                <SelectItem value="imx:ServiceCredential">Service</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-[200px]">
            <label htmlFor="catalog-status" className="text-sm font-medium text-foreground mb-2 block">Status</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger id="catalog-status" aria-label="Filter credentials by status">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expiring-soon">Expiring Soon</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {filteredCredentials.map((vc) => (
                <Card key={(vc.__uid as string) || vc.id} className="w-full p-6 bg-card border-border hover:shadow cursor-pointer" onClick={() => { router.push(`/catalog?credentialId=${encodeURIComponent(((vc.__uid as string) || vc.id) || '')}`); }}>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <Shield className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-semibold text-foreground">{getSubjectName(vc) || (Array.isArray(vc.type) ? vc.type[vc.type.length - 1] : vc.type) || 'Credential'}</h3>
                        <p className="text-sm text-muted-foreground">Subject: <span className="text-foreground font-medium">{getSubjectId(vc) || vc.id}</span></p>
                        <div className="mt-3 flex flex-wrap gap-2 items-center">
                          {getStatusBadge(vc.status)}
                          <Badge variant="outline" className="text-xs">{vc.id}</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                      <div>
                        <div className="text-xs">Issuer DID</div>
                        <div className="font-mono text-foreground break-all">{typeof vc.issuer === 'string' ? vc.issuer : ((vc.issuer as Record<string, unknown>)?.['did'] as string | undefined) || JSON.stringify(vc.issuer || {})}</div>
                      </div>
                      <div>
                        <div className="text-xs">Valid From</div>
                        <div className="text-foreground">{vc.validFrom ? formatDate(vc.validFrom as string) : '—'}</div>
                      </div>
                      <div>
                        <div className="text-xs">Valid Until</div>
                        <div className="text-foreground">{vc.validUntil ? formatDate(vc.validUntil as string) : '—'}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end">
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(JSON.stringify(vc.rawCredential || vc, null, 2)) }}>
                          Copy JSON
                        </Button>
                        <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); window.open((vc.id as string) || undefined, '_blank') as unknown as void }}>
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
        </div>
      </div>
    </div>
  )
}

export function CredentialCatalog() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><div className="text-center"><Shield className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" /><p className="text-muted-foreground">Loading credentials...</p></div></div>}>
      <CredentialCatalogContent />
    </Suspense>
  )
}
