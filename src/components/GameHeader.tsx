import { ArrowLeft, Factory } from 'lucide-react'

interface GameHeaderProps {
  onBack: () => void
}

export default function GameHeader({ onBack }: GameHeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Terug
            </button>
            <div className="flex items-center gap-2">
              <Factory className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Make2Manage</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              Voortgang wordt lokaal opgeslagen
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
