// Data Models for Make-to-Order Learning Game

export interface Order {
  id: string
  dueDate: Date
  route: number[]
  currentStepIndex: number
  status: 'queued' | 'processing' | 'done' | 'error'
  timestamps: { deptId: number; start: Date; end?: Date }[]
  reworkCount: number
  createdAt: Date
}

export interface Department {
  id: number
  name: string
  queue: Order[]
  inProcess?: Order
  utilization: number
  avgCycleTime: number
  totalProcessed: number
}

export type CustomerFilter = 'all' | 'completed' | 'rejected'
export type StatisticsFilter = 'order-doorlooptijd' | 'doorlooptijd-per-werkplek' | 'orderdoorlooptijd-per-afdeling'
export type ScreenType = 'landing' | 'game' | 'analytics'
export type NavigationScreen = 'game' | 'analytics'

export interface SLAStatus {
  status: 'overdue' | 'at-risk' | 'on-track'
  color: string
  text: string
}

export interface DepartmentStatus {
  color: string
  text: string
}
