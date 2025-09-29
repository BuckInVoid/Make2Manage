import { useState } from 'react'
import { Clock, DollarSign, Truck, AlertTriangle } from 'lucide-react'

export default function GameDashboard() {
  const [currentScenario] = useState(1)
  const [gameData] = useState({
    costs: 15000,
    deliveryTime: 8,
    reliability: 85,
    customerSatisfaction: 75
  })

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Scenario Panel */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Scenario {currentScenario}: Nieuwe Productieorder
            </h2>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
              <div className="flex">
                <AlertTriangle className="w-5 h-5 text-blue-400 mr-2" />
                <div>
                  <p className="text-blue-800">
                    <strong>Situatie:</strong> Een belangrijke klant vraagt om een rush order van 500 units. 
                    De normale levertijd is 10 dagen, maar zij hebben het product over 6 dagen nodig.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Wat is je beslissing?</h3>
                <div className="space-y-2">
                  <label className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input type="radio" name="decision" className="text-blue-600" />
                    <span>Accepteer de rush order met overtime kosten (+30% kosten)</span>
                  </label>
                  <label className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input type="radio" name="decision" className="text-blue-600" />
                    <span>Stel alternatieve levertijd voor (8 dagen, normale kosten)</span>
                  </label>
                  <label className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input type="radio" name="decision" className="text-blue-600" />
                    <span>Wijs de order af (geen extra kosten, maar klantverlies)</span>
                  </label>
                </div>
              </div>
              
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Bevestig Beslissing
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard Metrics */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Huidige Prestaties</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Kosten</span>
                </div>
                <span className="font-semibold text-gray-900">€{gameData.costs.toLocaleString()}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-700">Levertijd</span>
                </div>
                <span className="font-semibold text-gray-900">{gameData.deliveryTime} dagen</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-purple-600" />
                  <span className="text-gray-700">Betrouwbaarheid</span>
                </div>
                <span className="font-semibold text-gray-900">{gameData.reliability}%</span>
              </div>
              
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Klanttevredenheid</span>
                  <span className={`font-semibold ${gameData.customerSatisfaction >= 80 ? 'text-green-600' : gameData.customerSatisfaction >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {gameData.customerSatisfaction}%
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Voortgang</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Scenario's voltooid</span>
                  <span>1/5</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{width: '20%'}}></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
              Exporteer Resultaten
            </button>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Download je voortgang om te delen met de docent
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
