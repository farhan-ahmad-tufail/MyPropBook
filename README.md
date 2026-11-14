# MyPropBook - Professional Property & Submeter Bill Management System

MyPropBook is a production-ready **Progressive Web App (PWA)** built using **React 19, Vite, Tailwind CSS, Recharts, and Supabase**. It is designed for property owners, landlords, and PG managers to securely manage multi-property portfolios, track room occupancy, register tenants, manage security deposits, and automate monthly rent and electricity submeter bill generation with a single click.

It features a robust **Local Offline Demo Mode** with comprehensive seed data (`demoSeed.js`). If Supabase configuration is missing or offline, the application seamlessly switches to a standalone client-side database (`localStorage`), allowing owners and evaluators to test all features instantly without requiring any cloud setup.

---

## 🚀 Key Features

* **Multi-Property Portfolios:** Register multiple houses, residential PGs, commercial shops, or apartment complexes. Group rooms dynamically by floor and configurable room types.
* **Flexible Electricity Modes:** Support for:
  - **Submeter Mode:** Automated calculation based on previous and current meter readings × rate per unit.
  - **Fixed Monthly Electricity:** Flat fee added directly to monthly utility dues.
  - **Direct Utility / EB Bill:** Split board electricity bill amount directly across tenants.
* **Active Tenant Allocations & Leases:** Allocate tenants to specific rooms with start dates and custom unit terms. Supports multi-room allocations and shared co-tenant occupancy.
* **Security Deposit Ledger:** Track tenant deposit amounts, collection dates, held balances, refund statuses (`held`, `returned`, `partially_returned`, `forfeited`), and deduction reasons.
* **Automated Smart Calculator:** Select a property and room; the system automatically retrieves tenant information, base rent, arrears from the most recent prior bill, and the previous meter reading. The owner only enters the **current electricity reading** to generate an itemized bill.
* **Instant Digital Receipts & Invoices:** Generates invoice receipts in English or Hindi, supports custom styling themes (Dark Blue, Black, Indigo, Emerald), direct printing, PDF downloads (`jspdf` + `html2canvas`), and pre-filled one-click WhatsApp sharing.
* **Financial Analytics & Visual Reporting:** Interactive revenue, collection efficiency, payment breakdown, and electricity consumption charts powered by **Recharts**.
* **Billing Ledger & Payment Logging:** Complete invoice history tracking payments. Supports marking bills as Paid, Partially Paid, or Unpaid, and recording individual transaction amounts with payment methods (Cash, UPI, Bank Transfer).
* **Keyboard-First Command Palette (`Ctrl+K` / `Cmd+K`):** Global fuzzy search modal to instantly jump between properties, rooms, tenants, and bills.
* **Installable Progressive Web App (PWA):** Installs directly on iOS and Android devices, runs in standalone window mode, and supports service worker caching via `vite-plugin-pwa`.
* **Anonymous Fallback (Quick Calculator):** Fast standalone calculator for quick manual utility math without logging in.

---

## 🛠️ Technology Stack

* **Frontend:** React 19, Vite 7, React Router DOM v7, Axios, Lucide React (Icons)
* **Styling & UI:** Tailwind CSS v3, PostCSS, `@tailwindcss/forms`, Glassmorphic card design, and customizable CSS theme palettes
* **Data Visualization:** Recharts (Area, Bar, Pie, and Line charts)
* **Document & PDF Export:** HTML5 Canvas (`html2canvas`), JS PDF (`jspdf`)
* **Backend & Database:** Supabase Client SDK (PostgreSQL database, Row-Level Security, Supabase Auth)
* **PWA Engine:** `vite-plugin-pwa` (Service Worker and web app manifest auto-generation)
* **Offline Mock Engine:** Client-side local storage database (`mockDb.js`) with realistic pre-populated seed data (`demoSeed.js`)

---

## 📂 Project Architecture

```
/ (Project Root)
├── .env.example                  # Environment variables template
├── vite.config.js                # Vite configuration & PWA Service Worker config
├── tailwind.config.js            # Tailwind CSS design system config
├── postcss.config.js             # PostCSS plugins config
├── index.html                    # Application entry HTML
├── package.json
├── src/
│   ├── main.jsx                  # React DOM mount point
│   ├── App.jsx                   # Application router & route guards
│   ├── index.css                 # Global CSS styles & design tokens
│   ├── context/
│   │   └── AuthContext.jsx       # Supabase / Local mock auth provider
│   ├── services/
│   │   ├── api.js                # Unified API orchestrator (Supabase vs Local MockDB)
│   │   ├── supabase.js           # Supabase Client SDK & PostgreSQL queries
│   │   ├── mockDb.js             # Offline localStorage simulation database
│   │   ├── demoSeed.js           # Realistic multi-property demo dataset & restore logic
│   │   └── billing.js            # Shared billing calculations & arrears math
│   ├── components/
│   │   ├── Layout.jsx            # Responsive sidebar & navigation wrapper
│   │   ├── ProtectedRoute.jsx    # Authentication route guard
│   │   ├── CommandPalette.jsx    # Global search modal (Ctrl+K / Cmd+K)
│   │   ├── BillReceiptModal.jsx  # Invoice receipt modal (PDF, Print, WhatsApp)
│   │   ├── RoomDrawer.jsx        # Slide-over quick room inspector & editor
│   │   ├── RoomDetailsModal.jsx  # Detailed room information modal
│   │   ├── CreateRoomTypeModal.jsx # Custom room category creator
│   │   ├── ReminderModal.jsx     # WhatsApp rent reminder composer
│   │   ├── OnboardingModal.jsx   # Guided setup tour for new property owners
│   │   ├── ProfileModal.jsx      # Owner profile & theme settings
│   │   ├── AnimatedCounter.jsx   # Metric counter animation
│   │   ├── SkeletonLoader.jsx    # UI skeleton loading states
│   │   ├── Toast.jsx             # Toast notifications & confirmation dialogs
│   │   └── Logo.jsx              # Brand mark SVG component
│   ├── pages/
│   │   ├── Landing.jsx           # Product landing page & feature showcase
│   │   ├── Login.jsx             # Authentication screen (Login / Sign Up)
│   │   ├── Dashboard.jsx         # Financial metrics, room cards & portfolio overview
│   │   ├── Properties.jsx        # Property & room CRUD interface
│   │   ├── Rooms.jsx             # Dedicated room management interface
│   │   ├── Tenants.jsx           # Tenant records, lease allocation & deposit management
│   │   ├── SmartCalc.jsx         # Automated monthly bill generation
│   │   ├── Billing.jsx           # Invoice history ledger & payment recording
│   │   ├── Analytics.jsx         # Visual revenue, collection & utility charts
│   │   ├── QuickCalc.jsx         # Standalone utility & rent calculator
│   │   ├── Terms.jsx             # Terms of service
│   │   └── Privacy.jsx           # Privacy policy
│   └── utils/
│       └── formatters.js         # Currency (INR) and date formatting helpers
```

---

## 🗄️ Supabase Relational Schema (PostgreSQL)

Run the following DDL script in your Supabase SQL Editor to set up the backend database structure with Row-Level Security:

```sql
-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- 1. Properties
create table properties (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  address text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Rooms
create table rooms (
  id uuid primary key default uuid_generate_v4(),
  property_id uuid references properties(id) on delete cascade not null,
  room_number text not null,
  floor text,
  room_type text default 'Medium',
  base_rent numeric(10, 2) not null,
  has_submeter boolean default true,
  elec_mode text default 'submeter', -- 'submeter' | 'fixed' | 'direct'
  current_meter_reading numeric(10, 2) default 0.00,
  rate_per_unit numeric(10, 2) default 17.00,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Room Types (Customizable Room Categories)
create table room_types (
  id uuid primary key default uuid_generate_v4(),
  property_id uuid references properties(id) on delete cascade not null,
  name text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Tenants
create table tenants (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  phone text,
  email text,
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Leases (Room Assignments)
create table leases (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid references tenants(id) on delete cascade not null,
  room_id uuid references rooms(id) on delete cascade not null,
  start_date date not null,
  end_date date,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Bills
create table bills (
  id uuid primary key default uuid_generate_v4(),
  room_id uuid references rooms(id) on delete set null,
  tenant_id uuid references tenants(id) on delete set null,
  bill_month text not null,
  bill_year integer not null,
  previous_reading numeric(10, 2) not null default 0.00,
  current_reading numeric(10, 2) not null default 0.00,
  units_consumed numeric(10, 2) not null default 0.00,
  rate_per_unit numeric(10, 2) not null default 0.00,
  rent_amount numeric(10, 2) not null default 0.00,
  arrears numeric(10, 2) default 0.00,
  other_charges numeric(10, 2) default 0.00,
  total_payable numeric(10, 2) not null,
  amount_paid numeric(10, 2) default 0.00,
  payment_status text default 'Unpaid' check (payment_status in ('Unpaid', 'Paid', 'Partially Paid')),
  room_items jsonb default '[]'::jsonb,
  generated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Payments
create table payments (
  id uuid primary key default uuid_generate_v4(),
  bill_id uuid references bills(id) on delete cascade not null,
  amount_paid numeric(10, 2) not null,
  payment_date date not null,
  payment_method text not null, -- 'Cash', 'UPI', 'Bank Transfer'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Security Deposits
create table security_deposits (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references auth.users(id) on delete cascade not null,
  tenant_id uuid references tenants(id) on delete cascade,
  room_id uuid references rooms(id) on delete set null,
  property_id uuid references properties(id) on delete set null,
  amount numeric(10, 2) not null,
  collected_date date not null,
  status text default 'held' check (status in ('held', 'returned', 'partially_returned', 'forfeited')),
  deductions jsonb default '[]'::jsonb,
  notes text,
  return_amount numeric(10, 2),
  return_date date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row-Level Security (RLS) Configuration
alter table properties enable row level security;
alter table rooms enable row level security;
alter table room_types enable row level security;
alter table tenants enable row level security;
alter table leases enable row level security;
alter table bills enable row level security;
alter table payments enable row level security;
alter table security_deposits enable row level security;

-- Row-Level Security Policies
create policy "Owners can manage their own properties" on properties for all using (auth.uid() = owner_id);

create policy "Owners can manage rooms of their properties" on rooms for all using (
  exists (select 1 from properties where properties.id = rooms.property_id and properties.owner_id = auth.uid())
);

create policy "Owners can manage room types of their properties" on room_types for all using (
  exists (select 1 from properties where properties.id = room_types.property_id and properties.owner_id = auth.uid())
);

create policy "Owners can manage their tenants" on tenants for all using (auth.uid() = owner_id);

create policy "Owners can manage leases of their tenants" on leases for all using (
  exists (select 1 from tenants where tenants.id = leases.tenant_id and tenants.owner_id = auth.uid())
);

create policy "Owners can manage bills of their rooms" on bills for all using (
  exists (select 1 from rooms join properties on rooms.property_id = properties.id where rooms.id = bills.room_id and properties.owner_id = auth.uid())
);

create policy "Owners can manage payments of their bills" on payments for all using (
  exists (select 1 from bills join rooms on bills.room_id = rooms.id join properties on rooms.property_id = properties.id where bills.id = payments.bill_id and properties.owner_id = auth.uid())
);

create policy "Owners can manage their security deposits" on security_deposits for all using (auth.uid() = owner_id);
```

---

## 🛠️ Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/rentcalc.git
   cd rentcalc
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory (based on `.env.example`):
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```
   > **Note:** If these environment variables are left empty or omitted, the application automatically runs in **Local Demo Mode** using `localStorage` and seeds realistic sample properties, rooms, tenants, and bills for immediate testing.

4. **Launch the development server:**
   ```bash
   npm run dev
   ```

5. **Build the production package:**
   ```bash
   npm run build
   ```

---

## ⌨️ Useful Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Ctrl + K` / `Cmd + K` | Open the global Command Palette search |
| `Esc` | Close open modals, drawers, or Command Palette |

---

## 🌍 Production Deployment

The frontend of this application can be hosted on modern static hosting platforms:

* **Vercel:** Connect your GitHub repository to Vercel, set your environment variables, and deploy.
* **Netlify:** Connect your repository and set build command `npm run build` with publish directory `dist`.
* **Cloudflare Pages / Firebase Hosting:** Standard single-page application static build deployments.
