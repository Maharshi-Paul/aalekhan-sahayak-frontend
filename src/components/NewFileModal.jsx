import { useEffect, useRef, useState } from 'react'

export default function NewFileModal({ isOpen, onClose, onCreate }) {
  const [fileNumber, setFileNumber] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      setFileNumber('')
      window.setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return undefined
    function onKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  function submit(event) {
    event.preventDefault()
    if (!fileNumber.trim()) return
    onCreate(fileNumber)
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose()
    }}>
      <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="new-file-title">
        <button className="modal-close icon-button" onClick={onClose} aria-label="बंद करें">×</button>
        <span className="modal-icon" aria-hidden="true">▤</span>
        <h2 id="new-file-title">नई पत्रावली</h2>
        <p>इस मसौदे के लिए फ़ाइल नंबर दर्ज करें।</p>
        <form onSubmit={submit}>
          <label htmlFor="file-number">फ़ाइल नंबर <span aria-hidden="true">*</span></label>
          <input
            ref={inputRef}
            id="file-number"
            value={fileNumber}
            onChange={(event) => setFileNumber(event.target.value)}
            placeholder="पत्रावली सं. __/2026/प्रशासन"
            required
          />
          <div className="modal-actions">
            <button type="button" className="button button-outline" onClick={onClose}>रद्द करें</button>
            <button type="submit" className="button button-primary" disabled={!fileNumber.trim()}>पत्रावली बनाएं</button>
          </div>
        </form>
      </section>
    </div>
  )
}
