-- Supabase Schema for BillRoom (Property & Submeter Billing System)

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROPERTIES
create table if not exists public.properties (
    id uuid default uuid_generate_v4() primary key,
    owner_id uuid not null default auth.uid(),
    name text not null,
    address text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. ROOMS
create table if not exists public.rooms (
    id uuid default uuid_generate_v4() primary key,
    property_id uuid references public.properties(id) on delete cascade not null,
    room_number text not null,
    floor text,
    room_type text default 'Medium',
    base_rent numeric(10, 2) default 0.00 not null,
    has_submeter boolean default true,
    elec_mode text default 'submeter',
    current_meter_reading numeric(10, 2) default 0.00 not null,
    rate_per_unit numeric(10, 2) default 17.00 not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. TENANTS
create table if not exists public.tenants (
    id uuid default uuid_generate_v4() primary key,
    owner_id uuid not null default auth.uid(),
    name text not null,
    phone text,
    email text,
    active boolean default true not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. LEASES
create table if not exists public.leases (
    id uuid default uuid_generate_v4() primary key,
    tenant_id uuid references public.tenants(id) on delete cascade not null,
    room_id uuid references public.rooms(id) on delete cascade not null,
    start_date date default CURRENT_DATE not null,
    end_date date,
    is_active boolean default true not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. BILLS
create table if not exists public.bills (
    id uuid default uuid_generate_v4() primary key,
    room_id uuid references public.rooms(id) on delete cascade not null,
    tenant_id uuid references public.tenants(id) on delete cascade not null,
    bill_month text not null,
    bill_year integer not null,
    previous_reading numeric(10, 2) default 0.00,
    current_reading numeric(10, 2) default 0.00,
    units_consumed numeric(10, 2) default 0.00,
    rate_per_unit numeric(10, 2) default 17.00,
    rent_amount numeric(10, 2) default 0.00 not null,
    arrears numeric(10, 2) default 0.00,
    other_charges numeric(10, 2) default 0.00,
    total_payable numeric(10, 2) default 0.00 not null,
    amount_paid numeric(10, 2) default 0.00 not null,
    payment_status text default 'Unpaid' check (payment_status in ('Paid', 'Partially Paid', 'Unpaid')),
    room_items jsonb default null,
    elec_mode text default null,
    generated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. PAYMENTS
create table if not exists public.payments (
    id uuid default uuid_generate_v4() primary key,
    bill_id uuid references public.bills(id) on delete cascade not null,
    amount_paid numeric(10, 2) not null,
    payment_date date default CURRENT_DATE not null,
    payment_method text default 'Cash',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. SECURITY DEPOSITS
create table if not exists public.security_deposits (
    id uuid default uuid_generate_v4() primary key,
    owner_id uuid not null default auth.uid(),
    tenant_id uuid references public.tenants(id) on delete cascade not null,
    property_id uuid references public.properties(id) on delete set null,
    room_id uuid references public.rooms(id) on delete set null,
    amount numeric(10, 2) default 0.00 not null,
    deposit_date date default CURRENT_DATE not null,
    status text default 'held',
    deductions jsonb default '[]'::jsonb,
    notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.properties enable row level security;
alter table public.rooms enable row level security;
alter table public.tenants enable row level security;
alter table public.leases enable row level security;
alter table public.bills enable row level security;
alter table public.payments enable row level security;
alter table public.security_deposits enable row level security;

-- Policies for Authenticated Users (Full CRUD access)
drop policy if exists "Allow owners full access to properties" on public.properties;
drop policy if exists "Allow owners full access to rooms" on public.rooms;
drop policy if exists "Allow owners full access to tenants" on public.tenants;
drop policy if exists "Allow owners full access to leases" on public.leases;
drop policy if exists "Allow owners full access to bills" on public.bills;
drop policy if exists "Allow owners full access to payments" on public.payments;
drop policy if exists "Allow owners full access to security_deposits" on public.security_deposits;

create policy "Allow owners full access to properties" on public.properties for all using (true) with check (true);
create policy "Allow owners full access to rooms" on public.rooms for all using (true) with check (true);
create policy "Allow owners full access to tenants" on public.tenants for all using (true) with check (true);
create policy "Allow owners full access to leases" on public.leases for all using (true) with check (true);
create policy "Allow owners full access to bills" on public.bills for all using (true) with check (true);
create policy "Allow owners full access to payments" on public.payments for all using (true) with check (true);
create policy "Allow owners full access to security_deposits" on public.security_deposits for all using (true) with check (true);
