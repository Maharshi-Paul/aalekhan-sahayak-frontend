import { useCallback, useEffect, useRef, useState } from 'react'

export default function useSpeech(language, onFinalText) {
  const [isListening, setIsListening] = useState(false)
  const [interimText, setInterimText] = useState('')
  const recognitionRef = useRef(null)
  const onFinalTextRef = useRef(onFinalText)
  onFinalTextRef.current = onFinalText

  const isSupported = typeof window !== 'undefined'
    && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition)

  const stop = useCallback(() => {
    recognitionRef.current?.stop()
    recognitionRef.current = null
    setIsListening(false)
    setInterimText('')
  }, [])

  const start = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return false
    const recognition = new SpeechRecognition()
    recognition.lang = language === 'English' ? 'en-IN' : 'hi-IN'
    recognition.continuous = true
    recognition.interimResults = true
    recognition.onresult = (event) => {
      let finalText = ''
      let pendingText = ''
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index]
        const transcript = result[0]?.transcript || ''
        if (result.isFinal) finalText += transcript
        else pendingText += transcript
      }
      if (finalText) onFinalTextRef.current(finalText)
      setInterimText(pendingText)
    }
    recognition.onerror = () => {
      setInterimText('')
      setIsListening(false)
      recognitionRef.current = null
    }
    recognition.onend = () => {
      setInterimText('')
      setIsListening(false)
      recognitionRef.current = null
    }
    recognitionRef.current = recognition
    recognition.start()
    setIsListening(true)
    return true
  }, [language])

  useEffect(() => () => recognitionRef.current?.stop(), [])

  function toggle() {
    if (isListening) stop()
    else start()
  }

  return { isSupported, isListening, interimText, toggle, stop }
}
