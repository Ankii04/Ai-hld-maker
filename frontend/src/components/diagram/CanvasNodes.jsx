import { memo, useState, useRef, useEffect } from 'react'
import { Handle, Position, NodeResizer } from '@xyflow/react'
import { loadIconSet } from '../../utils/iconLoader'

function useIconComponent(iconName) {
  const [Icon, setIcon] = useState(null)

  useEffect(() => {
    let cancelled = false
    loadIconSet().then((mod) => {
      if (!cancelled) setIcon(() => mod[iconName] || null)
    })
    return () => { cancelled = true }
  }, [iconName])

  return Icon
}

/** Shared double-click-to-rename label, used by both shape and icon nodes. */
function EditableLabel({ label, onRename, className, style, placeholder = 'Label' }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(label)
  const inputRef = useRef(null)

  useEffect(() => setDraft(label), [label])

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [editing])

  const commit = () => {
    setEditing(false)
    const trimmed = draft.trim()
    if (trimmed && trimmed !== label) onRename?.(trimmed)
    else setDraft(label)
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit()
          if (e.key === 'Escape') { setDraft(label); setEditing(false) }
        }}
        onClick={(e) => e.stopPropagation()}
        onDoubleClick={(e) => e.stopPropagation()}
        placeholder={placeholder}
        className={`bg-black/40 outline-none border-b border-blue-400 text-center ${className}`}
        style={style}
      />
    )
  }

  return (
    <div
      onDoubleClick={(e) => { e.stopPropagation(); setEditing(true) }}
      className={className}
      style={style}
    >
      {label || placeholder}
    </div>
  )
}

const ResizableShapeNode = memo(({ data, selected }) => {
  const {
    shape = 'rectangle',
    color = '#1e293b',
    strokeColor = 'rgba(255, 255, 255, 0.2)',
    borderStyle = 'solid',
    borderWidth = 2,
    label = 'Node',
    fontSize = 12,
    onRename,
  } = data

  const borderCss = `${borderWidth}px ${borderStyle} ${strokeColor}`
  const textColor = '#f1f5f9'

  const renderShape = () => {
    switch (shape) {
      case 'circle':
        return (
          <EditableLabel
            label={label}
            onRename={onRename}
            className="w-full h-full rounded-full flex items-center justify-center font-medium break-words p-2 text-center"
            style={{ backgroundColor: color, border: borderCss, fontSize, color: textColor }}
          />
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
              <div style={{ transform: 'rotate(-45deg)' }}>
                <EditableLabel label={label} onRename={onRename} className="text-center" style={{ color: textColor }} />
              </div>
            </div>
          </div>
        )
      case 'text':
        return (
          <EditableLabel
            label={label}
            onRename={onRename}
            className="w-full h-full flex items-center justify-center font-medium break-words p-2"
            style={{ fontSize, color: strokeColor === 'rgba(255, 255, 255, 0.2)' ? textColor : strokeColor }}
          />
        )
      case 'rectangle':
      default:
        return (
          <EditableLabel
            label={label}
            onRename={onRename}
            className="w-full h-full rounded-lg flex items-center justify-center font-medium break-words p-2 text-center"
            style={{ backgroundColor: color, border: borderCss, fontSize, color: textColor }}
          />
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

const IconNode = memo(({ data, selected }) => {
  const { iconName, color = '#f1f5f9', label = '', onRename } = data
  const IconComponent = useIconComponent(iconName)

  return (
    <>
      <NodeResizer color="#3b82f6" isVisible={selected} minWidth={30} minHeight={30} keepAspectRatio />
      <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-blue-400 opacity-0 group-hover:opacity-100" />
      <div className="w-full h-full flex flex-col items-center justify-center group relative p-1">
        {IconComponent ? (
          <IconComponent className="w-full h-full" style={{ color }} />
        ) : (
          <div className="w-full h-full bg-[#1e293b] rounded-lg border border-red-500/50 flex items-center justify-center text-[11px] text-red-400">
            ?
          </div>
        )}
        <EditableLabel
          label={label}
          onRename={onRename}
          placeholder="Label"
          className="absolute -bottom-5 text-[11px] whitespace-nowrap"
          style={{ color }}
        />
      </div>
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-blue-400 opacity-0 group-hover:opacity-100" />
      <Handle type="source" position={Position.Left} id="left" className="w-2 h-2 !bg-blue-400 opacity-0 group-hover:opacity-100" />
      <Handle type="source" position={Position.Right} id="right" className="w-2 h-2 !bg-blue-400 opacity-0 group-hover:opacity-100" />
    </>
  )
})

export const CanvasNodes = {
  resizableShape: ResizableShapeNode,
  iconNode: IconNode,
}
