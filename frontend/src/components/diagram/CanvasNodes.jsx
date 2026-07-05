import { memo } from 'react'
import { Handle, Position, NodeResizer } from '@xyflow/react'

const ResizableShapeNode = memo(({ data, selected }) => {
  const { 
    shape = 'rectangle', 
    color = '#1e293b', 
    strokeColor = 'rgba(255, 255, 255, 0.2)',
    borderStyle = 'solid',
    borderWidth = 2,
    label = 'Node',
    fontSize = 12
  } = data

  const borderCss = `${borderWidth}px ${borderStyle} ${strokeColor}`
  const textColor = '#f1f5f9'

  const renderShape = () => {
    switch (shape) {
      case 'circle':
        return (
          <div
            className="w-full h-full rounded-full flex items-center justify-center font-medium break-words p-2 text-center"
            style={{ backgroundColor: color, border: borderCss, fontSize, color: textColor }}
          >
            {label}
          </div>
        )
      case 'diamond':
        return (
          <div className="w-full h-full relative">
            <div
              className="absolute inset-0 flex items-center justify-center font-medium break-words p-4 text-center"
              style={{
                backgroundColor: color,
                border: borderCss,
                transform: 'rotate(45deg) scale(0.7071)',
                fontSize,
                color: textColor
              }}
            >
              <div style={{ transform: 'rotate(-45deg)' }}>{label}</div>
            </div>
          </div>
        )
      case 'text':
        return (
          <div
            className="w-full h-full flex items-center justify-center font-medium break-words p-2"
            style={{ 
              fontSize, 
              color: strokeColor === 'rgba(255, 255, 255, 0.2)' ? textColor : strokeColor 
            }}
          >
            {label}
          </div>
        )
      case 'rectangle':
      default:
        return (
          <div
            className="w-full h-full rounded-lg flex items-center justify-center font-medium break-words p-2 text-center"
            style={{ backgroundColor: color, border: borderCss, fontSize, color: textColor }}
          >
            {label}
          </div>
        )
    }
  }

  return (
    <>
      <NodeResizer color="#3b82f6" isVisible={selected} minWidth={30} minHeight={30} />
      <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-blue-400" />
      <div className="w-full h-full">{renderShape()}</div>
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-blue-400" />
      <Handle type="source" position={Position.Left} id="left" className="w-2 h-2 !bg-blue-400" />
      <Handle type="source" position={Position.Right} id="right" className="w-2 h-2 !bg-blue-400" />
    </>
  )
})

export const CanvasNodes = {
  resizableShape: ResizableShapeNode,
}
