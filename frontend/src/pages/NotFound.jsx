import { useNavigate } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'

export const NotFound = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Grid */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, #3b82f6 1px, transparent 1px), linear-gradient(to bottom, #3b82f6 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />
      
      {/* Glowing Orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-blue-500/10 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-purple-500/10 blur-[80px] pointer-events-none" />

      <div className="relative z-10 text-center max-w-lg mx-auto">
        <h1 className="font-heading text-8xl md:text-9xl font-bold bg-gradient-to-br from-blue-400 to-purple-500 bg-clip-text text-transparent mb-6 drop-shadow-2xl">
          404
        </h1>
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-[#f1f5f9] mb-4">
          Page Not Found
        </h2>
        <p className="text-[#94a3b8] text-sm md:text-base leading-relaxed mb-10">
          We couldn't find the page you're looking for. It might have been moved, deleted, or never existed in the first place.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-[#2a2a3d] bg-[#12121a] text-[#f1f5f9] font-medium hover:border-[#3b82f6]/40 hover:bg-[#1a1a28] transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:from-blue-400 hover:to-purple-500 transition-all duration-200 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40"
          >
            <Home className="w-4 h-4" />
            Return Home
          </button>
        </div>
      </div>
    </div>
  )
}

export default NotFound
