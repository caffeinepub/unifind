# UniFind – Admin Approval Workflow Fix

## Current State
- `reportItem` already sets status to `#pending` on submission ✓
- Admin has `getPendingItems`, `updateItemStatus`, `getAllItems` backend functions ✓
- Admin panel has a Pending tab with approve/reject buttons ✓
- **BUG**: `getItems` (public) returns both `#pending` AND `#active` items — pending items are visible publicly
- **BUG**: Stats query tries `getItems({ status: 'resolved' })` but the `isActive` guard blocks it — resolved count always 0
- Admin pending tab shows a basic table row only — no photo, no description, no contact info for decision-making
- ID card image URL uses wrong `/api/photo/` pattern — should use blob storage URL

## Requested Changes (Diff)

### Add
- `getPublicStats` backend query — returns `{ lost, found, resolved }` counts without auth, from active+resolved items
- Admin pending tab: expandable detail panel per item showing item photo, description, date, contact, and ID card button
- Spam/validation guards: reject items with empty title/description, too-short content (<10 chars), or missing ID card

### Modify
- `getItems` in `main.mo`: change `isActive` guard from `#pending or #active` to only `#active`, so pending items are hidden publicly
- `useStats` hook: replace `getItems({ status: 'resolved' })` with `getPublicStats` call
- `ReportPage.tsx`: enforce client-side validation (title min 5 chars, description min 20 chars, ID card required)
- `AdminPage.tsx` Pending tab: replace plain table row with card-style view showing full item details + photo + ID card button
- ID card image display: use `getStorageUrl(hash)` instead of `/api/photo/${hash}`

### Remove
- `isActive` filter that exposed pending items publicly

## Implementation Plan
1. Fix `main.mo`: change `isActive` to only `#active`, add `getPublicStats`, add server-side validation in `reportItem`
2. Update `backend.d.ts`: add `getPublicStats` type signature
3. Update `useQueries.ts`: add `useGetPublicStats`, fix `useStats` to use it
4. Update `AdminPage.tsx`: replace ItemRow in pending tab with PendingItemCard showing full details
5. Fix ID card image URL to use `StorageClient.getStorageUrl`
6. Update `ReportPage.tsx`: enforce validation before submit
