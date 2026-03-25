# Floyd CRM - Deployment Guide

## Quick Start (Local Development)

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

The app will run on `http://localhost:5173` with hot module replacement.

## Building for Production

```bash
npm run build
npm run preview  # Preview production build locally
```

## Deploying to Lovable

This project is ready for Lovable deployment:

1. **Import to Lovable**
   - Connect this GitHub repo to Lovable
   - Lovable will detect the Vite configuration automatically

2. **Environment Variables**
   - In Lovable dashboard, add these variables (optional):
     - `VITE_SUPABASE_URL` - Your Supabase project URL
     - `VITE_SUPABASE_ANON_KEY` - Your Supabase anon key
   - If not set, the app will use mock data automatically

3. **Deploy**
   - Lovable will build and deploy automatically
   - Build command: `npm run build`
   - Output directory: `dist`

## Connecting to Supabase

### Option 1: Use Mock Data (Default)
No configuration needed! The app includes comprehensive mock data.

### Option 2: Connect Real Supabase Database

1. **Create Supabase Project**
   - Go to https://supabase.com
   - Create a new project

2. **Run Schema**
   - Open SQL Editor in Supabase
   - Copy/paste contents of `supabase/schema.sql`
   - Execute the SQL

3. **Get Credentials**
   - Go to Project Settings → API
   - Copy Project URL and anon/public key

4. **Configure Environment**
   - In Lovable: Add the variables in dashboard
   - Locally: Create `.env.local` with:
     ```
     VITE_SUPABASE_URL=your_project_url
     VITE_SUPABASE_ANON_KEY=your_anon_key
     ```

5. **Deploy/Restart**
   - The app will automatically use Supabase instead of mock data

## Features Included

✅ Dashboard with KPIs and charts  
✅ Drag-and-drop Lead Inbox (Kanban)  
✅ Pipeline Tracker (sortable/filterable table)  
✅ Referral Partners (tiered cards)  
✅ Past Client Reactivation (filters + batch actions)  
✅ Contact Detail pages  
✅ Dark/Light mode toggle  
✅ Mobile responsive  
✅ Mock data fallback  
✅ TypeScript + React + Vite  

## Tech Stack

- **Framework**: Vite 8 + React 18 + TypeScript
- **Styling**: Tailwind CSS v4 (latest)
- **UI Components**: Custom components (shadcn/ui pattern)
- **Routing**: React Router DOM
- **Charts**: Recharts
- **Drag & Drop**: @hello-pangea/dnd
- **Database**: Supabase (optional)

## File Structure

```
floyd-crm/
├── src/
│   ├── components/
│   │   ├── ui/          # Reusable UI components
│   │   └── Layout.tsx   # Main app layout with sidebar
│   ├── pages/           # Route components
│   ├── lib/
│   │   ├── utils.ts     # Helper functions
│   │   ├── supabase.ts  # Supabase client
│   │   └── mockData.ts  # Mock data + TypeScript types
│   ├── App.tsx          # Router setup
│   └── main.tsx         # Entry point
├── supabase/
│   └── schema.sql       # Database schema
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.ts
```

## Development Tips

### Hot Reload
Changes to any `.tsx` or `.ts` file will hot reload automatically.

### Adding New Pages
1. Create component in `src/pages/`
2. Add route in `src/App.tsx`
3. Add navigation link in `src/components/Layout.tsx`

### Styling
- Use Tailwind utility classes
- Custom theme variables defined in `src/index.css`
- Dark mode: Toggle adds `.dark` class to `<html>`

### Mock Data
All mock data is in `src/lib/mockData.ts`. Edit this file to customize the dummy data.

## Support

For issues or questions, contact Tanner Floyd.
