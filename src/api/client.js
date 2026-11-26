import { listThreads as mockListThreads, processDraft as mockProcessDraft } from './mock.js'

const REQUEST_TIMEOUT_MS = 60_000
let demoMode = import.meta.env.VITE_USE_MOCK === 'true'
let consecutiveFailures = 0

export function isDemoMode() {
  return demoMode
}

export function getConsecutiveFailures() {
  return consecutiveFailures
}

export function switchToDemoMode() {
  demoMode = true
  consecutiveFailures = 0
}

async function post(payload) {
  const url = import.meta.env.VITE_API_URL
  if (!url) {
    consecutiveFailures += 1
    throw new Error('API URL is not configured. Set VITE_API_URL or enable demo mode.')
  }

  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
    const data = await response.json().catch(() => null)
    if (!response.ok) {
      const message = data?.message || data?.error || `The service returned ${response.status}.`
      throw new Error(message)
    }
    if (!data || typeof data !== 'object') {
      throw new Error('The service returned an invalid response.')
    }
    consecutiveFailures = 0
    return data
  } catch (error) {
    consecutiveFailures += 1
    if (error?.name === 'AbortError') {
      throw new Error('The request took too long. Please try again.')
    }
    if (error instanceof TypeError) {
      throw new Error('Could not reach the service. Check your connection or CORS settings, then retry.')
    }
    throw error
  } finally {
    window.clearTimeout(timeout)
  }
}

export async function listThreads() {
  if (demoMode) return mockListThreads()
  const data = await post({ action: 'list_threads' })
  if (!Array.isArray(data.threads)) {
    consecutiveFailures += 1
    throw new Error('The service returned an invalid thread list.')
  }
  return { threads: data.threads }
}

export async function processDraft(request) {
  if (typeof request?.user_message !== 'string' || !request.user_message.trim()) {
    throw new Error('कृपया मसौदे के लिए निर्देश लिखें।')
  }
  if (demoMode) return mockProcessDraft(request)
  return post({ action: 'process', ...request })
}
