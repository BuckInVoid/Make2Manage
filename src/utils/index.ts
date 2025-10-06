import type { Order, SLAStatus, DepartmentStatus, Department } from '../types'

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

// Generate sample orders for testing
export const generateSampleOrders = (): Order[] => [
  {
    id: 'ORD-001',
    dueDate: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    route: [1, 4, 3, 2, 1, 3],
    currentStepIndex: -1,
    status: 'queued',
    timestamps: [],
    reworkCount: 0,
    createdAt: new Date()
  },
  {
    id: 'ORD-002', 
    dueDate: new Date(Date.now() + 1.5 * 60 * 60 * 1000),
    route: [2, 3, 4, 1],
    currentStepIndex: -1,
    status: 'queued',
    timestamps: [],
    reworkCount: 0,
    createdAt: new Date()
  },
  {
    id: 'ORD-003',
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
  { id: 1, name: 'Department 1', queue: [], utilization: 65, avgCycleTime: 45, totalProcessed: 23 },
  { id: 2, name: 'Department 2', queue: [], utilization: 82, avgCycleTime: 38, totalProcessed: 18 },
  { id: 3, name: 'Department 3', queue: [], utilization: 58, avgCycleTime: 52, totalProcessed: 31 },
  { id: 4, name: 'Department 4', queue: [], utilization: 91, avgCycleTime: 28, totalProcessed: 15 }
]
