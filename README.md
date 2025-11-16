# I Am In — Farcaster Event Mini App

This is a Next.js + TypeScript mini app for Farcaster that lets people browse events, join them with “I am in”, and view their own profile/participation. It uses the Neynar Mini App SDK for Farcaster context and MongoDB for persistence.

## Features
- Farcaster-aware UI: pulls username/display name/avatar/FID from context for the account tab and join flow.
- Events feed with pagination and client-side fetch (keeps MongoDB/child_process off the client bundle).
- Event detail with “I am in” button and live participant list.
- Account tab with two grids:
  - My events (badge: Created by me)
  - I’m attending (badge: I’m attending)
- API layer for events: list, create, filter by creator/participant, and join (idempotent FID add).

## Data model (MongoDB)
`src/lib/models/event.ts` defines:
- `title`, `description`
- `creator` object: `fid`, `username`, `displayName`, `pfpUrl`
- `participantsFid`: number[]
- `createdAt`, `updatedAt`

Helpers: list (with pagination/filters), get by id, create, update, join (add participant).

## API surface
- `GET /api/events` — supports `page`, `limit`, `creatorFid`, `participantFid`.
- `POST /api/events` — create event.
- `POST /api/events/:eventId/join` — add participant by FID (idempotent).

## Environment
Set in `.env.local` (and production):
- `MONGODB_URI`
- `MONGODB_DB_NAME` (default `i-am-in`)
- `MONGODB_COLLECTION_EVENTS` (default `events`)
- `MONGODB_TLS_ALLOW_INVALID_CERTS` (optional, `true` for local/self-signed)
- `NEYNAR_API_KEY`, `NEXT_PUBLIC_NEYNAR_API_KEY`

## Run locally
```bash
npm install
npm run dev
```

## Deploy
Any standard Next.js host (e.g., Vercel). Ensure env vars are set.

## Roadmap (this is the base; we’re building a real product, not a toy)
- [ ] Harden event flows: moderation, per-user limits, better errors, optimistic UI.
- [ ] Crypto where it matters:
  - [ ] Ticket payments for events (custodial/non-custodial) with our service fee.
  - [ ] On-chain NFT badges/achievements for attending/hosting.
  - [ ] Host payouts + transparent fee accounting.
- [ ] Trust & social: proofs of attendance, host/attendee reputation, FID-based anti-spam.
- [ ] Discovery: filters (time/location/category), trending, reminders/notifications.
- [ ] Mobile polish: offline-friendly caching, lighter images, smoother scroll/compact cards.

## Notes
- Join button is available when a Farcaster FID is present in context; otherwise it prompts to sign in.
- If avatars come from new domains, add them to `next.config.ts` or fall back to `<img>` (already supported).
