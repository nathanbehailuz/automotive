import { readFileSync } from 'fs'
import { join } from 'path'
import { supabaseAdmin } from '../src/lib/supabase-server'

interface Vendor {
  id: string
  name: string
  type: string
  contact_email: string
  contact_phone: string
}

interface Vehicle {
  id: string
  vin: string
  make: string
  model: string
  year: number
  mileage: number
  acquisition_date: string
  acquisition_price: number
  recon_start?: string
  recon_done?: string
  recon_vendor_id?: string
  photos_done?: string
  photo_vendor_id?: string
  photo_quality_score?: number
  listing_status: 'draft' | 'live' | 'sold'
  listing_live_at?: string
  listing_price?: number
  price_strategy: 'market_follow' | 'aggressive' | 'hold'
  market_comp_index: number
  deal_signed?: string
  funds_received?: string
  holding_cost_per_day: number
  current_stage: string
  days_on_market?: number
  photo_url: string
}

interface Event {
  id: string
  vehicle_id: string
  event_type: string
  timestamp: string
  metadata?: any
}

async function loadJsonFile<T>(filename: string): Promise<T[]> {
  const filePath = join(__dirname, '..', 'data', filename)
  const content = readFileSync(filePath, 'utf8')
  return JSON.parse(content)
}

async function seedVendors(vendors: Vendor[]) {
  console.log(`Seeding ${vendors.length} vendors...`)
  
  const { error } = await supabaseAdmin
    .from('vendors')
    .upsert(vendors, { 
      onConflict: 'name,type',
      ignoreDuplicates: false 
    })
  
  if (error) {
    console.error('Error seeding vendors:', error)
    throw error
  }
  
  console.log('✅ Vendors seeded successfully')
}

async function seedVehicles(vehicles: Vehicle[]) {
  console.log(`Seeding ${vehicles.length} vehicles...`)
  
  // Process in batches of 100 to avoid timeout
  const batchSize = 100
  for (let i = 0; i < vehicles.length; i += batchSize) {
    const batch = vehicles.slice(i, i + batchSize)
    console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(vehicles.length / batchSize)}`)
    
    const { error } = await supabaseAdmin
      .from('vehicles')
      .upsert(batch, { 
        onConflict: 'vin',
        ignoreDuplicates: false 
      })
    
    if (error) {
      console.error(`Error seeding vehicles batch ${i / batchSize + 1}:`, error)
      throw error
    }
  }
  
  console.log('✅ Vehicles seeded successfully')
}

async function seedEvents(events: Event[]) {
  console.log(`Seeding ${events.length} events...`)
  
  // Process in batches of 100 to avoid timeout
  const batchSize = 100
  for (let i = 0; i < events.length; i += batchSize) {
    const batch = events.slice(i, i + batchSize)
    console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(events.length / batchSize)}`)
    
    const { error } = await supabaseAdmin
      .from('events')
      .upsert(batch, { 
        onConflict: 'vehicle_id,event_type,timestamp',
        ignoreDuplicates: false 
      })
    
    if (error) {
      console.error(`Error seeding events batch ${i / batchSize + 1}:`, error)
      throw error
    }
  }
  
  console.log('✅ Events seeded successfully')
}

async function seedSlaRules() {
  console.log('Seeding SLA rules...')
  
  const slaRules = [
    { task_type: 'recon', sla_days: 3 },
    { task_type: 'photo', sla_days: 2 },
    { task_type: 'listing', sla_days: 1 },
    { task_type: 'funding', sla_days: 3 }
  ]
  
  const { error } = await supabaseAdmin
    .from('sla_rules')
    .upsert(slaRules, { 
      onConflict: 'task_type',
      ignoreDuplicates: false 
    })
  
  if (error) {
    console.error('Error seeding SLA rules:', error)
    throw error
  }
  
  console.log('✅ SLA rules seeded successfully')
}

async function verifySeeding() {
  console.log('Verifying seeded data...')
  
  // Check counts
  const { count: vendorCount } = await supabaseAdmin
    .from('vendors')
    .select('*', { count: 'exact', head: true })
  
  const { count: vehicleCount } = await supabaseAdmin
    .from('vehicles')
    .select('*', { count: 'exact', head: true })
  
  const { count: eventCount } = await supabaseAdmin
    .from('events')
    .select('*', { count: 'exact', head: true })
  
  const { count: slaCount } = await supabaseAdmin
    .from('sla_rules')
    .select('*', { count: 'exact', head: true })
  
  console.log(`📊 Seeding verification:`)
  console.log(`   - Vendors: ${vendorCount}`)
  console.log(`   - Vehicles: ${vehicleCount}`)
  console.log(`   - Events: ${eventCount}`)
  console.log(`   - SLA Rules: ${slaCount}`)
}

async function main() {
  try {
    console.log('🌱 Starting Supabase seeding process...')
    
    // Load data files
    console.log('Loading data files...')
    const vendors = await loadJsonFile<Vendor>('vendors.json')
    const vehicles = await loadJsonFile<Vehicle>('vehicles.json')
    const events = await loadJsonFile<Event>('events.json')
    
    // Seed in order: vendors → vehicles → events → sla_rules
    await seedVendors(vendors)
    await seedVehicles(vehicles)
    await seedEvents(events)
    await seedSlaRules()
    
    // Verify seeding
    await verifySeeding()
    
    console.log('🎉 Seeding completed successfully!')
    console.log('You can now check your Supabase dashboard to see the seeded data.')
    
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}
