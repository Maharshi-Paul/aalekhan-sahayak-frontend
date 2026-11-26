import { useEffect, useState } from 'react'
import usePipelineState from '../hooks/usePipelineState.js'

const agentNames = ['Sandarbh', 'Prabandhak', 'Lekhan', 'Samiksha']
const agentHindi = ['संदर्भ', 'प्रबंधक', 'लेखन', 'समीक्षा']
const agentDetails = ['Textract + Bedrock Vision', 'Format selection', 'Amazon Bedrock', 'Amazon Bedrock']
const agentXs = [632, 750, 868, 986]

export default function ArchitectureDiagram({ compact = false }) {
  const { isRunning, activeStepIndex, hasDocument } = usePipelineState()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (isRunning) setIsOpen(true)
  }, [isRunning])
  const diagram = (
    <div className={`architecture-scroll ${compact ? 'architecture-compact' : ''}`}>
      <svg viewBox="0 0 1120 390" role="img" aria-label="Officer से frontend और provided backend के चार agent तक architecture diagram">
        <defs>
          <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L7,3 z" fill="#75858d" />
          </marker>
        </defs>
        <text x="20" y="32" className="arch-label">Officer</text>
        <rect x="20" y="48" width="130" height="82" rx="14" className="arch-node arch-officer" />
        <text x="85" y="86" textAnchor="middle" className="arch-node-title">अधिकारी</text>
        <text x="85" y="108" textAnchor="middle" className="arch-node-subtitle">Officer</text>

        <line x1="150" y1="89" x2="202" y2="89" className="arch-arrow" />
        <rect x="202" y="40" width="200" height="100" rx="14" className="arch-node arch-frontend" />
        <rect x="216" y="52" width="112" height="20" rx="10" className="arch-tag arch-our-tag" />
        <text x="272" y="66" textAnchor="middle" className="arch-tag-text">OUR FRONTEND</text>
        <text x="302" y="96" textAnchor="middle" className="arch-node-title">React app</text>
        <text x="302" y="119" textAnchor="middle" className="arch-node-subtitle">AWS Amplify</text>

        <line x1="402" y1="89" x2="452" y2="89" className="arch-arrow" />
        <rect x="438" y="28" width="666" height="270" rx="18" className="arch-backend-boundary" />
        <rect x="456" y="40" width="260" height="22" rx="11" className="arch-tag arch-provided-tag" />
        <text x="586" y="55" textAnchor="middle" className="arch-tag-text">PROVIDED BACKEND (ORGANIZER)</text>
        <rect x="456" y="97" width="144" height="88" rx="12" className="arch-node arch-lambda" />
        <text x="528" y="131" textAnchor="middle" className="arch-node-title">Lambda</text>
        <text x="528" y="153" textAnchor="middle" className="arch-node-subtitle">Function URL</text>
        <line x1="600" y1="141" x2="624" y2="141" className="arch-arrow" />
        {agentNames.map((name, index) => {
          const x = agentXs[index]
          const active = isRunning && index === activeStepIndex
          const done = isRunning && index < activeStepIndex && (hasDocument || index > 0)
          const skipped = isRunning && !hasDocument && index === 0
          const className = active ? 'arch-agent arch-agent-active' : done ? 'arch-agent arch-agent-done' : skipped ? 'arch-agent arch-agent-skipped' : 'arch-agent'
          return (
            <g key={name}>
              {index > 0 && <line x1={agentXs[index - 1] + 106} y1="141" x2={x - 6} y2="141" className="arch-arrow" />}
              <rect x={x} y="97" width="106" height="88" rx="12" className={`arch-node ${className}`} />
              <text x={x + 53} y="132" textAnchor="middle" className="arch-node-title">{name}</text>
              <text x={x + 53} y="155" textAnchor="middle" className="arch-node-subtitle">{agentHindi[index]}</text>
              <text x={x + 53} y="173" textAnchor="middle" className="arch-node-detail">{agentDetails[index]}</text>
            </g>
          )
        })}
        <path d="M780 185 L780 225 L700 225 L700 246" className="arch-attachment-line" />
        <path d="M890 185 L890 225 L930 225 L930 246" className="arch-attachment-line" />
        <rect x="650" y="246" width="112" height="38" rx="10" className="arch-storage-node" />
        <text x="706" y="262" textAnchor="middle" className="arch-storage-text">S3</text>
        <text x="706" y="276" textAnchor="middle" className="arch-storage-detail">Document vault</text>
        <rect x="874" y="246" width="112" height="38" rx="10" className="arch-storage-node" />
        <text x="930" y="262" textAnchor="middle" className="arch-storage-text">DynamoDB</text>
        <text x="930" y="276" textAnchor="middle" className="arch-storage-detail">Case memory</text>
        <text x="20" y="180" className="arch-footnote">Neutral architecture view · no AWS logos</text>
      </svg>
    </div>
  )

  if (compact) {
    return (
      <details
        className="architecture-strip"
        open={isOpen}
        onToggle={(event) => setIsOpen(event.currentTarget.open)}
      >
        <summary>Architecture live · कैसे काम करता है</summary>
        {diagram}
      </details>
    )
  }
  return diagram
}
