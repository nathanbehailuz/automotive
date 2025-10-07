import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

// Mock data for demo purposes
const mockVendors = [
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
  }
]

export async function GET() {
  try {
    // Check if we have real Supabase credentials
    const hasRealCredentials = process.env.NEXT_PUBLIC_SUPABASE_URL && 
                              process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co'
    
    if (!hasRealCredentials) {
      // Return mock data for demo
      return NextResponse.json({
        data: mockVendors,
        count: mockVendors.length
      })
    }
    
    // Use real Supabase data
    const { data, error, count } = await supabaseAdmin
      .from('vendors')
      .select('*', { count: 'exact' })
      .order('name')
    
    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch vendors' },
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