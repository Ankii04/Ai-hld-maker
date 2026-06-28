import React from 'react'
import { getSmoothStepPath, EdgeLabelRenderer } from '@xyflow/react'


export default function SimulationEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data = {},
}) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  const state = data.state || 'idle' // 'idle', 'running', 'warning', 'error', 'dead'
  const speed = data.speed || 1 // speed factor
  const packetColor = data.packetColor || '#3b82f6'

  // Decide colors based on edge state
  let strokeColor = '#2a2a3d'
  let flowStroke = '#3b82f6'
  
  if (state === 'running' || state === 'walkthrough-forward' || state === 'walkthrough-backward') {
    strokeColor = '#1e293b'
    flowStroke = packetColor
  } else if (state === 'warning') {
    strokeColor = '#3f2e0a'
    flowStroke = '#f59e0b'
  } else if (state === 'error') {
    strokeColor = '#450a0a'
    flowStroke = '#ef4444'
  } else if (state === 'dead') {
    strokeColor = '#1f1f2e'
    flowStroke = 'transparent'
  }

  // Double speed for visual effect if high traffic, cap duration between 0.3s and 4s
  const duration = Math.max(0.3, Math.min(4, 2 / speed))

  return (
    <>
      {/* Background thicker edge for glowing aura */}
      {state !== 'idle' && state !== 'dead' && (
        <path
          d={edgePath}
          fill="none"
          stroke={flowStroke}
          strokeWidth={4}
          strokeOpacity={0.15}
          style={{ transition: 'stroke 0.3s' }}
        />
      )}

      {/* Standard structural line */}
      <path
        id={id}
        d={edgePath}
        fill="none"
        stroke={strokeColor}
        strokeWidth={2}
        style={{
          ...style,
          transition: 'stroke 0.3s, stroke-width 0.3s',
        }}
        markerEnd={markerEnd}
      />

      {/* Dynamic flowing packet dashes for continuous load */}
      {state === 'running' && (
        <path
          d={edgePath}
          fill="none"
          stroke={flowStroke}
          strokeWidth={2.5}
          strokeLinecap="round"
          style={{
            strokeDasharray: '6 14',
            animation: `flow-dash ${duration}s linear infinite`,
            pointerEvents: 'none',
            filter: `drop-shadow(0 0 3px ${flowStroke})`,
          }}
        />
      )}

      {/* Single packet animation for walkthrough forward */}
      {state === 'walkthrough-forward' && (
        <circle r="5" fill={flowStroke} style={{ filter: `drop-shadow(0 0 4px ${flowStroke})` }}>
          <animateMotion
            dur={`${duration}s`}
            repeatCount="1"
            fill="freeze"
            path={edgePath}
          />
        </circle>
      )}

      {/* Single packet animation for walkthrough backward */}
      {state === 'walkthrough-backward' && (
        <circle r="5" fill={flowStroke} style={{ filter: `drop-shadow(0 0 4px ${flowStroke})` }}>
          <animateMotion
            dur={`${duration}s`}
            repeatCount="1"
            fill="freeze"
            path={edgePath}
            keyPoints="1;0"
            keyTimes="0;1"
            calcMode="linear"
          />
        </circle>
      )}
      {/* Dynamic Edge Payload Text Badge */}
      {data.payload && (state === 'walkthrough-forward' || state === 'walkthrough-backward') && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className={`px-2.5 py-1 rounded-lg border text-[9px] font-bold font-mono shadow-2xl backdrop-blur-md whitespace-nowrap z-[999] animate-fade-in transition-all duration-300 ${
              state === 'walkthrough-forward'
                ? 'bg-[#12121a]/95 border-purple-500/50 text-[#c084fc] shadow-purple-900/10'
                : 'bg-[#12121a]/95 border-green-500/50 text-green-400 shadow-green-900/10'
            }`}
          >
            {data.payload}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}
