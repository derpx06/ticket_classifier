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
  const withBold = withLinks.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  const withItalic = withBold.replace(/\*([^*]+)\*/g, '<em>$1</em>')
  const withCode = withItalic.replace(/`([^`]+)`/g, '<code>$1</code>')
  const withBullets = withCode.replace(/^\s*-\s+/gm, '• ')
  return withBullets.replace(/\n/g, '<br>')
}

export const renderMarkdown = (value: string): string => {
  const segments = String(value || '').split(/```/)
  return segments
    .map((segment, idx) => {
      if (idx % 2 === 1) {
        return `<pre><code>${escapeHtml(segment.trim())}</code></pre>`
      }
      const escaped = escapeHtml(segment)
      return renderMarkdownInline(escaped)
    })
    .join('')
}
