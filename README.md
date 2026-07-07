# LeafShield AI

An AI-powered plant disease detection app built for farmers in Jalna, Marathwada, Maharashtra. Upload a photo of a plant leaf and get instant disease diagnosis, treatment advice, and prevention tips — plus a Marathi agricultural chatbot and weather-based disease risk forecasts.

## Tech Stack

- React + Vite
- Tailwind CSS
- Firebase (Authentication + Firestore + Storage)
- Google Gemini API (AI image analysis & chatbot)
- Framer Motion (animations)
- Recharts (analytics charts)

## Features

- 🔬 AI-powered plant disease detection from photos
- 🤖 Marathi-language agricultural chatbot
- 📊 Scan history and analytics dashboard
- 📅 Crop health calendar with seasonal tips
- ⛅ Weather-based disease risk forecasts
- 📥 Export scan history (CSV, Excel, JSON)

## Local Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Environment Setup

This project uses Firebase for authentication and data storage, and the Google Gemini API for AI analysis. Configuration is set in `src/lib/firebase.js` and `src/lib/gemini.js`.

## Deployment

Deployed on [Vercel](https://vercel.com).