# PRICINA Owner

Private Expo owner portal for monitoring and managing PRICINA customer inquiries from the existing Firebase `leads` collection.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Mobile app

- `pnpm --filter @workspace/pricina-owner run dev` — run the Expo preview
- `pnpm --filter @workspace/pricina-owner run typecheck` — check the mobile app
- `cd artifacts/pricina-owner && pnpm exec expo install --check` — verify Expo SDK alignment
- `cd artifacts/pricina-owner && pnpm exec expo-doctor` — verify Expo environment health
- Firebase client configuration is in `artifacts/pricina-owner/lib/firebase.ts`; it targets project `pricina-a47fa`.
- `artifacts/pricina-owner/firestore.rules` is the owner-only/no-delete ruleset to apply in the existing Firebase project.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/pricina-owner/app/` — Expo Router routes for login, dashboard tabs, and lead details
- `artifacts/pricina-owner/context/AppContext.tsx` — Firebase Auth, Firestore listener, owner authorization, lead normalization, status updates
- `artifacts/pricina-owner/components/PricinaUI.tsx` — shared PRICINA visual components and formatting helpers
- `artifacts/pricina-owner/constants/colors.ts` — dark PRICINA theme tokens
- `artifacts/pricina-owner/firestore.rules` — security rules source for manual Firebase Console deployment

## Architecture decisions

- Firestore remains the source of truth; the app subscribes to `leads` in real time and keeps historical inquiries intact.
- Owner access is gated by Firebase Auth plus a `users/{uid}` document whose `role` is exactly `owner`.
- Repeat-customer detection uses normalized phone numbers without merging or deleting historical lead documents.
- The first preview build uses the Firebase JavaScript SDK so Expo Go and Expo Web can share the same client integration; native FCM delivery still needs server-side Firebase setup.

## Product

PRICINA Owner gives authorized owners a focused dark mobile CRM for live inquiry monitoring, searchable lead history, client relationship context, status updates, and direct call/message/email actions.

## User preferences

The requested product is private-owner-only, must use the existing Firebase project and `leads` collection, and must never expose delete actions.

## Gotchas

- Do not replace the existing customer website or create a second Firebase project/database.
- The `users/{uid}` owner document and Firestore rules must be configured in Firebase Console before real owner data can load.
- Expo Doctor may report newly published patch versions before the package firewall considers them mature; use the exact compatible patch versions already installed if that happens.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
