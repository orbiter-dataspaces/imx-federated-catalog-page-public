# IMX Federated Catalog Page

Interactive credential catalog for the LNI 4.0 / Gaia-X ecosystem, built with Next.js 16. The application surfaces verifiable credential metadata, lets users search and filter by type and status, and provides helpful catalog insights for dataspace participants.

## Features

- Credential explorer with search, type, and status filters
- Responsive UI backed by Tailwind CSS and shadcn-inspired components
- Clipboard copy helpers for credential IDs and references
- Analytics instrumentation via Vercel Analytics
- Linting (ESLint flat config) and testing (Vitest + Testing Library) baked in
- Dockerfile optimized for reproducible `npm ci` installs

## Tech Stack

- Next.js 16 (App Router) + React 19
- TypeScript with strict settings
- Tailwind CSS 4, class-variance-authority, and shadcn/ui primitives
- Vitest, Testing Library, jsdom for unit and component testing
- Semantic Release for automated versioning and changelog generation

## Getting Started

Prerequisites:

- Node.js 22.x
- npm 10.x (ships with Node 22)

Install dependencies:

```bash
npm ci
```

Start the development server:

```bash
npm run dev
# App will be available at http://localhost:3000
```

Create a production build and serve it locally:

```bash
npm run build
npm run start
```

## Available Scripts

- `npm run dev` – Run the Next.js development server
- `npm run build` – Generate a production build
- `npm run start` – Serve the production build
- `npm run lint` – Run ESLint with the project flat config
- `npm run test` – Execute Vitest in run mode (jsdom environment)

## Testing & Linting

The project uses a flat ESLint setup with TypeScript, React, Next.js, hooks, and accessibility rules. Tests are powered by Vitest with Testing Library helpers. Both commands run in CI and should pass before committing changes:

```bash
npm run lint
npm run test
```

## Docker

The `Dockerfile` produces a standalone Next.js build and uses `npm ci` for deterministic installs. Build and run the container locally with:

```bash
docker build -t imx-federated-catalog .
docker run -p 3000:3000 imx-federated-catalog
```

## Continuous Integration & Delivery

- `CI` workflow (`.github/workflows/ci.yml`) runs on every pull request, executing `npm run lint` and `npm run test`.
- `Release` workflow (`.github/workflows/release.yml`) runs on pushes to `main` (or manually) to execute Semantic Release, publish GitHub releases, and build/push Docker images to GHCR tagged with the release version and `latest`.

## Versioning & Releases

Semantic Release enforces versioning through conventional commit messages. Use the conventional/semantic release prefixes (e.g., `feat:`, `fix:`, `chore:`, `ci:`) so automatic version calculation, changelog generation, and release publishing work correctly.

## Project Structure

```
app/                 # Next.js App Router pages and layouts
components/          # Reusable UI components (shadcn-based)
lib/                 # Shared utilities (e.g., class name helpers)
public/              # Static assets
styles/              # Global Tailwind styles
.github/workflows/   # CI and release automation
```

## Contributing

1. Fork the repository and create a feature branch
2. Install dependencies with `npm ci`
3. Implement your changes and add/adjust tests
4. Ensure `npm run lint` and `npm run test` pass
5. Follow semantic-release commit message conventions when committing
6. Open a pull request against `develop`

## License

This project is maintained by the Orbiter Dataspaces team. Licensing terms are TBD; please contact the maintainers for clarification before redistribution.