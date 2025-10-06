// Data Models for Make-to-Order Learning Game

export interface Order {
  id: string
  dueDate: Date
  route: number[]
  currentStepIndex: number
  status: 'queued' | 'processing' | 'done' | 'error' | 'completed-on-time' | 'completed-late'
  timestamps: { deptId: number; start: Date; end?: Date }[]
  reworkCount: number
  createdAt: Date
  processingTime?: number // Total time needed for current step
  processingTimeRemaining?: number // Time remaining for current step
  actualLeadTime?: number // Actual completion time
  slaStatus?: 'on-track' | 'at-risk' | 'overdue'
  completedAt?: Date
  currentDepartment?: number
  currentOperationIndex?: number // For tracking multi-step department operations
  operationProgress?: OperationProgress[] // Track progress through department operations
}

export interface OperationProgress {
  operationId: string
  operationName: string
  startTime: Date
  endTime?: Date
  duration: number
  completed: boolean
}

export interface Department {
  id: number
  name: string
  queue: Order[]
  inProcess?: Order
  utilization: number
  avgCycleTime: number
  totalProcessed: number
  capacity: number // Max orders that can be processed simultaneously
  efficiency: number // Worker efficiency multiplier (0.8 - 1.2)
  equipmentCondition: number // Equipment reliability (0.95 - 1.0)
  status: 'available' | 'busy' | 'overloaded' | 'maintenance'
  operations: DepartmentOperation[] // List of operations this department performs
  standardProcessingTime: number // Standard time for all operations in minutes
  currentOperationIndex?: number // For multi-step departments
}

export interface DepartmentOperation {
  id: string
  name: string
  duration: number // Duration in minutes
  description: string
}

export type CustomerFilter = 'all' | 'completed' | 'rejected'
export type StatisticsFilter = 'order-doorlooptijd' | 'doorlooptijd-per-werkplek' | 'orderdoorlooptijd-per-afdeling'
export type ScreenType = 'landing' | 'game' | 'analytics'
export type NavigationScreen = 'game' | 'analytics'

// Game Session Management
export interface GameSession {
  id: string
  duration: number // Session duration in milliseconds
  startTime?: Date
  endTime?: Date
  status: 'setup' | 'running' | 'paused' | 'completed'
  settings: GameSettings
  elapsedTime: number // Time elapsed in milliseconds
}

export interface GameSettings {
  sessionDuration: 20 | 30 // minutes
  orderGenerationRate: 'low' | 'medium' | 'high'
  complexityLevel: 'beginner' | 'intermediate' | 'advanced'
  randomSeed?: string // for reproducible scenarios
}

export interface GameState {
  session: GameSession
  departments: Department[]
  pendingOrders: Order[]
  completedOrders: Order[]
  rejectedOrders: Order[]
  totalOrdersGenerated: number
  gameEvents: GameEvent[]
  performance: GamePerformance
}

export interface GameEvent {
  id: string
  type: 'order-generated' | 'order-completed' | 'order-late' | 'equipment-failure' | 'rush-order'
  timestamp: Date
  message: string
  severity: 'info' | 'warning' | 'error' | 'success'
  departmentId?: number
  orderId?: string
}

export interface GamePerformance {
  onTimeDeliveryRate: number
  averageLeadTime: number
  totalThroughput: number
  utilizationRates: { [deptId: number]: number }
  bottleneckDepartment?: number
}

export interface SLAStatus {
  status: 'overdue' | 'at-risk' | 'on-track'
  color: string
  text: string
}

export interface DepartmentStatus {
  color: string
  text: string
}
