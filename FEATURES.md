# Floyd CRM - Feature Overview

## 🎯 Purpose
A personal CRM for mortgage loan officers to manage leads, track pipeline, nurture referral partners, and reactivate past clients.

---

## 📊 1. Dashboard (`/`)

**KPI Cards (Top Row):**
- **New Leads This Week**: 8 (+20% from last week)
- **Pipeline Volume**: $2,030,000 (across all stages)
- **Deals Closing This Month**: 4 (Est. $1,655,000)
- **Reactivation Touches**: 12 (this week)

**Charts:**
- **Pipeline by Stage** (Horizontal Bar Chart)
  - New: 3 leads, $1.25M
  - Contacted: 5 leads, $1.835M
  - Pre-Approved: 4 leads, $2.1M
  - Under Contract: 3 leads, $1.655M

- **Lead Source Breakdown** (Donut Chart)
  - Realtor Referral: 45% (12 leads)
  - Past Client: 30% (8 leads)
  - Website: 15% (4 leads)
  - Facebook Ad: 10% (3 leads)

---

## 📥 2. Lead Inbox (`/leads`)

**Kanban Board - Drag & Drop Enabled**

Columns: `New` → `Contacted` → `Pre-Approved` → `Under Contract` → `Closed` / `Lost`

**Each Lead Card Shows:**
- Contact name
- Loan type (Purchase / Refinance / Cash-Out Refi)
- Loan amount (formatted currency)
- Temperature indicator:
  - 🔴 Hot
  - 🟡 Warm
  - 🟢 Cold
- Next follow-up date

**Click to Expand:**
- Lead source
- Created date
- Temperature status
- Full details

**Example Leads:**
- Sarah Martinez - Purchase, $425K, 🔴 Hot, Follow-up: 3/26
- James Chen - Refinance, $350K, 🟡 Warm, Follow-up: 3/27
- Michael Roberts - Purchase, $575K, 🔴 Hot, Pre-Approved

---

## 📈 3. Pipeline Tracker (`/pipeline`)

**Filters:**
- Stage dropdown (All / Processing / Underwriting / Clear to Close)
- Lock Status dropdown (All / Locked / Floating / Expired)

**Sortable Table Columns:**
- Borrower Name
- Loan Stage
- Lender
- Loan Amount
- **Lock Status** (color-coded badges):
  - 🟢 Locked (green)
  - 🟡 Floating (yellow)
  - 🔴 Expired (red)
- Est. Close Date
- Days Until Close (red if <7 days)

**Example Rows:**
- Michael Roberts - Processing - Rocket Mortgage - $575K - 🟢 Locked - 4/15/26 - 21 days
- Emily Thompson - Clear to Close - LoanDepot - $425K - 🟢 Locked - 3/30/26 - 5 days ⚠️

---

## 🤝 4. Referral Partners (`/partners`)

**Grouped by Tier:**

### Tier A (Top Producers)
- Lisa Anderson - Berkshire Hathaway - 23 deals - Last: 3/10/26 - Next touch: 3/28
- Tom Harrison - Keller Williams - 18 deals - Last: 2/28/26 - Next touch: 3/30
- Steve Johnson - HomeBuilders Inc - 15 deals - Last: 3/05/26 - Next touch: 3/27

### Tier B (Solid Contributors)
- Angela Brooks - RE/MAX - 9 deals
- Kevin Martinez - Century 21 - 7 deals

### Tier C (Developing Relationships)
- Rachel Kim - Coldwell Banker - 3 deals

**Each Card:**
- Name & Company
- Partner Type (Realtor / Builder)
- Tier badge (A/B/C)
- Deals closed count
- Last deal date
- Next touchpoint date
- **Quick Actions:**
  - 📝 Add Note
  - Log Activity

---

## 🔄 5. Past Client Reactivation (`/reactivation`)

**Filters:**
- ☑️ Refi Eligible Only (checkbox)
- Min Equity dropdown ($50K / $100K / $150K+)
- Last Contacted Before (date picker)

**Batch Actions:**
- Select multiple clients (checkboxes)
- "Mark as Contacted" button

**Table Columns:**
- Name
- Property Address (GA addresses)
- Close Date
- Current Rate (e.g., 6.75%)
- Est. Equity (formatted $)
- **Refi Eligible** (✅ badge or "Not Eligible")
- **Reactivation Status**:
  - Not Contacted (gray)
  - Contacted (blue)
  - Scheduled (green)
  - Not Interested (red)
- **Life Events** (pill badges):
  - Job Change
  - New Baby
  - Marriage

**Example Rows:**
- Emily Thompson - 1234 Peachtree St, Atlanta - 6/15/23 - 6.75% - $125K - ✅ Eligible - 🔵 Job Change
- Amanda Foster - 2345 Northside Dr, Atlanta - 3/18/23 - 7.25% - $140K - ✅ Eligible - Scheduled - 💍 Marriage

---

## 👤 6. Contact Detail Page (`/contacts/:id`)

**Header:**
- Contact name (large)
- Email & phone icons
- Type badge (Lead / Client / Partner)

**Quick Actions (Buttons):**
- 📞 Log Call
- 💬 Send Text
- 📅 Schedule Follow-up
- ➕ Add Note

**Activity Timeline (Chronological):**
Each activity shows:
- Icon (phone/email/text/meeting/note)
- Type (capitalized)
- Description
- Timestamp

Example:
- 📞 **Call** - Initial consultation - discussed purchase timeline - 3/20 10:30am
- 📧 **Email** - Sent pre-approval requirements - 3/20 2:15pm

**Sidebar:**

### Active Leads
- Shows linked leads for this contact
- Loan type, amount, stage badge
- Next follow-up date

### Relationship Data
- Customer Since: (date)
- Total Deals: (count)
- Last Contact: (date or "Never")

---

## 🎨 7. Layout & Design

**Sidebar Navigation:**
- 📊 Dashboard
- 📥 Lead Inbox
- 📈 Pipeline
- 🤝 Partners
- 🔄 Reactivation
- 🌙 Dark Mode Toggle (bottom)

**Responsive:**
- Desktop: Fixed sidebar + main content
- Mobile: Hamburger menu, slide-out sidebar

**Theme:**
- Light mode (default): White background, blue primary
- Dark mode: Dark gray background, lighter blue primary
- Smooth transitions on toggle

---

## 🗂️ Mock Data Highlights

**Realistic Georgia Data:**
- Addresses: Atlanta, Alpharetta, Marietta
- Names: Diverse, realistic
- Loan amounts: $200K - $800K
- Lenders: Rocket Mortgage, Better.com, LoanDepot, Quicken Loans
- Loan types: Purchase, Refinance, Cash-Out Refi
- Phone numbers: (678), (770), (404) area codes
- Stages: Full pipeline from New → Closed
- Lock statuses: Locked, Floating, Expired
- Partner types: Realtors, Builders
- Life events: Job Change, New Baby, Marriage

---

## 🔌 Supabase Integration

**Current State:**
- App runs 100% with mock data (no Supabase required)
- Supabase client helper ready in `src/lib/supabase.ts`
- Reads from `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Falls back to mock data if env vars not set

**Future Connection:**
- Add env vars → app automatically switches to Supabase
- Schema ready in `supabase/schema.sql`
- No code changes needed to switch between mock and real data

---

## 🚀 Ready for Lovable

- ✅ Vite + React + TypeScript
- ✅ Tailwind CSS v4
- ✅ Environment variable support
- ✅ Production build tested
- ✅ No hardcoded URLs or secrets
- ✅ Mobile responsive
- ✅ GitHub repo ready

**Deploy to Lovable:**
1. Import GitHub repo
2. (Optional) Add Supabase env vars
3. Deploy ✅

---

## 📦 Component Architecture

**Reusable UI Components:**
- `Button` - Multiple variants (default/destructive/outline/ghost/link)
- `Card` - Header, Content, Footer sections
- `Badge` - Status indicators (default/secondary/success/warning/destructive)

**Layout:**
- `Layout.tsx` - Sidebar navigation wrapper
- Responsive mobile menu
- Dark mode provider

**Pages:**
- Each route = separate page component
- Clean imports, TypeScript types
- Mock data as fallback

---

Built with ⚡ for Tanner Floyd's mortgage business.
