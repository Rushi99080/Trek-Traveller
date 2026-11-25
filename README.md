# Adventure Trips Website — Phase 1

Mobile-first website for a Pune-based group trek and travel company.
Built with Next.js, Tailwind CSS, Supabase (database) and Razorpay (payments). Hosted on Vercel.

**It works straight away in demo mode** — no keys or accounts needed. It shows 8 sample trips, lets you go through a full booking with a test payment, and has a working admin panel (password `admin`). Connect Supabase and Razorpay when you're ready to take real bookings.

---

## What's included (Phase 1)

| Page | Address |
|---|---|
| Home: live hero (sky follows the real time in Pune, countdown to the next group), split-flap departure board, "How far is your weekend?" radar from Pune, categories, why us with odometer stats, reviews, solo-to-crew campfire animation, Instagram, FAQ | `/` |
| All trips with filters and sorting | `/treks` |
| Trip detail (gallery, batches, prices, itinerary, inclusions, packing list, pickup points, leaders, policy, FAQs, sticky Book Now bar) | `/treks/rajgad-fort-trek` |
| Printable itinerary (Save as PDF) | `/treks/rajgad-fort-trek/itinerary` |
| Booking + payment (3 steps: trip → travellers → review & pay) | `/book/rajgad-fort-trek` |
| Booking confirmation | `/booking?id=…` |
| GST invoice | `/booking/invoice?id=…` |
| Plan a custom trip | `/plan-a-trip` |
| Contact | `/contact` |
| About us | `/about` |
| Policies (terms, privacy, cancellation, safety) | `/policies/terms` etc. |
| **Admin panel** | `/admin` |

Admin panel: dashboard, trips (add / edit / duplicate / hide), batches (dates, seats, status, leaders, WhatsApp group link), photo upload, bookings (filters, payment status, cancel/refund, WhatsApp buttons), participant list per batch (Excel and PDF), custom trip enquiries (New / Contacted / Quoted / Confirmed / Lost), trek leaders.

Also built in: Razorpay checkout (UPI, cards, net banking), full or advance payment per trip, coupon codes, automatic group discounts, seats update automatically after payment, waitlist when a batch is full, booking emails to the traveller and your team, SEO-friendly addresses, Google previews (schema), sitemap, WhatsApp/Instagram link previews, Google Analytics and Meta Pixel, floating WhatsApp button on every page.

---

## Files you'll edit (no coding needed)

| What to change | File |
|---|---|
| Company name, logo, phone, WhatsApp number, email, address, social links, GSTIN, homepage numbers | `site.config.ts` |
| Homepage text, categories, "why us", FAQs, reviews, cancellation policy, coupons for demo | `data/content.ts` |
| Terms, privacy, cancellation and safety pages | `data/policies.ts` |
| Brand colours | `tailwind.config.ts` |
| Logo image | put `logo.png` in the `public` folder, then set `logo: "/logo.png"` in `site.config.ts` |

Anything in `[square brackets]` is a placeholder — search for `[` to find them all.

**Trips, dates, prices and photos are managed from the Admin panel**, not from files (once Supabase is connected).

---

## Step 1 — Put it online (free, about 10 minutes)

1. Create a free account at **github.com** and a new **empty repository** (for example `trek-website`).
2. Upload this folder to it (or ask Claude to push it for you).
3. Create a free account at **vercel.com** → **Add New → Project** → pick the repository → **Deploy**.
4. In a minute you get a link like `trek-website.vercel.app`. The site runs in demo mode.

> Demo mode note: on Vercel, admin changes and test bookings in demo mode are temporary. That's expected — connect Supabase (Step 2) to save everything.

## Step 2 — Connect the database (Supabase, free)

1. Create an account at **supabase.com** → **New project** (region: Mumbai). Save the database password somewhere safe.
2. Open **SQL Editor → New query**, paste everything from `supabase/schema.sql`, press **Run**. (Safe to run again after updates — it only adds what's missing.)
3. New query again, paste everything from `supabase/seed.sql`, press **Run**. This loads the 8 sample trips (dates start 28 Nov 2026 — change them in Admin).
4. Go to **Project Settings → API** and copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `service_role` secret key → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret — never share it)
5. In Vercel: **Project → Settings → Environment Variables**, add both, plus:
   - `ADMIN_PASSWORD` = a long password for `/admin`
   - `NEXT_PUBLIC_SITE_URL` = your website address, e.g. `https://www.yourcompany.com`
6. Vercel → **Deployments → … → Redeploy**.

Now bookings, enquiries and admin changes are saved permanently, and photo upload works.

## Step 3 — Connect payments (Razorpay)

1. Create an account at **razorpay.com** and complete KYC (needed for live payments).
2. **Account & Settings → API Keys → Generate Test Key**. Add to Vercel:
   - `RAZORPAY_KEY_ID` (starts with `rzp_test_`)
   - `RAZORPAY_KEY_SECRET`
3. **Settings → Webhooks → Add**:
   - URL: `https://YOURSITE/api/payments/webhook`
   - Events: `payment.captured` and `order.paid`
   - Make up a secret and add it to Vercel as `RAZORPAY_WEBHOOK_SECRET`
4. Redeploy, then make a test booking. In test mode use UPI ID `success@razorpay` to simulate a successful payment.
5. When everything works, generate **Live keys**, replace the two key values in Vercel, set up the webhook again in Live mode, and redeploy.

GST invoices are created automatically for every paid booking (SAC 998555, CGST + SGST). Check the GST rate and wording with your CA in `site.config.ts`.

## Step 4 — Booking emails (Resend, free)

1. Create an account at **resend.com**, add and verify your domain.
2. Create an API key. Add to Vercel:
   - `RESEND_API_KEY`
   - `EMAIL_FROM` = e.g. `Your Company <bookings@yourcompany.com>`
   - `TEAM_EMAIL` = where new booking and enquiry alerts should go
3. Redeploy. Travellers now get a confirmation email with booking ID, pickup details, itinerary PDF link, invoice link and the trip WhatsApp group link.

## Step 5 — Analytics and Instagram ads tracking

Add to Vercel and redeploy:
- `NEXT_PUBLIC_GA_ID` — Google Analytics 4 measurement ID (`G-XXXXXXX`)
- `NEXT_PUBLIC_META_PIXEL_ID` — from Meta Events Manager

Events tracked: page views, trip views (ViewContent), booking started (InitiateCheckout), payment done (Purchase), enquiry sent (Lead).

## Step 6 — Your own domain

Vercel → **Project → Settings → Domains** → add `yourcompany.com` and follow the DNS steps shown. Then update `NEXT_PUBLIC_SITE_URL`.

---

## Using the Admin panel

Go to `yourwebsite.com/admin` and log in with `ADMIN_PASSWORD`.

- **Add a trip:** Trips & batches → Add trip. Fill the sections, add batches, upload photos, Save. The trip appears on the website within a minute.
- **Show a trip on the homepage radar:** in the trip's Basic details, fill **Map location** — on Google Maps, long-press the place and paste the numbers (e.g. `18.2465, 73.6823`).
- **Copy a trip:** Duplicate creates a hidden copy without dates — edit it and tick "Show this trip on the website".
- **Add dates:** open a trip → Batches → Add batch. Paste the trip WhatsApp group link on each batch; travellers get it after paying.
- **Seats:** "Booked" goes up automatically after each payment. When a batch is full it switches to waitlist. Change "Booked" only to add offline bookings.
- **Before a trip:** Dashboard → Departures → **Excel** or **PDF** to download the participant list with phone numbers, emergency contacts and medical notes for your trek leaders.
- **Waitlist:** in Bookings, filter by Waitlist, then press **Offer seat** to WhatsApp the traveller when a seat opens.
- **Cash / balance payments:** open the booking and set Payment to "Fully paid", add a note.
- **Cancellations:** set Booking to Cancelled or Payment to Refunded — seats go back to the batch automatically. (Process the refund itself in the Razorpay dashboard.)
- **Coupons:** for now, add or change them in Supabase → Table Editor → `coupons` (admin screen comes in Phase 2). Demo codes: `FIRSTTREK` (10% off) and `SQUAD500` (₹500 off for 4+).

## WhatsApp

- Floating WhatsApp button and pre-filled WhatsApp messages work now (click-to-chat).
- Automatic WhatsApp messages need the **WhatsApp Business (Cloud) API** and an approved message template. The code is ready: add `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID` and `WHATSAPP_BOOKING_TEMPLATE` when you have them. Until then, use the one-tap **Send details** button on each booking in Admin.

---

## Go-live checklist

- [ ] Company name, logo, phone, WhatsApp number, email, address in `site.config.ts`
- [ ] Real numbers for the homepage stats (trips, travellers, destinations, rating)
- [ ] Real reviews in `data/content.ts` (don't publish made-up reviews)
- [ ] Pickup spots and times for every trip (replace `[Pickup spot…]`)
- [ ] Trek leader names, photos and bios (Admin → Trek leaders)
- [ ] Real photos for every trip (the landscape drawings are placeholders)
- [ ] Policies and cancellation terms reviewed by your CA / lawyer
- [ ] GSTIN, PAN and legal name for invoices
- [ ] `ADMIN_PASSWORD` set
- [ ] Razorpay **live** keys + live webhook
- [ ] One real ₹1 test booking end to end, then refund it
- [ ] Delete test bookings in Supabase → Table Editor → `bookings`

---

## For developers

```bash
npm install
cp .env.example .env.local   # optional — the site runs without it
npm run dev                  # http://localhost:3000
npm run build && npm start
npm run make-seed            # rebuild supabase/seed.sql from data/sample-trips.ts
npm run make-images          # regenerate the placeholder landscape images
```

- `app/(site)` public pages, `app/admin` admin panel, `app/api` server routes
- `lib/data.ts` all database reads/writes (falls back to in-memory demo data without Supabase)
- `lib/pricing.ts` the one place prices, discounts, GST and advance amounts are calculated (used by browser and server)
- `supabase/schema.sql` tables, seat-count functions (`confirm_booking_seats`, `release_booking_seats`) and row-level security
- Prices are always recalculated on the server; payments are verified with Razorpay's signature and the webhook

## Phase 2 (next)

User accounts (phone OTP / Google), My Bookings, reviews with photos, coupon and referral management screen, blog / trek guides, gallery, community page with solo / women traveller counts per trip, revenue reports, homepage banner management.
