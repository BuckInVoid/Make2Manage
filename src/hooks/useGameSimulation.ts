import { useState, useEffect, useCallback, useRef } from 'react'
import type { GameState, GameSettings, Order, Department, GameEvent } from '../types'
import { initializeGameState, SeededRandom, generateRandomRoute } from '../utils/gameInitialization'

export const useGameSimulation = (initialSettings: GameSettings) => {
  const [gameState, setGameState] = useState<GameState>(() => initializeGameState(initialSettings))
  const [isRunning, setIsRunning] = useState(false)
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
      const route = generateRandomRoute(rng, complexityLevel)
      const orderId = `ORD-${String(gameState.totalOrdersGenerated + 1).padStart(3, '0')}`
      
      newOrders.push({
        id: orderId,
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
        gameEvents: [...prevState.gameEvents, ...events].slice(-50), // Keep last 50 events
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

      return {
        ...prev,
        departments: updatedDepartments,
        pendingOrders: updatedPendingOrders
      }
    })
  }, [])

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

  return {
    gameState,
    isRunning,
    startGame,
    pauseGame,
    resetGame,
    releaseOrder
  }
}
