import { useState } from 'react'
import { Package, Factory, ShoppingCart, Users, Play, Eye, CheckCircle, XCircle } from 'lucide-react'
import type { Order, Department, CustomerFilter } from '../types'
import { formatDueDate, getSLAStatus, getDepartmentStatus, generateSampleOrders, generateSampleDepartments } from '../utils'

export default function GameScreen() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false)
  const [previewRoute, setPreviewRoute] = useState<number[]>([])
  const [customerFilter, setCustomerFilter] = useState<CustomerFilter>('all')
  
  // Game state
  const [incomingOrders, setIncomingOrders] = useState<Order[]>(generateSampleOrders())
  const [departments, setDepartments] = useState<Department[]>(generateSampleDepartments())
  const [completedOrders] = useState<Order[]>([])

  // Game actions
  const releaseOrder = (order: Order) => {
    if (order.route.length === 0) return
    
    const firstDept = order.route[0]
    const updatedOrder = {
      ...order,
      currentStepIndex: 0,
      status: 'processing' as const,
      timestamps: [{ deptId: firstDept, start: new Date() }]
    }

    // Remove from incoming orders
    setIncomingOrders(prev => prev.filter(o => o.id !== order.id))
    
    // Add to first department queue
    setDepartments(prev => prev.map(dept => 
      dept.id === firstDept 
        ? { ...dept, queue: [...dept.queue, updatedOrder] }
        : dept
    ))
  }

  const previewOrderRoute = (order: Order) => {
    setPreviewRoute(order.route)
    setTimeout(() => setPreviewRoute([]), 3000)
  }

  const openOrderDetail = (order: Order) => {
    setSelectedOrder(order)
    setDetailDrawerOpen(true)
  }

  const filteredCustomerOrders = completedOrders.filter(order => {
    if (customerFilter === 'all') return true
    if (customerFilter === 'completed') return order.status === 'done'
    if (customerFilter === 'rejected') return order.status === 'error'
    return true
  })

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-gray-50">
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
                onClick={() => incomingOrders.length > 0 && releaseOrder(incomingOrders[0])}
                disabled={incomingOrders.length === 0}
                className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium"
              >
                <Play size={18} />
                <span>Release Next Order</span>
              </button>
            </div>
            <div className="text-sm text-gray-500">
              Orders in queue: {incomingOrders.length}
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
            {incomingOrders.map((order) => {
              const sla = getSLAStatus(order)
              return (
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
                    <span className={`text-xs px-3 py-1 rounded-full text-white font-medium ${sla.color}`}>
                      {formatDueDate(order.dueDate)}
                    </span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); openOrderDetail(order); }}
                      className="text-gray-400 hover:text-gray-600 p-1"
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                </div>
              )
            })}
            {incomingOrders.length === 0 && (
              <p className="text-gray-500 text-center py-8">No incoming orders</p>
            )}
          </div>
        </div>
      </div>

      {/* Factory Grid (2x2) */}
      <div className="mb-8">
        <div className="grid grid-cols-2 gap-8 max-w-5xl mx-auto">
          {departments.map((dept) => {
            const status = getDepartmentStatus(dept)
            const isHighlighted = previewRoute.includes(dept.id)
            
            return (
              <div 
                key={dept.id}
                className={`bg-white rounded-xl p-6 shadow-sm border-2 transition-all min-h-[200px] ${
                  isHighlighted ? 'border-blue-500 bg-blue-50 scale-105' : 'border-gray-200'
                } ${status.color}`}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-800">{dept.name}</h3>
                  <Factory className="w-8 h-8 text-purple-600" />
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Queue</p>
                      <p className="text-2xl font-bold text-gray-900">{dept.queue.length}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">WIP</p>
                      <p className="text-2xl font-bold text-gray-900">{dept.inProcess ? 1 : 0}</p>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Utilization</p>
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            dept.utilization > 85 ? 'bg-red-500' : 
                            dept.utilization > 70 ? 'bg-amber-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${dept.utilization}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold">{dept.utilization}%</span>
                    </div>
                  </div>
                  
                  <div className={`text-sm px-3 py-2 rounded-lg text-center font-medium ${status.color}`}>
                    {status.text}
                  </div>
                  
                  {dept.inProcess && (
                    <div className="flex items-center justify-center space-x-2 text-blue-600 bg-blue-50 rounded-lg p-3">
                      <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">Processing {dept.inProcess.id}</span>
                    </div>
                  )}
                  
                  {dept.queue.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs text-gray-600 mb-2">Next in queue:</p>
                      <div className="flex flex-wrap gap-1">
                        {dept.queue.slice(0, 3).map((order) => (
                          <span key={order.id} className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {order.id}
                          </span>
                        ))}
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
          <h3 className="text-xl font-semibold text-gray-800">Customer</h3>
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
        
        <div className="space-y-3 max-h-48 overflow-y-auto">
          {filteredCustomerOrders.map((order) => (
            <div 
              key={order.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 border"
              onClick={() => openOrderDetail(order)}
            >
              <div className="flex items-center space-x-3">
                <span className="font-mono text-sm font-semibold">{order.id}</span>
                {order.status === 'done' ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <span className="text-sm text-gray-600">
                  {order.status === 'done' ? 'Completed' : 'Rejected'}
                </span>
              </div>
              <Eye size={16} className="text-gray-400" />
            </div>
          ))}
          {filteredCustomerOrders.length === 0 && (
            <p className="text-gray-500 text-center py-8">No orders to display</p>
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
                    selectedOrder.status === 'done' ? 'bg-green-100 text-green-800' :
                    selectedOrder.status === 'error' ? 'bg-red-100 text-red-800' :
                    selectedOrder.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 block mb-1">Rework Count</label>
                  <p className="text-lg">{selectedOrder.reworkCount}</p>
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
