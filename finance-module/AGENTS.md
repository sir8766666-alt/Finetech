<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Finance Module Agent Instructions

## Project Overview

Next.js 16 finance management app with Supabase backend. Single-module structure in `/finance-module`.

## Commands

```bash
cd /workspaces/Finetech/finance-module
npm run dev          # Development server
npm run build        # Production build
npm run lint         # ESLint check
npm run start        # Production server
```

No separate test suite configured.

## Architecture

- **Framework**: Next.js 16 (App Router), React 19, TypeScript (strict)
- **Styling**: Tailwind CSS 4 with `tailwind-merge` via `clsx`
- **Backend**: Supabase (auth, database, storage)
- **Forms**: react-hook-form + zod + @hookform/resolvers
- **Charts**: Recharts
- **Icons**: lucide-react
- **Dates**: date-fns

## File Structure

```
src/
  app/
    layout.tsx          # Root layout with sidebar nav
    page.tsx            # Redirects to /dashboard
    globals.css         # Global styles with print support
    login/
      page.tsx          # Email/password auth form
    dashboard/
      page.tsx          # Stats, charts, recent transactions
    projects/
      page.tsx          # Server component fetching projects
      projects-client.tsx # Client component with table + dialog
      actions.ts        # Server actions: create/update/delete
    income/
      page.tsx          # Server component fetching income
      income-client.tsx # Client component with table + dialog
      actions.ts        # Server actions: create/update/delete
    expenses/
      page.tsx          # Server component fetching expenses
      expenses-client.tsx # Client component with table + dialog
      actions.ts        # Server actions: create/update/delete
    dues/
      page.tsx          # Server component fetching dues
      dues-client.tsx   # Client component with tabs + dialog
      actions.ts        # Server actions: create/update/delete
    invoices/
      page.tsx          # Server component fetching invoices
      invoices-client.tsx # Client component with table + dialog
      actions.ts        # Server actions: create/update/delete
      [id]/
        page.tsx        # Print-friendly invoice view
        print-button.tsx # Client component for window.print()
    api/
      auth/
        route.ts        # Auth API endpoint
  components/
    ui/                 # shadcn components (button, card, input, label, select, table, dialog, tabs)
    nav-sidebar.tsx     # Left sidebar (desktop) / top nav (mobile)
    stat-card.tsx       # Reusable stat card with icon + trend
    income-expense-chart.tsx # Recharts bar chart
    budget-progress.tsx # Color-coded progress bar
    receipt-upload.tsx  # File upload or link paste toggle
    status-badge.tsx    # Colored badge for status fields
  lib/
    utils.ts            # cn() helper + formatCurrency()
    supabase/
      client.ts         # createBrowserClient from @supabase/ssr
      server.ts         # createServerClient with cookies()
      middleware.ts     # Session refresh + redirect logic
  types/
    supabase.ts         # Database types (pre-generated)
```

## Supabase Setup

Required env vars in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
```

Database tables (pre-existing with RLS):
- `projects` (id, name, budget, start_date, status, user_id)
- `income` (id, project_id, source, amount, date, notes, receipt_url, user_id)
- `expenses` (id, project_id, category, amount, date, notes, receipt_url, user_id)
- `dues` (id, type: receivable/payable, party_name, amount, due_date, status, user_id)
- `invoices` (id, client_name, amount, issue_date, due_date, status, invoice_number, user_id)

Storage bucket: `receipts` for file uploads.

## Key Patterns

### Server Actions
- Place in `actions.ts` files within route directories
- Always call `revalidatePath()` after mutations
- Use Zod schemas for validation
- Auth via `createClient` from `@/lib/supabase/server`

### Components
- Server components fetch data, client components handle interactivity
- Use `*-client.tsx` pattern for client components that receive server data
- shadcn components in `src/components/ui/`
- Reusable components in `src/components/`

### Styling
- Tailwind-only, no inline styles
- Responsive: mobile-first with `md:` breakpoints
- Sidebar collapses to top drawer on mobile
- Color scheme: green (income), red (expenses), yellow (warnings)
- Print styles in globals.css hide nav/buttons

## Conventions

- Money fields: `Intl.NumberFormat` for display
- Status badges: colored variants per status type
- Forms: react-hook-form + zodResolver for validation
- Receipt uploads: Supabase Storage "receipts" bucket
- Invoice numbers: auto-generated by DB trigger (never user-editable)
- RLS handles user scoping (no manual `user_id` filtering needed)

## Common Pitfalls

1. **Next.js 16 breaking changes**: Check docs before using APIs
2. **Server vs Client components**: Data fetching in server components, interactivity in client
3. **Supabase cookies**: Use `@/lib/supabase/server` for server-side, `@/lib/supabase/client` for browser
4. **File uploads**: Must handle both file upload AND link paste modes
5. **Print styles**: Use `@media print` to hide nav/buttons on invoice pages
6. **Static generation**: Login page uses client-side auth to avoid build-time Supabase errors
