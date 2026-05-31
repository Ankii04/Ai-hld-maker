import { useEffect } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  BackgroundVariant,
  Handle,
  Position,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { Database, HardDrive, Layers, GitBranch, Download } from 'lucide-react'
import { generateSQLSchema } from '../../utils/exportPDF'
import dagre from 'dagre'

/* ─── ER Table Node ─────────────────────────────────────────────────────── */
function TableNode({ data, selected }) {
  return (
    <div
      className="rounded-xl overflow-hidden min-w-[200px] max-w-[280px] transition-all duration-200"
      style={{
        background: '#0d1a12',
        border: `1.5px solid ${selected ? '#16a34a' : '#166534'}`,
        boxShadow: selected
          ? '0 0 0 2px #16a34a30, 0 8px 32px #16a34a22'
          : '0 4px 24px rgba(0,0,0,0.5)',
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#16a34a', border: '2px solid #0d1a12', width: 9, height: 9 }}
      />

      {/* Table header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-[#14532d] border-b border-[#166534]">
        <Database size={13} className="text-[#4ade80] flex-shrink-0" />
        <span className="text-[#f1f5f9] text-xs font-bold truncate">{data?.label}</span>
      </div>

      {/* Columns */}
      <div className="divide-y divide-[#1a2e1e]">
        {data?.columns?.map((col, i) => (
          <div key={i} className="flex items-center justify-between gap-2 px-3 py-1.5">
            <div className="flex items-center gap-1.5 min-w-0">
              {col.isPrimary && (
                <span className="text-[8px] font-bold text-[#fbbf24] leading-none">PK</span>
              )}
              {col.isForeign && (
                <span className="text-[8px] font-bold text-[#60a5fa] leading-none">FK</span>
              )}
              <span className="text-[#e2e8f0] text-[11px] font-mono truncate">{col.name}</span>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="text-[10px] text-[#94a3b8] font-mono">{col.type}</span>
              {col.constraints?.includes('NOT NULL') && (
                <span className="text-[8px] text-[#f87171]">NN</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#16a34a', border: '2px solid #0d1a12', width: 9, height: 9 }}
      />
    </div>
  )
}

const erNodeTypes = { table: TableNode }

function buildERGraph(tables = []) {
  const nodes = []
  const edges = []

  tables.forEach((table) => {
    nodes.push({
      id: table.name,
      type: 'table',
      position: { x: 0, y: 0 },
      data: {
        label: table.name,
        columns: table.columns || [],
      },
    })
    
    table.relations?.forEach((rel) => {
      if (rel.target) {
        edges.push({
          id: `${table.name}-${rel.target}`,
          source: table.name,
          target: rel.target,
          type: 'smoothstep',
          label: rel.type || '1:N',
          animated: false,
          markerEnd: { type: MarkerType.ArrowClosed, color: '#16a34a' },
          style: { stroke: '#16a34a66', strokeWidth: 1.5 },
          labelStyle: { fill: '#4ade80', fontSize: 10, fontFamily: 'monospace', fontWeight: 'bold' },
          labelBgStyle: { fill: '#0d1a12', fillOpacity: 0.9 },
          labelBgPadding: [4, 6],
        })
      }
    })
  })

  // Apply Dagre Layout to calculate position coordinates
  const dagreGraph = new dagre.graphlib.Graph()
  dagreGraph.setDefaultEdgeLabel(() => ({}))
  dagreGraph.setGraph({ rankdir: 'LR', nodesep: 120, ranksep: 180 })

  nodes.forEach((node) => {
    const colCount = node.data.columns?.length || 1
    const height = 40 + colCount * 26
    dagreGraph.setNode(node.id, { width: 240, height })
  })

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target)
  })

  dagre.layout(dagreGraph)

  nodes.forEach((node) => {
    const pos = dagreGraph.node(node.id)
    const colCount = node.data.columns?.length || 1
    const height = 40 + colCount * 26
    node.position = {
      x: pos.x - 120,
      y: pos.y - height / 2,
    }
  })

  return { nodes, edges }
}

/* ─── Info Card ─────────────────────────────────────────────────────────── */
function InfoCard({ icon: Icon, iconColor, title, children }) {
  return (
    <div className="bg-[#12121a] border border-[#2a2a3d] rounded-xl p-4">
      <div className="flex items-center gap-2.5 mb-2">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${iconColor}20` }}
        >
          <Icon size={13} style={{ color: iconColor }} />
        </div>
        <h4 className="text-sm font-semibold text-[#f1f5f9]">{title}</h4>
      </div>
      {children}
    </div>
  )
}

/* ─── DatabaseTab ────────────────────────────────────────────────────────── */
export default function DatabaseTab({ design }) {
  const db = design?.database || {}
  const tables = db.tables || []
  const { nodes, edges } = buildERGraph(tables)
  const [rfNodes, setRfNodes, onNodesChange] = useNodesState(nodes)
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState(edges)

  useEffect(() => {
    const { nodes: n, edges: e } = buildERGraph(tables)
    setRfNodes(n)
    setRfEdges(e)
  }, [JSON.stringify(tables)])

  const handleDownloadSQL = () => {
    const sql = generateSQLSchema(design)
    if (!sql) return
    const blob = new Blob([sql], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${design?.title || 'database'}-schema.sql`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!design) {
    return (
      <div className="flex items-center justify-center h-64 text-[#4a4a6a] text-sm p-6">
        Generate a design to see database schema
      </div>
    )
  }

  return (
    <div id="database-tab" className="flex flex-col gap-6 p-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-[#f1f5f9]">Database Schema & DDL</h2>
          <p className="text-xs text-[#94a3b8] mt-0.5">
            {tables.length} tables defined for {db.type || 'PostgreSQL'}
          </p>
        </div>
        <button
          onClick={handleDownloadSQL}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-[#1a1a28] border border-[#2a2a3d] text-[#94a3b8] hover:border-[#16a34a]/60 hover:text-[#4ade80] hover:bg-[#16a34a]/10 transition-all duration-200"
        >
          <Download size={14} />
          Download SQL DDL
        </button>
      </div>
      {/* ER Diagram */}
      <div
        className="rounded-2xl overflow-hidden border border-[#2a2a3d] bg-[#0a0a0f] relative"
        style={{ height: 480 }}
      >
        <div className="absolute top-3 left-3 z-10">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#16a34a]/20 text-[#4ade80] border border-[#16a34a]/30">
            Entity Relationship Diagram
          </span>
        </div>
        {tables.length > 0 ? (
          <ReactFlow
            nodes={rfNodes}
            edges={rfEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={erNodeTypes}
            colorMode="dark"
            minZoom={0.05}
            maxZoom={4}
            fitView
            fitViewOptions={{ padding: 0.3 }}
            nodesDraggable
            nodesConnectable={false}
            proOptions={{ hideAttribution: true }}
            style={{ background: '#0a0a0f' }}
          >
            <Background variant={BackgroundVariant.Dots} color="#1e1e2e" gap={20} size={1} />
            <Controls
              style={{ background: '#12121a', border: '1px solid #2a2a3d', borderRadius: 8 }}
              showInteractive={false}
            />
            <MiniMap
              style={{ background: '#12121a', border: '1px solid #2a2a3d', borderRadius: 8 }}
              nodeColor="#16a34a"
              maskColor="rgba(10,10,15,0.7)"
            />
          </ReactFlow>
        ) : (
          <div className="flex items-center justify-center h-full text-[#4a4a6a] text-sm">
            No table definitions available
          </div>
        )}
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InfoCard icon={Database} iconColor="#4ade80" title="Database">
          <p className="text-sm text-[#94a3b8] leading-relaxed">
            <span className="text-[#f1f5f9] font-medium">{db.type || 'PostgreSQL'}</span>
          </p>
          {db.rationale && (
            <p className="text-xs text-[#94a3b8] mt-1.5 leading-relaxed">{db.rationale}</p>
          )}
        </InfoCard>

        <InfoCard icon={HardDrive} iconColor="#f59e0b" title="Caching Strategy">
          <p className="text-xs text-[#94a3b8] leading-relaxed">
            {typeof db.cachingStrategy === 'string' ? db.cachingStrategy : (
              <>
                <span className="text-sm text-[#f1f5f9] font-medium block mb-1">{db.cachingStrategy?.type || 'Redis'}</span>
                {db.cachingStrategy?.description}
              </>
            )}
          </p>
        </InfoCard>

        <InfoCard icon={Layers} iconColor="#a855f7" title="Sharding Strategy">
          <p className="text-xs text-[#94a3b8] leading-relaxed">
            {typeof db.shardingStrategy === 'string' ? db.shardingStrategy : (
              <>
                <span className="text-sm text-[#f1f5f9] font-medium block mb-1">{db.shardingStrategy?.type || 'Hash-based'}</span>
                {db.shardingStrategy?.description}
              </>
            )}
          </p>
        </InfoCard>
      </div>

      {/* Database Scaling Strategy */}
      {db.scalingStrategy && (
        <div className="bg-[#12121a] border border-[#2a2a3d] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Layers size={15} className="text-[#ec4899]" />
            <h3 className="text-sm font-semibold text-[#f1f5f9]">Replication & Scaling Strategy</h3>
          </div>
          <p className="text-xs text-[#94a3b8] leading-relaxed">{db.scalingStrategy}</p>
        </div>
      )}

      {/* Indexing Recommendations */}
      {db.indexingRecommendations?.length > 0 && (
        <div className="bg-[#12121a] border border-[#2a2a3d] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <GitBranch size={15} className="text-[#06b6d4]" />
            <h3 className="text-sm font-semibold text-[#f1f5f9]">Indexing Recommendations</h3>
          </div>
          <div className="space-y-2">
            {db.indexingRecommendations.map((rec, i) => (
              <div
                key={i}
                className="flex items-start gap-3 bg-[#1a1a28] border border-[#2a2a3d] rounded-lg px-4 py-3"
              >
                <div className="w-5 h-5 rounded-full bg-[#06b6d4]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[9px] font-bold text-[#06b6d4]">{i + 1}</span>
                </div>
                <p className="text-sm text-[#94a3b8] leading-relaxed">
                  <code className="text-[#e2e8f0] font-mono">{rec}</code>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
