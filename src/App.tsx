import { useState } from 'react'
import { Factory, Users, Target, BarChart3 } from 'lucide-react'
import { GameHeader, GameDashboard } from './components'

function App() {
  const [currentScreen, setCurrentScreen] = useState<'welcome' | 'game'>('welcome')

  if (currentScreen === 'welcome') {
    return (
      <div className="w-screen h-screen bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden">
        <div className="w-full h-full flex items-center justify-center p-8 overflow-y-auto">
          <div className="max-w-6xl w-full text-center">
            <div className="mb-12">
              <Factory className="w-20 h-20 mx-auto text-blue-600 mb-6" />
              <h1 className="text-5xl font-bold text-gray-900 mb-4">Make2Manage</h1>
              <p className="text-2xl text-gray-600">Digital Learning Game voor Productie Planning</p>
            </div>

            <div className="grid grid-cols-3 gap-8 mb-12">
              <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <Users className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Voor Management</h3>
                <p className="text-gray-600">Leer productieprocessen beter te beheersen</p>
              </div>
              <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <Target className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Make-to-Order</h3>
                <p className="text-gray-600">Balanceer kosten en leverbetrouwbaarheid</p>
              </div>
              <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <BarChart3 className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Realtime Inzichten</h3>
                <p className="text-gray-600">Zie direct de impact van je beslissingen</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-10 shadow-lg mb-8">
              <h2 className="text-3xl font-semibold text-gray-900 mb-6">Over deze Learning Game</h2>
              <p className="text-lg text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
                In de MKB-maakindustrie in Limburg is vaak sprake van een make-to-order situatie. 
                Deze game helpt je de complexe planning en besturing van productieprocessen te begrijpen 
                en de balans te vinden tussen kostenefficiëntie en betrouwbare levering.
              </p>
              <button 
                onClick={() => setCurrentScreen('game')}
                className="bg-blue-600 text-white px-12 py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
              >
                Start Learning Game
              </button>
            </div>

            <div className="text-gray-500">
              Ontwikkeld voor TBK onderwijs | Contact: ruud.nijssen@zuyd.nl
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-screen h-screen bg-gray-50 overflow-hidden">
      <GameHeader onBack={() => setCurrentScreen('welcome')} />
      <GameDashboard />
    </div>
  )
}

export default App
