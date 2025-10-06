import { Factory, BarChart3 } from 'lucide-react'
import type { ScreenType, NavigationScreen } from '../types'

interface SidebarProps {
  activeScreen: ScreenType
  onScreenChange: (screen: NavigationScreen) => void
}

export default function Sidebar({ activeScreen, onScreenChange }: SidebarProps) {
  const navItems = [
    { id: 'game' as NavigationScreen, icon: Factory, title: 'Game' },
    { id: 'analytics' as NavigationScreen, icon: BarChart3, title: 'Analytics' }
  ]

  return (
    <div className="w-20 bg-slate-800 flex flex-col items-center py-6 shrink-0">
      {/* Logo */}
      <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-8">
        <span className="text-sm font-bold text-slate-800">MTO</span>
      </div>
      
      {/* Navigation Items */}
      <div className="flex flex-col space-y-4">
        {navItems.map(({ id, icon: Icon, title }) => (
          <button
            key={id}
            onClick={() => onScreenChange(id)}
            className={`w-14 h-14 rounded-lg flex items-center justify-center transition-colors ${
              activeScreen === id 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-slate-600 text-gray-300 hover:bg-slate-500'
            }`}
            title={title}
          >
            <Icon size={24} />
          </button>
        ))}
      </div>
    </div>
  )
}
