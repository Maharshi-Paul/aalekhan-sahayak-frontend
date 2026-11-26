import { useEffect, useMemo, useRef, useState } from 'react'
import {
  getConsecutiveFailures,
  isDemoMode,
  listThreads,
  processDraft,
  switchToDemoMode,
} from './api/client.js'
import ArchitectureDiagram from './components/ArchitectureDiagram.jsx'
import ChatHeader from './components/ChatHeader.jsx'
import Composer, { DEFAULT_ATTACHMENT_INSTRUCTION } from './components/Composer.jsx'
import DiffView from './components/DiffView.jsx'
import FactsDrawer from './components/FactsDrawer.jsx'
import MessageList from './components/MessageList.jsx'
import NewFileModal from './components/NewFileModal.jsx'
import Sidebar from './components/Sidebar.jsx'
import SplitView from './components/SplitView.jsx'
import Toast from './components/Toast.jsx'
import Welcome from './components/Welcome.jsx'
import usePipelineState, { PipelineProvider } from './hooks/usePipelineState.js'
import { downloadWord, printDraft } from './utils/export.js'
import { encodeAttachment, validateAttachment } from './utils/image.js'

function threadKey(thread) {
  return thread.key || thread.thread_id || `local-${Date.now()}`
}

function normalizeThread(thread) {
  return {
    ...thread,
    key: threadKey(thread),
    messages: Array.isArray(thread.messages) ? thread.messages : [],
    extracted_facts: thread.extracted_facts || {},
  }
}

function localKey() {
  return globalThis.crypto?.randomUUID?.() || `local-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

const EMPTY_COMPOSER = { text: '', attachment: null, attachmentUrl: '' }

function AppContent() {
  const pipeline = usePipelineState()
  const [threads, setThreads] = useState([])
  const [selectedKey, setSelectedKey] = useState(null)
  const [isLoadingThreads, setIsLoadingThreads] = useState(true)
  const [threadError, setThreadError] = useState('')
  const [isNewFileOpen, setIsNewFileOpen] = useState(false)
  const [mobileView, setMobileView] = useState('welcome')
  const [language, setLanguage] = useState('Hindi')
  const [composerDrafts, setComposerDrafts] = useState({})
  const [isSending, setIsSending] = useState(false)
  const [requestError, setRequestError] = useState('')
  const [pendingRequest, setPendingRequest] = useState(null)
  const [composerHint, setComposerHint] = useState('')
  const [isFactsOpen, setIsFactsOpen] = useState(false)
  const [isArchitectureOpen, setIsArchitectureOpen] = useState(false)
  const [presentationMode, setPresentationMode] = useState(false)
  const [splitView, setSplitView] = useState(null)
  const [diffPair, setDiffPair] = useState(null)
  const [toast, setToast] = useState(null)
  const [sessionDurations, setSessionDurations] = useState([])
  const [showDemoOffer, setShowDemoOffer] = useState(false)
  const [busyThreadKey, setBusyThreadKey] = useState(null)
  const busyRef = useRef(false)
  const initialLoadStartedRef = useRef(false)
  const textareaRef = useRef(null)
  const objectUrlsRef = useRef(new Set())

  const selectedThread = useMemo(
    () => threads.find((thread) => thread.key === selectedKey) || null,
    [threads, selectedKey],
  )
  const activeComposer = selectedKey ? composerDrafts[selectedKey] || EMPTY_COMPOSER : EMPTY_COMPOSER
  const stats = useMemo(() => {
    const manualMinutes = Number(import.meta.env.VITE_MANUAL_MINUTES)
    const manualTime = Number.isFinite(manualMinutes) && manualMinutes > 0 ? manualMinutes : 30
    const elapsedSeconds = sessionDurations.reduce((total, seconds) => total + seconds, 0)
    const drafts = sessionDurations.length
    return {
      drafts,
      averageSeconds: drafts ? elapsedSeconds / drafts : 0,
      savedMinutes: drafts * manualTime - elapsedSeconds / 60,
    }
  }, [sessionDurations])

  function notify(message, tone = 'success') {
    setToast({ message, tone, id: localKey() })
  }

  async function loadThreads() {
    setIsLoadingThreads(true)
    setThreadError('')
    try {
      const response = await listThreads()
      const nextThreads = response.threads
        .map(normalizeThread)
        .sort((a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0))
      setThreads((current) => {
        const remoteIds = new Set(nextThreads.map((thread) => thread.thread_id))
        const retained = current.filter((thread) => !thread.thread_id || !remoteIds.has(thread.thread_id))
        const merged = nextThreads.map((thread) => {
          const existing = current.find((item) => item.thread_id === thread.thread_id)
          return existing ? { ...thread, ...existing, key: existing.key } : thread
        })
        return [...retained, ...merged].sort((a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0))
      })
      setShowDemoOffer(false)
    } catch (error) {
      setThreadError(error?.message || 'पत्रावलियाँ लोड नहीं हो सकीं।')
      if (!isDemoMode() && getConsecutiveFailures() >= 2) setShowDemoOffer(true)
    } finally {
      setIsLoadingThreads(false)
    }
  }

  useEffect(() => {
    if (initialLoadStartedRef.current) return
    initialLoadStartedRef.current = true
    loadThreads()
  }, [])

  useEffect(() => () => {
    objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url))
  }, [])

  function updateDraftText(nextValue) {
    if (!selectedKey) return
    setComposerDrafts((current) => {
      const previous = current[selectedKey] || EMPTY_COMPOSER
      const text = typeof nextValue === 'function' ? nextValue(previous.text) : nextValue
      return { ...current, [selectedKey]: { ...previous, text } }
    })
  }

  function changeAttachment(file) {
    if (!selectedKey) return
    const previous = composerDrafts[selectedKey] || EMPTY_COMPOSER
    if (previous.attachmentUrl && previous.attachment) {
      URL.revokeObjectURL(previous.attachmentUrl)
      objectUrlsRef.current.delete(previous.attachmentUrl)
    }
    if (!file) {
      setComposerDrafts((current) => ({
        ...current,
        [selectedKey]: { ...(current[selectedKey] || EMPTY_COMPOSER), attachment: null, attachmentUrl: '' },
      }))
      return
    }
    const url = URL.createObjectURL(file)
    objectUrlsRef.current.add(url)
    setComposerDrafts((current) => ({
      ...current,
      [selectedKey]: { ...(current[selectedKey] || EMPTY_COMPOSER), attachment: file, attachmentUrl: url },
    }))
  }

  function clearSentComposer(key) {
    setComposerDrafts((current) => ({ ...current, [key]: EMPTY_COMPOSER }))
  }

  async function sendMessage(retryRequest = null, options = {}) {
    const targetThread = options.thread
      || (retryRequest ? threads.find((thread) => thread.key === retryRequest.key) : selectedThread)
    if (busyRef.current || !targetThread) return
    let pending = retryRequest
    if (!pending) {
      const targetComposer = composerDrafts[targetThread.key] || EMPTY_COMPOSER
      const selectedAttachment = Object.prototype.hasOwnProperty.call(options, 'attachment')
        ? options.attachment
        : targetComposer.attachment
      const selectedAttachmentUrl = options.attachmentUrl
        || (selectedAttachment === targetComposer.attachment ? targetComposer.attachmentUrl : '')
      const text = options.text?.trim()
        || targetComposer.text.trim()
        || (selectedAttachment ? DEFAULT_ATTACHMENT_INSTRUCTION : '')
      if (!text) return
      const userMessage = {
        role: 'user',
        text,
        timestamp: new Date().toISOString(),
        attachment_name: selectedAttachment?.name || '',
        source_url: selectedAttachmentUrl,
        source_type: selectedAttachment?.type || '',
      }
      pending = {
        key: targetThread.key,
        thread_id: targetThread.thread_id || null,
        file_number: targetThread.file_number,
        user_message: text,
        language,
        attachment: selectedAttachment,
        source_url: selectedAttachmentUrl,
        source_type: selectedAttachment?.type || '',
        user_message_id: localKey(),
        clearComposer: !options.preserveComposer,
      }
      setThreads((current) => current.map((thread) => (
        thread.key === targetThread.key
          ? { ...thread, messages: [...thread.messages, { ...userMessage, id: pending.user_message_id }] }
          : thread
      )))
    }

    busyRef.current = true
    setIsSending(true)
    setBusyThreadKey(pending.key)
    setRequestError('')
    setPendingRequest(pending)
    pipeline.start(Boolean(pending.attachment))
    const pipelineTimer = window.setInterval(() => pipeline.advance(), 2500)
    try {
      const filePayload = pending.attachment ? await encodeAttachment(pending.attachment) : {}
      const request = {
        thread_id: pending.thread_id,
        file_number: pending.file_number,
        user_message: pending.user_message,
        language: pending.language,
        ...filePayload,
      }
      const startedAt = performance.now()
      const response = await processDraft(request)
      const durationSeconds = Number(((performance.now() - startedAt) / 1000).toFixed(1))
      const timestamp = new Date().toISOString()
      const assistantMessage = {
        role: 'assistant',
        ...response,
        timestamp,
        duration_seconds: durationSeconds,
      }
      setThreads((current) => current
        .map((thread) => thread.key === pending.key
          ? {
            ...thread,
            thread_id: response.thread_id || thread.thread_id,
            file_number: response.file_number || thread.file_number,
            subject: response.subject || thread.subject,
            extracted_facts: response.extracted_facts || {},
            messages: [...thread.messages, assistantMessage],
            updated_at: timestamp,
          }
          : thread)
        .sort((a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0)))
      setSessionDurations((current) => [...current, durationSeconds])
      setShowDemoOffer(false)
      if (pending.clearComposer) {
        clearSentComposer(pending.key)
        setComposerHint('')
      }
      setPendingRequest(null)
    } catch (error) {
      setRequestError(error?.message || 'मसौदा तैयार नहीं हो सका। कृपया पुनः प्रयास करें।')
      if (!isDemoMode() && getConsecutiveFailures() >= 2) setShowDemoOffer(true)
    } finally {
      window.clearInterval(pipelineTimer)
      pipeline.stop()
      busyRef.current = false
      setIsSending(false)
      setBusyThreadKey(null)
    }
  }

  function createThread(fileNumber) {
    const thread = {
      key: localKey(),
      thread_id: null,
      file_number: fileNumber.trim(),
      subject: 'नई पत्रावली',
      messages: [],
      extracted_facts: {},
      updated_at: new Date().toISOString(),
    }
    setThreads((current) => [thread, ...current])
    setSelectedKey(thread.key)
    setMobileView('chat')
    setIsNewFileOpen(false)
  }

  function selectThread(thread) {
    setSelectedKey(thread.key)
    setMobileView('chat')
  }

  function openSourceView(draftMessage) {
    if (!selectedThread) return
    const draftIndex = selectedThread.messages.indexOf(draftMessage)
    const sourceMessage = selectedThread.messages
      .slice(0, draftIndex)
      .reverse()
      .find((message) => message.role === 'user' && message.source_url)
    if (!sourceMessage) {
      notify('इस मसौदे के लिए संलग्न स्रोत उपलब्ध नहीं है।', 'error')
      return
    }
    setSplitView({ sourceMessage, draftMessage })
  }

  function compareDraft(draftMessage) {
    if (!selectedThread) return
    const index = selectedThread.messages.indexOf(draftMessage)
    const previous = selectedThread.messages.slice(0, index).reverse()
      .find((message) => message.role === 'assistant' && message.draft_content)
    if (previous) setDiffPair({ previous, current: draftMessage })
  }

  async function trySample() {
    try {
      const response = await fetch('/sample/incoming_letter.pdf')
      if (!response.ok) throw new Error('नमूना पत्र अभी उपलब्ध नहीं है। टीम द्वारा public/sample/incoming_letter.pdf जोड़ने के बाद पुनः प्रयास करें।')
      const blob = await response.blob()
      const contentType = response.headers.get('content-type') || ''
      if (contentType.includes('text/html') || await blob.slice(0, 5).text() !== '%PDF-') {
        throw new Error('नमूना पत्र अभी उपलब्ध नहीं है। टीम द्वारा public/sample/incoming_letter.pdf जोड़ने के बाद पुनः प्रयास करें।')
      }
      const file = new File([blob], 'incoming_letter.pdf', { type: 'application/pdf' })
      validateAttachment(file)
      const sourceUrl = URL.createObjectURL(file)
      objectUrlsRef.current.add(sourceUrl)
      const thread = {
        key: localKey(),
        thread_id: null,
        file_number: 'पत्रावली सं. 42/2026/प्रशासन',
        subject: 'नमूना आवक पत्र',
        messages: [],
        extracted_facts: {},
        updated_at: new Date().toISOString(),
      }
      setThreads((current) => [thread, ...current])
      setSelectedKey(thread.key)
      setMobileView('chat')
      await sendMessage(null, {
        thread,
        text: 'इस संलग्न पत्र के आधार पर शासकीय पत्र तैयार करें। केवल संलग्न पत्र में दिए गए तथ्य प्रयोग करें, कोई नियम या अधिनियम अपनी ओर से न जोड़ें, और जो जानकारी उपलब्ध न हो उसे [ ] में छोड़ दें।',
        attachment: file,
        attachmentUrl: sourceUrl,
      })
    } catch (error) {
      notify(error?.message || 'नमूना पत्र लोड नहीं हो सका।', 'error')
    }
  }

  function switchToDemo() {
    switchToDemoMode()
    setShowDemoOffer(false)
    setThreadError('')
    setRequestError('')
    loadThreads()
  }

  return (
    <main className={`app-shell ${presentationMode ? 'presentation-mode' : ''}`}>
      <div className={`workspace mobile-view-${mobileView}`}>
        <Sidebar
          threads={threads}
          selectedKey={selectedKey}
          isLoading={isLoadingThreads}
          error={threadError}
          onRetry={loadThreads}
          onSelect={selectThread}
          onNewFile={() => setIsNewFileOpen(true)}
          onArchitecture={() => setIsArchitectureOpen(true)}
          presentationMode={presentationMode}
          onPresentationToggle={() => setPresentationMode((current) => !current)}
        />
        <section className="chat-pane" aria-label="पत्रावली वार्तालाप">
          {selectedThread ? (
            <>
              <ChatHeader
                thread={selectedThread}
                language={language}
                onLanguageChange={setLanguage}
                onBack={() => setMobileView('sidebar')}
                onOpenFacts={() => setIsFactsOpen(true)}
                presentationMode={presentationMode}
                onPresentationToggle={() => setPresentationMode((current) => !current)}
              />
              <MessageList
                messages={selectedThread.messages}
                error={selectedThread.key === pendingRequest?.key ? requestError : ''}
                onRetry={() => sendMessage(pendingRequest)}
                isBusy={isSending && busyThreadKey === selectedThread.key}
                activeStepIndex={pipeline.activeStepIndex}
                hasDocument={pipeline.hasDocument}
                onRefine={() => {
                  setComposerHint('मसौदे में क्या सुधार करना है, लिखें।')
                  window.setTimeout(() => textareaRef.current?.focus(), 0)
                }}
                onCopy={async (raw) => {
                  try {
                    await navigator.clipboard.writeText(raw)
                    notify('Copied')
                  } catch {
                    notify('क्लिपबोर्ड उपलब्ध नहीं है।', 'error')
                  }
                }}
                onDownloadWord={async (message) => {
                  try {
                    await downloadWord(message, selectedThread.file_number)
                    notify('Word मसौदा डाउनलोड हो गया।')
                  } catch (error) {
                    notify(error?.message || 'Word फ़ाइल डाउनलोड नहीं हो सकी।', 'error')
                  }
                }}
                onPrint={(message) => {
                  try {
                    printDraft(message, selectedThread.file_number)
                  } catch (error) {
                    notify(error?.message || 'प्रिंट विंडो नहीं खुली।', 'error')
                  }
                }}
                onToggleSource={openSourceView}
                onCompare={compareDraft}
                onQuickRefine={(text) => sendMessage(null, { text, preserveComposer: true })}
              />
              {pipeline.isRunning && <ArchitectureDiagram compact />}
              <Composer
                value={activeComposer.text}
                onValueChange={updateDraftText}
                attachment={activeComposer.attachment}
                attachmentUrl={activeComposer.attachmentUrl}
                onAttachmentChange={changeAttachment}
                isBusy={isSending}
                isEmpty={selectedThread.messages.length === 0}
                language={language}
                onSend={() => sendMessage()}
                textareaRef={textareaRef}
                hint={composerHint}
              />
            </>
          ) : (
            <Welcome
              onNewFile={() => setIsNewFileOpen(true)}
              onTrySample={trySample}
              onOpenFiles={() => setMobileView('sidebar')}
            />
          )}
        </section>
      </div>
      <NewFileModal
        isOpen={isNewFileOpen}
        onClose={() => setIsNewFileOpen(false)}
        onCreate={createThread}
      />
      {isArchitectureOpen && (
        <div className="modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setIsArchitectureOpen(false)
        }}>
          <section className="architecture-modal" role="dialog" aria-modal="true" aria-labelledby="architecture-title">
            <header className="drawer-header">
              <div>
                <p className="eyebrow">How it works / कैसे काम करता है</p>
                <h2 id="architecture-title">आलेखन सहायक की संरचना</h2>
              </div>
              <button className="icon-button" onClick={() => setIsArchitectureOpen(false)} aria-label="डायग्राम बंद करें">×</button>
            </header>
            <ArchitectureDiagram />
            <p className="architecture-legend"><strong>Our part:</strong> React frontend on AWS Amplify. <strong>Provided part:</strong> organizer backend and its AWS services.</p>
          </section>
        </div>
      )}
      <FactsDrawer
        isOpen={isFactsOpen}
        facts={selectedThread?.extracted_facts || {}}
        stats={stats}
        onClose={() => setIsFactsOpen(false)}
      />
      {splitView && (
        <SplitView
          sourceMessage={splitView.sourceMessage}
          draftMessage={splitView.draftMessage}
          facts={splitView.draftMessage.extracted_facts || selectedThread?.extracted_facts || {}}
          onClose={() => setSplitView(null)}
        />
      )}
      {diffPair && <DiffView previous={diffPair.previous} current={diffPair.current} onClose={() => setDiffPair(null)} />}
      <Toast toast={toast} onDismiss={() => setToast(null)} />
      {showDemoOffer && (
        <div className="demo-mode-offer" role="status">
          <div>
            <strong>सर्वर से संपर्क नहीं हो सका</strong>
            <span>रिकॉर्डिंग जारी रखने के लिए demo mode पर जा सकते हैं।</span>
          </div>
          <button className="button button-light" onClick={switchToDemo}>Switch to demo mode</button>
          <button className="icon-button" onClick={() => setShowDemoOffer(false)} aria-label="Demo सुझाव बंद करें">×</button>
        </div>
      )}
      <span className="sr-only" aria-live="polite">
        {selectedThread ? `चयनित पत्रावली ${selectedThread.file_number}` : 'कोई पत्रावली चयनित नहीं'}
      </span>
    </main>
  )
}

function App() {
  return (
    <PipelineProvider>
      <AppContent />
    </PipelineProvider>
  )
}

export default App
