import { Play, Pause, RotateCcw, Clock, Users, Factory, TrendingUp, Settings, Download } from 'lucide-react'
import type { GameSession, GamePerformance } from '../types'

interface GameControlsProps {
  session: GameSession
  performance: GamePerformance
  onStart: () => void
  onPause: () => void
  onReset: () => void
  onOpenSettings?: () => void
  onOpenExport?: () => void
  onOpenQuickStart?: () => void
}

export default function GameControls({ 
  session, 
  performance, 
  onStart, 
  onPause, 
  onReset,
  onOpenSettings,
  onOpenExport,
  onOpenQuickStart
}: GameControlsProps) {
  
  const formatTimeRemaining = (milliseconds: number): string => {
    if (milliseconds <= 0) return "00:00"
    
    const totalSeconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const formatElapsedTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const getSessionStatusColor = (status: string) => {
    switch (status) {
      case 'setup': return 'bg-gray-100 text-gray-800'
      case 'running': return 'bg-green-100 text-green-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const timeRemaining = session.duration - session.elapsedTime
  const sessionProgress = (session.elapsedTime / session.duration) * 100

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      {/* Top Row: Session Info and Controls */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Game Session</h2>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getSessionStatusColor(session.status)}`}>
              {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
            </span>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-mono font-bold text-blue-600">
              {formatTimeRemaining(timeRemaining)}
            </div>
            <div className="text-sm text-gray-600">Time Remaining</div>
          </div>
          
          <div className="text-center">
            <div className="text-xl font-mono font-semibold text-gray-700">
              {formatElapsedTime(session.elapsedTime)}
            </div>
            <div className="text-sm text-gray-600">Elapsed Time</div>
          </div>
        </div>
        
        {/* Control Buttons */}
        <div className="flex items-center space-x-3">
          {/* Quick Start Button */}
          {session.status === 'setup' && onOpenQuickStart && (
            <button 
              onClick={onOpenQuickStart}
              className="flex items-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
            >
              <Play size={16} />
              <span>Quick Start</span>
            </button>
          )}

          {/* Settings Button */}
          {onOpenSettings && (
            <button 
              onClick={onOpenSettings}
              className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              aria-label="Open game settings"
            >
              <Settings size={16} aria-hidden="true" />
              <span>Settings</span>
            </button>
          )}

          {/* Export Button */}
          {onOpenExport && (
            <button 
              onClick={onOpenExport}
              className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              aria-label="Export game data and analytics"
            >
              <Download size={16} aria-hidden="true" />
              <span>Export</span>
            </button>
          )}
          
          {session.status === 'setup' && (
            <button 
              onClick={onStart}
              className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              aria-label="Start the manufacturing simulation game"
            >
              <Play size={20} aria-hidden="true" />
              <span>Start Game</span>
            </button>
          )}
          
          {session.status === 'running' && (
            <button 
              onClick={onPause}
              className="flex items-center space-x-2 bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 transition-colors font-medium shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
              aria-label="Pause the game simulation"
            >
              <Pause size={20} aria-hidden="true" />
              <span>Pause</span>
            </button>
          )}
          
          {session.status === 'paused' && (
            <button 
              onClick={onStart}
              className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              aria-label="Resume the game simulation"
            >
              <Play size={20} aria-hidden="true" />
              <span>Resume</span>
            </button>
          )}
          
          <button 
            onClick={onReset}
            className="flex items-center space-x-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            aria-label="Reset the game to start over"
          >
            <RotateCcw size={20} aria-hidden="true" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700" id="session-progress-label">Session Progress</span>
          <span className="text-sm text-gray-500">{Math.round(sessionProgress)}%</span>
        </div>
        <div 
          className="w-full bg-gray-200 rounded-full h-3"
          role="progressbar"
          aria-labelledby="session-progress-label"
          aria-valuenow={sessionProgress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuetext={`${Math.round(sessionProgress)}% complete`}
        >
          <div 
            className="bg-blue-500 h-3 rounded-full transition-all duration-1000 ease-linear"
            style={{ width: `${Math.min(sessionProgress, 100)}%` }}
          />
        </div>
      </div>

      {/* Performance KPIs */}
      <div className="grid grid-cols-5 gap-4">
        <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-center mb-2">
            <Clock className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {performance.averageLeadTime.toFixed(1)}m
          </div>
          <div className="text-sm text-gray-600">Avg Lead Time</div>
        </div>
        
        <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center justify-center mb-2">
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-600">
            {performance.onTimeDeliveryRate.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600">On-Time Rate</div>
        </div>
        
        <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex items-center justify-center mb-2">
            <Users className="w-6 h-6 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-600">
            {performance.totalThroughput}
          </div>
          <div className="text-sm text-gray-600">Total Orders</div>
        </div>
        
        <div className="text-center p-4 bg-amber-50 rounded-lg border border-amber-200">
          <div className="flex items-center justify-center mb-2">
            <Factory className="w-6 h-6 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-600">
            Dept {performance.bottleneckDepartment || 'N/A'}
          </div>
          <div className="text-sm text-gray-600">Bottleneck</div>
        </div>
        
        <div className="text-center p-4 bg-indigo-50 rounded-lg border border-indigo-200">
          <div className="flex items-center justify-center mb-2">
            <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">%</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-indigo-600">
            {Object.values(performance.utilizationRates).length > 0 
              ? (Object.values(performance.utilizationRates).reduce((a, b) => a + b, 0) / Object.values(performance.utilizationRates).length).toFixed(0)
              : 0}%
          </div>
          <div className="text-sm text-gray-600">Avg Utilization</div>
        </div>
      </div>

      {/* Game Settings Info */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>Session: {session.settings.sessionDuration} minutes</span>
          <span>Order Rate: {session.settings.orderGenerationRate}</span>
          <span>Complexity: {session.settings.complexityLevel}</span>
          {session.settings.randomSeed && <span>Seed: {session.settings.randomSeed}</span>}
        </div>
      </div>
    </div>
  )
}
