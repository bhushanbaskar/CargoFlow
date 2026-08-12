# CargoFlow — Manual Setup Guide

This document contains configuration, API key instructions, and deployment details for the **CargoFlow** B2B Cargo Reservation & Transport Platform.

---

## 1. Environment Variables

CargoFlow operates out-of-the-box using built-in interactive SVG/CSS Maharashtra transit network map visualizations and simulated MSRTC timetables. No external API keys are required for standard local development or previewing.

If you wish to configure optional Google Maps API integrations or backend authentication, create a `.env.local` file at the root of the project:

```env
# Optional: Google Maps JavaScript API key for custom tile overlays
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=

# Optional: Server-side Gemini API key for automated waybill route optimization
GEMINI_API_KEY=
```

---

## 2. Google Maps API Configuration (Optional)

If you decide to substitute the built-in SVG Maharashtra map with Google Maps Platform:

1. Visit the [Google Cloud Console](https://console.cloud.google.com/).
2. Enable the following APIs in your Google Cloud Project:
   - **Maps JavaScript API**
   - **Places API (New)**
   - **Routes API**
3. Generate an API key with HTTP referrer restrictions matching your production domain.
4. Add the key to `.env.local` as `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`.
5. Restart your development server (`npm run dev`).

---

## 3. Local Development & Build Commands

To run CargoFlow locally:

```bash
# Install dependencies
npm install

# Start local development server (runs on port 3000)
npm run dev

# Run code linter
npm run lint

# Build production bundle
npm run build

# Start production server
npm run start
```

---

## 4. Deployment to Production / Cloud Run

CargoFlow is optimized for deployment on Google Cloud Run or Vercel.

- **Port Configuration**: The application listens on port `3000`.
- **Production Build**: `npm run build` generates static assets in `.next/`.
- **Start Script**: `npm start` executes `next start`.

---

## 5. MSRTC Route Timetable Data Notes

The current MVP database contains timetable data for:
- **Nashik Division** (Nashik CBS, Sangamner, Sinnar)
- **Pune Division** (Pune Swargate, Hadapsar)
- **Mumbai Division** (Mumbai Central, Dadar, Panvel)
- **Chhatrapati Sambhajinagar Division** (Central Bus Stand, Yeola, Vaijapur)
- **Nagpur Division** (Nagpur Ganeshpeth, Amravati, Wardha)

---

## Manual Actions Required Summary

- No immediate manual action is required to run or test CargoFlow.
- If you deploy to custom domains or add live payment gateway webhooks, set the relevant credentials in your host environment settings.
