import React, { useState, useEffect } from 'react'
import { Search, X, Loader2 } from 'lucide-react'
import { CURATED_ICON_NAMES } from '../../utils/curatedIcons'
import { loadIconSet } from '../../utils/iconLoader'

export default function IconSearchPanel({ onSelect, onClose }) {
  const [search, setSearch] = useState('')
  const [iconSet, setIconSet] = useState(null)

  // The full ~3,400-icon set (several MB) is only fetched the moment this
  // panel is actually opened — never as part of the main or editor bundle.
  useEffect(() => {
    let cancelled = false
    loadIconSet().then((mod) => {
      if (!cancelled) setIconSet(mod)
    })
    return () => { cancelled = true }
  }, [])

  const isSearching = search.trim() !== ''
  const namePool = isSearching && iconSet ? Object.keys(iconSet) : CURATED_ICON_NAMES

  const displayedIcons = isSearching
    ? namePool
        .filter((name) => name.toLowerCase().includes(search.toLowerCase().replace(/[^a-z0-9]/g, '')))
        .slice(0, 100) // limit results to prevent lag
    : CURATED_ICON_NAMES

  return (
    <div className="absolute left-2 sm:left-16 top-4 w-80 max-w-[calc(100vw-1rem)] bg-[#12121a] border border-[#2a2a3d] rounded-xl shadow-2xl z-50 flex flex-col h-[400px] max-h-[70vh] animate-fade-in overflow-hidden">
      {/* Header / Search */}
      <div className="p-3 border-b border-[#2a2a3d] flex items-center gap-2 bg-[#1a1a28]">
        <Search className="w-4 h-4 text-[#94a3b8]" />
        <input
          type="text"
          autoFocus
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tech logos..."
          className="flex-1 bg-transparent text-sm text-[#f1f5f9] placeholder-[#94a3b8]/50 focus:outline-none"
        />
        <button onClick={onClose} className="p-1 rounded hover:bg-[#2a2a3d] text-[#94a3b8] transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-3 grid grid-cols-4 gap-2 content-start">
        {!iconSet ? (
          <div className="col-span-4 flex flex-col items-center justify-center py-10 text-[#94a3b8] text-sm gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading icon library…
          </div>
        ) : displayedIcons.length === 0 ? (
          <div className="col-span-4 text-center py-10 text-[#94a3b8] text-sm">
            No logos found for "{search}"
          </div>
        ) : (
          displayedIcons.map((iconName) => {
            const IconComponent = iconSet[iconName]
            if (!IconComponent) return null

            // Extract a clean label (e.g. SiReact -> React)
            const label = iconName.replace(/^Si/, '')

            return (
              <button
                key={iconName}
                onClick={() => {
                  onSelect({ type: 'icon', iconName, label })
                  onClose()
                }}
                title={label}
                className="aspect-square flex flex-col items-center justify-center p-2 rounded-lg bg-[#1a1a28]/50 border border-[#2a2a3d] hover:border-blue-500 hover:bg-blue-500/10 text-[#f1f5f9] transition-all group"
              >
                <IconComponent className="w-6 h-6 text-[#94a3b8] group-hover:text-blue-400 transition-colors" />
                <span className="text-[11px] mt-2 text-[#94a3b8] truncate w-full text-center group-hover:text-blue-400">
                  {label}
                </span>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
