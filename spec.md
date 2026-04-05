# ID&PC Chak - Printing Center

## Current State

The app has a React frontend + Motoko backend. All data (employees, services, companies, logo, banner) is fetched from backend every 5 seconds via polling. The core problem is:

1. **Images (employee photos, service images, company logos) use `ExternalBlob.fromURL()` in frontend code** — this silently fails for base64 data URLs because ExternalBlob is designed for CDN URLs, not inline data. Result: images are saved only to localStorage on the uploader's device, never reach the backend, so other devices see empty photos.

2. **Logo and Banner use `actor.setLogo(dataUrl)` / `actor.setBannerImage(dataUrl)** — these store full base64 strings (can be 1-2MB) in backend stable memory. ICP has a per-message 2MB limit — large images silently fail to save.

3. **Homepage has a Services section** — user wants to remove it and replace with: (a) a picture gallery section (admin uploads pictures), (b) a Vision & Mission section (admin can edit the text).

## Requested Changes (Diff)

### Add
- `HomepageGallery` backend storage: backend should store an array of gallery image URLs (base64) as a JSON string, similar to how companies are stored — `getGalleryJson` / `setGalleryJson`
- `VisionMission` backend storage: backend stores vision text and mission text — `getVisionMission` / `setVisionMission` returning `{ vision: string, mission: string }`
- Homepage: new "Gallery" section showing images uploaded by admin (grid layout)
- Homepage: new "Vision & Mission" section showing vision and mission text
- Admin Panel: new "Gallery" tab — admin can upload multiple images, delete them
- Admin Panel: "About Stats" tab (already exists) — add Vision & Mission text fields

### Modify
- **Fix image storage for employees and services**: Instead of using `ExternalBlob.fromURL()` with base64 data, store employee photos and service images as base64 strings directly in backend using JSON fields (same approach as logo/banner but compressed). The backend should have `photo` field as `text` (string), not `ExternalBlob`. This requires backend regeneration.
- **Fix logo and banner sync**: Logo and banner are already stored as strings in backend (getLogo/setBannerImage). The issue is `fetchServices` and `fetchEmployees` try to call `s.image.getDirectURL()` on ExternalBlob — fix this to treat `image` as plain string in backend.
- **Remove Services section from Homepage** — replace with Gallery section + Vision/Mission section
- `fetchServices`: remove `ExternalBlob.getDirectURL()` call, treat image as plain string
- `fetchEmployees`: remove `ExternalBlob.getDirectURL()` call, treat photo as plain string
- `backendAddService` / `backendUpdateService`: remove `ExternalBlob.fromURL()`, pass image as plain string
- `backendAddEmployee` / `backendUpdateEmployee`: remove `ExternalBlob.fromURL()`, pass photo as plain string
- Compress images to max 200KB before saving to backend (use canvas resize)

### Remove
- Services section from `HomePage.tsx`
- `ExternalBlob` usage for employee photos and service images

## Implementation Plan

1. **Regenerate Motoko backend** — change `Employee.photo` and `Service.image` from `ExternalBlob` to `Text` (plain string). Add `getVisionMission`/`setVisionMission` and `getGalleryJson`/`setGalleryJson` methods.

2. **Update `backendData.ts`**:
   - Remove all `ExternalBlob.fromURL()` and `.getDirectURL()` calls
   - Treat photo/image as plain string (base64)
   - Add image compression helper (resize to max 800px, quality 0.7 JPEG) before saving to backend
   - Add `fetchVisionMission`, `saveVisionMission`, `fetchGallery`, `saveGallery` functions

3. **Update `useQueries.ts`**: add `useVisionMission` and `useGallery` hooks with 5s polling

4. **Update `HomePage.tsx`**: remove Services section, add Gallery section (grid of images) and Vision/Mission section

5. **Update `AdminDashboardPage.tsx`**: 
   - Add Gallery tab (upload images, delete images)
   - Add Vision/Mission fields to About Stats tab (or new tab)
   - Fix employee add/edit to compress images before saving
   - Fix service add/edit to compress images before saving

6. The `declarations/backend.did.d.ts` will be regenerated — `Employee.photo` and `Service.image` will be `string` instead of `ExternalBlob`
