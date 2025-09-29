import { useState } from 'react'
import { 
  Clock, DollarSign, Truck, AlertTriangle, TrendingUp, TrendingDown, 
  Users, Package, Calendar, BarChart3, Settings, Download, Play, 
  CheckCircle, XCircle, AlertCircle, Factory
} from 'lucide-react'

export default function GameDashboard() {
  const [currentScenario] = useState(1)
  const [activeTab, setActiveTab] = useState<'overview' | 'scenarios' | 'performance' | 'export'>('overview')
  const [gameData] = useState({
    costs: 15000,
    deliveryTime: 8,
    reliability: 85,
    customerSatisfaction: 75,
    ordersCompleted: 12,
    totalOrders: 15,
    currentWeek: 3,
    totalWeeks: 8
  })

  const recentDecisions = [
    { id: 1, scenario: "Rush Order", decision: "Accept with overtime", impact: "positive", cost: 1200 },
    { id: 2, scenario: "Supplier Delay", decision: "Find alternative supplier", impact: "neutral", cost: 800 },
    { id: 3, scenario: "Quality Issue", decision: "Rework internally", impact: "negative", cost: 2100 }
  ]

  const upcomingScenarios = [
    { id: 4, title: "Equipment Breakdown", difficulty: "high", estimatedTime: "15 min" },
    { id: 5, title: "New Customer Inquiry", difficulty: "medium", estimatedTime: "10 min" },
    { id: 6, title: "Seasonal Demand Spike", difficulty: "high", estimatedTime: "20 min" }
  ]

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Navigation Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {(['overview', 'scenarios', 'performance', 'export'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Kosten</p>
                  <p className="text-2xl font-semibold text-gray-900">€{gameData.costs.toLocaleString()}</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
              <div className="mt-2 flex items-center">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">12% vs vorige week</span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Gem. Levertijd</p>
                  <p className="text-2xl font-semibold text-gray-900">{gameData.deliveryTime} dagen</p>
                </div>
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
              <div className="mt-2 flex items-center">
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                <span className="text-sm text-red-600">2% langzamer</span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Betrouwbaarheid</p>
                  <p className="text-2xl font-semibold text-gray-900">{gameData.reliability}%</p>
                </div>
                <Truck className="w-8 h-8 text-purple-600" />
              </div>
              <div className="mt-2 flex items-center">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">5% verbeterd</span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Klanttevredenheid</p>
                  <p className="text-2xl font-semibold text-gray-900">{gameData.customerSatisfaction}%</p>
                </div>
                <Users className="w-8 h-8 text-orange-600" />
              </div>
              <div className="mt-2 flex items-center">
                <span className="text-sm text-gray-600">Stabiel t.o.v. vorige maand</span>
              </div>
            </div>
          </div>

          {/* Progress Section */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Game Progress */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Scenario Voortgang</h3>
                <Factory className="w-6 h-6 text-blue-600" />
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Voltooid</span>
                    <span>{gameData.ordersCompleted}/{gameData.totalOrders} scenario's</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
                      style={{width: `${(gameData.ordersCompleted / gameData.totalOrders) * 100}%`}}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Week Voortgang</span>
                    <span>{gameData.currentWeek}/{gameData.totalWeeks} weken</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-green-600 h-3 rounded-full transition-all duration-300" 
                      style={{width: `${(gameData.currentWeek / gameData.totalWeeks) * 100}%`}}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Decisions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recente Beslissingen</h3>
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <div className="space-y-3">
                {recentDecisions.map((decision) => (
                  <div key={decision.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {decision.impact === 'positive' && <CheckCircle className="w-4 h-4 text-green-500" />}
                      {decision.impact === 'negative' && <XCircle className="w-4 h-4 text-red-500" />}
                      {decision.impact === 'neutral' && <AlertCircle className="w-4 h-4 text-yellow-500" />}
                      <div>
                        <p className="text-sm font-medium text-gray-900">{decision.scenario}</p>
                        <p className="text-xs text-gray-600">{decision.decision}</p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">€{decision.cost}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Scenarios */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Volgende Scenario's</h3>
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div className="space-y-3">
                {upcomingScenarios.map((scenario) => (
                  <div key={scenario.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{scenario.title}</p>
                      <p className="text-xs text-gray-600">Geschatte tijd: {scenario.estimatedTime}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        scenario.difficulty === 'high' ? 'bg-red-100 text-red-800' :
                        scenario.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {scenario.difficulty === 'high' ? 'Hoog' : 
                         scenario.difficulty === 'medium' ? 'Gemiddeld' : 'Laag'}
                      </span>
                      <Play className="w-4 h-4 text-blue-600" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scenarios Tab */}
      {activeTab === 'scenarios' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Scenario {currentScenario}: Nieuwe Productieorder
            </h2>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
              <div className="flex">
                <AlertTriangle className="w-5 h-5 text-blue-400 mr-2" />
                <div>
                  <p className="text-blue-800">
                    <strong>Situatie:</strong> Een belangrijke klant vraagt om een rush order van 500 units. 
                    De normale levertijd is 10 dagen, maar zij hebben het product over 6 dagen nodig.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-4">Wat is je beslissing?</h3>
                <div className="space-y-3">
                  <label className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                    <input type="radio" name="decision" className="text-blue-600 mt-1" />
                    <div>
                      <span className="font-medium text-gray-900">Accepteer de rush order met overtime kosten</span>
                      <p className="text-sm text-gray-600 mt-1">+30% kosten, maar behoudt klantrelatie. Risico op werknemersuitputting.</p>
                    </div>
                  </label>
                  <label className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                    <input type="radio" name="decision" className="text-blue-600 mt-1" />
                    <div>
                      <span className="font-medium text-gray-900">Stel alternatieve levertijd voor (8 dagen)</span>
                      <p className="text-sm text-gray-600 mt-1">Normale kosten, compromis met klant. 70% kans dat klant akkoord gaat.</p>
                    </div>
                  </label>
                  <label className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                    <input type="radio" name="decision" className="text-blue-600 mt-1" />
                    <div>
                      <span className="font-medium text-gray-900">Wijs de order af</span>
                      <p className="text-sm text-gray-600 mt-1">Geen extra kosten, maar mogelijke klantverlies en reputatieschade.</p>
                    </div>
                  </label>
                </div>
              </div>
              
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                Bevestig Beslissing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === 'performance' && (
        <div className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Prestatie Overzicht</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Kostenbeheersing</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{width: '68%'}}></div>
                    </div>
                    <span className="text-sm font-medium">68%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Levertijd Optimalisatie</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: '82%'}}></div>
                    </div>
                    <span className="text-sm font-medium">82%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Kwaliteitsmanagement</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{width: '75%'}}></div>
                    </div>
                    <span className="text-sm font-medium">75%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Klantcommunicatie</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{width: '91%'}}></div>
                    </div>
                    <span className="text-sm font-medium">91%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Leerresultaten</h3>
              <div className="space-y-4">
                <div className="border-l-4 border-green-400 pl-4">
                  <h4 className="font-medium text-green-800">Sterke Punten</h4>
                  <ul className="text-sm text-green-700 mt-2 space-y-1">
                    <li>• Uitstekende klantcommunicatie</li>
                    <li>• Goede levertijd optimalisatie</li>
                    <li>• Effectieve planningsmethoden</li>
                  </ul>
                </div>
                <div className="border-l-4 border-yellow-400 pl-4">
                  <h4 className="font-medium text-yellow-800">Verbeterpunten</h4>
                  <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                    <li>• Kostenbeheersing kan beter</li>
                    <li>• Meer aandacht voor risicomanagement</li>
                    <li>• Leverancierrelaties optimaliseren</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Tab */}
      {activeTab === 'export' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Exporteer Resultaten</h3>
            <p className="text-gray-600 mb-6">
              Download je leerresultaten en voortgang om te delen met je docent of voor eigen analyse.
            </p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <button className="flex items-center justify-center space-x-2 bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition-colors">
                <Download className="w-5 h-5" />
                <span>Export als PDF</span>
              </button>
              <button className="flex items-center justify-center space-x-2 bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition-colors">
                <Download className="w-5 h-5" />
                <span>Export als CSV</span>
              </button>
            </div>
            
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Wat wordt geëxporteerd:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Alle gemaakte beslissingen per scenario</li>
                <li>• Prestatiemetrics en trends</li>
                <li>• Leerresultaten en feedback</li>
                <li>• Tijdsbesteding per onderdeel</li>
                <li>• Sterke punten en verbeterpunten</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions Bar */}
      <div className="fixed bottom-6 right-6">
        <div className="flex space-x-3">
          <button className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors">
            <Settings className="w-5 h-5" />
          </button>
          <button className="bg-green-600 text-white p-3 rounded-full shadow-lg hover:bg-green-700 transition-colors">
            <Package className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
