# CareNotes AI

AI-powered documentation assistant for Australian aged care staff.

Nurses describe a care interaction in plain language (or via voice), and the app generates a structured, ACQSC-compliant note in seconds — progress notes, incident reports, handover notes, and family updates.

## Why

Aged care staff spend 30–40% of their time on documentation. Under the new Aged Care Act (July 2024), compliance burden has increased. CareNotes AI gives that time back.

## Features

- 4 note types: Progress Note, Incident Report, Handover Note, Family Update
- Voice input (Chrome, Australian English)
- Claude AI generates structured, person-centred notes
- One-click copy to clipboard
- No login, no storage — notes are never saved

## Setup

```bash
npm install
cp .env.local.example .env.local
# Add your Gemini API key to .env.local
# Get a free key at: https://aistudio.google.com/app/apikey
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Stack

- Next.js 15 (App Router)
- Tailwind CSS v4
- Google Gemini 1.5 Flash (free tier: 1,500 req/day)
- Web Speech API for voice input
