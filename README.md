# Floyd CRM

A modern mortgage loan officer CRM built with React, TypeScript, Tailwind CSS, and shadcn/ui components.

## Features

### 1. Dashboard
- KPI cards: new leads this week, pipeline volume, deals closing this month, reactivation touches
- Charts: pipeline by stage (horizontal bar), lead source breakdown (donut)
- Built with recharts for data visualization

### 2. Lead Inbox
- Kanban board with drag-and-drop functionality
- Stages: New → Contacted → Pre-Approved → Under Contract → Closed/Lost
- Temperature indicators (🔴🟡🟢)
- Click to expand cards for full details

### 3. Pipeline Tracker
- Sortable table view of active loans
- Filterable by stage and lock status
- Color-coded lock status (green=locked, yellow=floating, red=expired)
- Days until close countdown

### 4. Referral Partners
- Card grid grouped by tier (A/B/C)
- Track deals closed, last deal date, next touchpoint
- Quick-add note and log activity buttons

### 5. Past Client Reactivation
- Filter by refi eligible, min equity, last contacted date
- Life event flags (pill badges)
- Batch action: "Mark as Contacted"

### 6. Contact Detail Page
- Unified view with activity timeline
- Linked leads/loans section
- Quick-action buttons (Log Call, Send Text, Schedule Follow-up, Add Note)

### 7. Layout Features
- Sidebar navigation with icons
- Dark/light mode toggle
- Fully mobile responsive

## Tech Stack

- **Framework**: Vite + React + TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui pattern (custom components)
- **Routing**: React Router DOM
- **Charts**: Recharts
- **Drag & Drop**: @hello-pangea/dnd
- **Database**: Supabase (optional, falls back to mock data)

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Supabase Integration

The app is designed to work with Supabase but includes comprehensive mock data for development.

### Using Mock Data (Default)

Simply leave the Supabase environment variables empty in `.env.local`:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

The app will automatically use realistic mock data.

### Connecting to Supabase

1. Copy `.env.example` to `.env.local`
2. Fill in your Supabase credentials:

```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

3. Run the schema in `supabase/schema.sql` in your Supabase SQL editor

## Mock Data

Includes realistic Georgia mortgage data:
- GA addresses (Atlanta, Alpharetta, Marietta)
- Realistic names and contact information
- Loan amounts: $200K-$800K
- Various loan types: Purchase, Refinance, Cash-Out Refi
- Multiple lenders: Rocket Mortgage, Better.com, LoanDepot, etc.

## Future Lovable Integration

This app is built with Lovable deployment in mind:
- Follows Vite + React patterns
- Uses environment variables for configuration
- Supabase-ready architecture
- Clean component structure

## Project Structure

```
src/
├── components/
│   ├── ui/           # Reusable UI components (Button, Card, Badge)
│   └── Layout.tsx    # Main layout with sidebar navigation
├── pages/            # Route components
│   ├── Dashboard.tsx
│   ├── LeadInbox.tsx
│   ├── PipelineTracker.tsx
│   ├── ReferralPartners.tsx
│   ├── PastClientReactivation.tsx
│   └── ContactDetail.tsx
├── lib/
│   ├── utils.ts      # Utility functions
│   ├── supabase.ts   # Supabase client
│   └── mockData.ts   # Mock data and TypeScript types
├── App.tsx           # Router configuration
└── main.tsx          # Entry point
```

## License

Private project for Tanner Floyd.
