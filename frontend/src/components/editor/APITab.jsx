import { useState } from 'react'
import { Lock, Copy, ChevronDown, ChevronRight, Check } from 'lucide-react'

const METHOD_STYLES = {
  GET:    { bg: '#14532d', text: '#4ade80', border: '#16a34a' },
  POST:   { bg: '#1e3a5f', text: '#60a5fa', border: '#3b82f6' },
  PUT:    { bg: '#422006', text: '#fbbf24', border: '#d97706' },
  DELETE: { bg: '#450a0a', text: '#f87171', border: '#dc2626' },
  PATCH:  { bg: '#3b0764', text: '#c084fc', border: '#9333ea' },
}

function MethodBadge({ method }) {
  const s = METHOD_STYLES[method?.toUpperCase()] || METHOD_STYLES['GET']
  return (
    <span
      className="inline-block px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider w-14 text-center flex-shrink-0"
      style={{ background: s.bg, color: s.text, border: `1px solid ${s.border}44` }}
    >
      {method}
    </span>
  )
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded-md text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#2a2a3d] transition-colors flex-shrink-0"
      title="Copy endpoint"
    >
      {copied ? <Check size={13} className="text-[#4ade80]" /> : <Copy size={13} />}
    </button>
  )
}

function EndpointItem({ endpoint }) {
  const [open, setOpen] = useState(false)
  const copyText = `${endpoint.method} ${endpoint.path}\n${endpoint.description || ''}`

  return (
    <div className="border border-[#2a2a3d] rounded-xl overflow-hidden">
      {/* Endpoint header row */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[#1a1a28] transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <MethodBadge method={endpoint.method} />
        <code className="flex-1 text-sm text-[#e2e8f0] font-mono min-w-0 truncate">
          {endpoint.path}
        </code>
        {endpoint.auth && (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#422006] border border-[#d97706]/30" title="Auth required">
            <Lock size={10} className="text-[#fbbf24]" />
            <span className="text-[9px] text-[#fbbf24] font-bold">AUTH</span>
          </div>
        )}
        <CopyButton text={copyText} />
        <span className="text-[#4a4a6a] flex-shrink-0">
          {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>
      </div>

      {/* Description */}
      {endpoint.description && (
        <div className="px-4 pb-2 text-xs text-[#94a3b8] border-t border-[#2a2a3d]/50">
          <span className="block pt-2">{endpoint.description}</span>
        </div>
      )}

      {/* Expanded detail */}
      {open && (
        <div className="border-t border-[#2a2a3d] grid grid-cols-1 md:grid-cols-2 gap-0 divide-x divide-[#2a2a3d]">
          {/* Request Body */}
          <div className="p-4">
            <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-2">
              Request Body
            </p>
            <pre
              className="text-xs text-[#e2e8f0] font-mono overflow-auto rounded-lg p-3 leading-relaxed"
              style={{ background: '#0d1117', maxHeight: 200 }}
            >
              {endpoint.requestBody
                ? JSON.stringify(endpoint.requestBody, null, 2)
                : '// No body required'}
            </pre>
          </div>

          {/* Response */}
          <div className="p-4">
            <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-2">
              Response
            </p>
            <pre
              className="text-xs text-[#e2e8f0] font-mono overflow-auto rounded-lg p-3 leading-relaxed"
              style={{ background: '#0d1117', maxHeight: 200 }}
            >
              {endpoint.response
                ? JSON.stringify(endpoint.response, null, 2)
                : '{\n  "status": "success",\n  "data": {}\n}'}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}

function ServiceAccordion({ service }) {
  const [open, setOpen] = useState(true)

  return (
    <div className="border border-[#2a2a3d] rounded-2xl overflow-hidden">
      {/* Group header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 bg-[#12121a] hover:bg-[#1a1a28] transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-[#f1f5f9]">{service.name}</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#3b82f6]/15 text-[#3b82f6] border border-[#3b82f6]/25">
            {service.endpoints?.length || 0} endpoints
          </span>
          {service.technology && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#1a1a28] text-[#94a3b8] border border-[#2a2a3d]">
              {service.technology}
            </span>
          )}
        </div>
        {open ? <ChevronDown size={16} className="text-[#94a3b8]" /> : <ChevronRight size={16} className="text-[#94a3b8]" />}
      </button>

      {open && (
        <div className="bg-[#0d0d18] p-4 space-y-2">
          {service.endpoints?.map((ep, i) => (
            <EndpointItem key={i} endpoint={ep} />
          ))}
          {(!service.endpoints || service.endpoints.length === 0) && (
            <p className="text-sm text-[#4a4a6a] py-2 px-2">No endpoints defined</p>
          )}
        </div>
      )}
    </div>
  )
}

/* ─── APITab ──────────────────────────────────────────────────────────────── */
export default function APITab({ design }) {
  const services = design?.lld?.services || []

  if (!design) {
    return (
      <div className="flex items-center justify-center h-64 text-[#4a4a6a] text-sm p-6">
        Generate a design to see API contracts
      </div>
    )
  }

  return (
    <div id="api-tab" className="flex flex-col gap-5 p-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-[#f1f5f9]">API Contracts</h2>
          <p className="text-xs text-[#94a3b8] mt-0.5">
            {services.reduce((acc, s) => acc + (s.endpoints?.length || 0), 0)} total endpoints
            across {services.length} services
          </p>
        </div>
      </div>

      {/* Service accordions */}
      <div className="space-y-4">
        {services.map((svc) => (
          <ServiceAccordion key={svc.name} service={svc} />
        ))}
        {services.length === 0 && (
          <div className="flex items-center justify-center h-32 text-[#4a4a6a] text-sm border border-[#2a2a3d] rounded-xl">
            No services defined
          </div>
        )}
      </div>
    </div>
  )
}
