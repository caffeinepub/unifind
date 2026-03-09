# UniFind – Lost & Found ID Verification

## Current State

The app is a full Chandigarh University Lost & Found system with:
- Report Lost/Found items with optional photo upload
- Campus zone picker (A-Blocks through E-Blocks, FR, Fountain Area)
- QR claim code system (admin-generated)
- Admin panel with Pending / All Items / Archive / QR Codes / Security tabs
- Notification system for matching items
- Reward/thanks system
- Security patrol role
- blob-storage, authorization, qr-code components already selected

No ID card verification currently exists. The `Item` type has `photoId` (optional item photo) but no ID card photo field.

## Requested Changes (Diff)

### Add
- `idCardPhotoId` field on `Item` to store the blob storage ID of the reporter's CU ID card image
- `ReportItemInput` updated with `idCardPhotoId : ?Text` (required in spirit; front-end enforces upload)
- `getIdCardPhoto(itemId)` admin-only query that returns the `idCardPhotoId` for a given item
- "ID Verification" section in the report form: mandatory upload of CU ID card photo with clear messaging about admin-only access and security purpose
- Separate upload state (preview, progress, ID) for the ID card photo, distinct from item photo
- Admin panel new tab "ID Verification" — lists all items with their reporter identity, shows whether ID card was uploaded, and allows admin to view the stored ID card image (via blob storage URL)
- Admin item row and detail: show a shield/ID icon indicator if `idCardPhotoId` is set
- Privacy notice on the report form explaining ID is only seen by CU admin

### Modify
- `ReportItemInput` Motoko type: add `idCardPhotoId : ?Text`
- `reportItem` backend function: store `idCardPhotoId` from input on the item
- `Item` Motoko type: add `idCardPhotoId : ?Text`
- ReportPage frontend: add mandatory "CU ID Card" upload section above submit button
- AdminPage frontend: add "ID Verification" tab; each row shows "ID Uploaded" badge; admin can click to view the ID card image in a modal

### Remove
- Nothing removed

## Implementation Plan

1. Update `main.mo`: add `idCardPhotoId : ?Text` to `Item` and `ReportItemInput`; update `reportItem` to store it; add `getIdCardPhoto` admin-only query
2. Re-generate backend (generate_motoko_code)
3. Update ReportPage: add mandatory CU ID card upload section with its own file input ref, preview, progress state; enforce it before submission; add privacy disclaimer
4. Update AdminPage: add "ID Verification" tab listing items with ID card status; clicking "View ID" opens a modal showing the stored blob image URL; show ID badge on item rows
5. Validate and deploy
