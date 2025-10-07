import { differenceInDays } from 'date-fns'

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

interface VehicleCardProps {
  vehicle: Vehicle
}

const STAGE_COLORS = {
  acquired: 'bg-gray-100 text-gray-800',
  recon: 'bg-blue-100 text-blue-800',
  photo: 'bg-purple-100 text-purple-800',
  listing: 'bg-green-100 text-green-800',
  sold: 'bg-yellow-100 text-yellow-800',
  funded: 'bg-emerald-100 text-emerald-800'
}

const STAGE_LABELS = {
  acquired: 'Acquired',
  recon: 'Recon',
  photo: 'Photo',
  listing: 'Listing',
  sold: 'Sold',
  funded: 'Funded'
}

export default function VehicleCard({ vehicle }: VehicleCardProps) {
  const daysSinceAcquisition = differenceInDays(new Date(), new Date(vehicle.acquisition_date))
  const totalHoldingCost = daysSinceAcquisition * vehicle.holding_cost_per_day
  
  const stageColor = STAGE_COLORS[vehicle.current_stage as keyof typeof STAGE_COLORS] || 'bg-gray-100 text-gray-800'
  const stageLabel = STAGE_LABELS[vehicle.current_stage as keyof typeof STAGE_LABELS] || vehicle.current_stage

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Vehicle Image */}
      <div className="aspect-video bg-gray-200">
        <img
          src={vehicle.photo_url}
          alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = `https://picsum.photos/seed/${vehicle.vin}/800/600`
          }}
        />
      </div>
      
      {/* Vehicle Info */}
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-lg text-gray-900">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </h3>
            <p className="text-sm text-gray-600">VIN: {vehicle.vin}</p>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${stageColor}`}>
            {stageLabel}
          </span>
        </div>
        
        {/* Details */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Mileage:</span>
            <span className="font-medium">{vehicle.mileage.toLocaleString()} mi</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Acquired:</span>
            <span className="font-medium">{daysSinceAcquisition} days ago</span>
          </div>
          
          {vehicle.listing_price && (
            <div className="flex justify-between">
              <span className="text-gray-600">List Price:</span>
              <span className="font-medium">${vehicle.listing_price.toLocaleString()}</span>
            </div>
          )}
          
          {vehicle.days_on_market !== undefined && (
            <div className="flex justify-between">
              <span className="text-gray-600">Days on Market:</span>
              <span className="font-medium">{vehicle.days_on_market}</span>
            </div>
          )}
        </div>
        
        {/* Holding Cost */}
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-600">Holding Cost</p>
              <p className="text-sm font-medium text-gray-900">
                ${vehicle.holding_cost_per_day}/day
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-600">Total to Date</p>
              <p className="text-sm font-semibold text-red-600">
                ${totalHoldingCost.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
