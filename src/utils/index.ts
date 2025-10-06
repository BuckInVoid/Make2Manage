import type { Order, Department, SLAStatus, DepartmentStatus, Customer } from '../types'

// Date and time formatting utilities
export const formatDueDate = (date: Date): string => {
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  
  if (diffMs < 0) return 'OVERDUE'
  if (diffHours === 0) return `${diffMins}m`
  return `${diffHours}h ${diffMins}m`
}

// SLA status calculation
export const getSLAStatus = (order: Order): SLAStatus => {
  const now = new Date()
  const timeLeft = order.dueDate.getTime() - now.getTime()
  const totalTime = order.dueDate.getTime() - order.createdAt.getTime()
  const elapsed = now.getTime() - order.createdAt.getTime()
  const progress = elapsed / totalTime

  if (timeLeft < 0) return { status: 'overdue', color: 'bg-red-500', text: 'OVERDUE' }
  if (progress > 0.8) return { status: 'at-risk', color: 'bg-amber-500', text: 'AT RISK' }
  return { status: 'on-track', color: 'bg-green-500', text: 'ON TRACK' }
}

// Department status calculation
export const getDepartmentStatus = (dept: Department): DepartmentStatus => {
  if (dept.utilization > 85) return { color: 'bg-red-100 border-red-300', text: 'HIGH LOAD' }
  if (dept.utilization > 70) return { color: 'bg-amber-100 border-amber-300', text: 'BUSY' }
  return { color: 'bg-green-100 border-green-300', text: 'AVAILABLE' }
}

// R01-R03: Generate sample customers
export const generateSampleCustomers = (): Customer[] => [
  {
    id: 'CUST-001',
    name: 'Acme Manufacturing',
    tier: 'vip',
    contactEmail: 'orders@acme-mfg.com',
    totalOrders: 45,
    onTimeDeliveryRate: 92.5,
    averageOrderValue: 15000
  },
  {
    id: 'CUST-002', 
    name: 'TechCorp Solutions',
    tier: 'premium',
    contactEmail: 'procurement@techcorp.com',
    totalOrders: 28,
    onTimeDeliveryRate: 88.2,
    averageOrderValue: 8500
  },
  {
    id: 'CUST-003',
    name: 'Global Industries',
    tier: 'standard',
    contactEmail: 'orders@global-ind.com',
    totalOrders: 67,
    onTimeDeliveryRate: 85.7,
    averageOrderValue: 5200
  },
  {
    id: 'CUST-004',
    name: 'Precision Parts Ltd',
    tier: 'premium',
    contactEmail: 'purchasing@precision-parts.com',
    totalOrders: 34,
    onTimeDeliveryRate: 91.1,
    averageOrderValue: 12300
  }
]

// Generate sample orders for testing
export const generateSampleOrders = (): Order[] => [
  {
    id: 'ORD-001',
    customerId: 'CUST-001',
    customerName: 'Acme Manufacturing',
    priority: 'high',
    orderValue: 15000,
    dueDate: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    route: [1, 4, 3, 2, 1, 3],
    currentStepIndex: -1,
    status: 'queued',
    timestamps: [],
    reworkCount: 0,
    createdAt: new Date(),
    specialInstructions: 'Handle with care - precision components',
    rushOrder: false
  },
  {
    id: 'ORD-002', 
    customerId: 'CUST-002',
    customerName: 'TechCorp Solutions',
    priority: 'urgent',
    orderValue: 8500,
    dueDate: new Date(Date.now() + 1.5 * 60 * 60 * 1000),
    route: [2, 3, 4, 1],
    currentStepIndex: -1,
    status: 'queued',
    timestamps: [],
    reworkCount: 0,
    createdAt: new Date(),
    rushOrder: true
  },
  {
    id: 'ORD-003',
    customerId: 'CUST-003',
    customerName: 'Global Industries',
    priority: 'normal',
    orderValue: 5200,
    dueDate: new Date(Date.now() + 3 * 60 * 60 * 1000),
    route: [1, 2, 3, 4, 3, 2],
    currentStepIndex: -1,
    status: 'queued', 
    timestamps: [],
    reworkCount: 0,
    createdAt: new Date()
  }
]

// Generate sample departments
export const generateSampleDepartments = (): Department[] => [
  { 
    id: 1, 
    name: 'Department 1', 
    queue: [], 
    utilization: 65, 
    avgCycleTime: 45, 
    totalProcessed: 23,
    capacity: 3,
    efficiency: 1.0,
    equipmentCondition: 0.98,
    status: 'available',
    operations: [],
    standardProcessingTime: 45
  },
  { 
    id: 2, 
    name: 'Department 2', 
    queue: [], 
    utilization: 82, 
    avgCycleTime: 38, 
    totalProcessed: 18,
    capacity: 2,
    efficiency: 1.1,
    equipmentCondition: 0.95,
    status: 'busy',
    operations: [],
    standardProcessingTime: 38
  },
  { 
    id: 3, 
    name: 'Department 3', 
    queue: [], 
    utilization: 58, 
    avgCycleTime: 52, 
    totalProcessed: 31,
    capacity: 4,
    efficiency: 0.9,
    equipmentCondition: 1.0,
    status: 'available',
    operations: [],
    standardProcessingTime: 52
  },
  { 
    id: 4, 
    name: 'Department 4', 
    queue: [], 
    utilization: 91, 
    avgCycleTime: 28, 
    totalProcessed: 15,
    capacity: 1,
    efficiency: 1.2,
    equipmentCondition: 0.97,
    status: 'overloaded',
    operations: [],
    standardProcessingTime: 28
  }
]
