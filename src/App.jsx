import { useEffect, useMemo, useState } from 'react'
import { listThreads } from './api/client.js'
import ChatHeader from './components/ChatHeader.jsx'
import MessageList from './components/MessageList.jsx'
import NewFileModal from './components/NewFileModal.jsx'
import Sidebar from './components/Sidebar.jsx'
import Welcome from './components/Welcome.jsx'

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

function App() {
  const [threads, setThreads] = useState([])
  const [selectedKey, setSelectedKey] = useState(null)
  const [isLoadingThreads, setIsLoadingThreads] = useState(true)
  const [threadError, setThreadError] = useState('')
  const [isNewFileOpen, setIsNewFileOpen] = useState(false)
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false)
  const [language, setLanguage] = useState('Hindi')

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
      setThreads(nextThreads)
    } catch (error) {
      setThreadError(error?.message || 'पत्रावलियाँ लोड नहीं हो सकीं।')
    } finally {
      setIsLoadingThreads(false)
    }
  }

  useEffect(() => {
    loadThreads()
  }, [])

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
              <MessageList messages={selectedThread.messages} />
              <div className="composer-placeholder">संदेश लिखने की सुविधा अगले चरण में उपलब्ध होगी।</div>
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

export default App
