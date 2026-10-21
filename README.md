# Rajib Digital Centre – website

Single-page static site for Rajib Digital Centre (Amberia, Hingalganj). Visitors pick a service / scheme, fill a short form and the request is sent on WhatsApp and/or by email.

## Files
| Path | Purpose |
|---|---|
| `index.html` | Page markup + CSS (logo and favicon are inline images supplied by the owner) |
| `js/main.js` | All behaviour. **Edit the block at the top** to change WhatsApp number, email, services and schemes |

## Features
- 12 service cards → form → "Open WhatsApp" with pre-written message (+ silent email copy).
- Government schemes: **Annapurna Yojana** (notes form) and **Agristack ID** (new).
- **Agristack ID application** (`openAgristack` in `js/main.js`):
  1. Name in Aadhaar card · 2. Father/Husband name · 3. Aadhaar number (12-digit check) · Aadhaar-linked mobile · 4. Address
  5. "Number of land" select (1–10) → one upload box per land (image/PDF, max 5 MB each); files are kept when changing the count.
  - On submit the data + all documents are emailed as attachments to **info@rajibdigital.cyou**, then an animated green tick "Application submitted!" screen appears with a masked Aadhaar summary.
  - On failure: inline error + WhatsApp fallback link.
- Performance: removed animated blurred blobs, `backdrop-filter`, 3D tilt, cursor glow and the per-frame canvas; script moved to `js/main.js` with `defer`. Visual glass style retained.

## Email delivery (important – one-time step)
Email is sent client-side via FormSubmit (`https://formsubmit.co/ajax/info@rajibdigital.cyou`, no key required).
**The first submission triggers an "Activate form" email to info@rajibdigital.cyou — the owner must click the link once.** Until activated, no mails are delivered. Attachments are supported by FormSubmit's multipart endpoint.

## Storage
No database; nothing persisted on the site. All data goes directly to WhatsApp / the email inbox.

## Deployment
Not yet deployed from this project. Publish via Hosted Deploy (or any static host) when ready.

## Possible next steps
- Add more schemes in the `SCHEMES` array (`type:"agristack"` reuses the document form).
- If FormSubmit limits become an issue, swap `MAIL_ENDPOINT` for a Web3Forms key.
