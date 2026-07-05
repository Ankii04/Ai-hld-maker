import { memo } from 'react'
import { Handle, Position, NodeResizer } from '@xyflow/react'

const ResizableShapeNode = memo(({ data, selected }) => {
  const { shape = 'rectangle', color = '#1e293b', label = 'Node' } = data

  const renderShape = () => {
    switch (shape) {
      case 'circle':
        return (
          <div
            className="w-full h-full rounded-full flex items-center justify-center border-2 border-white/20 text-white font-medium text-xs break-words p-2 text-center"
            style={{ backgroundColor: color }}
          >
            {label}
          </div>
        )
      case 'diamond':
        return (
          <div className="w-full h-full relative">
            <div
              className="absolute inset-0 border-2 border-white/20 flex items-center justify-center text-white font-medium text-xs break-words p-4 text-center"
              style={{
                backgroundColor: color,
                transform: 'rotate(45deg) scale(0.7071)',
              }}
            >
              <div style={{ transform: 'rotate(-45deg)' }}>{label}</div>
            </div>
          </div>
        )
      case 'rectangle':
      default:
        return (
          <div
            className="w-full h-full rounded-lg flex items-center justify-center border-2 border-white/20 text-white font-medium text-xs break-words p-2 text-center"
            style={{ backgroundColor: color }}
          >
            {label}
          </div>
        )
    }
  }

  return (
    <>
      <NodeResizer color="#3b82f6" isVisible={selected} minWidth={50} minHeight={50} />
      <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-blue-400" />
      <div className="w-full h-full">{renderShape()}</div>
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-blue-400" />
    </>
  )
})

export const CanvasNodes = {
  resizableShape: ResizableShapeNode,
}
