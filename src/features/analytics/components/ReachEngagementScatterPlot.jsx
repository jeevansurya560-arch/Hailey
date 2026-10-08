import { useState } from 'react'
import { Info, HelpCircle } from 'lucide-react'

/**
 * Interactive SVG Scatter Plot mapping Content Reach (X) vs. Engagement Rate % (Y).
 * Conforms strictly to Requirement 27 (no fake data, displays 'Not enough data' if empty).
 */
export function ReachEngagementScatterPlot({ points = [], empty = false, emptyReason }) {
  const [hoveredPoint, setHoveredPoint] = useState(null)

  if (empty || !points || points.length === 0) {
    return (
      <div className="border border-[var(--line)] bg-[var(--paper-2)] p-12 text-center rounded space-y-2">
        <Info className="h-6 w-6 text-[var(--ink-2)] mx-auto" />
        <h3 className="font-serif text-lg font-bold text-[var(--ink)]">Not enough data</h3>
        <p className="text-xs text-[var(--ink-2)] max-w-sm mx-auto">
          {emptyReason || 'This creator has not published enough cultural posts to compute statistical reach and engagement distribution.'}
        </p>
      </div>
    )
  }

  // Calculate domain bounds
  const maxReach = Math.max(...points.map((p) => p.reach), 10)
  const maxEngagement = Math.max(...points.map((p) => p.engagementRate), 15)

  // Chart Dimensions
  const width = 600
  const height = 300
  const padding = 50

  const scaleX = (val) => padding + (val / maxReach) * (width - padding * 2)
  const scaleY = (val) => height - padding - (val / maxEngagement) * (height - padding * 2)

  return (
    <div className="border border-[var(--ink)] bg-[var(--paper)] p-6 shadow-[var(--shadow-hard)] space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="font-mono text-[10px] text-[var(--clay)] uppercase font-bold tracking-widest">
            Creator Statistical Analysis
          </span>
          <h3 className="font-serif text-xl font-bold text-[var(--ink)]">
            Reach vs. Engagement Rate Distribution
          </h3>
        </div>
        <div className="flex items-center gap-1 text-[11px] font-mono text-[var(--ink-2)]">
          <HelpCircle className="h-3.5 w-3.5" />
          <span>Each node represents 1 verified dispatch</span>
        </div>
      </div>

      <div className="relative overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto bg-[var(--paper-2)] border border-[var(--line)] rounded"
        >
          {/* Grid lines */}
          <line
            x1={padding}
            y1={scaleY(0)}
            x2={width - padding}
            y2={scaleY(0)}
            stroke="var(--line)"
            strokeWidth="1.5"
          />
          <line
            x1={padding}
            y1={padding}
            x2={padding}
            y2={height - padding}
            stroke="var(--line)"
            strokeWidth="1.5"
          />

          {/* Y Axis Labels */}
          <text
            x={padding - 10}
            y={scaleY(maxEngagement)}
            textAnchor="end"
            fontSize="10"
            fill="var(--ink-2)"
            fontFamily="monospace"
          >
            {maxEngagement.toFixed(0)}%
          </text>
          <text
            x={padding - 10}
            y={scaleY(maxEngagement / 2)}
            textAnchor="end"
            fontSize="10"
            fill="var(--ink-2)"
            fontFamily="monospace"
          >
            {(maxEngagement / 2).toFixed(0)}%
          </text>
          <text
            x={padding - 10}
            y={scaleY(0)}
            textAnchor="end"
            fontSize="10"
            fill="var(--ink-2)"
            fontFamily="monospace"
          >
            0%
          </text>

          {/* X Axis Labels */}
          <text
            x={padding}
            y={height - padding + 18}
            textAnchor="middle"
            fontSize="10"
            fill="var(--ink-2)"
            fontFamily="monospace"
          >
            0
          </text>
          <text
            x={scaleX(maxReach / 2)}
            y={height - padding + 18}
            textAnchor="middle"
            fontSize="10"
            fill="var(--ink-2)"
            fontFamily="monospace"
          >
            {Math.round(maxReach / 2)}
          </text>
          <text
            x={width - padding}
            y={height - padding + 18}
            textAnchor="middle"
            fontSize="10"
            fill="var(--ink-2)"
            fontFamily="monospace"
          >
            {maxReach} Reach
          </text>

          {/* Data Points */}
          {points.map((pt) => {
            const cx = scaleX(pt.reach)
            const cy = scaleY(pt.engagementRate)
            const isHovered = hoveredPoint?.id === pt.id

            return (
              <g key={pt.id}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 7 : 4.5}
                  fill={isHovered ? 'var(--clay)' : 'var(--indigo)'}
                  stroke="var(--paper)"
                  strokeWidth="1.5"
                  className="cursor-pointer transition-all duration-150"
                  onMouseEnter={() => setHoveredPoint(pt)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              </g>
            )
          })}
        </svg>

        {/* Hover Tooltip */}
        {hoveredPoint && (
          <div className="mt-3 border border-[var(--ink)] bg-[var(--paper)] p-3 rounded shadow-[2px_2px_0_var(--ink)] font-mono text-xs text-[var(--ink)] max-w-sm">
            <span className="font-bold text-[var(--clay)] block">"{hoveredPoint.title}"</span>
            <div className="flex items-center justify-between gap-4 mt-1 text-[11px] text-[var(--ink-2)]">
              <span>Reach: <strong className="text-[var(--ink)]">{hoveredPoint.reach}</strong></span>
              <span>Engagements: <strong className="text-[var(--ink)]">{hoveredPoint.engagements}</strong></span>
              <span>Rate: <strong className="text-emerald-700">{hoveredPoint.engagementRate}%</strong></span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ReachEngagementScatterPlot
