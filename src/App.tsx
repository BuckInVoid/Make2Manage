import { useState } from 'react'
import { Factory, Users, Target, BarChart3 } from 'lucide-react'
import { GameHeader, GameDashboard } from './components'

function App() {
  const [currentScreen, setCurrentScreen] = useState<'welcome' | 'game'>('welcome')

  if (currentScreen === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8">
              <Factory className="w-16 h-16 mx-auto text-blue-600 mb-4" />
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Make2Manage</h1>
              <p className="text-xl text-gray-600">Digital Learning Game voor Productie Planning</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg p-6 shadow-md">
                <Users className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Voor Management</h3>
                <p className="text-gray-600">Leer productieprocessen beter te beheersen</p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-md">
                <Target className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Make-to-Order</h3>
                <p className="text-gray-600">Balanceer kosten en leverbetrouwbaarheid</p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-md">
                <BarChart3 className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Realtime Inzichten</h3>
                <p className="text-gray-600">Zie direct de impact van je beslissingen</p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-8 shadow-lg mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Over deze Learning Game</h2>
              <p className="text-gray-600 mb-6">
                In de MKB-maakindustrie in Limburg is vaak sprake van een make-to-order situatie. 
                Deze game helpt je de complexe planning en besturing van productieprocessen te begrijpen 
                en de balans te vinden tussen kostenefficiëntie en betrouwbare levering.
              </p>
              <button 
                onClick={() => setCurrentScreen('game')}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Start Learning Game
              </button>
            </div>

            <div className="text-sm text-gray-500">
              Ontwikkeld voor TBK onderwijs | Contact: ruud.nijssen@zuyd.nl
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <GameHeader onBack={() => setCurrentScreen('welcome')} />
      <GameDashboard />
    </div>
  )
}

export default App
