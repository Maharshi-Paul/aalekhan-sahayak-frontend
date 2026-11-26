const agents = [
  { hi: 'संदर्भ', en: 'Sandarbh' },
  { hi: 'प्रबंधक', en: 'Prabandhak' },
  { hi: 'लेखन', en: 'Lekhan' },
  { hi: 'समीक्षा', en: 'Samiksha' },
]

export default function AgentProgress({ activeStepIndex, hasDocument }) {
  return (
    <div className="agent-progress" aria-label="मसौदा तैयार करने की प्रगति" aria-live="polite">
      <p className="progress-heading">मसौदा तैयार किया जा रहा है</p>
      <ol className="progress-steps">
        {agents.map((agent, index) => {
          const skipped = !hasDocument && index === 0
          const done = !skipped && index < activeStepIndex
          const active = !skipped && index === activeStepIndex
          return (
            <li
              className={`progress-step ${done ? 'step-done' : ''} ${active ? 'step-active' : ''} ${skipped ? 'step-skipped' : ''}`}
              key={agent.en}
            >
              <span className="step-indicator" aria-hidden="true">
                {skipped ? '–' : done ? '✓' : active ? '●' : String(index + 1)}
              </span>
              <span className="step-label">
                <strong>{skipped ? 'Skipped (no document)' : active && index === 0 ? 'Reading attached document…' : `${agent.en} (${agent.hi})`}</strong>
                {!skipped && <small>{agent.en}</small>}
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
