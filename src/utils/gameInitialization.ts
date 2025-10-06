import type { GameSettings, GameState, GameSession, Department, Order, GamePerformance, DepartmentOperation } from '../types'

// Random number generator with seed support
class SeededRandom {
  private seed: number

  constructor(seed?: string) {
    this.seed = seed ? this.hashCode(seed) : Math.random() * 2147483647
  }

  private hashCode(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32bit integer
    }
    return Math.abs(hash)
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280
    return this.seed / 233280
  }

  between(min: number, max: number): number {
    return min + this.next() * (max - min)
  }

  choice<T>(array: T[]): T {
    return array[Math.floor(this.next() * array.length)]
  }
}

// Generate random department capacities and characteristics
export const generateRandomDepartmentConfig = (rng: SeededRandom) => {
  return {
    capacity: Math.floor(rng.between(80, 120)), // 80-120% of base capacity
    efficiency: rng.between(0.8, 1.2), // Worker efficiency multiplier
    equipmentCondition: rng.between(0.95, 1.0), // Equipment reliability
    avgCycleTime: Math.floor(rng.between(15, 60)), // 15-60 minutes base cycle time
  }
}

// Generate initial WIP (Work in Progress)
export const generateInitialWIP = (rng: SeededRandom, complexityLevel: string): Order[] => {
  const wipCount = complexityLevel === 'beginner' ? rng.between(2, 4) : 
                   complexityLevel === 'intermediate' ? rng.between(4, 8) : 
                   rng.between(6, 12)

  const orders: Order[] = []
  for (let i = 0; i < wipCount; i++) {
    const route = generateRandomRoute(rng, complexityLevel)
    const currentStep = Math.floor(rng.between(0, route.length))
    
    orders.push({
      id: `WIP-${String(i + 1).padStart(3, '0')}`,
      dueDate: new Date(Date.now() + rng.between(30, 120) * 60 * 1000), // 30-120 minutes
      route,
      currentStepIndex: currentStep,
      status: 'processing',
      timestamps: generateTimestamps(route.slice(0, currentStep + 1)),
      reworkCount: 0,
      createdAt: new Date(Date.now() - rng.between(10, 60) * 60 * 1000), // Started 10-60 min ago
      processingTime: Math.floor(rng.between(15, 45)), // 15-45 minutes for current step
      processingTimeRemaining: Math.floor(rng.between(5, 30)), // 5-30 minutes remaining
      currentDepartment: route[currentStep],
      slaStatus: rng.next() < 0.7 ? 'on-track' : rng.next() < 0.8 ? 'at-risk' : 'overdue'
    })
  }

  return orders
}

// Generate random order routes based on complexity
export const generateRandomRoute = (rng: SeededRandom, complexityLevel: string): number[] => {
  const departments = [1, 2, 3, 4]
  let routeLength: number
  
  switch (complexityLevel) {
    case 'beginner':
      routeLength = Math.floor(rng.between(2, 4))
      break
    case 'intermediate':
      routeLength = Math.floor(rng.between(3, 6))
      break
    case 'advanced':
      routeLength = Math.floor(rng.between(4, 8))
      break
    default:
      routeLength = 4
  }

  const route: number[] = []
  for (let i = 0; i < routeLength; i++) {
    // Ensure we don't repeat the same department consecutively (90% of the time)
    let nextDept: number
    do {
      nextDept = rng.choice(departments)
    } while (route.length > 0 && route[route.length - 1] === nextDept && rng.next() < 0.9)
    
    route.push(nextDept)
  }

  return route
}

// Generate timestamps for orders already in progress
const generateTimestamps = (completedSteps: number[]) => {
  return completedSteps.map((deptId, index) => ({
    deptId,
    start: new Date(Date.now() - (completedSteps.length - index) * 20 * 60 * 1000),
    end: new Date(Date.now() - (completedSteps.length - index - 1) * 20 * 60 * 1000)
  }))
}

// Initialize departments with random characteristics
export const initializeDepartments = (settings: GameSettings): Department[] => {
  const rng = new SeededRandom(settings.randomSeed)
  
  const baseDepartments = [
    { 
      id: 1, 
      name: 'Cutting & Prep',
      standardProcessingTime: 15, // 15 minutes standard
      operations: [
        { id: 'cut-1', name: 'Material Cutting', duration: 8, description: 'Cut raw materials to specifications' },
        { id: 'prep-1', name: 'Surface Preparation', duration: 7, description: 'Clean and prepare surfaces for assembly' }
      ]
    },
    { 
      id: 2, 
      name: 'Assembly',
      standardProcessingTime: 25, // 25 minutes standard  
      operations: [
        { id: 'asm-1', name: 'Component Assembly', duration: 25, description: 'Assemble components according to specifications' }
      ]
    },
    { 
      id: 3, 
      name: 'Quality Control',
      standardProcessingTime: 12, // 12 minutes standard
      operations: [
        { id: 'qc-1', name: 'Initial Inspection', duration: 7, description: 'Visual and dimensional inspection' },
        { id: 'qc-2', name: 'Function Testing', duration: 5, description: 'Test product functionality and performance' }
      ]
    },
    { 
      id: 4, 
      name: 'Packaging & Ship',
      standardProcessingTime: 8, // 8 minutes standard
      operations: [
        { id: 'pack-1', name: 'Final Packaging', duration: 8, description: 'Package product for shipment' }
      ]
    }
  ]

  return baseDepartments.map(dept => {
    const config = generateRandomDepartmentConfig(rng)
    
    return {
      ...dept,
      queue: [],
      utilization: Math.floor(rng.between(40, 85)), // Start with some utilization
      avgCycleTime: dept.standardProcessingTime,
      totalProcessed: Math.floor(rng.between(15, 35)), // Previous orders processed
      capacity: config.capacity,
      efficiency: config.efficiency,
      equipmentCondition: config.equipmentCondition,
      status: rng.next() < 0.8 ? 'available' : 'busy' as const
    }
  })
}

// Generate initial pending orders
export const generateInitialOrders = (settings: GameSettings): Order[] => {
  const rng = new SeededRandom(settings.randomSeed)
  const orderCount = settings.complexityLevel === 'beginner' ? rng.between(3, 6) : 
                     settings.complexityLevel === 'intermediate' ? rng.between(5, 10) : 
                     rng.between(8, 15)

  const orders: Order[] = []
  for (let i = 0; i < orderCount; i++) {
    const route = generateRandomRoute(rng, settings.complexityLevel)
    
    orders.push({
      id: `ORD-${String(i + 1).padStart(3, '0')}`,
      dueDate: new Date(Date.now() + rng.between(60, 180) * 60 * 1000), // 1-3 hours
      route,
      currentStepIndex: -1, // Not started yet
      status: 'queued',
      timestamps: [],
      reworkCount: 0,
      createdAt: new Date(),
      slaStatus: 'on-track'
    })
  }

  return orders
}

// Create initial game session
export const createGameSession = (settings: GameSettings): GameSession => {
  return {
    id: `session-${Date.now()}`,
    duration: settings.sessionDuration * 60 * 1000, // Convert minutes to milliseconds
    status: 'setup',
    settings,
    elapsedTime: 0
  }
}

// Initialize complete game state
export const initializeGameState = (settings: GameSettings): GameState => {
  const rng = new SeededRandom(settings.randomSeed)
  const session = createGameSession(settings)
  const departments = initializeDepartments(settings)
  const pendingOrders = generateInitialOrders(settings)
  const wipOrders = generateInitialWIP(rng, settings.complexityLevel)

  // Distribute WIP orders to departments
  wipOrders.forEach(order => {
    if (order.currentDepartment) {
      const dept = departments.find(d => d.id === order.currentDepartment)
      if (dept) {
        if (order.status === 'processing') {
          dept.inProcess = order
        } else {
          dept.queue.push(order)
        }
      }
    }
  })

  const initialPerformance: GamePerformance = {
    onTimeDeliveryRate: 0,
    averageLeadTime: 0,
    totalThroughput: 0,
    utilizationRates: departments.reduce((acc, dept) => {
      acc[dept.id] = dept.utilization
      return acc
    }, {} as { [key: number]: number })
  }

  return {
    session,
    departments,
    pendingOrders,
    completedOrders: [],
    rejectedOrders: [],
    totalOrdersGenerated: pendingOrders.length + wipOrders.length,
    gameEvents: [{
      id: `event-${Date.now()}`,
      type: 'order-generated',
      timestamp: new Date(),
      message: `Game initialized with ${pendingOrders.length} pending orders and ${wipOrders.length} WIP orders`,
      severity: 'info'
    }],
    performance: initialPerformance
  }
}

// Export seeded random for consistent behavior during testing
export { SeededRandom }
