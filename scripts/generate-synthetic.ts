import { writeFileSync } from 'fs'
import { join } from 'path'
import { addDays, subDays, format } from 'date-fns'

// Types
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

// Utility functions
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

function weightedChoice<T>(items: { item: T; weight: number }[]): T {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0)
  let random = Math.random() * totalWeight
  
  for (const { item, weight } of items) {
    random -= weight
    if (random <= 0) return item
  }
  
  return items[items.length - 1].item
}

function normalRandom(mean: number, stdDev: number): number {
  const u1 = Math.random()
  const u2 = Math.random()
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
  return z0 * stdDev + mean
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function generateVIN(): string {
  const chars = 'ABCDEFGHJKLMNPRSTUVWXYZ0123456789'
  let vin = ''
  for (let i = 0; i < 17; i++) {
    vin += chars[Math.floor(Math.random() * chars.length)]
  }
  return vin
}

// Fixed vendor data
const VENDORS: Vendor[] = [
  {
    id: 'vendor-1',
    name: 'Quick Recon Services',
    type: 'recon',
    contact_email: 'service@quickrecon.com',
    contact_phone: '(555) 123-4567'
  },
  {
    id: 'vendor-2',
    name: 'Pro Photo Solutions',
    type: 'photo',
    contact_email: 'photos@prophoto.com',
    contact_phone: '(555) 234-5678'
  },
  {
    id: 'vendor-3',
    name: 'Metro Auto Finance',
    type: 'lender',
    contact_email: 'funding@metroauto.com',
    contact_phone: '(555) 345-6789'
  },
  {
    id: 'vendor-4',
    name: 'Express Title Services',
    type: 'title',
    contact_email: 'title@express.com',
    contact_phone: '(555) 456-7890'
  },
  {
    id: 'vendor-5',
    name: 'Elite Recon Group',
    type: 'recon',
    contact_email: 'info@eliterecon.com',
    contact_phone: '(555) 567-8901'
  }
]

// Vehicle makes and models
const MAKES = ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan', 'Hyundai', 'Kia', 'Mazda', 'Subaru', 'Volkswagen']
const MODELS = {
  'Toyota': ['Camry', 'Corolla', 'RAV4', 'Highlander', 'Prius', 'Sienna'],
  'Honda': ['Civic', 'Accord', 'CR-V', 'Pilot', 'Odyssey', 'Fit'],
  'Ford': ['F-150', 'Escape', 'Explorer', 'Mustang', 'Focus', 'Edge'],
  'Chevrolet': ['Silverado', 'Equinox', 'Malibu', 'Tahoe', 'Cruze', 'Traverse'],
  'Nissan': ['Altima', 'Sentra', 'Rogue', 'Pathfinder', 'Murano', 'Versa'],
  'Hyundai': ['Elantra', 'Sonata', 'Tucson', 'Santa Fe', 'Accent', 'Genesis'],
  'Kia': ['Optima', 'Sorento', 'Sportage', 'Forte', 'Soul', 'Telluride'],
  'Mazda': ['CX-5', 'Mazda3', 'Mazda6', 'CX-9', 'MX-5', 'CX-3'],
  'Subaru': ['Outback', 'Forester', 'Impreza', 'Legacy', 'Crosstrek', 'Ascent'],
  'Volkswagen': ['Jetta', 'Passat', 'Tiguan', 'Atlas', 'Golf', 'Beetle']
}

function generateVehicle(count: number): Vehicle[] {
  const vehicles: Vehicle[] = []
  const today = new Date()
  
  for (let i = 0; i < count; i++) {
    const make = randomChoice(MAKES)
    const model = randomChoice(MODELS[make as keyof typeof MODELS])
    const year = randomInt(2015, 2024)
    const mileage = randomInt(10000, 150000)
    
    // Acquisition date in last 90 days
    const acquisitionDate = subDays(today, randomInt(1, 90))
    
    // Base price calculation
    const basePrice = randomInt(15000, 45000)
    const acquisitionPrice = basePrice * randomFloat(0.85, 0.95) // Dealer pays 85-95% of market
    
    // Recon timeline
    const reconStart = addDays(acquisitionDate, randomInt(0, 2))
    const reconDelay = randomInt(1, 3)
    const backorderChance = Math.random() < 0.25
    const reconDone = addDays(reconStart, reconDelay + (backorderChance ? randomInt(2, 7) : 0))
    
    // Photo timeline
    const photosDone = addDays(reconDone, randomInt(0, 2))
    
    // Listing status and timeline
    const listingStatus = weightedChoice([
      { item: 'draft' as const, weight: 0.15 },
      { item: 'live' as const, weight: 0.70 },
      { item: 'sold' as const, weight: 0.15 }
    ])
    
    let listingLiveAt: string | undefined
    let dealSigned: string | undefined
    let fundsReceived: string | undefined
    
    if (listingStatus === 'live' || listingStatus === 'sold') {
      listingLiveAt = addDays(photosDone, randomInt(0, 1)).toISOString()
    }
    
    if (listingStatus === 'sold') {
      dealSigned = addDays(new Date(listingLiveAt!), randomInt(1, 5)).toISOString()
      fundsReceived = addDays(new Date(dealSigned), randomInt(0, 3)).toISOString()
    }
    
    // Pricing
    const priceStrategy = weightedChoice([
      { item: 'market_follow' as const, weight: 0.60 },
      { item: 'aggressive' as const, weight: 0.25 },
      { item: 'hold' as const, weight: 0.15 }
    ])
    
    const marketCompIndex = randomFloat(0.4, 0.9)
    const priceAdjustment = randomFloat(-0.02, 0.02) // ±2%
    const listingPrice = basePrice * (1 + priceAdjustment)
    
    // Other fields
    const holdingCostPerDay = randomFloat(30, 70)
    const photoQualityScore = clamp(normalRandom(0.78, 0.1), 0.5, 1.0)
    
    // Current stage determination
    let currentStage = 'acquired'
    if (reconDone && new Date(reconDone) <= today) currentStage = 'recon'
    if (photosDone && new Date(photosDone) <= today) currentStage = 'photo'
    if (listingLiveAt && new Date(listingLiveAt) <= today) currentStage = 'listing'
    if (dealSigned && new Date(dealSigned) <= today) currentStage = 'sold'
    if (fundsReceived && new Date(fundsReceived) <= today) currentStage = 'funded'
    
    // Days on market
    const daysOnMarket = listingLiveAt ? 
      Math.floor((today.getTime() - new Date(listingLiveAt).getTime()) / (1000 * 60 * 60 * 24)) : 
      undefined
    
    const vin = generateVIN()
    
    const vehicle: Vehicle = {
      id: `vehicle-${i + 1}`,
      vin,
      make,
      model,
      year,
      mileage,
      acquisition_date: format(acquisitionDate, 'yyyy-MM-dd'),
      acquisition_price: Math.round(acquisitionPrice),
      recon_start: format(reconStart, 'yyyy-MM-dd'),
      recon_done: format(reconDone, 'yyyy-MM-dd'),
      recon_vendor_id: randomChoice(VENDORS.filter(v => v.type === 'recon')).id,
      photos_done: format(photosDone, 'yyyy-MM-dd'),
      photo_vendor_id: randomChoice(VENDORS.filter(v => v.type === 'photo')).id,
      photo_quality_score: Math.round(photoQualityScore * 100) / 100,
      listing_status: listingStatus,
      listing_live_at: listingLiveAt,
      listing_price: Math.round(listingPrice),
      price_strategy: priceStrategy,
      market_comp_index: Math.round(marketCompIndex * 100) / 100,
      deal_signed: dealSigned,
      funds_received: fundsReceived,
      holding_cost_per_day: Math.round(holdingCostPerDay * 100) / 100,
      current_stage: currentStage,
      days_on_market: daysOnMarket,
      photo_url: `https://picsum.photos/seed/${vin}/800/600`
    }
    
    vehicles.push(vehicle)
  }
  
  return vehicles
}

function generateEvents(vehicles: Vehicle[]): Event[] {
  const events: Event[] = []
  
  for (const vehicle of vehicles) {
    let eventId = 1
    
    // Acquired event
    events.push({
      id: `event-${vehicle.id}-${eventId++}`,
      vehicle_id: vehicle.id,
      event_type: 'acquired',
      timestamp: new Date(vehicle.acquisition_date).toISOString(),
      metadata: { price: vehicle.acquisition_price }
    })
    
    // Recon started
    if (vehicle.recon_start) {
      events.push({
        id: `event-${vehicle.id}-${eventId++}`,
        vehicle_id: vehicle.id,
        event_type: 'recon_started',
        timestamp: new Date(vehicle.recon_start).toISOString(),
        metadata: { vendor_id: vehicle.recon_vendor_id }
      })
    }
    
    // Recon done
    if (vehicle.recon_done) {
      events.push({
        id: `event-${vehicle.id}-${eventId++}`,
        vehicle_id: vehicle.id,
        event_type: 'recon_done',
        timestamp: new Date(vehicle.recon_done).toISOString(),
        metadata: { vendor_id: vehicle.recon_vendor_id }
      })
    }
    
    // Photos done
    if (vehicle.photos_done) {
      events.push({
        id: `event-${vehicle.id}-${eventId++}`,
        vehicle_id: vehicle.id,
        event_type: 'photos_done',
        timestamp: new Date(vehicle.photos_done).toISOString(),
        metadata: { 
          vendor_id: vehicle.photo_vendor_id,
          quality_score: vehicle.photo_quality_score
        }
      })
    }
    
    // Listing live
    if (vehicle.listing_live_at) {
      events.push({
        id: `event-${vehicle.id}-${eventId++}`,
        vehicle_id: vehicle.id,
        event_type: 'listing_live',
        timestamp: vehicle.listing_live_at,
        metadata: { 
          price: vehicle.listing_price,
          strategy: vehicle.price_strategy
        }
      })
    }
    
    // Deal signed
    if (vehicle.deal_signed) {
      events.push({
        id: `event-${vehicle.id}-${eventId++}`,
        vehicle_id: vehicle.id,
        event_type: 'deal_signed',
        timestamp: vehicle.deal_signed,
        metadata: { price: vehicle.listing_price }
      })
    }
    
    // Funds received
    if (vehicle.funds_received) {
      events.push({
        id: `event-${vehicle.id}-${eventId++}`,
        vehicle_id: vehicle.id,
        event_type: 'funds_received',
        timestamp: vehicle.funds_received,
        metadata: { price: vehicle.listing_price }
      })
    }
  }
  
  // Sort events by timestamp
  return events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
}

// Main execution
function main() {
  const args = process.argv.slice(2)
  const nIndex = args.indexOf('--n')
  const count = nIndex !== -1 && args[nIndex + 1] ? parseInt(args[nIndex + 1]) : 150
  
  console.log(`Generating ${count} vehicles with synthetic data...`)
  
  // Generate data
  const vendors = VENDORS
  const vehicles = generateVehicle(count)
  const events = generateEvents(vehicles)
  
  // Write files
  const dataDir = join(__dirname, '..', 'data')
  
  writeFileSync(join(dataDir, 'vendors.json'), JSON.stringify(vendors, null, 2))
  writeFileSync(join(dataDir, 'vehicles.json'), JSON.stringify(vehicles, null, 2))
  writeFileSync(join(dataDir, 'events.json'), JSON.stringify(events, null, 2))
  
  console.log(`✅ Generated synthetic data:`)
  console.log(`   - ${vendors.length} vendors`)
  console.log(`   - ${vehicles.length} vehicles`)
  console.log(`   - ${events.length} events`)
  console.log(`   Files saved to: ${dataDir}`)
}

if (require.main === module) {
  main()
}
