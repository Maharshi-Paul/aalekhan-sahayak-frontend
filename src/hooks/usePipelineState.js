import { createContext, createElement, useContext, useMemo, useState } from 'react'

const PipelineContext = createContext(null)

export function PipelineProvider({ children }) {
  const [pipeline, setPipeline] = useState({
    isRunning: false,
    activeStepIndex: 0,
    hasDocument: false,
  })

  const value = useMemo(() => ({
    ...pipeline,
    start(hasDocument) {
      setPipeline({
        isRunning: true,
        activeStepIndex: hasDocument ? 0 : 1,
        hasDocument,
      })
    },
    advance() {
      setPipeline((current) => ({
        ...current,
        activeStepIndex: Math.min(3, current.activeStepIndex + 1),
      }))
    },
    stop() {
      setPipeline((current) => ({ ...current, isRunning: false }))
    },
  }), [pipeline])

  return createElement(PipelineContext.Provider, { value }, children)
}

export default function usePipelineState() {
  const value = useContext(PipelineContext)
  if (!value) throw new Error('usePipelineState must be used within PipelineProvider.')
  return value
}
