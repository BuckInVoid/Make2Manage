import { useState } from 'react'
import { Package, Factory, ShoppingCart, Users, Play, Eye, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import type { Order, Department, CustomerFilter, GameSettings } from '../types'
import { GameControls } from '../components'
import { useGameSimulation } from '../hooks/useGameSimulation'

export default function GameScreen() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false)
  const [previewRoute, setPreviewRoute] = useState<number[]>([])
  const [customerFilter, setCustomerFilter] = useState<CustomerFilter>('all')
  
  // Game settings - in a real app, these might come from a setup screen
  const gameSettings: GameSettings = {
    sessionDuration: 20, // 20 minutes for testing
    orderGenerationRate: 'medium',
    complexityLevel: 'intermediate',
    randomSeed: 'demo-seed-123'
  }

  // Use the game simulation hook
  const { gameState, startGame, pauseGame, resetGame, releaseOrder } = useGameSimulation(gameSettings)

  const previewOrderRoute = (order: Order) => {
    setPreviewRoute(order.route)
    setTimeout(() => setPreviewRoute([]), 3000)
  }

  const openOrderDetail = (order: Order) => {
    setSelectedOrder(order)
    setDetailDrawerOpen(true)
  }

  const handleReleaseOrder = (orderId: string) => {
    releaseOrder(orderId)
  }

  const filteredCustomerOrders = (() => {
    const allCompleted = [...gameState.completedOrders, ...gameState.rejectedOrders]
    switch (customerFilter) {
      case 'completed':
        return allCompleted.filter(order => order.status === 'completed-on-time' || order.status === 'completed-late')
      case 'rejected':
        return allCompleted.filter(order => order.status === 'error')
      default:
        return allCompleted
    }
  })()

  const getDepartmentStatus = (dept: Department) => {
    switch (dept.status) {
      case 'overloaded':
        return { color: 'bg-red-100 border-red-300 text-red-800', text: 'OVERLOADED' }
      case 'busy':
        return { color: 'bg-amber-100 border-amber-300 text-amber-800', text: 'BUSY' }
      case 'maintenance':
        return { color: 'bg-purple-100 border-purple-300 text-purple-800', text: 'MAINTENANCE' }
      default:
        return { color: 'bg-green-100 border-green-300 text-green-800', text: 'AVAILABLE' }
    }
  }

  const getSLAStatusColor = (order: Order) => {
    switch (order.slaStatus) {
      case 'overdue':
        return 'bg-red-500 text-white'
      case 'at-risk':
        return 'bg-amber-500 text-white'
      default:
        return 'bg-green-500 text-white'
    }
  }

  const formatTime = (milliseconds?: number) => {
    if (!milliseconds) return '--'
    const minutes = Math.floor(milliseconds / (60 * 1000))
    const seconds = Math.floor((milliseconds % (60 * 1000)) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-gray-50">
      {/* Game Controls */}
      <GameControls
        session={gameState.session}
        performance={gameState.performance}
        onStart={startGame}
        onPause={pauseGame}
        onReset={resetGame}
      />

      {/* Top Row Cards */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        {/* Sales Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-800">Sales</h3>
            <ShoppingCart className="w-8 h-8 text-blue-600" />
          </div>
          <div className="space-y-4">
            <p className="text-gray-600">Release orders to factory</p>
            <div className="flex space-x-3">
              <button 
                onClick={() => gameState.pendingOrders.length > 0 && handleReleaseOrder(gameState.pendingOrders[0].id)}
                disabled={gameState.pendingOrders.length === 0 || gameState.session.status !== 'running'}
                className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium"
              >
                <Play size={18} />
                <span>Release Next Order</span>
              </button>
            </div>
            <div className="text-sm text-gray-500">
              Orders in queue: {gameState.pendingOrders.length}
            </div>
          </div>
        </div>

        {/* Incoming Orders Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-800">Incoming Orders</h3>
            <Package className="w-8 h-8 text-green-600" />
          </div>
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {gameState.pendingOrders.slice(0, 5).map((order) => (
              <div 
                key={order.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors border"
                onClick={() => previewOrderRoute(order)}
              >
                <div className="flex items-center space-x-3">
                  <span className="font-mono text-sm font-semibold text-gray-800">{order.id}</span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                    {order.route.join('→')}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`text-xs px-3 py-1 rounded-full text-white font-medium ${getSLAStatusColor(order)}`}>
                    {order.slaStatus?.toUpperCase()}
                  </span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); openOrderDetail(order); }}
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    <Eye size={16} />
                  </button>
                </div>
              </div>
            ))}
            {gameState.pendingOrders.length === 0 && (
              <p className="text-gray-500 text-center py-8">No incoming orders</p>
            )}
          </div>
        </div>
      </div>

      {/* Factory Grid (2x2) */}
      <div className="mb-8">
        <div className="grid grid-cols-2 gap-8 max-w-5xl mx-auto">
          {gameState.departments.map((dept) => {
            const status = getDepartmentStatus(dept)
            const isHighlighted = previewRoute.includes(dept.id)
            
            return (
              <div 
                key={dept.id}
                className={`bg-white rounded-xl p-6 shadow-sm border-2 transition-all duration-300 min-h-[280px] ${
                  isHighlighted ? 'border-blue-500 bg-blue-50 scale-105' : 'border-gray-200'
                } ${status.color}`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">{dept.name}</h3>
                    <div className="text-xs text-gray-600 mt-1">
                      Standard Time: {dept.standardProcessingTime}min | {dept.operations?.length || 0} operation(s)
                    </div>
                  </div>
                  <Factory className="w-8 h-8 text-purple-600" />
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Queue</p>
                      <p className="text-2xl font-bold text-gray-900">{dept.queue.length}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Processing</p>
                      <p className="text-2xl font-bold text-gray-900">{dept.inProcess ? 1 : 0}</p>
                    </div>
                  </div>
                  
                  {/* Current Processing Order with Progress Bar */}
                  {dept.inProcess && (
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-blue-800">Processing: {dept.inProcess.id}</span>
                        <span className="text-sm text-blue-600">
                          {formatTime(dept.inProcess.processingTimeRemaining)}
                        </span>
                      </div>
                      
                      {/* Current Operation Info */}
                      {dept.inProcess.currentOperationIndex !== undefined && dept.operations && (
                        <div className="mb-2">
                          <div className="text-xs text-blue-600 mb-1">
                            Operation {(dept.inProcess.currentOperationIndex || 0) + 1} of {dept.operations.length}: 
                            <span className="font-medium ml-1">
                              {dept.operations[dept.inProcess.currentOperationIndex || 0]?.name}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {/* Progress Bar */}
                      <div className="w-full bg-blue-200 rounded-full h-3">
                        <div 
                          className="bg-blue-500 h-3 rounded-full transition-all duration-1000 ease-linear"
                          style={{ 
                            width: `${dept.inProcess.processingTime && dept.inProcess.processingTimeRemaining
                              ? ((dept.inProcess.processingTime - dept.inProcess.processingTimeRemaining) / dept.inProcess.processingTime) * 100
                              : 0}%` 
                          }}
                        />
                      </div>
                      
                      {/* Operations Progress */}
                      {dept.operations && dept.operations.length > 1 && (
                        <div className="mt-3 space-y-1">
                          <div className="text-xs text-blue-600 font-medium">Department Operations:</div>
                          <div className="flex space-x-1">
                            {dept.operations.map((operation, index) => {
                              const isCompleted = dept.inProcess?.operationProgress?.some(
                                p => p.operationId === operation.id && p.completed
                              )
                              const isCurrent = (dept.inProcess?.currentOperationIndex || 0) === index
                              
                              return (
                                <div 
                                  key={operation.id}
                                  className={`flex-1 h-2 rounded-full ${
                                    isCompleted ? 'bg-green-400' : 
                                    isCurrent ? 'bg-blue-400' : 
                                    'bg-gray-200'
                                  }`}
                                  title={`${operation.name} (${operation.duration}min)`}
                                />
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Utilization</p>
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-1000 ${
                            dept.utilization > 85 ? 'bg-red-500' : 
                            dept.utilization > 70 ? 'bg-amber-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(dept.utilization, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold">{dept.utilization}%</span>
                    </div>
                  </div>
                  
                  <div className={`text-sm px-3 py-2 rounded-lg text-center font-medium ${status.color}`}>
                    {status.text}
                  </div>
                  
                  {dept.queue.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs text-gray-600 mb-2">Next in queue:</p>
                      <div className="flex flex-wrap gap-1">
                        {dept.queue.slice(0, 3).map((order) => {
                          const slaColor = order.slaStatus === 'overdue' ? 'bg-red-100 text-red-800' :
                                          order.slaStatus === 'at-risk' ? 'bg-amber-100 text-amber-800' :
                                          'bg-green-100 text-green-800'
                          return (
                            <span key={order.id} className={`text-xs px-2 py-1 rounded ${slaColor}`}>
                              {order.id}
                            </span>
                          )
                        })}
                        {dept.queue.length > 3 && (
                          <span className="text-xs text-gray-500">+{dept.queue.length - 3} more</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Customer Card */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800">Customer Orders</h3>
          <Users className="w-8 h-8 text-green-600" />
        </div>
        
        <div className="flex space-x-2 mb-6">
          {(['all', 'completed', 'rejected'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setCustomerFilter(filter)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                customerFilter === filter 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-64 overflow-y-auto">
          {filteredCustomerOrders.map((order) => (
            <div 
              key={order.id}
              className="p-4 rounded-lg border-2 transition-all duration-300 cursor-pointer hover:shadow-md"
              onClick={() => openOrderDetail(order)}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-sm font-semibold">{order.id}</span>
                {order.status === 'completed-on-time' ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : order.status === 'completed-late' ? (
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
              </div>
              
              <div className="space-y-1 text-sm text-gray-600">
                <div>Route: {order.route.join(' → ')}</div>
                {order.actualLeadTime && (
                  <div className={`font-medium ${
                    order.status === 'completed-on-time' ? 'text-green-600' : 
                    order.status === 'completed-late' ? 'text-amber-600' : 
                    'text-red-600'
                  }`}>
                    Lead Time: {order.actualLeadTime}min
                  </div>
                )}
              </div>
            </div>
          ))}
          {filteredCustomerOrders.length === 0 && (
            <p className="text-gray-500 text-center py-8 col-span-full">No orders to display</p>
          )}
        </div>
      </div>

      {/* Order Detail Drawer */}
      {detailDrawerOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold text-gray-800">Order Details: {selectedOrder.id}</h3>
              <button 
                onClick={() => setDetailDrawerOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-2"
              >
                <XCircle size={28} />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-600 block mb-1">Route</label>
                  <p className="text-lg font-mono bg-gray-100 px-3 py-2 rounded">{selectedOrder.route.join(' → ')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 block mb-1">Due Date</label>
                  <p className="text-lg">{selectedOrder.dueDate.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 block mb-1">Status</label>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    selectedOrder.status === 'completed-on-time' ? 'bg-green-100 text-green-800' :
                    selectedOrder.status === 'completed-late' ? 'bg-amber-100 text-amber-800' :
                    selectedOrder.status === 'error' ? 'bg-red-100 text-red-800' :
                    selectedOrder.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 block mb-1">Lead Time</label>
                  <p className="text-lg">{selectedOrder.actualLeadTime || '--'} minutes</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600 mb-3 block">Timeline</label>
                <div className="space-y-3">
                  {selectedOrder.timestamps.length > 0 ? selectedOrder.timestamps.map((timestamp, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-blue-600">{timestamp.deptId}</span>
                        </div>
                        <span className="font-medium">Department {timestamp.deptId}</span>
                      </div>
                      <div className="text-sm text-gray-600 text-right">
                        <div>Start: {timestamp.start.toLocaleTimeString()}</div>
                        {timestamp.end && <div>End: {timestamp.end.toLocaleTimeString()}</div>}
                      </div>
                    </div>
                  )) : (
                    <p className="text-gray-500 text-center py-4">No timeline data available</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
