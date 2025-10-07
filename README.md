# Auto Manager

A connected command center for automotive dealers that tracks vehicles through the entire pipeline from acquisition to funding, with real-time status monitoring and vendor coordination.

## Tech Stack

- **Frontend**: Next.js 15 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes + Supabase (PostgreSQL)
- **Data Fetching**: React Query
- **Utilities**: date-fns for date handling
- **Scripts**: tsx for TypeScript execution

## Quick Start

### 1. Environment Setup

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
UNSPLASH_ACCESS_KEY=optional
PEXELS_API_KEY=optional
```

### 2. Database Setup

Apply the database schema:

```bash
npm run schema
```

### 3. Generate Synthetic Data

Create realistic test data:

```bash
npm run gen:synthetic
```

### 4. Seed Database

Load the synthetic data into Supabase:

```bash
npm run seed
```

### 5. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the dashboard.

### 6. Smoke Test API

Test the API endpoints:

```bash
npm run smoke:api
```

## Runbook

### Initial Setup (First Time)

1. **Apply schema**
   ```bash
   npm run schema
   ```

2. **Generate data**
   ```bash
   npm run gen:synthetic
   ```

3. **Seed DB**
   ```bash
   npm run seed
   ```

4. **Start app**
   ```bash
   npm run dev
   ```

5. **Smoke test**
   ```bash
   npm run smoke:api
   ```

### Daily Development

1. **Start development server**
   ```bash
   npm run dev
   ```

2. **Regenerate fresh data** (if needed)
   ```bash
   npm run gen:synthetic
   npm run seed
   ```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run schema` - Apply database schema
- `npm run gen:synthetic` - Generate synthetic data
- `npm run seed` - Seed database with synthetic data
- `npm run smoke:api` - Test API endpoints

## Features

### Week 1 Implementation

- ✅ **Database Schema**: Complete schema with vehicles, vendors, events, tasks, and SLA rules
- ✅ **Synthetic Data Generator**: Realistic vehicle timelines with proper business logic
- ✅ **API Endpoints**: RESTful APIs for vehicles, events, and vendors
- ✅ **Dashboard**: Clean, responsive dashboard with vehicle cards and filtering
- ✅ **Vehicle Cards**: Detailed cards showing stage, costs, and key metrics

### Dashboard Features

- **Vehicle Grid**: Responsive grid layout showing all vehicles
- **Stage Filtering**: Filter by current stage (Acquired, Recon, Photo, Listing, Sold, Funded)
- **Vehicle Cards**: Show key information including:
  - Vehicle details (Make, Model, Year, VIN)
  - Current stage with color coding
  - Days since acquisition
  - Holding cost per day and total
  - Listing price and days on market
  - Vehicle photos (with fallback to Picsum)

### API Endpoints

- `GET /api/vehicles` - List vehicles with optional filtering
- `GET /api/vehicles/[id]` - Get single vehicle with recent events
- `GET /api/events` - List recent events across all vehicles
- `GET /api/vendors` - List all vendors

## Database Schema

### Tables

- **vehicles**: Core vehicle data with timeline fields
- **vendors**: Vendor information (recon, photo, lender, title)
- **events**: Timeline of vehicle events
- **tasks**: Vendor task tracking with SLAs
- **sla_rules**: Configurable SLA rules by task type

### Key Features

- UUID primary keys
- Proper foreign key relationships
- Indexes for performance
- JSONB metadata fields for flexibility

## Data Generation

The synthetic data generator creates realistic vehicle timelines:

- **Acquisition**: Random dates in last 90 days
- **Recon**: 1-3 days after acquisition (with 25% backorder chance)
- **Photos**: 0-2 days after recon completion
- **Listing**: 0-1 days after photos (70% live, 15% draft, 15% sold)
- **Deal**: 1-5 days after listing goes live
- **Funding**: 0-3 days after deal signed


## Next Steps (Future Weeks)

- Week 2: SLA tracking and vendor nudges
- Week 3: Magic-link vendor tasks
- Week 4: Autopilot automation rules
- Week 5: Reporting and analytics
- Week 6: End-to-end workflow completion