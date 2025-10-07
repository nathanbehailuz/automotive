-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Vendors table
CREATE TABLE IF NOT EXISTS vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL, -- 'recon', 'photo', 'lender', 'title', etc.
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(name, type)
);

-- Vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vin VARCHAR(17) UNIQUE NOT NULL,
    make VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INTEGER NOT NULL,
    mileage INTEGER,
    acquisition_date DATE NOT NULL,
    acquisition_price DECIMAL(10,2),
    
    -- Recon fields
    recon_start DATE,
    recon_done DATE,
    recon_vendor_id UUID REFERENCES vendors(id),
    
    -- Photo fields
    photos_done DATE,
    photo_vendor_id UUID REFERENCES vendors(id),
    photo_quality_score DECIMAL(3,2), -- 0.00 to 1.00
    
    -- Listing fields
    listing_status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'live', 'sold'
    listing_live_at TIMESTAMP WITH TIME ZONE,
    listing_price DECIMAL(10,2),
    price_strategy VARCHAR(20), -- 'market_follow', 'aggressive', 'hold'
    market_comp_index DECIMAL(3,2), -- 0.00 to 1.00
    
    -- Deal fields
    deal_signed TIMESTAMP WITH TIME ZONE,
    funds_received TIMESTAMP WITH TIME ZONE,
    
    -- Calculated fields
    holding_cost_per_day DECIMAL(8,2),
    current_stage VARCHAR(20), -- 'acquired', 'recon', 'photo', 'listing', 'sold', 'funded'
    days_on_market INTEGER,
    
    -- Image
    photo_url TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events table (timeline of vehicle events)
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL, -- 'acquired', 'recon_started', 'recon_done', 'photos_done', 'listing_live', 'deal_signed', 'funds_received'
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    metadata JSONB, -- Additional event data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(vehicle_id, event_type, timestamp)
);

-- Tasks table (for tracking vendor tasks and SLAs)
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    vendor_id UUID REFERENCES vendors(id),
    task_type VARCHAR(50) NOT NULL, -- 'recon', 'photo', 'listing', 'funding'
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'overdue'
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    due_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SLA Rules table
CREATE TABLE IF NOT EXISTS sla_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_type VARCHAR(50) NOT NULL,
    vendor_id UUID REFERENCES vendors(id), -- NULL for default rules
    sla_days INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(task_type, vendor_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_vehicles_vin ON vehicles(vin);
CREATE INDEX IF NOT EXISTS idx_vehicles_stage ON vehicles(current_stage);
CREATE INDEX IF NOT EXISTS idx_vehicles_acquisition_date ON vehicles(acquisition_date);
CREATE INDEX IF NOT EXISTS idx_vehicles_listing_status ON vehicles(listing_status);

CREATE INDEX IF NOT EXISTS idx_events_vehicle_id ON events(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);

CREATE INDEX IF NOT EXISTS idx_tasks_vehicle_id ON tasks(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_tasks_vendor_id ON tasks(vendor_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_at ON tasks(due_at);

CREATE INDEX IF NOT EXISTS idx_vendors_type ON vendors(type);
