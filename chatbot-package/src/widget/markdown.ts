const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const renderMarkdownInline = (value: string): string => {
  const withHeadings = value
    .replace(/^###\s+(.+)$/gm, '<div class="chatbot-md-h3">$1</div>')
    .replace(/^##\s+(.+)$/gm, '<div class="chatbot-md-h2">$1</div>')
    .replace(/^#\s+(.+)$/gm, '<div class="chatbot-md-h1">$1</div>')
  const withLinks = withHeadings.replace(
    /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
    (_, text, url) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`,
  )
  const withAutoLinks = withLinks.replace(
    /&lt;(https?:\/\/[^&]+)&gt;/g,
    (_, url) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`,
  )
  const withBold = withAutoLinks.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  const withItalic = withBold.replace(/\*([^*]+)\*/g, '<em>$1</em>')
  const withCode = withItalic.replace(/`([^`]+)`/g, '<code>$1</code>')
  const withBullets = withCode.replace(/^\s*-\s+/gm, '• ')
  return withBullets.replace(/\n/g, '<br>')
}

const extractReferenceLinks = (value: string): Array<{ label: string; url: string }> => {
  const text = String(value || '')
  const headerMatch = text.match(/^##+\s+References\s*$/im) || text.match(/^References\s*$/im)
  if (!headerMatch || headerMatch.index == null) return []
  const start = headerMatch.index + headerMatch[0].length
  const after = text.slice(start)
  const lines = after.split(/\r?\n/)
  const links: Array<{ label: string; url: string }> = []
  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line) continue
    if (/^##+/.test(line)) break
    const mdMatch = line.match(/^\s*[-*]\s*\[([^\]]+)\]\((https?:\/\/[^)]+)\)/i)
    if (mdMatch) {
      links.push({ label: mdMatch[1], url: mdMatch[2] })
      continue
    }
    const urlMatch = line.match(/(https?:\/\/\S+)/i)
    if (urlMatch) {
      links.push({ label: urlMatch[1], url: urlMatch[1] })
    }
  }
  return links
}

const stripReferenceSection = (value: string): string => {
  const text = String(value || '')
  const headerMatch = text.match(/^##+\s+References\s*$/im) || text.match(/^References\s*$/im)
  if (!headerMatch || headerMatch.index == null) return text
  const before = text.slice(0, headerMatch.index).trimEnd()
  return before
}

export const renderMarkdown = (value: string): string => {
  const refLinks = extractReferenceLinks(value)
  const content = stripReferenceSection(value)
  const segments = String(content || '').split(/```/)
  const body = segments
    .map((segment, idx) => {
      if (idx % 2 === 1) {
        return `<pre><code>${escapeHtml(segment.trim())}</code></pre>`
      }
      const escaped = escapeHtml(segment)
      return renderMarkdownInline(escaped)
    })
    .join('')
  if (refLinks.length === 0) return body
  const chips = refLinks
    .map(
      (link) =>
        `<a class="chatbot-ref-chip" href="${link.url}" target="_blank" rel="noopener noreferrer">${escapeHtml(link.label)}</a>`,
    )
    .join('')
  return `${body}<div class="chatbot-ref-chips">${chips}</div>`
}
