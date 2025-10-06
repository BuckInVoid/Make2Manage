import { useState, useEffect, useCallback, useRef } from 'react'
import type { GameState, GameSettings, Order, Department, GameEvent, Decision } from '../types'
import { initializeGameState, SeededRandom, generateRandomRoute } from '../utils/gameInitialization'
import { generateOptimizedRoute } from '../utils/routeOptimization'

export const useGameSimulation = (initialSettings: GameSettings) => {
  const [gameState, setGameState] = useState<GameState>(() => initializeGameState(initialSettings))
  const [isRunning, setIsRunning] = useState(false)
  const [currentDecisionIndex, setCurrentDecisionIndex] = useState(-1) // R13: Track decision position
  const intervalRef = useRef<number | null>(null)
  const lastUpdateTime = useRef<number>(Date.now())
  const rngRef = useRef(new SeededRandom(initialSettings.randomSeed))

  // Calculate processing time for an order at a department
  const calculateProcessingTime = useCallback((order: Order, department: Department): number => {
    // Use standard processing time as base
    const baseTime = department.standardProcessingTime * 60 * 1000 // Convert to milliseconds
    const efficiencyFactor = department.efficiency
    const equipmentFactor = department.equipmentCondition
    const complexityFactor = order.route.length > 5 ? 1.2 : order.route.length < 3 ? 0.8 : 1.0
    
    return Math.floor(baseTime * efficiencyFactor * equipmentFactor * complexityFactor)
  }, [])

  // Generate new orders based on time and settings
  const generateNewOrders = useCallback((): Order[] => {
    const rng = rngRef.current
    const { orderGenerationRate, complexityLevel } = gameState.session.settings
    
    // Calculate generation probability based on rate and time
    let generationChance = 0
    switch (orderGenerationRate) {
      case 'low':
        generationChance = 0.002 // ~7 orders per hour
        break
      case 'medium':
        generationChance = 0.003 // ~11 orders per hour
        break
      case 'high':
        generationChance = 0.005 // ~18 orders per hour
        break
    }

    const newOrders: Order[] = []
    if (rng.next() < generationChance) {
      // R06: Use advanced routing logic for new orders
      const route = gameState.session.settings.enableAdvancedRouting !== false 
        ? generateOptimizedRoute(rng, gameState.departments, {
            complexityLevel,
            prioritizeSpeed: rng.next() < 0.3,
            prioritizeCost: rng.next() < 0.3,
            prioritizeReliability: rng.next() < 0.3,
            avoidBottlenecks: rng.next() < 0.4
          })
        : generateRandomRoute(rng, complexityLevel)
      
      const orderId = `ORD-${String(gameState.totalOrdersGenerated + 1).padStart(3, '0')}`
      
      // Select a random customer for this order
      const randomCustomer = gameState.customers[rng.between(0, gameState.customers.length - 1)]
      
      // Generate order value based on complexity and customer tier
      const baseValue = route.length * 150 // Base value per step
      const tierMultiplier = randomCustomer.tier === 'vip' ? 1.5 : randomCustomer.tier === 'premium' ? 1.3 : 1.0
      const orderValue = Math.round(baseValue * tierMultiplier * rng.between(0.8, 1.4))
      
      // Determine priority based on customer tier and random factors
      let priority: 'low' | 'normal' | 'high' | 'urgent'
      if (randomCustomer.tier === 'vip') {
        priority = rng.between(0, 100) < 40 ? 'urgent' : 'high'
      } else if (randomCustomer.tier === 'premium') {
        priority = rng.between(0, 100) < 30 ? 'high' : 'normal'
      } else {
        priority = rng.between(0, 100) < 10 ? 'high' : 'normal'
      }
      
      // Check for rush order
      const isRushOrder = rng.between(0, 100) < (randomCustomer.tier === 'vip' ? 15 : 5)
      
      newOrders.push({
        id: orderId,
        customerId: randomCustomer.id,
        customerName: randomCustomer.name,
        priority,
        orderValue,
        specialInstructions: isRushOrder ? 'RUSH ORDER - Expedited processing required' : '',
        rushOrder: isRushOrder,
        dueDate: new Date(Date.now() + rng.between(90, 240) * 60 * 1000), // 1.5-4 hours
        route,
        currentStepIndex: -1,
        status: 'queued',
        timestamps: [],
        reworkCount: 0,
        createdAt: new Date(),
        slaStatus: 'on-track'
      })
    }

    return newOrders
  }, [gameState.totalOrdersGenerated, gameState.session.settings])

  // Update SLA status for orders
  const updateSLAStatus = useCallback((order: Order): Order => {
    const now = Date.now()
    const timeLeft = order.dueDate.getTime() - now
    const totalTime = order.dueDate.getTime() - order.createdAt.getTime()
    const elapsed = now - order.createdAt.getTime()
    const progress = elapsed / totalTime

    let slaStatus: 'on-track' | 'at-risk' | 'overdue'
    if (timeLeft < 0) {
      slaStatus = 'overdue'
    } else if (progress > 0.8) {
      slaStatus = 'at-risk'
    } else {
      slaStatus = 'on-track'
    }

    return { ...order, slaStatus }
  }, [])

  // R07: Generate random events (equipment failures, rush orders, etc.)
  const generateRandomEvents = useCallback((departments: Department[]): GameEvent[] => {
    if (!gameState.session.settings.enableEvents) return []
    
    const events: GameEvent[] = []
    const rng = rngRef.current
    
    // Equipment failure event (0.1% chance per second)
    if (rng.next() < 0.001) {
      const affectedDept = rng.choice(departments.filter(d => d.status !== 'maintenance'))
      if (affectedDept) {
        events.push({
          id: `event-${Date.now()}-${Math.random()}`,
          type: 'equipment-failure',
          timestamp: new Date(),
          message: `Equipment failure in ${affectedDept.name}! Processing slowed by 50%`,
          severity: 'error',
          departmentId: affectedDept.id
        })
      }
    }

    // Rush order event (0.05% chance per second)
    if (rng.next() < 0.0005) {
      events.push({
        id: `event-${Date.now()}-${Math.random()}`,
        type: 'rush-order',
        timestamp: new Date(),
        message: `Rush order received! Tight deadline requires priority handling`,
        severity: 'warning'
      })
    }

    // Delivery delay event (0.02% chance per second)
    if (rng.next() < 0.0002) {
      events.push({
        id: `event-${Date.now()}-${Math.random()}`,
        type: 'delivery-delay',
        timestamp: new Date(),
        message: `Material delivery delayed. Some departments may experience shortages`,
        severity: 'warning'
      })
    }

    // Efficiency boost event (0.03% chance per second)
    if (rng.next() < 0.0003) {
      const boostedDept = rng.choice(departments)
      events.push({
        id: `event-${Date.now()}-${Math.random()}`,
        type: 'efficiency-boost',
        timestamp: new Date(),
        message: `${boostedDept.name} running at peak efficiency! 25% speed boost`,
        severity: 'success',
        departmentId: boostedDept.id
      })
    }

    return events
  }, [gameState.session.settings.enableEvents])

  // Process department operations
  const processDepartmentUpdates = useCallback((departments: Department[]): {
    updatedDepartments: Department[]
    completedOrders: Order[]
    events: GameEvent[]
  } => {
    const updatedDepartments: Department[] = []
    const completedOrders: Order[] = []
    const events: GameEvent[] = []

    departments.forEach(dept => {
      const updatedDept = { ...dept, queue: [...dept.queue] }

      // Process currently active order
      if (updatedDept.inProcess) {
        const order = updatedDept.inProcess
        const timeRemaining = (order.processingTimeRemaining || 0) - 1000 // Subtract 1 second

        if (timeRemaining <= 0) {
          // Current operation completed
          const currentOpIndex = order.currentOperationIndex || 0
          const currentOperation = updatedDept.operations[currentOpIndex]
          
          // Mark current operation as completed
          if (order.operationProgress) {
            const progressIndex = order.operationProgress.findIndex(p => p.operationId === currentOperation.id)
            if (progressIndex >= 0) {
              order.operationProgress[progressIndex].completed = true
              order.operationProgress[progressIndex].endTime = new Date()
            }
          }

          // Check if there are more operations in this department
          const nextOpIndex = currentOpIndex + 1
          if (nextOpIndex < updatedDept.operations.length) {
            // Start next operation in same department
            const nextOperation = updatedDept.operations[nextOpIndex]
            const nextOpTime = nextOperation.duration * 60 * 1000 // Convert to milliseconds
            
            updatedDept.inProcess = {
              ...order,
              currentOperationIndex: nextOpIndex,
              processingTime: nextOpTime,
              processingTimeRemaining: nextOpTime,
              operationProgress: [
                ...(order.operationProgress || []),
                {
                  operationId: nextOperation.id,
                  operationName: nextOperation.name,
                  startTime: new Date(),
                  duration: nextOperation.duration,
                  completed: false
                }
              ]
            }
          } else {
            // All operations in this department completed
            const completedOrder = { ...order, processingTimeRemaining: 0 }
            
            // Add completion timestamp for this department
            const lastTimestamp = completedOrder.timestamps[completedOrder.timestamps.length - 1]
            if (lastTimestamp && !lastTimestamp.end) {
              lastTimestamp.end = new Date()
            }

            // Move to next department or complete order
            const nextStepIndex = completedOrder.currentStepIndex + 1
            if (nextStepIndex >= completedOrder.route.length) {
              // Order fully completed
              completedOrder.status = completedOrder.slaStatus === 'overdue' ? 'completed-late' : 'completed-on-time'
              completedOrder.completedAt = new Date()
              completedOrder.actualLeadTime = Math.floor((Date.now() - completedOrder.createdAt.getTime()) / (60 * 1000))
              completedOrders.push(completedOrder)
              
              events.push({
                id: `event-${Date.now()}-${Math.random()}`,
                type: 'order-completed',
                timestamp: new Date(),
                message: `Order ${completedOrder.id} completed ${completedOrder.status === 'completed-on-time' ? 'on time' : 'late'}`,
                severity: completedOrder.status === 'completed-on-time' ? 'success' : 'warning',
                orderId: completedOrder.id,
                departmentId: dept.id
              })
            } else {
              // Move to next department
              const nextDeptId = completedOrder.route[nextStepIndex]
              const nextDept = departments.find(d => d.id === nextDeptId)
              
              if (nextDept) {
                completedOrder.currentStepIndex = nextStepIndex
                completedOrder.currentDepartment = nextDeptId
                completedOrder.status = 'queued'
                completedOrder.processingTime = calculateProcessingTime(completedOrder, nextDept)
                completedOrder.currentOperationIndex = 0 // Reset for next department
                completedOrder.operationProgress = [] // Reset operation progress
                
                // Add to next department's queue
                const targetDept = updatedDepartments.find(d => d.id === nextDeptId) || 
                                 { ...departments.find(d => d.id === nextDeptId)!, queue: [] }
                targetDept.queue.push(completedOrder)
                
                if (!updatedDepartments.find(d => d.id === nextDeptId)) {
                  updatedDepartments.push(targetDept)
                }
              }
            }

            updatedDept.inProcess = undefined
            updatedDept.totalProcessed += 1
          }
        } else {
          // Continue processing current operation
          updatedDept.inProcess = { ...order, processingTimeRemaining: timeRemaining }
        }
      }

      // Start processing next order in queue if department is available
      if (!updatedDept.inProcess && updatedDept.queue.length > 0) {
        const nextOrder = updatedDept.queue.shift()!
        const firstOperation = updatedDept.operations[0]
        const processingTime = firstOperation.duration * 60 * 1000 // Convert to milliseconds
        
        updatedDept.inProcess = {
          ...nextOrder,
          status: 'processing',
          processingTime,
          processingTimeRemaining: processingTime,
          currentOperationIndex: 0,
          operationProgress: [{
            operationId: firstOperation.id,
            operationName: firstOperation.name,
            startTime: new Date(),
            duration: firstOperation.duration,
            completed: false
          }],
          timestamps: [
            ...nextOrder.timestamps,
            { deptId: dept.id, start: new Date() }
          ]
        }
      }

      // Update utilization
      const queueLoad = updatedDept.queue.length
      const processingLoad = updatedDept.inProcess ? 1 : 0
      updatedDept.utilization = Math.min(100, (queueLoad + processingLoad) * 25)
      
      // Update status
      if (updatedDept.utilization > 85) {
        updatedDept.status = 'overloaded'
      } else if (updatedDept.utilization > 50) {
        updatedDept.status = 'busy'
      } else {
        updatedDept.status = 'available'
      }

      if (!updatedDepartments.find(d => d.id === dept.id)) {
        updatedDepartments.push(updatedDept)
      }
    })

    return { updatedDepartments, completedOrders, events }
  }, [calculateProcessingTime])

  // Main simulation step
  const simulationStep = useCallback(() => {
    const now = Date.now()
    const deltaTime = now - lastUpdateTime.current
    lastUpdateTime.current = now

    setGameState(prevState => {
      // Check if game should end
      if (prevState.session.elapsedTime >= prevState.session.duration) {
        return {
          ...prevState,
          session: { ...prevState.session, status: 'completed', endTime: new Date() }
        }
      }

      // Update elapsed time
      const newElapsedTime = prevState.session.elapsedTime + deltaTime

      // Generate new orders
      const newOrders = generateNewOrders()

      // Update SLA status for all pending orders
      const updatedPendingOrders = prevState.pendingOrders.map(updateSLAStatus)

      // Process department updates
      const { updatedDepartments, completedOrders, events } = processDepartmentUpdates(prevState.departments)

      // R07: Generate random events
      const randomEvents = generateRandomEvents(updatedDepartments)
      const allEvents = [...events, ...randomEvents]

      // Update performance metrics
      const totalCompleted = prevState.completedOrders.length + completedOrders.length
      const onTimeCompleted = [...prevState.completedOrders, ...completedOrders]
        .filter(order => order.status === 'completed-on-time').length
      
      const onTimeDeliveryRate = totalCompleted > 0 ? (onTimeCompleted / totalCompleted) * 100 : 0
      const averageLeadTime = totalCompleted > 0 ? 
        [...prevState.completedOrders, ...completedOrders]
          .reduce((sum, order) => sum + (order.actualLeadTime || 0), 0) / totalCompleted : 0

      const utilizationRates = updatedDepartments.reduce((acc, dept) => {
        acc[dept.id] = dept.utilization
        return acc
      }, {} as { [key: number]: number })

      const bottleneckDepartment = updatedDepartments.reduce((max, dept) => 
        dept.utilization > (updatedDepartments.find(d => d.id === max)?.utilization || 0) ? dept.id : max, 1)

      return {
        ...prevState,
        session: {
          ...prevState.session,
          elapsedTime: newElapsedTime
        },
        departments: updatedDepartments,
        pendingOrders: [...updatedPendingOrders, ...newOrders],
        completedOrders: [...prevState.completedOrders, ...completedOrders],
        totalOrdersGenerated: prevState.totalOrdersGenerated + newOrders.length,
        gameEvents: [...prevState.gameEvents, ...allEvents].slice(-50), // Keep last 50 events
        performance: {
          onTimeDeliveryRate,
          averageLeadTime,
          totalThroughput: totalCompleted,
          utilizationRates,
          bottleneckDepartment
        }
      }
    })
  }, [generateNewOrders, updateSLAStatus, processDepartmentUpdates])

  // Start simulation
  const startGame = useCallback(() => {
    if (gameState.session.status === 'setup') {
      setGameState(prev => ({
        ...prev,
        session: { ...prev.session, status: 'running', startTime: new Date() }
      }))
    } else if (gameState.session.status === 'paused') {
      setGameState(prev => ({
        ...prev,
        session: { ...prev.session, status: 'running' }
      }))
    }
    setIsRunning(true)
  }, [gameState.session.status])

  // Pause simulation
  const pauseGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      session: { ...prev.session, status: 'paused' }
    }))
    setIsRunning(false)
  }, [])

  // Reset simulation
  const resetGame = useCallback(() => {
    setIsRunning(false)
    setGameState(initializeGameState(initialSettings))
    rngRef.current = new SeededRandom(initialSettings.randomSeed)
  }, [initialSettings])

  // R13: Record decisions for undo/redo
  const recordDecision = useCallback((
    type: 'order-release' | 'game-pause' | 'game-resume' | 'settings-change',
    description: string,
    orderId?: string,
    previousState?: Partial<GameState>
  ) => {
    const decision: Decision = {
      id: `decision-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      type,
      description,
      orderId,
      previousState,
      canUndo: true
    }

    setGameState(prev => ({
      ...prev,
      decisions: [...prev.decisions.slice(0, currentDecisionIndex + 1), decision]
    }))
    
    setCurrentDecisionIndex(prev => prev + 1)
  }, [currentDecisionIndex])

  // Release order from pending to first department
  const releaseOrder = useCallback((orderId: string) => {
    setGameState(prev => {
      const orderIndex = prev.pendingOrders.findIndex(o => o.id === orderId)
      if (orderIndex === -1) return prev

      const order = prev.pendingOrders[orderIndex]
      if (order.route.length === 0) return prev

      const firstDeptId = order.route[0]
      const updatedOrder = {
        ...order,
        currentStepIndex: 0,
        currentDepartment: firstDeptId,
        status: 'queued' as const
      }

      const updatedDepartments = prev.departments.map(dept => 
        dept.id === firstDeptId 
          ? { ...dept, queue: [...dept.queue, updatedOrder] }
          : dept
      )

      const updatedPendingOrders = prev.pendingOrders.filter((_, index) => index !== orderIndex)

      const newState = {
        ...prev,
        departments: updatedDepartments,
        pendingOrders: updatedPendingOrders
      }

      // Record decision for undo/redo
      recordDecision(
        'order-release',
        `Released order ${orderId} to ${prev.departments.find(d => d.id === firstDeptId)?.name}`,
        orderId,
        {
          departments: prev.departments,
          pendingOrders: prev.pendingOrders
        }
      )

      return newState
    })
  }, [recordDecision])

  // Effect to handle simulation loop
  useEffect(() => {
    if (isRunning && gameState.session.status === 'running') {
      intervalRef.current = setInterval(simulationStep, 1000) // Update every second
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, gameState.session.status, simulationStep])

  // Auto-pause when game completes
  useEffect(() => {
    if (gameState.session.status === 'completed') {
      setIsRunning(false)
    }
  }, [gameState.session.status])

  // R13: Undo/redo functionality
  const undoLastDecision = useCallback(() => {
    if (currentDecisionIndex >= 0 && gameState.decisions.length > 0) {
      const decision = gameState.decisions[currentDecisionIndex]
      if (decision.canUndo && decision.previousState) {
        setGameState(prev => ({
          ...prev,
          ...decision.previousState
        }))
        setCurrentDecisionIndex(prev => prev - 1)
      }
    }
  }, [currentDecisionIndex, gameState.decisions])

  const redoLastDecision = useCallback(() => {
    if (currentDecisionIndex < gameState.decisions.length - 1) {
      const nextDecision = gameState.decisions[currentDecisionIndex + 1]
      if (nextDecision.newState) {
        setGameState(prev => ({
          ...prev,
          ...nextDecision.newState
        }))
        setCurrentDecisionIndex(prev => prev + 1)
      }
    }
  }, [currentDecisionIndex, gameState.decisions])

  const clearDecisionHistory = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      decisions: []
    }))
    setCurrentDecisionIndex(-1)
  }, [])

  // R06: Route optimization functionality
  const optimizeOrderRoute = useCallback((orderId: string, newRoute: number[]) => {
    const previousState = { ...gameState }
    
    setGameState(prev => {
      const pendingIndex = prev.pendingOrders.findIndex(o => o.id === orderId)
      if (pendingIndex !== -1) {
        const updatedPendingOrders = [...prev.pendingOrders]
        updatedPendingOrders[pendingIndex] = {
          ...updatedPendingOrders[pendingIndex],
          route: newRoute
        }
        return {
          ...prev,
          pendingOrders: updatedPendingOrders
        }
      }
      
      // Check if order is already in processing
      const updatedDepartments = prev.departments.map(dept => {
        const queueIndex = dept.queue.findIndex(o => o.id === orderId)
        if (queueIndex !== -1) {
          const updatedQueue = [...dept.queue]
          updatedQueue[queueIndex] = {
            ...updatedQueue[queueIndex],
            route: newRoute
          }
          return { ...dept, queue: updatedQueue }
        }
        
        if (dept.inProcess?.id === orderId) {
          return {
            ...dept,
            inProcess: {
              ...dept.inProcess,
              route: newRoute
            }
          }
        }
        
        return dept
      })
      
      return {
        ...prev,
        departments: updatedDepartments
      }
    })

    // Record the optimization decision
    recordDecision(
      'order-release',
      `Optimized route for order ${orderId}: ${newRoute.join(' → ')}`,
      orderId,
      previousState
    )
  }, [gameState, recordDecision])

  // R04-R05: Advanced scheduling functionality
  const scheduleOrder = useCallback((orderId: string, departmentId: number, scheduledTime: Date) => {
    const previousState = { ...gameState }
    
    setGameState(prev => {
      // Find the order in pending orders
      const orderIndex = prev.pendingOrders.findIndex(o => o.id === orderId)
      if (orderIndex === -1) return prev
      
      const order = prev.pendingOrders[orderIndex]
      const updatedOrder = {
        ...order,
        currentStepIndex: 0,
        currentDepartment: departmentId,
        status: 'queued' as const,
        // Add scheduling metadata (could be used for future scheduling logic)
        scheduledStartTime: scheduledTime
      }
      
      // Remove from pending and add to target department
      const updatedPendingOrders = prev.pendingOrders.filter((_, i) => i !== orderIndex)
      const updatedDepartments = prev.departments.map(dept => {
        if (dept.id === departmentId) {
          return {
            ...dept,
            queue: [...dept.queue, updatedOrder]
          }
        }
        return dept
      })
      
      return {
        ...prev,
        pendingOrders: updatedPendingOrders,
        departments: updatedDepartments
      }
    })

    recordDecision(
      'order-release',
      `Scheduled order ${orderId} to Department ${departmentId} at ${scheduledTime.toLocaleTimeString()}`,
      orderId,
      previousState
    )
  }, [gameState, recordDecision])

  // R04-R05: Workload rebalancing functionality
  const rebalanceWorkload = useCallback((sourceIds: number[], targetIds: number[], ordersToMove: string[]) => {
    const previousState = { ...gameState }
    
    setGameState(prev => {
      const updatedDepartments = prev.departments.map(dept => {
        // Remove orders from overloaded departments
        if (sourceIds.includes(dept.id)) {
          const remainingQueue = dept.queue.filter(order => !ordersToMove.includes(order.id))
          return { ...dept, queue: remainingQueue }
        }
        return dept
      })
      
      // Distribute moved orders to target departments
      const movedOrders: any[] = []
      prev.departments.forEach(dept => {
        if (sourceIds.includes(dept.id)) {
          const ordersFromThisDept = dept.queue.filter(order => ordersToMove.includes(order.id))
          movedOrders.push(...ordersFromThisDept)
        }
      })
      
      // Distribute moved orders evenly across target departments
      const finalDepartments = updatedDepartments.map(dept => {
        if (targetIds.includes(dept.id)) {
          const targetIndex = targetIds.indexOf(dept.id)
          const ordersForThisDept = movedOrders.filter((_, index) => index % targetIds.length === targetIndex)
          return {
            ...dept,
            queue: [...dept.queue, ...ordersForThisDept]
          }
        }
        return dept
      })
      
      return {
        ...prev,
        departments: finalDepartments
      }
    })

    recordDecision(
      'order-release',
      `Rebalanced workload: moved ${ordersToMove.length} orders from departments [${sourceIds.join(', ')}] to [${targetIds.join(', ')}]`,
      undefined,
      previousState
    )
  }, [gameState, recordDecision])

  return {
    gameState,
    isRunning,
    currentDecisionIndex,
    startGame,
    pauseGame,
    resetGame,
    releaseOrder,
    optimizeOrderRoute,
    scheduleOrder,
    rebalanceWorkload,
    undoLastDecision,
    redoLastDecision,
    clearDecisionHistory
  }
}
