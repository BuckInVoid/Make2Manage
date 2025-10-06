import { useState } from 'react'
import { Users, Package, Star, Clock, DollarSign, AlertTriangle, Filter, Search } from 'lucide-react'
import type { Order, Customer, CustomerFilter, OrderPriority } from '../types'

interface CustomerOrderManagerProps {
  orders: Order[]
  customers: Customer[]
  onReleaseOrder: (orderId: string) => void
  onModifyOrder?: (orderId: string, modifications: Partial<Order>) => void
  // onCreateOrder?: (order: Omit<Order, 'id' | 'createdAt'>) => void // TODO: Future feature
}

export default function CustomerOrderManager({ 
  orders, 
  customers, 
  onReleaseOrder,
  onModifyOrder
}: CustomerOrderManagerProps) {
  const [selectedFilter, setSelectedFilter] = useState<CustomerFilter>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<string>('')

  const getPriorityColor = (priority: OrderPriority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'normal':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityIcon = (priority: OrderPriority) => {
    switch (priority) {
      case 'urgent':
        return <AlertTriangle size={14} className="text-red-600" />
      case 'high':
        return <Clock size={14} className="text-orange-600" />
      case 'normal':
        return <Package size={14} className="text-blue-600" />
      case 'low':
        return <Package size={14} className="text-gray-600" />
      default:
        return <Package size={14} className="text-gray-600" />
    }
  }

  const getCustomerTierBadge = (customer: Customer) => {
    const tierColors = {
      vip: 'bg-purple-100 text-purple-800',
      premium: 'bg-yellow-100 text-yellow-800', 
      standard: 'bg-green-100 text-green-800'
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${tierColors[customer.tier]}`}>
        {customer.tier === 'vip' && <Star size={10} className="inline mr-1" />}
        {customer.tier.toUpperCase()}
      </span>
    )
  }

  const filteredOrders = orders.filter(order => {
    // Apply search filter
    if (searchTerm && !order.id.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !order.customerName.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }

    // Apply customer filter
    if (selectedCustomer && order.customerId !== selectedCustomer) {
      return false
    }

    // Apply status filter
    switch (selectedFilter) {
      case 'high-priority':
        return order.priority === 'high' || order.priority === 'urgent'
      case 'rush-orders':
        return order.rushOrder === true
      case 'completed':
        return order.status === 'completed-on-time' || order.status === 'completed-late'
      case 'rejected':
        return order.status === 'error'
      default:
        return true
    }
  })

  const sortedOrders = filteredOrders.sort((a, b) => {
    // Sort by priority first
    const priorityOrder = { urgent: 4, high: 3, normal: 2, low: 1 }
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
    if (priorityDiff !== 0) return priorityDiff
    
    // Then by due date
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  })

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
          <Users className="w-6 h-6 text-blue-600" />
          <span>Customer Orders (R01-R03)</span>
        </h3>
        
        {/* TODO: Implement new order functionality
        {onCreateOrder && (
          <button
            onClick={() => console.log('New order feature coming soon')}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus size={16} />
            <span>New Order</span>
          </button>
        )}
        */}
      </div>

      {/* Filters and Search */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search orders or customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <Filter size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value as CustomerFilter)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
          >
            <option value="all">All Orders</option>
            <option value="high-priority">High Priority</option>
            <option value="rush-orders">Rush Orders</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Customer Filter */}
        <div className="relative">
          <Users size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <select
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
          >
            <option value="">All Customers</option>
            {customers.map(customer => (
              <option key={customer.id} value={customer.id}>
                {customer.name} ({customer.tier})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {sortedOrders.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No orders match the current filters</p>
        ) : (
          sortedOrders.map(order => {
            const customer = customers.find(c => c.id === order.customerId)
            
            return (
              <div
                key={order.id}
                className={`border rounded-lg p-4 transition-all duration-200 hover:shadow-md ${
                  order.rushOrder ? 'border-red-200 bg-red-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Order Header */}
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="font-mono text-sm font-semibold">{order.id}</span>
                      
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(order.priority)} flex items-center space-x-1`}>
                        {getPriorityIcon(order.priority)}
                        <span>{order.priority.toUpperCase()}</span>
                      </span>
                      
                      {order.rushOrder && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                          RUSH
                        </span>
                      )}
                    </div>

                    {/* Customer Info */}
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="font-medium text-gray-800">{order.customerName}</span>
                      {customer && getCustomerTierBadge(customer)}
                    </div>

                    {/* Order Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <DollarSign size={14} />
                        <span>${order.orderValue.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock size={14} />
                        <span>Due: {new Date(order.dueDate).toLocaleDateString()}</span>
                      </div>
                      <div>
                        Route: {order.route.join(' → ')}
                      </div>
                      <div>
                        Status: <span className="capitalize">{order.status.replace('-', ' ')}</span>
                      </div>
                    </div>

                    {order.specialInstructions && (
                      <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                        <span className="font-medium">Special Instructions:</span> {order.specialInstructions}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col space-y-2 ml-4">
                    {order.status === 'queued' && (
                      <button
                        onClick={() => onReleaseOrder(order.id)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                      >
                        Release
                      </button>
                    )}
                    
                    {onModifyOrder && (
                      <button
                        onClick={() => {/* TODO: Open modify modal */}}
                        className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
                      >
                        Modify
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="font-semibold text-gray-800">{sortedOrders.length}</div>
            <div className="text-gray-600">Total Orders</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-red-600">
              {sortedOrders.filter(o => o.priority === 'urgent' || o.priority === 'high').length}
            </div>
            <div className="text-gray-600">High Priority</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-orange-600">
              {sortedOrders.filter(o => o.rushOrder).length}
            </div>
            <div className="text-gray-600">Rush Orders</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-green-600">
              ${sortedOrders.reduce((sum, o) => sum + o.orderValue, 0).toLocaleString()}
            </div>
            <div className="text-gray-600">Total Value</div>
          </div>
        </div>
      </div>
    </div>
  )
}
