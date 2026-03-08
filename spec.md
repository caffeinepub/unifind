# UniFind

## Current State
UniFind is a university lost-and-found web app with:
- Lost & Found item browsing with search/filter by category, location, date, and status
- Item reporting with photo upload, category, location, date, contact info
- In-app messaging between users per item
- Notification system (category match alerts)
- Admin panel: approve/reject/resolve pending items
- User profiles with display name and email
- Internet Identity login with role-based access (user/admin)
- Blob storage for photo uploads
- Categories: wallet, phone, idCard, books, keys, laptop, bag, clothing, jewelry, other
- Item statuses: pending, active, resolved, rejected

## Requested Changes (Diff)

### Add
1. **QR Code Claim System** - Admin can generate a QR code for a found item; owner scans it to initiate a claim request; prevents fake claims by requiring QR scan to claim
2. **Category System Expansion** - Add `earbuds` and `accessories` categories to the existing set; reorganize UI categories into Electronics (phone, laptop, earbuds), ID Cards, Wallets, Books, Clothing, Accessories groups
3. **Reward / Thank-You System** - After an item is resolved/returned, the owner can award a "Thank You" badge and points to the finder; users accumulate finder reputation points visible on their profile
4. **Campus Security Role** - New `security` role in addition to admin/user; security staff can upload found items tagged as "security patrol" and mark them as official finds; admin can assign security role
5. **Expiry System** - Items not claimed/resolved after 45 days automatically move to `archived` status; a separate "Archive" section in the admin panel shows these items; archived items are hidden from main browsing
6. **Image Similarity Suggestions** - When a user views a lost item, the app computes basic visual similarity (color histogram + category match) client-side using canvas and suggests similar found items as "Possible Matches"; no external ML library needed
7. **Campus Location Map UI** - Item report form gets a location picker with predefined campus zones (Library, Canteen, Admin Block, Hostel, Sports Ground, Main Gate, Lecture Hall, Parking) as selectable tags instead of free text; item detail page shows the zone label prominently
8. **Archive Page** - New `/archive` route showing expired/archived items with read-only view

### Modify
- `Item` type: add `qrClaimCode: ?Text`, `claimedByQR: Bool`, `isSecurityPatrol: Bool`, `archivedAt: ?Int`
- `Category.Type`: add `#earbuds`, `#accessories`
- `ItemStatus.Type`: add `#archived`
- `UserProfile`: add `rewardPoints: Nat`, `thanksReceived: Nat`
- Backend `reportItem`: auto-tag items from security staff with `isSecurityPatrol = true`
- Admin panel: add archive section tab, QR code generation button per found item, security role assignment
- My Items page: show QR claim button for found items user reported
- Item detail page: show campus location zone badge, image similarity suggestions panel
- Report form: replace free-text location with campus zone picker

### Remove
- Nothing removed

## Implementation Plan
1. Update `main.mo` to add new category variants, status `#archived`, QR claim fields on Item, reward points on UserProfile, `generateQRCode`, `claimByQR`, `awardThanks`, `archiveExpiredItems`, `assignSecurityRole` functions
2. Update frontend `ReportPage`: replace location text input with campus zone selector (tag buttons)
3. Update `ItemDetailPage`: add campus zone badge, image similarity suggestions panel (canvas-based color comparison), QR claim button for owner
4. Update `AdminPage`: add Archive tab, QR generate button per item, security role assignment
5. Update `MyItemsPage`: show QR code when generated for found items
6. Add `ArchivePage` at `/archive`
7. Update `App.tsx` to include `/archive` route
8. Update `ProfilePage` to show reward points and thanks received
9. Add category grouping in filter UI (Lost/Found pages)
