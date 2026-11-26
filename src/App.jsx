import { useEffect, useMemo, useRef, useState } from 'react'
import { listThreads, processDraft } from './api/client.js'
import ChatHeader from './components/ChatHeader.jsx'
import Composer, { DEFAULT_ATTACHMENT_INSTRUCTION } from './components/Composer.jsx'
import MessageList from './components/MessageList.jsx'
import NewFileModal from './components/NewFileModal.jsx'
import Sidebar from './components/Sidebar.jsx'
import Welcome from './components/Welcome.jsx'
import usePipelineState, { PipelineProvider } from './hooks/usePipelineState.js'
import { encodeAttachment } from './utils/image.js'

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

function AppContent() {
  const pipeline = usePipelineState()
  const [threads, setThreads] = useState([])
  const [selectedKey, setSelectedKey] = useState(null)
  const [isLoadingThreads, setIsLoadingThreads] = useState(true)
  const [threadError, setThreadError] = useState('')
  const [isNewFileOpen, setIsNewFileOpen] = useState(false)
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false)
  const [language, setLanguage] = useState('Hindi')
  const [draftText, setDraftText] = useState('')
  const [attachment, setAttachment] = useState(null)
  const [attachmentUrl, setAttachmentUrl] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [requestError, setRequestError] = useState('')
  const [pendingRequest, setPendingRequest] = useState(null)
  const [composerHint, setComposerHint] = useState('')
  const busyRef = useRef(false)
  const textareaRef = useRef(null)
  const objectUrlsRef = useRef(new Set())

  const selectedThread = useMemo(
    () => threads.find((thread) => thread.key === selectedKey) || null,
    [threads, selectedKey],
  )

  async function loadThreads() {
    setIsLoadingThreads(true)
    setThreadError('')
    try {
      const response = await listThreads()
      const nextThreads = (Array.isArray(response.threads) ? response.threads : [])
        .map(normalizeThread)
        .sort((a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0))
      setThreads((current) => [
        ...current.filter((thread) => !thread.thread_id),
        ...nextThreads.filter((thread) => !current.some((item) => item.thread_id === thread.thread_id)),
        ...nextThreads.filter((thread) => current.some((item) => item.thread_id === thread.thread_id)),
      ])
    } catch (error) {
      setThreadError(error?.message || 'पत्रावलियाँ लोड नहीं हो सकीं।')
    } finally {
      setIsLoadingThreads(false)
    }
  }

  useEffect(() => {
    loadThreads()
  }, [])

  useEffect(() => () => {
    objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url))
  }, [])

  function changeAttachment(file) {
    if (attachmentUrl && attachment) {
      URL.revokeObjectURL(attachmentUrl)
      objectUrlsRef.current.delete(attachmentUrl)
    }
    if (!file) {
      setAttachment(null)
      setAttachmentUrl('')
      return
    }
    const url = URL.createObjectURL(file)
    objectUrlsRef.current.add(url)
    setAttachment(file)
    setAttachmentUrl(url)
  }

  function clearSentAttachment() {
    setAttachment(null)
    setAttachmentUrl('')
  }

  async function sendMessage(retryRequest = null) {
    if (busyRef.current || !selectedThread) return
    let pending = retryRequest
    if (!pending) {
      const text = draftText.trim() || (attachment ? DEFAULT_ATTACHMENT_INSTRUCTION : '')
      if (!text) return
      const userMessage = {
        role: 'user',
        text,
        timestamp: new Date().toISOString(),
        attachment_name: attachment?.name || '',
        source_url: attachmentUrl || '',
        source_type: attachment?.type || '',
      }
      pending = {
        key: selectedThread.key,
        thread_id: selectedThread.thread_id || null,
        file_number: selectedThread.file_number,
        user_message: text,
        language,
        attachment,
        user_message_id: localKey(),
      }
      setThreads((current) => current.map((thread) => (
        thread.key === selectedThread.key
          ? { ...thread, messages: [...thread.messages, { ...userMessage, id: pending.user_message_id }] }
          : thread
      )))
    }

    busyRef.current = true
    setIsSending(true)
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
      setDraftText('')
      clearSentAttachment()
      setComposerHint('')
      setPendingRequest(null)
    } catch (error) {
      setRequestError(error?.message || 'मसौदा तैयार नहीं हो सका। कृपया पुनः प्रयास करें।')
    } finally {
      window.clearInterval(pipelineTimer)
      pipeline.stop()
      busyRef.current = false
      setIsSending(false)
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
    setIsMobileChatOpen(true)
    setIsNewFileOpen(false)
  }

  function selectThread(thread) {
    setSelectedKey(thread.key)
    setIsMobileChatOpen(true)
  }

  return (
    <main className="app-shell">
      <div className={`workspace ${isMobileChatOpen ? 'mobile-chat-open' : ''}`}>
        <Sidebar
          threads={threads}
          selectedKey={selectedKey}
          isLoading={isLoadingThreads}
          error={threadError}
          onRetry={loadThreads}
          onSelect={selectThread}
          onNewFile={() => setIsNewFileOpen(true)}
        />
        <section className="chat-pane" aria-label="पत्रावली वार्तालाप">
          {selectedThread ? (
            <>
              <ChatHeader
                thread={selectedThread}
                language={language}
                onLanguageChange={setLanguage}
                onBack={() => setIsMobileChatOpen(false)}
              />
              <MessageList
                messages={selectedThread.messages}
                error={requestError}
                onRetry={() => sendMessage(pendingRequest)}
                isBusy={isSending}
                activeStepIndex={pipeline.activeStepIndex}
                hasDocument={pipeline.hasDocument}
                onRefine={() => {
                  setComposerHint('मसौदे में क्या सुधार करना है, लिखें।')
                  window.setTimeout(() => textareaRef.current?.focus(), 0)
                }}
              />
              <Composer
                value={draftText}
                onValueChange={setDraftText}
                attachment={attachment}
                attachmentUrl={attachmentUrl}
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
            <Welcome onNewFile={() => setIsNewFileOpen(true)} />
          )}
        </section>
      </div>
      <NewFileModal
        isOpen={isNewFileOpen}
        onClose={() => setIsNewFileOpen(false)}
        onCreate={createThread}
      />
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
