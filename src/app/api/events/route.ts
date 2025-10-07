import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit')
    
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
    
    const { data, error, count } = await supabaseAdmin
      .from('events')
      .select(`
        *,
        vehicles (
          vin,
          make,
          model,
          year
        )
      `, { count: 'exact' })
      .order('timestamp', { ascending: false })
      .limit(limitNum)
    
    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch events' },
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
