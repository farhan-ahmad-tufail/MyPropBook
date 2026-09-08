# MyPropBook - Professional Property & Submeter Bill Management System

MyPropBook is a production-ready **Progressive Web App (PWA)** built using **React (Vite) + Supabase**. It is designed for property owners to securely manage multiple properties, register tenants, allocate room leases, and automate monthly electricity and rent bill generation with a single click.

It features a robust **Local Offline Demo Mode** using local storage fallbacks. If Supabase configuration is missing or offline, the application seamlessly degrades to a standalone client-side database, allowing users (and potential recruiters) to fully try out the application instantly without setting up any cloud accounts.

---

## 🚀 Key Features

* **Multi-Property Portfolios:** Register multiple houses, commercial shops, or apartment complexes. Group rooms dynamically by floor and room type (Small, Medium, Big, Shop).
* **Active Tenant Allocations (Leases):** Allocate tenants to rooms with start dates and custom rate-per-unit terms. Supports complex allocations (e.g., a single tenant occupying multiple rooms).
* **Automated Smart Calculator:** Select a property and room; the system automatically retrieves the current tenant name, floor, room type, base rent, arrears, and previous meter reading. The owner only enters the **current electricity reading** to generate a complete itemized bill.
* **Instant Digital Receipts:** Generates beautiful invoice receipts in English or Hindi, supports custom styling themes (Dark Blue, Black, Indigo, Emerald), prints bills directly, downloads bills as PDFs, or generates pre-filled templates to share immediately on WhatsApp.
* **Aggregated Dashboard:** Live metrics showing total properties, active leases, expected monthly revenue, and pending arrears. Displays a property-by-property room breakdown showing occupied/vacant statuses and balance details.
* **Billing & Payments Records:** Full transaction history tracking payments. Supports marking bills as Paid, Partially Paid, or Unpaid, and recording individual transaction amounts/methods (Cash, UPI, Bank Transfer).
* **Installable Progressive Web App (PWA):** Installs directly on iOS and Android devices, runs in standalone window mode, and supports caching.
* **Anonymous Fallback (Manual Calc):** Retains a fast anonymous calculator for quick manual utility calculations.

---

## 🛠️ Technology Stack

* **Frontend:** React 19, React Router DOM v7, Axios, Lucide React (Icons), HTML5 Canvas (`html2canvas`), JS PDF (`jspdf`)
* **Backend & Database:** Supabase Client SDK (PostgreSQL database, Row-Level Security, Supabase Auth)
* **PWA Engine:** `vite-plugin-pwa` (Service Worker and manifest auto-generation)
* **Styling:** Vanilla CSS with a modern HSL variable theme system (Glassmorphism card effects, smooth animations, and glowing design accents).

---

## 📂 Project Architecture

```
/ (Project Root)
├── .env.example              # Environment variables template
├── vite.config.js            # Vite configuration & PWA Service Worker config
├── index.html
├── package.json
├── src/
│   ├── main.jsx              # Entry point
│   ├── App.jsx               # Application Router
│   ├── index.css             # Fluid CSS Design System
│   ├── context/
│   │   └── AuthContext.jsx   # Authentication context listener
│   ├── services/
│   │   ├── api.js            # Unified API orchestrator (Supabase vs Local MockDB)
│   │   ├── supabase.js       # Supabase Client & PostgreSQL queries
│   │   └── mockDb.js         # Offline localStorage simulation database
│   ├── components/
│   │   ├── Layout.jsx        # Responsive sidebar/hamburger menu container
│   │   └── ProtectedRoute.jsx# Auth routing guard
│   └── pages/
│       ├── Landing.jsx       # Elegant product landing page
│       ├── Login.jsx         # Authentication screen (Login / Sign Up)
│       ├── Dashboard.jsx     # Financial metrics & property dashboard
│       ├── Properties.jsx    # Property and room CRUD interface
│       ├── Tenants.jsx       # Tenant registration & Lease allocation
│       ├── SmartCalc.jsx     # Automated billing calculator
│       ├── Billing.jsx       # Invoice history database & payment recording
│       └── QuickCalc.jsx     # Fast anonymous manual utility calculator
```

---

## 🗄️ Supabase Relational Schema (PostgreSQL)

Run the following DDL script in your Supabase SQL Editor to set up the backend database structure:

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
  current_meter_reading numeric(10, 2) default 0.00,
  rate_per_unit numeric(10, 2) default 17.00,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Tenants
create table tenants (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  phone text,
  email text,
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Leases (Room Assignments)
create table leases (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid references tenants(id) on delete cascade not null,
  room_id uuid references rooms(id) on delete cascade not null,
  start_date date not null,
  end_date date,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Bills
create table bills (
  id uuid primary key default uuid_generate_v4(),
  room_id uuid references rooms(id) on delete set null,
  tenant_id uuid references tenants(id) on delete set null,
  bill_month text not null,
  bill_year integer not null,
  previous_reading numeric(10, 2) not null,
  current_reading numeric(10, 2) not null,
  units_consumed numeric(10, 2) not null,
  rate_per_unit numeric(10, 2) not null,
  rent_amount numeric(10, 2) not null,
  arrears numeric(10, 2) default 0.00,
  other_charges numeric(10, 2) default 0.00,
  total_payable numeric(10, 2) not null,
  payment_status text default 'Unpaid' check (payment_status in ('Unpaid', 'Paid', 'Partially Paid')),
  generated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Payments
create table payments (
  id uuid primary key default uuid_generate_v4(),
  bill_id uuid references bills(id) on delete cascade not null,
  amount_paid numeric(10, 2) not null,
  payment_date date not null,
  payment_method text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row-Level Security (RLS) Configuration
alter table properties enable row level security;
alter table rooms enable row level security;
alter table tenants enable row level security;
alter table leases enable row level security;
alter table bills enable row level security;
alter table payments enable row level security;

-- Row-Level Security Policies
create policy "Owners can manage their own properties" on properties for all using (auth.uid() = owner_id);
create policy "Owners can manage rooms of their properties" on rooms for all using (
  exists (select 1 from properties where properties.id = rooms.property_id and properties.owner_id = auth.uid())
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
   *Note: If these keys are left empty or omitted, the application will automatically enter **Local Demo Mode** using `localStorage`, meaning it runs immediately without any database setup!*

4. **Launch the development server:**
   ```bash
   npm run dev
   ```

5. **Build the production package:**
   ```bash
   npm run build
   ```

---

## 🌍 Production Deployment

The frontend of this application can be hosted for **$0/month** on popular serverless hosting providers:

* **Vercel:** Connect your GitHub repository to Vercel, set your environment variables, and click deploy.
* **Netlify:** Connect your repository and configure build options (`npm run build`, output dir: `dist`).
* **Firebase Hosting / GitHub Pages:** Standard static site deployments.

Combined with **Supabase's free tier**, this setup allows you to run this application for free in perpetuity.
