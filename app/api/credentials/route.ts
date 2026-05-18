import fs from 'fs'
import path from 'path'
import { NextResponse } from 'next/server'

// Credentials live in /IMXC as JSON files. Each file is one Verifiable Credential.
// Files ending in ".jwt" are raw JWT text and not parseable as JSON — skip them here.
export async function GET() {
  try {
    const repoRoot = process.cwd()
    const credsDir = path.join(repoRoot, 'IMXC')
    const exists = fs.existsSync(credsDir)
    if (!exists) {
      return NextResponse.json({ error: 'credentials directory not found', credentials: [] })
    }

    const files = fs.readdirSync(credsDir).filter(f => f.endsWith('.json') && !f.includes('.jwt'))
    const credentials: unknown[] = []

    for (const file of files) {
      try {
        const full = path.join(credsDir, file)
        const stat = fs.statSync(full)
        if (!stat.isFile()) continue
        const content = fs.readFileSync(full, 'utf8')
        // try parse JSON, fallback to raw text. attach filename as __uid and __source
        try {
          const parsed = JSON.parse(content)
          // avoid mutating parsed if it's primitive
          const entry: Record<string, unknown> = (typeof parsed === 'object' && parsed !== null) ? { ...(parsed as Record<string, unknown>) } : { value: parsed }

          // Some credential fields (e.g. "vcJwt") store the credential as a signed JWT string.
          // Decode any such fields so the UI can display the structured payload without losing the original.
          // JWT structure: base64url(header) . base64url(payload) . base64url(signature)
          // Unsecured JWTs (no signature) have only 2 dot-separated parts.
          const tryDecodeJwt = (token: string) => {
            try {
              const parts = token.split('.')
              if (parts.length < 2) return null
              const payload = parts[1]
              // base64url uses - and _ instead of + and /; restore standard base64
              const b64 = payload.replace(/-/g, '+').replace(/_/g, '/')
              // base64 strings must be padded to a multiple of 4 characters
              const pad = b64.length % 4
              const padded = pad ? b64 + '='.repeat(4 - pad) : b64
              const decoded = Buffer.from(padded, 'base64').toString('utf8')
              return JSON.parse(decoded)
            } catch {
              return null
            }
          }

          // Scan top-level string fields for JWT patterns and attach decoded variants.
          // E.g. a field named "vcJwt" gets a sibling "vcJwt_decoded" with the parsed payload,
          // and also "vc" (base key without the "Jwt" suffix) as a convenience alias.
          for (const key of Object.keys(entry)) {
            const val = entry[key]
            if (typeof val === 'string') {
              // Match both 3-part (signed) and 2-part (unsecured) JWTs
              const isJwtLike = /^[-A-Za-z0-9_]+\.[-A-Za-z0-9_]+\.[-A-Za-z0-9_]*$/.test(val) || /^[-A-Za-z0-9_]+\.[-A-Za-z0-9_]+$/.test(val)
              if (isJwtLike) {
                const decoded = tryDecodeJwt(val)
                if (decoded) {
                  entry[`${key}_decoded`] = decoded
                  if (/jwt$/i.test(key)) {
                    const baseKey = key.replace(/jwt$/i, '')
                    if (!entry[baseKey]) entry[baseKey] = decoded
                  }
                }
              }
            }
          }

          // __uid is the filename and serves as the stable, URL-safe identifier for a credential.
          // We prefer it over the in-content "id" field because credential IDs are often full
          // DID URIs (e.g. "did:web:example.com:...") which are long and need URL-encoding.
          entry.__uid = file
          entry.__source = file
          credentials.push(entry)
        } catch {
          credentials.push({ id: file, raw: content, __uid: file, __source: file })
        }
      } catch {
        // skip file on error
        continue
      }
    }

    return NextResponse.json({ credentials })
  } catch (err) {
    return NextResponse.json({ error: String(err), credentials: [] })
  }
}
