import { useEffect, useState } from 'react'
import useDesignStore from '../../store/designStore'
import useAuthStore from '../../store/authStore'
import { GitCommit, RefreshCw, Plus, Clock, User, ArrowLeftRight, Check, AlertCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default function HistoryTab({ design }) {
  const designId = design?._id || design?.id
  const {
    versions,
    isLoading,
    fetchVersions,
    commitVersion,
    rollbackVersion,
  } = useDesignStore()
  const { user } = useAuthStore()

  const [message, setMessage] = useState('')
  const [isCommitting, setIsCommitting] = useState(false)
  const [rollbackTarget, setRollbackTarget] = useState(null)
  const [isRollingBack, setIsRollingBack] = useState(false)
  const [status, setStatus] = useState(null) // { type: 'success'|'error', text: '' }

  useEffect(() => {
    if (designId) {
      fetchVersions(designId)
    }
  }, [designId, fetchVersions])

  const handleCommit = async (e) => {
    e.preventDefault()
    const trimmed = message.trim()
    if (!trimmed || isCommitting) return

    setIsCommitting(true)
    setStatus(null)
    try {
      const res = await commitVersion(designId, trimmed)
      if (res.success) {
        setMessage('')
        setStatus({ type: 'success', text: 'Architectural savepoint committed successfully!' })
      } else {
        setStatus({ type: 'error', text: res.message || 'Failed to commit savepoint.' })
      }
    } catch (err) {
      setStatus({ type: 'error', text: err.message || 'An error occurred.' })
    } finally {
      setIsCommitting(false)
      setTimeout(() => setStatus(null), 4000)
    }
  }

  const handleRollback = async (versionId, versionNumber) => {
    if (isRollingBack) return
    if (!window.confirm(`Are you sure you want to rollback all diagrams, databases, and specifications to Version v${versionNumber}? Current workspace changes will be snapshotted in a new auto-commit.`)) return

    setRollbackTarget(versionId)
    setIsRollingBack(true)
    setStatus(null)
    try {
      const res = await rollbackVersion(designId, versionId)
      if (res.success) {
        setStatus({ type: 'success', text: `Workspace rolled back successfully to Version v${versionNumber}!` })
      } else {
        setStatus({ type: 'error', text: res.message || 'Failed to roll back.' })
      }
    } catch (err) {
      setStatus({ type: 'error', text: err.message || 'An error occurred during rollback.' })
    } finally {
      setIsRollingBack(false)
      setRollbackTarget(null)
      setTimeout(() => setStatus(null), 5000)
    }
  }

  if (!design) {
    return (
      <div className="flex items-center justify-center h-64 text-[#4a4a6a] text-sm p-6">
        Generate or load a design to inspect history
      </div>
    )
  }

  return (
    <div id="history-tab" className="flex flex-col gap-6 p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-base font-bold text-[#f1f5f9]">Version Control</h2>
        <p className="text-xs text-[#94a3b8] mt-0.5">
          Git-like snapshot commits and rollbacks for system whiteboard architectures and API blueprints.
        </p>
      </div>

      {/* Commit status notification */}
      {status && (
        <div
          className={`flex items-start gap-3 border rounded-xl px-4 py-3 text-xs leading-relaxed animate-fade-in ${
            status.type === 'success'
              ? 'bg-green-500/10 border-green-500/30 text-green-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}
        >
          {status.type === 'success' ? (
            <Check size={14} className="flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
          )}
          <span>{status.text}</span>
        </div>
      )}

      {/* Create new commit / snapshot form */}
      <form onSubmit={handleCommit} className="bg-[#12121a] border border-[#2a2a3d] rounded-2xl p-5 flex flex-col gap-3">
        <label className="block text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">
          Create Architectural Commit Savepoint
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isCommitting}
            placeholder="e.g. Added caching layers, defined billing service DB table indexes…"
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#1a1a28] border border-[#2a2a3d] text-[#f1f5f9] placeholder-[#94a3b8]/40 text-sm focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20 transition-all duration-200"
            maxLength={180}
            required
          />
          <button
            type="submit"
            disabled={!message.trim() || isCommitting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold text-xs hover:from-blue-400 hover:to-purple-500 transition-all duration-200 shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {isCommitting ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <GitCommit className="w-3.5 h-3.5" />
            )}
            Commit Savepoint
          </button>
        </div>
        <p className="text-[10px] text-[#4a4a6a]">
          Saving a savepoint commits the current position, names, and labels of whiteboard elements, ER tables, endpoints, and scalability parameters.
        </p>
      </form>

      {/* Timeline view */}
      <div className="bg-[#12121a] border border-[#2a2a3d] rounded-2xl p-5">
        <h3 className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-6">
          Architectural Timeline
        </h3>

        {versions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Clock className="w-8 h-8 text-[#2a2a3d] mb-3 animate-pulse" />
            <p className="text-xs text-[#4a4a6a] max-w-xs leading-relaxed">
              No custom savepoint commits have been created for this architecture yet. Use the input field above to log your first commit!
            </p>
          </div>
        ) : (
          <div className="relative border-l border-[#2a2a3d] pl-6 ml-3 space-y-8">
            {versions.map((ver, idx) => {
              const isLatest = idx === 0
              const dateText = ver.createdAt
                ? formatDistanceToNow(new Date(ver.createdAt), { addSuffix: true })
                : 'recently'
              const verTargeting = rollbackTarget === ver._id

              return (
                <div key={ver._id} className="relative">
                  {/* Timeline dot element */}
                  <div
                    className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full border-2 flex items-center justify-center bg-[#0a0a0f] transition-all duration-200 ${
                      isLatest
                        ? 'border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)] bg-blue-950/20'
                        : 'border-[#2a2a3d]'
                    }`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        isLatest ? 'bg-blue-400' : 'bg-[#2a2a3d]'
                      }`}
                    />
                  </div>

                  {/* Version Item Card */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-[#2a2a3d]/50 bg-[#161622]/40 hover:bg-[#1a1a28] hover:border-[#2a2a3d] transition-all duration-200">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-[#3b82f6] text-[10px] font-bold font-mono">
                          v{ver.versionNumber}
                        </span>
                        {isLatest && (
                          <span className="px-1.5 py-0.5 rounded bg-green-500/10 border border-green-500/20 text-green-400 text-[9px] font-bold">
                            LATEST WORKSPACE
                          </span>
                        )}
                        <span className="text-[10px] text-[#4a4a6a] font-medium flex items-center gap-1">
                          <Clock size={10} />
                          {dateText}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-[#e2e8f0] leading-snug">
                        {ver.commitMessage}
                      </p>
                      <div className="flex items-center gap-1.5 text-[10px] text-[#94a3b8] pt-1">
                        <User size={10} className="text-blue-500" />
                        <span>Committed by {user?.name || 'Owner'}</span>
                      </div>
                    </div>

                    {!isLatest && (
                      <button
                        onClick={() => handleRollback(ver._id, ver.versionNumber)}
                        disabled={isRollingBack}
                        className="flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-lg border border-[#2a2a3d] text-xs font-semibold bg-[#1a1a28] text-[#94a3b8] hover:border-blue-500/60 hover:text-blue-400 hover:bg-blue-500/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 whitespace-nowrap"
                      >
                        {verTargeting ? (
                          <>
                            <RefreshCw size={11} className="animate-spin" />
                            Restoring…
                          </>
                        ) : (
                          <>
                            <ArrowLeftRight size={11} />
                            Rollback to v{ver.versionNumber}
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
