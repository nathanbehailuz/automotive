import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

// Mock data for demo purposes
const mockVehicles = [
  {
    id: 'vehicle-1',
    vin: '1HGBH41JXMN109186',
    make: 'Honda',
    model: 'Civic',
    year: 2020,
    mileage: 45000,
    acquisition_date: '2024-01-15',
    acquisition_price: 18000,
    listing_status: 'live' as const,
    listing_price: 22000,
    current_stage: 'listing',
    holding_cost_per_day: 45.50,
    days_on_market: 12,
    photo_url: 'https://picsum.photos/seed/honda-civic/800/600'
  },
  {
    id: 'vehicle-2',
    vin: '2HGBH41JXMN109187',
    make: 'Toyota',
    model: 'Camry',
    year: 2019,
    mileage: 52000,
    acquisition_date: '2024-01-10',
    acquisition_price: 16000,
    listing_status: 'sold' as const,
    listing_price: 19500,
    current_stage: 'sold',
    holding_cost_per_day: 38.75,
    days_on_market: 8,
    photo_url: 'https://picsum.photos/seed/toyota-camry/800/600'
  },
  {
    id: 'vehicle-3',
    vin: '3HGBH41JXMN109188',
    make: 'Ford',
    model: 'F-150',
    year: 2021,
    mileage: 28000,
    acquisition_date: '2024-01-20',
    acquisition_price: 32000,
    listing_status: 'draft' as const,
    current_stage: 'photo',
    holding_cost_per_day: 65.00,
    days_on_market: undefined,
    photo_url: 'https://picsum.photos/seed/ford-f150/800/600'
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit')
    const stage = searchParams.get('stage')
    
    // Parse and validate limit
    let limitNum = 50 // default
    if (limit) {
      const parsed = parseInt(limit, 10)
      if (isNaN(parsed) || parsed < 1 || parsed > 1000) {
        return NextResponse.json(
          { error: 'Invalid limit parameter. Must be between 1 and 1000.' },
          { status: 400 }
        )
      }
      limitNum = parsed
    }
    
    // Check if we have real Supabase credentials
    const hasRealCredentials = process.env.NEXT_PUBLIC_SUPABASE_URL && 
                              process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co'
    
    if (!hasRealCredentials) {
      // Return mock data for demo
      let filteredVehicles = mockVehicles
      
      if (stage && stage !== 'all') {
        filteredVehicles = mockVehicles.filter(v => v.current_stage === stage)
      }
      
      return NextResponse.json({
        data: filteredVehicles.slice(0, limitNum),
        count: filteredVehicles.length
      })
    }
    
    // Use real Supabase data
    let query = supabaseAdmin
      .from('vehicles')
      .select('*', { count: 'exact' })
      .order('acquisition_date', { ascending: false })
      .limit(limitNum)
    
    // Add stage filter if provided
    if (stage && stage !== 'all') {
      const validStages = ['acquired', 'recon', 'photo', 'listing', 'sold', 'funded']
      if (!validStages.includes(stage)) {
        return NextResponse.json(
          { error: `Invalid stage parameter. Must be one of: ${validStages.join(', ')}, or 'all'` },
          { status: 400 }
        )
      }
      query = query.eq('current_stage', stage)
    }
    
    const { data, error, count } = await query
    
    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch vehicles' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      data: data || [],
      count: count || 0
    })
    
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}