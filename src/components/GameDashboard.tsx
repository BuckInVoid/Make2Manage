import { useState } from 'react'
import { Package, Truck, Factory, ShoppingCart, Users, DollarSign, TrendingUp, AlertCircle, BarChart3 } from 'lucide-react'

export default function GameDashboard() {
  const currentWeek = 5
  
  const supplyChain = [
    { id: 'retailer', name: 'Retailer', icon: ShoppingCart, stock: 12, orders: 8, costs: 230, incoming: 6, color: 'blue' },
    { id: 'wholesaler', name: 'Wholesaler', icon: Package, stock: 28, orders: 18, costs: 315, incoming: 12, color: 'orange' },
    { id: 'distributor', name: 'Distributor', icon: Truck, stock: 35, orders: 25, costs: 195, incoming: 15, color: 'emerald' },
    { id: 'manufacturer', name: 'Manufacturer', icon: Factory, stock: 45, orders: 22, costs: 380, incoming: 20, color: 'purple' }
  ]

  const [orders, setOrders] = useState<Record<string, string>>({ 
    retailer: '', 
    wholesaler: '', 
    distributor: '', 
    manufacturer: '' 
  })

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: {
        gradient: 'from-blue-500 to-blue-600',
        light: 'text-blue-100',
        lighter: 'text-blue-200',
        icon: 'bg-blue-100',
        iconText: 'text-blue-600'
      },
      orange: {
        gradient: 'from-orange-500 to-orange-600',
        light: 'text-orange-100',
        lighter: 'text-orange-200',
        icon: 'bg-orange-100',
        iconText: 'text-orange-600'
      },
      emerald: {
        gradient: 'from-emerald-500 to-emerald-600',
        light: 'text-emerald-100',
        lighter: 'text-emerald-200',
        icon: 'bg-emerald-100',
        iconText: 'text-emerald-600'
      },
      purple: {
        gradient: 'from-purple-500 to-purple-600',
        light: 'text-purple-100',
        lighter: 'text-purple-200',
        icon: 'bg-purple-100',
        iconText: 'text-purple-600'
      }
    }
    return colorMap[color as keyof typeof colorMap]
  }

  return (
    <div className="w-screen h-screen bg-white flex overflow-hidden">
      
      {/* Sidebar */}
      <div className="w-16 bg-slate-800 flex flex-col items-center py-6 shrink-0">
        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mb-8">
          <span className="text-sm font-bold text-slate-800">SC</span>
        </div>
        
        <div className="flex flex-col space-y-6">
          <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center cursor-pointer hover:bg-slate-500 transition-colors">
            <BarChart3 size={16} className="text-white" />
          </div>
          <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center cursor-pointer hover:bg-slate-500 transition-colors">
            <TrendingUp size={16} className="text-white" />
          </div>
          <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center cursor-pointer hover:bg-slate-500 transition-colors">
            <Package size={16} className="text-white" />
          </div>
          <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center cursor-pointer hover:bg-slate-500 transition-colors">
            <AlertCircle size={16} className="text-white" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 h-full p-8 bg-gray-50 overflow-y-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Supply Chain Dashboard</h1>
          <p className="text-gray-600">Week {currentWeek} • Manufacturing Planning & Control</p>
        </div>

        {/* Top Metrics Cards - 4 Afdelingen */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          {supplyChain.map((node) => {
            const IconComponent = node.icon
            const colors = getColorClasses(node.color)
            return (
              <div key={`top-${node.id}`} className={`bg-gradient-to-br ${colors.gradient} rounded-xl p-6 text-white shadow-lg`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`${colors.light} text-sm font-medium`}>{node.name}</p>
                    <p className="text-3xl font-bold mt-1">{node.stock}</p>
                    <p className={`${colors.lighter} text-xs mt-1`}>Units in stock</p>
                  </div>
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    <IconComponent size={24} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Operations Grid */}
        <div className="grid grid-cols-6 gap-4 mb-8">
          
          {/* Current Orders Row */}
          {supplyChain.map((node) => (
            <div key={`orders-${node.id}`} className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-center">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Users size={20} className="text-indigo-600" />
                </div>
                <h3 className="font-semibold text-gray-800 text-xs mb-1">Current Orders</h3>
                <p className="text-xl font-bold text-gray-900 mb-1">{node.orders}</p>
                <p className="text-xs text-gray-500">{node.name}</p>
              </div>
            </div>
          ))}

          {/* Stock Levels Row */}
          {supplyChain.map((node) => (
            <div key={`stock-${node.id}`} className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-center">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Package size={20} className="text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-800 text-xs mb-1">Stock Level</h3>
                <p className="text-xl font-bold text-gray-900 mb-1">{node.stock}</p>
                <p className="text-xs text-gray-500">{node.name}</p>
              </div>
            </div>
          ))}

          {/* Incoming Shipments Row */}
          {supplyChain.map((node) => (
            <div key={`incoming-${node.id}`} className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-center">
                <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Truck size={20} className="text-yellow-600" />
                </div>
                <h3 className="font-semibold text-gray-800 text-xs mb-1">Incoming</h3>
                <p className="text-xl font-bold text-gray-900 mb-1">{node.incoming}</p>
                <p className="text-xs text-gray-500">{node.name}</p>
              </div>
            </div>
          ))}

          {/* Weekly Costs Row */}
          {supplyChain.map((node) => (
            <div key={`costs-${node.id}`} className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-center">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <DollarSign size={20} className="text-red-600" />
                </div>
                <h3 className="font-semibold text-gray-800 text-xs mb-1">Weekly Costs</h3>
                <p className="text-xl font-bold text-red-600 mb-1">${node.costs}</p>
                <p className="text-xs text-gray-500">{node.name}</p>
              </div>
            </div>
          ))}

        </div>

        {/* Order Input Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Place New Orders</h2>
          <div className="grid grid-cols-4 gap-6">
            {supplyChain.map((node) => {
              const IconComponent = node.icon
              const colors = getColorClasses(node.color)
              return (
                <div key={`input-${node.id}`} className="border-2 border-gray-100 rounded-xl p-6 hover:border-blue-200 transition-colors">
                  <div className="text-center">
                    <div className={`w-12 h-12 ${colors.icon} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                      <IconComponent size={24} className={colors.iconText} />
                    </div>
                    <h3 className="font-semibold text-gray-800 text-sm mb-3">{node.name}</h3>
                    <input 
                      type="number"
                      value={orders[node.id]}
                      onChange={(e) => setOrders(prev => ({ ...prev, [node.id]: e.target.value }))}
                      className="w-full text-center text-lg font-semibold border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-blue-400 focus:outline-none transition-colors"
                      placeholder="0"
                      min="0"
                    />
                    <p className="text-xs text-gray-500 mt-2">Units to order</p>
                  </div>
                </div>
              )
            })}
          </div>
          
          {/* Submit Button */}
          <div className="mt-8 flex justify-center">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors">
              Submit Orders for Week {currentWeek + 1}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
