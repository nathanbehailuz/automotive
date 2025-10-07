'use client'

import { useState, useEffect } from 'react'
import VehicleCard from '@/components/VehicleCard'

interface Vehicle {
  id: string
  vin: string
  make: string
  model: string
  year: number
  mileage: number
  acquisition_date: string
  acquisition_price: number
  listing_status: 'draft' | 'live' | 'sold'
  listing_price?: number
  current_stage: string
  holding_cost_per_day: number
  days_on_market?: number
  photo_url: string
}

interface ApiResponse {
  data: Vehicle[]
  count: number
}

const STAGES = [
  { value: 'all', label: 'All Stages' },
  { value: 'acquired', label: 'Acquired' },
  { value: 'recon', label: 'Recon' },
  { value: 'photo', label: 'Photo' },
  { value: 'listing', label: 'Listing' },
  { value: 'sold', label: 'Sold' },
  { value: 'funded', label: 'Funded' }
]

export default function Dashboard() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedStage, setSelectedStage] = useState('all')
  const [totalCount, setTotalCount] = useState(0)

  const fetchVehicles = async (stage: string = 'all') => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams({
        limit: '50'
      })
      
      if (stage !== 'all') {
        params.append('stage', stage)
      }
      
      const response = await fetch(`/api/vehicles?${params}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result: ApiResponse = await response.json()
      setVehicles(result.data)
      setTotalCount(result.count)
      
    } catch (err) {
      console.error('Error fetching vehicles:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch vehicles')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVehicles(selectedStage)
  }, [selectedStage])

  const handleStageChange = (stage: string) => {
    setSelectedStage(stage)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error loading vehicles
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => fetchVehicles(selectedStage)}
                    className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Auto Manager</h1>
              <p className="mt-1 text-sm text-gray-600">
                Vehicle pipeline management dashboard
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Total Vehicles</p>
              <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center space-x-4">
          <label htmlFor="stage-filter" className="text-sm font-medium text-gray-700">
            Filter by stage:
          </label>
          <select
            id="stage-filter"
            value={selectedStage}
            onChange={(e) => handleStageChange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {STAGES.map((stage) => (
              <option key={stage.value} value={stage.value}>
                {stage.label}
              </option>
            ))}
          </select>
          
          {selectedStage !== 'all' && (
            <span className="text-sm text-gray-600">
              Showing {vehicles.length} vehicles in {STAGES.find(s => s.value === selectedStage)?.label}
            </span>
          )}
        </div>
      </div>

      {/* Vehicle Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {vehicles.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No vehicles found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {selectedStage === 'all' 
                ? 'No vehicles in the system yet.' 
                : `No vehicles in ${STAGES.find(s => s.value === selectedStage)?.label} stage.`
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {vehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}