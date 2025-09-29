import { useState } from 'react'
import { 
  TrendingUp, Package, Truck, Factory, 
  ShoppingCart, Users, ArrowRight, AlertCircle, CheckCircle,
  DollarSign, Clock, BarChart3
} from 'lucide-react'

interface SupplyChainNode {
  id: string
  name: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  currentStock: number
  incomingOrders: number
  outgoingOrders: number
  weekCosts: number
  totalCosts: number
  backlog: number
  inTransit: number
  orderPlaced: number
}

export default function GameDashboard() {
  const [currentWeek] = useState(5)
  const [gamePhase] = useState<'planning' | 'executing' | 'reviewing'>('planning')
  
  const [supplyChain] = useState<SupplyChainNode[]>([
    {
      id: 'retailer',
      name: 'RETAILER',
      icon: ShoppingCart,
      currentStock: 12,
      incomingOrders: 8,
      outgoingOrders: 15,
      weekCosts: 45,
      totalCosts: 230,
      backlog: 3,
      inTransit: 6,
      orderPlaced: 18
    },
    {
      id: 'wholesaler', 
      name: 'WHOLESALER',
      icon: Package,
      currentStock: 28,
      incomingOrders: 18,
      outgoingOrders: 22,
      weekCosts: 62,
      totalCosts: 315,
      backlog: 0,
      inTransit: 12,
      orderPlaced: 25
    },
    {
      id: 'distributor',
      name: 'DISTRIBUTOR', 
      icon: Truck,
      currentStock: 35,
      incomingOrders: 25,
      outgoingOrders: 20,
      weekCosts: 38,
      totalCosts: 195,
      backlog: 2,
      inTransit: 15,
      orderPlaced: 22
    },
    {
      id: 'manufacturer',
      name: 'MANUFACTURER',
      icon: Factory,
      currentStock: 45,
      incomingOrders: 22,
      outgoingOrders: 25,
      weekCosts: 71,
      totalCosts: 380,
      backlog: 1,
      inTransit: 20,
      orderPlaced: 30
    }
  ])

  const [newOrders, setNewOrders] = useState<Record<string, number>>({
    retailer: 0,
    wholesaler: 0,
    distributor: 0,
    manufacturer: 0
  })

  const handleOrderSubmit = (nodeId: string, quantity: number) => {
    setNewOrders(prev => ({ ...prev, [nodeId]: quantity }))
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Game Header */}
      <div className="mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Make2Manage Supply Chain</h1>
              <div className="text-sm text-gray-600">Week {currentWeek} | {gamePhase === 'planning' ? 'Planningsfase' : gamePhase === 'executing' ? 'Uitvoeringsfase' : 'Evaluatiefase'}</div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                Volgende Week
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Supply Chain Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        {supplyChain.map((node, index) => (
          <div key={node.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Node Header */}
            <div className={`p-4 text-white text-center font-semibold ${
              node.id === 'retailer' ? 'bg-blue-600' :
              node.id === 'wholesaler' ? 'bg-green-600' :
              node.id === 'distributor' ? 'bg-orange-600' : 'bg-purple-600'
            }`}>
              <div className="flex items-center justify-center space-x-2">
                <node.icon className="w-5 h-5" />
                <span>{node.name}</span>
              </div>
            </div>

            {/* Metrics Section */}
            <div className="p-4 space-y-4">
              {/* Customer Orders */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Klantorders</span>
                  <Users className="w-4 h-4 text-gray-500" />
                </div>
                <div className="flex justify-between">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{node.incomingOrders}</div>
                    <div className="text-xs text-gray-500">Inkomend</div>
                  </div>
                  <div className="w-px bg-gray-300"></div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{node.backlog}</div>
                    <div className="text-xs text-gray-500">Achterstand</div>
                  </div>
                </div>
                {node.backlog > 0 && (
                  <div className="mt-2 flex items-center text-red-600 text-xs">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Achterstand in orders
                  </div>
                )}
              </div>

              {/* Stock Level */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Voorraad</span>
                  <Package className="w-4 h-4 text-gray-500" />
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{node.currentStock}</div>
                  <div className="text-xs text-gray-500">Units beschikbaar</div>
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${node.currentStock > 20 ? 'bg-green-500' : node.currentStock > 10 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{width: `${Math.min(100, (node.currentStock / 50) * 100)}%`}}
                  ></div>
                </div>
              </div>

              {/* Transport */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Transport</span>
                  <Truck className="w-4 h-4 text-gray-500" />
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{node.inTransit}</div>
                  <div className="text-xs text-gray-500">Onderweg (volgende week)</div>
                </div>
              </div>

              {/* Weekly Costs */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Kosten</span>
                  <DollarSign className="w-4 h-4 text-gray-500" />
                </div>
                <div className="flex justify-between">
                  <div className="text-center">
                    <div className="text-xl font-bold text-orange-600">€{node.weekCosts}</div>
                    <div className="text-xs text-gray-500">Deze week</div>
                  </div>
                  <div className="w-px bg-gray-300"></div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-red-600">€{node.totalCosts}</div>
                    <div className="text-xs text-gray-500">Totaal</div>
                  </div>
                </div>
              </div>

              {/* Order Input */}
              <div className="bg-blue-50 rounded-lg p-3 border-2 border-blue-200">
                <label className="block text-sm font-medium text-blue-800 mb-2">
                  Nieuwe bestelling plaatsen
                </label>
                <div className="flex space-x-2">
                  <input 
                    type="number"
                    defaultValue={newOrders[node.id]}
                    onChange={(e) => setNewOrders(prev => ({ ...prev, [node.id]: parseInt(e.target.value) || 0 }))}
                    className="flex-1 px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Aantal"
                    min="0"
                  />
                  <button 
                    onClick={() => handleOrderSubmit(node.id, newOrders[node.id])}
                    className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Bestel
                  </button>
                </div>
                {newOrders[node.id] > 0 && (
                  <div className="mt-2 flex items-center text-green-600 text-sm">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Order van {newOrders[node.id]} units geplaatst
                  </div>
                )}
              </div>
            </div>

            {/* Flow Arrow */}
            {index < supplyChain.length - 1 && (
              <div className="hidden lg:block absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
                <div className="bg-gray-600 text-white rounded-full p-2">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Game Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Supply Chain Prestaties</h3>
            <BarChart3 className="w-6 h-6 text-blue-600" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Totale Kosten</span>
              <span className="font-semibold">€{supplyChain.reduce((sum, node) => sum + node.totalCosts, 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Gemiddelde Voorraad</span>
              <span className="font-semibold">{Math.round(supplyChain.reduce((sum, node) => sum + node.currentStock, 0) / supplyChain.length)} units</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Totale Achterstand</span>
              <span className={`font-semibold ${supplyChain.reduce((sum, node) => sum + node.backlog, 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {supplyChain.reduce((sum, node) => sum + node.backlog, 0)} orders
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Efficiency Metrics</h3>
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Service Level</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{width: '87%'}}></div>
                </div>
                <span className="text-sm font-medium">87%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Inventory Turnover</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{width: '73%'}}></div>
                </div>
                <span className="text-sm font-medium">73%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Cost Efficiency</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{width: '65%'}}></div>
                </div>
                <span className="text-sm font-medium">65%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Game Controls</h3>
            <Clock className="w-6 h-6 text-purple-600" />
          </div>
          <div className="space-y-3">
            <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
              Simuleer Volgende Week
            </button>
            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
              Bekijk Trends & Analyse
            </button>
            <button className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors">
              Exporteer Resultaten
            </button>
            <div className="text-sm text-gray-500 text-center mt-4">
              Week {currentWeek} van 20 | Planning fase
            </div>
          </div>
        </div>
      </div>

      {/* Decision Log */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Beslissingen Log - Week {currentWeek}</h3>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {supplyChain.map((node) => (
            <div key={node.id} className="border rounded-lg p-3">
              <div className="font-medium text-gray-900 mb-2">{node.name}</div>
              <div className="space-y-1 text-sm text-gray-600">
                <div>Besteld: {node.orderPlaced} units</div>
                <div>Geleverd: {node.outgoingOrders} units</div>
                <div>Status: {node.backlog > 0 ? 
                  <span className="text-red-600">Achterstand</span> : 
                  <span className="text-green-600">Op schema</span>
                }</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
