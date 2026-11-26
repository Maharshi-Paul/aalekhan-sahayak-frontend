import { normalizeDraft } from './format.js'

export const referenceFields = [
  ['letter_number', 'पत्र संख्या'],
  ['letter_date', 'पत्र दिनांक'],
  ['sender_name_designation', 'प्रेषक'],
  ['recipient_designation', 'प्राप्तकर्ता'],
  ['deadline', 'समय-सीमा'],
]

export function normalizeReference(value) {
  return String(value || '')
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[०-९]/g, (digit) => String(digit.charCodeAt(0) - 0x0966))
    .toLocaleLowerCase('en-IN')
}

export function getReferenceChecks(facts = {}, draft = '') {
  const normalizedDraft = normalizeReference(normalizeDraft(draft))
  return referenceFields.map(([key, label]) => {
    const value = typeof facts?.[key] === 'string' ? facts[key].trim() : ''
    return {
      key,
      label,
      value,
      status: !value
        ? 'not-extracted'
        : normalizedDraft.includes(normalizeReference(value))
          ? 'in-draft'
          : 'not-referenced',
    }
  })
}

function normalizedWithMap(value) {
  let normalized = ''
  const map = []
  let lastWasSpace = false
  for (let index = 0; index < value.length; index += 1) {
    let character = value[index]
    if (/\s/.test(character)) {
      if (!lastWasSpace) {
        normalized += ' '
        map.push(index)
      }
      lastWasSpace = true
      continue
    }
    lastWasSpace = false
    if (character >= '०' && character <= '९') {
      character = String(character.charCodeAt(0) - 0x0966)
    }
    normalized += character.toLocaleLowerCase('en-IN')
    map.push(index)
  }
  return { normalized, map }
}

export function highlightedSegments(draft, values) {
  const { normalized, map } = normalizedWithMap(draft)
  const ranges = []
  for (const value of values.filter(Boolean)) {
    const needle = normalizeReference(value)
    if (!needle) continue
    let offset = 0
    while (offset < normalized.length) {
      const start = normalized.indexOf(needle, offset)
      if (start < 0) break
      const end = start + needle.length
      ranges.push([map[start], map[end - 1] + 1])
      offset = end
    }
  }
  ranges.sort((left, right) => left[0] - right[0])
  const merged = []
  for (const range of ranges) {
    const previous = merged[merged.length - 1]
    if (previous && range[0] <= previous[1]) previous[1] = Math.max(previous[1], range[1])
    else merged.push([...range])
  }
  const segments = []
  let cursor = 0
  for (const [start, end] of merged) {
    if (start > cursor) segments.push(draft.slice(cursor, start))
    segments.push({ match: draft.slice(start, end) })
    cursor = end
  }
  if (cursor < draft.length) segments.push(draft.slice(cursor))
  return segments.length ? segments : [draft]
}
