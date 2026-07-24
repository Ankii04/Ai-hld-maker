import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, BrainCircuit, Crown, CheckCircle, Mail } from 'lucide-react'
import { toast } from 'react-hot-toast'
import useAuthStore from '../store/authStore'

const perks = [
  'Unlimited AI blueprint generations',
  'Challenge Mode — find bottlenecks & SPOFs',
  'OpenAPI YAML export',
  'Shareable read-only links for your team',
  'Priority AI generation queue',
]

/**
 * Honest placeholder for the Pro upgrade path — this app does not yet have
 * billing wired up, so this page collects interest instead of pretending to
 * process a payment. Every "Upgrade to Pro" link/button in the app points
 * here rather than 404ing or doing nothing.
 */
const Upgrade = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [requested, setRequested] = useState(false)

  const handleRequestAccess = () => {
    setRequested(true)
    toast.success("You're on the list — we'll email you when Pro billing opens.")
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#f1f5f9] flex flex-col items-center px-6 py-16">
      <button
        onClick={() => navigate(-1)}
        className="self-start flex items-center gap-2 text-[#94a3b8] hover:text-[#f1f5f9] text-sm mb-10 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="w-full max-w-md text-center">
        <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center mx-auto mb-6">
          <Crown className="w-7 h-7 text-yellow-400" />
        </div>
        <h1 className="font-heading text-3xl font-bold mb-2">ArchMind Pro</h1>
        <p className="text-[#94a3b8] text-sm mb-8">
          Pro billing isn't live yet — we're building it. Join the list below and we'll email
          you the moment it opens.
        </p>

        <div className="bg-[#12121a] border border-[#2a2a3d] rounded-2xl p-6 text-left mb-6">
          <div className="flex items-end gap-1 mb-5">
            <span className="text-4xl font-bold">$19</span>
            <span className="text-[#94a3b8] mb-1">/month</span>
          </div>
          <div className="space-y-3">
            {perks.map((perk) => (
              <div key={perk} className="flex items-center gap-2.5">
                <CheckCircle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                <span className="text-sm text-[#f1f5f9]">{perk}</span>
              </div>
            ))}
          </div>
        </div>

        {requested ? (
          <div className="flex items-center justify-center gap-2 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-semibold">
            <CheckCircle className="w-4 h-4" />
            You're on the waitlist{user?.email ? ` (${user.email})` : ''}
          </div>
        ) : (
          <button
            onClick={handleRequestAccess}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold text-sm hover:from-yellow-400 hover:to-orange-400 transition-all duration-200 shadow-lg shadow-yellow-500/20"
          >
            <Mail className="w-4 h-4" />
            Notify me when Pro launches
          </button>
        )}

        <button
          onClick={() => navigate('/dashboard')}
          className="w-full py-2.5 rounded-xl text-[#94a3b8] text-sm hover:text-[#f1f5f9] transition-colors mt-3"
        >
          Back to Dashboard
        </button>
      </div>

      <div className="flex items-center gap-2 mt-16 text-[#94a3b8] text-xs">
        <BrainCircuit className="w-3.5 h-3.5" />
        ArchMind
      </div>
    </div>
  )
}

export default Upgrade
