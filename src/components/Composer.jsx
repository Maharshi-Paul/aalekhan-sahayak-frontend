import { useEffect, useRef, useState } from 'react'
import useSpeech from '../hooks/useSpeech.js'
import { validateAttachment } from '../utils/image.js'

export const DEFAULT_ATTACHMENT_INSTRUCTION = 'इस संलग्न आवक पत्र का संज्ञान लेते हुए उपयुक्त शासकीय पत्र तैयार करें। केवल संलग्न पत्र में दिए गए तथ्य प्रयोग करें, कोई नियम या अधिनियम अपनी ओर से न जोड़ें, और जो जानकारी उपलब्ध न हो उसे [ ] में छोड़ दें।'

const templates = [
  {
    label: 'आधार-सहित शासकीय पत्र',
    text: 'इस संलग्न पत्र के आधार पर शासकीय पत्र तैयार करें। केवल संलग्न पत्र में दिए गए तथ्य प्रयोग करें, कोई नियम या अधिनियम अपनी ओर से न जोड़ें, और जो जानकारी उपलब्ध न हो उसे [ ] में छोड़ दें।',
  },
  {
    label: '7 दिन में स्पष्टीकरण',
    text: 'इस पत्र का संज्ञान लेते हुए 7 दिन में स्पष्टीकरण हेतु शासकीय पत्र तैयार करें। केवल संलग्न पत्र के तथ्य प्रयोग करें और कोई नियम अपनी ओर से न जोड़ें।',
  },
  {
    label: 'पत्रावली टिप्पण',
    text: 'संलग्न पत्र के आधार पर पत्रावली टिप्पण तैयार करें: तथ्य, प्रस्तावित कार्रवाई और अनुमोदन हेतु। कोई तथ्य अपनी ओर से न जोड़ें।',
  },
  {
    label: 'Office Memorandum',
    text: 'Draft an Office Memorandum based only on the attached letter. Do not add rules or facts that are not in it; leave unknown details in [ ].',
  },
]

function formatSize(bytes) {
  return bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function Composer({
  value,
  onValueChange,
  attachment,
  attachmentUrl,
  onAttachmentChange,
  isBusy,
  isEmpty,
  language,
  onSend,
  textareaRef,
  hint,
}) {
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)
  const [fileError, setFileError] = useState('')
  const speech = useSpeech(language, (text) => {
    onValueChange((current) => `${current}${current && !current.endsWith(' ') ? ' ' : ''}${text}`)
  })

  useEffect(() => {
    const textarea = textareaRef?.current
    if (!textarea) return
    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(textarea.scrollHeight, 112)}px`
  }, [value, textareaRef])

  useEffect(() => {
    if (hint) textareaRef?.current?.focus()
  }, [hint, textareaRef])

  function chooseFile(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    try {
      validateAttachment(file)
      setFileError('')
      onAttachmentChange(file)
    } catch (error) {
      setFileError(error.message)
    }
  }

  function onKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      if (!isBusy && (value.trim() || attachment)) onSend()
    }
  }

  function updateText(event) {
    onValueChange(event.target.value)
    event.target.style.height = 'auto'
    event.target.style.height = `${Math.min(event.target.scrollHeight, 112)}px`
  }

  const isImage = attachment?.type?.startsWith('image/')

  return (
    <div className="composer-wrap">
      {hint && <div className="composer-hint">{hint}</div>}
      {isEmpty && !value && !attachment && (
        <div className="template-list" aria-label="निर्देश टेम्पलेट">
          {templates.map((template) => (
            <button
              type="button"
              className="template-chip"
              key={template.label}
              onClick={() => {
                onValueChange(template.text)
                textareaRef?.current?.focus()
              }}
            >
              {template.label}
            </button>
          ))}
        </div>
      )}
      {attachment && (
        <div className="attachment-preview">
          {isImage && attachmentUrl
            ? <img src={attachmentUrl} alt="संलग्न छवि का पूर्वावलोकन" />
            : <span className="attachment-file-icon" aria-hidden="true">▧</span>}
          <span className="attachment-file-copy">
            <strong>{attachment.name}</strong>
            <small>{formatSize(attachment.size)}</small>
          </span>
          <button type="button" className="icon-button" onClick={() => onAttachmentChange(null)} aria-label="संलग्न फ़ाइल हटाएं">×</button>
        </div>
      )}
      {fileError && <p className="composer-error" role="alert">{fileError}</p>}
      <div className={`composer-box ${isBusy ? 'composer-busy' : ''}`}>
        <div className="composer-tools">
          <button type="button" className="icon-button composer-tool" onClick={() => fileInputRef.current?.click()} aria-label="फ़ाइल संलग्न करें" title="फ़ाइल संलग्न करें">
            <span aria-hidden="true">＋</span>
          </button>
          <button type="button" className="icon-button composer-tool" onClick={() => cameraInputRef.current?.click()} aria-label="कैमरे से पत्र लें" title="कैमरे से पत्र लें">
            <span aria-hidden="true">▣</span>
          </button>
          <input ref={fileInputRef} type="file" accept=".pdf,.png,.jpg,.jpeg,.webp" onChange={chooseFile} hidden />
          <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={chooseFile} hidden />
        </div>
        <div className="composer-textarea-wrap">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={updateText}
            onKeyDown={onKeyDown}
            placeholder="अपना निर्देश लिखें"
            rows={1}
            maxLength={4000}
            disabled={isBusy}
            aria-label="मसौदे के लिए निर्देश"
          />
          {speech.interimText && <div className="interim-caption" aria-live="polite">{speech.interimText}</div>}
        </div>
        <button
          type="button"
          className={`icon-button composer-tool mic-button ${speech.isListening ? 'is-listening' : ''}`}
          onClick={() => {
            if (!speech.isSupported) {
              setFileError('Voice input works in Chrome or Edge.')
              return
            }
            setFileError('')
            speech.toggle()
          }}
          aria-label={speech.isListening ? 'आवाज़ रिकॉर्ड करना रोकें' : 'आवाज़ से निर्देश लिखें'}
          title={speech.isSupported ? 'आवाज़ से निर्देश लिखें' : 'Voice input works in Chrome or Edge'}
          disabled={isBusy}
        >
          <span aria-hidden="true">●</span>
        </button>
        <button
          type="button"
          className="button button-primary send-button"
          onClick={onSend}
          disabled={isBusy || (!value.trim() && !attachment)}
          aria-label="निर्देश भेजें"
        >
          <span>भेजें</span><span aria-hidden="true">➤</span>
        </button>
      </div>
      <div className="composer-caption">
        <span>{speech.isListening ? 'सुन रहा है…' : 'Enter से भेजें · Shift + Enter से नई पंक्ति'}</span>
        {isBusy && <span>मसौदा तैयार हो रहा है…</span>}
      </div>
    </div>
  )
}
