import React from 'react'

const CanvasProperties = ({
  selectedNode,
  selectedEdge,
  onUpdateNode,
  onUpdateEdge,
}) => {
  if (!selectedNode && !selectedEdge) return null

  const isNode = !!selectedNode
  const entity = selectedNode || selectedEdge

  const colors = [
    '#1e293b', '#3b82f6', '#8b5cf6', '#ec4899', '#ef4444', 
    '#f59e0b', '#10b981', '#06b6d4', 'transparent'
  ]

  const strokeColors = [
    'rgba(255, 255, 255, 0.2)', '#ffffff', '#3b82f6', '#8b5cf6', '#ec4899', '#ef4444', '#f59e0b', '#10b981', 'transparent'
  ]

  const borderStyles = ['solid', 'dashed', 'dotted']
  const edgeStyles = ['default', 'straight', 'step', 'smoothstep']
  
  const handleColorChange = (color) => {
    if (isNode) onUpdateNode(entity.id, { color })
  }

  const handleStrokeChange = (strokeColor) => {
    if (isNode) onUpdateNode(entity.id, { strokeColor })
    else onUpdateEdge(entity.id, { strokeColor })
  }

  const handleBorderStyle = (borderStyle) => {
    if (isNode) onUpdateNode(entity.id, { borderStyle })
  }

  const handleEdgeType = (type) => {
    if (!isNode) onUpdateEdge(entity.id, { type })
  }

  return (
    <div className="absolute top-20 right-2 sm:right-4 w-64 max-w-[calc(100vw-1rem)] max-h-[60vh] overflow-y-auto bg-[#12121a] border border-[#2a2a3d] p-4 rounded-xl shadow-xl z-50 text-sm animate-fade-in">
      <h3 className="text-[#f1f5f9] font-bold mb-4 border-b border-[#2a2a3d] pb-2">
        {isNode ? 'Node Properties' : 'Edge Properties'}
      </h3>

      {isNode && (
        <div className="mb-4">
          <label className="block text-[#94a3b8] text-xs mb-2">Background Color</label>
          <div className="flex flex-wrap gap-2">
            {colors.map(c => (
              <button
                key={c}
                onClick={() => handleColorChange(c)}
                className="w-6 h-6 rounded border hover:scale-110 transition-transform"
                style={{ backgroundColor: c, borderColor: c === 'transparent' ? '#3a3a55' : c, borderStyle: c === 'transparent' ? 'dashed' : 'solid' }}
              />
            ))}
          </div>
        </div>
      )}

      <div className="mb-4">
        <label className="block text-[#94a3b8] text-xs mb-2">Stroke Color</label>
        <div className="flex flex-wrap gap-2">
          {strokeColors.map(c => (
            <button
              key={c}
              onClick={() => handleStrokeChange(c)}
              className="w-6 h-6 rounded border hover:scale-110 transition-transform"
              style={{ backgroundColor: c === 'rgba(255, 255, 255, 0.2)' ? '#2a2a3d' : c, borderColor: c === 'transparent' ? '#3a3a55' : '#2a2a3d', borderStyle: c === 'transparent' ? 'dashed' : 'solid' }}
            />
          ))}
        </div>
      </div>

      {isNode ? (
        <div className="mb-4">
          <label className="block text-[#94a3b8] text-xs mb-2">Border Style</label>
          <div className="flex gap-2">
            {borderStyles.map(s => (
              <button
                key={s}
                onClick={() => handleBorderStyle(s)}
                className={`flex-1 py-1 bg-[#1a1a28] border rounded text-[#94a3b8] hover:text-[#f1f5f9] capitalize transition-colors ${entity.data?.borderStyle === s ? 'border-blue-500 text-blue-400' : 'border-[#2a2a3d]'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="mb-4">
          <label className="block text-[#94a3b8] text-xs mb-2">Edge Type</label>
          <div className="grid grid-cols-2 gap-2">
            {edgeStyles.map(s => (
              <button
                key={s}
                onClick={() => handleEdgeType(s)}
                className={`py-1 bg-[#1a1a28] border rounded text-[#94a3b8] hover:text-[#f1f5f9] capitalize text-xs transition-colors ${entity.type === s || (!entity.type && s === 'default') ? 'border-blue-500 text-blue-400' : 'border-[#2a2a3d]'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default CanvasProperties
