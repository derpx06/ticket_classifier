import {
  Bot,
  MessageCircle,
  SendHorizontal,
  UserRound,
  X,
  CheckCircle,
  ArrowLeft,
  createIcons,
} from 'lucide'
import { io, type Socket } from 'socket.io-client'

export interface ChatbotWidgetOptions {
  botName?: string
  title?: string
  subtitle?: string
  welcomeMessage?: string
  placeholder?: string
  primaryColor?: string
  position?: 'bottom-right' | 'bottom-left'
  zIndex?: number
  aiSupport?: {
    apiBaseUrl: string
    apiKey: string
    chatPath?: string
  }
  humanSupport?: {
    apiBaseUrl: string
    widgetKey?: string
  }
  onUserMessage?: (message: string) => string | Promise<string> | void
  onTalkToHumanClick?: () => string | Promise<string> | void
}

export interface ChatbotWidgetInstance {
  open: () => void
  close: () => void
  toggle: () => void
  destroy: () => void
  sendMessage: (message: string) => Promise<void>
}

const STYLE_ID = 'chatbot-package-styles'

const DEFAULT_OPTIONS: Required<
  Omit<ChatbotWidgetOptions, 'onUserMessage' | 'onTalkToHumanClick' | 'aiSupport' | 'humanSupport'>
> = {
  botName: 'Support Assistant',
  title: 'Support Assistant',
  subtitle: 'Online',
  welcomeMessage: 'Hi there! I am your support assistant. Ask me anything.',
  placeholder: 'Type your question...',
  primaryColor: '#2563eb',
  position: 'bottom-right',
  zIndex: 9999,
}

const WIDGET_CSS = `
.chatbot-widget-root {
  position: fixed;
  bottom: 16px;
  font-family: "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif;
}

.chatbot-widget-root.right {
  right: 16px;
}

.chatbot-widget-root.left {
  left: 16px;
}

.chatbot-launcher {
  width: 56px;
  height: 56px;
  border-radius: 9999px;
  border: 0;
  background: linear-gradient(135deg, var(--chatbot-primary), #1d4ed8);
  color: #ffffff;
  box-shadow: 0 16px 30px rgba(37, 99, 235, 0.35);
  cursor: pointer;
  display: grid;
  place-items: center;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.2px;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.chatbot-launcher svg {
  width: 20px;
  height: 20px;
}

.chatbot-launcher:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 34px rgba(37, 99, 235, 0.42);
}

.chatbot-panel {
  position: absolute;
  bottom: 66px;
  width: min(378px, calc(100vw - 24px));
  height: min(610px, calc(100vh - 88px));
  border-radius: 16px;
  border: 1px solid #dbe4f5;
  overflow: hidden;
  box-shadow: 0 28px 56px rgba(15, 23, 42, 0.24);
  background: #f8fbff;
  display: flex;
  flex-direction: column;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transform: translateY(10px) scale(0.98);
  transition: opacity 0.2s ease, transform 0.2s ease, visibility 0.2s ease;
}

.chatbot-widget-root.right .chatbot-panel {
  right: 0;
  transform-origin: bottom right;
}

.chatbot-widget-root.left .chatbot-panel {
  left: 0;
  transform-origin: bottom left;
}

.chatbot-widget-root.open .chatbot-panel {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
  transform: translateY(0) scale(1);
}

.chatbot-header {
  background: linear-gradient(135deg, var(--chatbot-primary), #1d4ed8);
  color: #ffffff;
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.chatbot-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.chatbot-avatar {
  width: 38px;
  height: 38px;
  border-radius: 9999px;
  background: #ffffff;
  color: var(--chatbot-primary);
  border: 1px solid rgba(255, 255, 255, 0.84);
  display: grid;
  place-items: center;
  font-size: 14px;
  font-weight: 700;
}

.chatbot-avatar svg {
  width: 18px;
  height: 18px;
}

.chatbot-header-info h2 {
  margin: 0;
  font-size: 15px;
  line-height: 1.15;
  font-weight: 700;
}

.chatbot-status {
  margin-top: 3px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
  opacity: 0.95;
}

.chatbot-status-dot {
  width: 8px;
  height: 8px;
  border-radius: 9999px;
  background: #22c55e;
}

.chatbot-controls {
  display: flex;
  align-items: center;
  margin-left: auto;
}

.chatbot-controls button {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.42);
  background: rgba(255, 255, 255, 0.24);
  color: #ffffff;
  cursor: pointer;
  line-height: 0;
  display: grid;
  place-items: center;
  transition: background 0.2s ease, transform 0.2s ease;
}

.chatbot-controls button svg {
  width: 16px;
  height: 16px;
  stroke-width: 2.25;
}

.chatbot-controls button:hover {
  background: rgba(255, 255, 255, 0.36);
  transform: translateY(-1px);
}

.chatbot-body {
  flex: 1;
  overflow-y: auto;
  padding: 14px 12px 10px;
  background: linear-gradient(180deg, #f8fbff 0%, #f1f6ff 100%);
}

.chatbot-body::-webkit-scrollbar {
  width: 8px;
}

.chatbot-body::-webkit-scrollbar-thumb {
  background: #bfdbfe;
  border-radius: 999px;
}

.chatbot-intro {
  text-align: center;
  color: #334155;
  border: 1px solid #dbe4f5;
  background: rgba(255, 255, 255, 0.72);
  border-radius: 14px;
  padding: 16px 12px;
}

.chatbot-intro-icon {
  width: 44px;
  height: 44px;
  border-radius: 9999px;
  background: #dbeafe;
  color: #1d4ed8;
  display: grid;
  place-items: center;
  font-size: 22px;
  font-weight: 700;
  margin: 0 auto 12px;
}

.chatbot-intro h3 {
  margin: 0;
  font-size: 25px;
  color: #0f172a;
}

.chatbot-intro p {
  margin: 10px auto 0;
  max-width: 290px;
  font-size: 13px;
  line-height: 1.45;
  color: #475569;
}

.chatbot-intro .chatbot-human-note {
  margin-top: 12px;
  font-style: italic;
  font-size: 12px;
  color: #6b7a92;
}

.chatbot-messages {
  display: none;
  flex-direction: column;
  gap: 8px;
}

.chatbot-body.has-messages .chatbot-intro {
  display: none;
}

.chatbot-body.has-messages .chatbot-messages {
  display: flex;
}
.chatbot-body.human-mode .chatbot-intro {
  display: none;
}
.chatbot-human-hero {
  display: none;
  text-align: center;
  color: #0f172a;
  border: 1px solid #dbe4f5;
  background: rgba(255, 255, 255, 0.88);
  border-radius: 14px;
  padding: 18px 14px;
}
.chatbot-body.human-mode .chatbot-human-hero {
  display: block;
}
.chatbot-human-hero h3 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
}
.chatbot-human-hero p {
  margin: 8px 0 0;
  font-size: 13px;
  color: #475569;
}
.chatbot-history-label {
  margin-top: 14px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #94a3b8;
  text-align: center;
}
.chatbot-divider {
  display: none;
  align-items: center;
  gap: 10px;
  margin: 16px 0 10px;
  color: #94a3b8;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
.chatbot-divider::before,
.chatbot-divider::after {
  content: "";
  flex: 1;
  height: 1px;
  background: #e2e8f0;
}
.chatbot-body.human-mode .chatbot-divider {
  display: flex;
}

.chatbot-bubble {
  max-width: 86%;
  border-radius: 12px;
  padding: 8px 10px;
  line-height: 1.45;
  font-size: 13px;
  white-space: pre-wrap;
}

.chatbot-bubble.user {
  align-self: flex-end;
  background: linear-gradient(135deg, var(--chatbot-primary), #1d4ed8);
  color: #ffffff;
}

.chatbot-bubble.bot {
  align-self: flex-start;
  background: #e2e8f0;
  color: #1e293b;
}
.chatbot-bubble.bot a {
  color: #1d4ed8;
  text-decoration: underline;
  text-underline-offset: 2px;
}
.chatbot-bubble.bot code {
  background: #e2e8f0;
  border-radius: 6px;
  padding: 1px 4px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
    "Courier New", monospace;
  font-size: 12px;
}
.chatbot-bubble.bot pre {
  margin: 8px 0 0;
  padding: 10px 12px;
  border-radius: 10px;
  background: #0f172a;
  color: #e2e8f0;
  overflow-x: auto;
  font-size: 12px;
  line-height: 1.5;
}
.chatbot-bubble.bot pre code {
  background: transparent;
  padding: 0;
  color: inherit;
}
.chatbot-md-h1,
.chatbot-md-h2,
.chatbot-md-h3 {
  font-weight: 700;
  color: #0f172a;
  margin: 6px 0 4px;
}
.chatbot-md-h1 {
  font-size: 15px;
}
.chatbot-md-h2 {
  font-size: 14px;
}
.chatbot-md-h3 {
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.chatbot-bubble.system {
  align-self: center;
  background: transparent;
  color: #2563eb;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 4px 6px;
  box-shadow: none;
}

.chatbot-footer {
  border-top: 1px solid #dbe4f5;
  background: #f8fbff;
  padding: 10px;
}

.chatbot-input-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
  margin-bottom: 8px;
  align-items: center;
}

.chatbot-input-row input {
  border: 1px solid #bfdbfe;
  border-radius: 10px;
  min-height: 44px;
  padding: 0 12px;
  outline: none;
  font-size: 13px;
  background: #ffffff;
  color: #1e293b;
}
.chatbot-input-row textarea {
  border: 1px solid #bfdbfe;
  border-radius: 12px;
  min-height: 46px;
  padding: 10px 12px;
  outline: none;
  font-size: 13px;
  background: #ffffff;
  color: #1e293b;
  resize: none;
  line-height: 1.4;
  font-family: inherit;
}

.chatbot-input-row input:focus {
  border-color: var(--chatbot-primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
}
.chatbot-input-row textarea:focus {
  border-color: var(--chatbot-primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
}

.chatbot-input-row button {
  width: 46px;
  height: 44px;
  border: 0;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--chatbot-primary), #1d4ed8);
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  padding: 0;
  display: grid;
  place-items: center;
  box-shadow: 0 10px 18px rgba(37, 99, 235, 0.28);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.chatbot-input-row button svg {
  width: 17px;
  height: 17px;
  stroke-width: 2.2;
}

.chatbot-input-row button:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 24px rgba(37, 99, 235, 0.34);
}

.chatbot-human-button {
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  background: #ffffff;
  color: #334155;
  min-height: 44px;
  padding: 0 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: border-color 0.2s ease, background 0.2s ease;
}

.chatbot-human-button:hover {
  background: #f8fafc;
  border-color: #94a3b8;
}

.chatbot-human-button svg {
  width: 16px;
  height: 16px;
  stroke-width: 2.1;
}

.chatbot-powered {
  margin: 8px 0 0;
  text-align: center;
  font-size: 11px;
  color: #94a3b8;
}

.chatbot-powered strong {
  color: #64748b;
}

/* --- Human Form Styles --- */
.chatbot-widget-root.show-human-form .chatbot-body,
.chatbot-widget-root.show-human-form .chatbot-footer {
  display: none !important;
}

.chatbot-human-container {
  display: none;
  flex: 1;
  flex-direction: column;
  background: #f8fbff;
  overflow-y: auto;
}

.chatbot-widget-root.show-human-form .chatbot-human-container {
  display: flex;
}

.chatbot-human-container::-webkit-scrollbar {
  width: 8px;
}

.chatbot-human-container::-webkit-scrollbar-thumb {
  background: #bfdbfe;
  border-radius: 999px;
}

.chatbot-human-header {
  padding: 20px 16px 12px;
  text-align: center;
}

.chatbot-human-header h3 {
  margin: 0 0 6px;
  color: #0f172a;
  font-size: 18px;
}

.chatbot-human-header p {
  margin: 0;
  color: #64748b;
  font-size: 13px;
  line-height: 1.45;
}

.chatbot-human-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 16px 20px;
}

.chatbot-form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.chatbot-form-group label {
  font-size: 13px;
  font-weight: 600;
  color: #334155;
}

.chatbot-form-group input,
.chatbot-form-group textarea {
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  padding: 10px;
  font-size: 13px;
  outline: none;
  background: #ffffff;
  color: #1e293b;
  font-family: inherit;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.chatbot-form-group input:focus,
.chatbot-form-group textarea:focus {
  border-color: var(--chatbot-primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}

.chatbot-form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.chatbot-form-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.chatbot-btn-primary {
  flex: 1;
  background: linear-gradient(135deg, var(--chatbot-primary), #1d4ed8);
  color: white;
  border: none;
  padding: 10px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.chatbot-btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
}

.chatbot-btn-secondary {
  flex: 1;
  background: #e2e8f0;
  color: #334155;
  border: none;
  padding: 10px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.chatbot-btn-secondary:hover {
  background: #cbd5e1;
}

.chatbot-human-success {
  display: none;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 32px 24px;
  height: 100%;
}

.chatbot-widget-root.show-human-success .chatbot-human-success {
  display: flex;
}
.chatbot-widget-root.show-human-success .chatbot-human-form,
.chatbot-widget-root.show-human-success .chatbot-human-header {
  display: none !important;
}

.chatbot-success-icon {
  width: 56px;
  height: 56px;
  background: #dcfce7;
  color: #16a34a;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.chatbot-success-icon svg {
  width: 28px;
  height: 28px;
}

.chatbot-human-success h3 {
  margin: 0 0 8px;
  color: #0f172a;
  font-size: 20px;
}

.chatbot-human-success p {
  margin: 0 0 24px;
  color: #475569;
  font-size: 14px;
  line-height: 1.5;
}

@media (max-width: 640px) {
  .chatbot-widget-root.right,
  .chatbot-widget-root.left {
    right: 10px;
    left: 10px;
  }

  .chatbot-widget-root {
    bottom: 10px;
  }

  .chatbot-panel {
    width: min(360px, calc(100vw - 20px));
    height: min(520px, calc(100vh - 70px));
  }

  .chatbot-intro h3 {
    font-size: 22px;
  }
}
`

const ensureStyles = (): void => {
  if (document.getElementById(STYLE_ID)) {
    return
  }

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = WIDGET_CSS
  document.head.appendChild(style)
}

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

const renderMarkdown = (value: string): string => {
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

const createBubble = (
  text: string,
  role: 'user' | 'bot' | 'system',
  renderAsMarkdown = false,
): HTMLDivElement => {
  const bubble = document.createElement('div')
  bubble.className = `chatbot-bubble ${role}`
  if (renderAsMarkdown) {
    bubble.innerHTML = renderMarkdown(text)
  } else {
    bubble.textContent = text
  }
  return bubble
}

const createControlButton = (
  iconName: string,
  ariaLabel: string,
  onClick?: () => void,
): HTMLButtonElement => {
  const button = document.createElement('button')
  button.type = 'button'
  button.innerHTML = `<i data-lucide="${iconName}" aria-hidden="true"></i>`
  button.setAttribute('aria-label', ariaLabel)
  if (onClick) {
    button.addEventListener('click', onClick)
  }
  return button
}

const hydrateIcons = (): void => {
  createIcons({
    icons: {
      Bot,
      MessageCircle,
      SendHorizontal,
      UserRound,
      X,
      CheckCircle,
      ArrowLeft,
    },
  })
}

const resolveApiBase = (input: string): string => {
  const trimmed = String(input || '').trim().replace(/\/+$/, '')
  if (!trimmed) return trimmed
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  if (trimmed.startsWith('/')) {
    return `${window.location.origin}${trimmed}`
  }
  return trimmed
}
const resolveApiPath = (input: string): string => (input.startsWith('/') ? input : `/${input}`)

const resolveSocketBase = (apiBase: string): string => apiBase.replace(/\/api\/?$/i, '')

const unwrapResponseData = <T>(payload: unknown): T => {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data: T }).data
  }
  return payload as T
}

type ResolvedOptions = typeof DEFAULT_OPTIONS & ChatbotWidgetOptions

const buildHeader = (config: ResolvedOptions, onClose: () => void) => {
  const header = document.createElement('header')
  header.className = 'chatbot-header'

  const headerLeft = document.createElement('div')
  headerLeft.className = 'chatbot-header-left'

  const avatar = document.createElement('div')
  avatar.className = 'chatbot-avatar'
  avatar.innerHTML = '<i data-lucide="bot" aria-hidden="true"></i>'

  const headerInfo = document.createElement('div')
  headerInfo.className = 'chatbot-header-info'

  const title = document.createElement('h2')
  title.textContent = config.title

  const status = document.createElement('div')
  status.className = 'chatbot-status'

  const statusDot = document.createElement('span')
  statusDot.className = 'chatbot-status-dot'

  const statusText = document.createElement('span')
  statusText.textContent = config.subtitle

  status.append(statusDot, statusText)
  headerInfo.append(title, status)
  headerLeft.append(avatar, headerInfo)

  const controls = document.createElement('div')
  controls.className = 'chatbot-controls'

  const closeControl = createControlButton('x', 'Close chat', onClose)
  controls.append(closeControl)

  header.append(headerLeft, controls)

  return {
    header,
    statusText,
  }
}

const buildBody = (config: ResolvedOptions) => {
  const body = document.createElement('div')
  body.className = 'chatbot-body'

  const intro = document.createElement('section')
  intro.className = 'chatbot-intro'

  const introIcon = document.createElement('div')
  introIcon.className = 'chatbot-intro-icon'
  introIcon.textContent = '?'

  const introTitle = document.createElement('h3')
  introTitle.textContent = 'Hi there!'

  const introDescription = document.createElement('p')
  introDescription.textContent = 'I am your AI support assistant. Ask me anything.'

  const introHumanNote = document.createElement('p')
  introHumanNote.className = 'chatbot-human-note'
  introHumanNote.textContent =
    'If I cannot help, you can connect with our human support team.'

  intro.append(introIcon, introTitle, introDescription, introHumanNote)

  const humanHero = document.createElement('section')
  humanHero.className = 'chatbot-human-hero'
  const humanHeroTitle = document.createElement('h3')
  humanHeroTitle.textContent = 'Talk to Support'
  const humanHeroCopy = document.createElement('p')
  humanHeroCopy.textContent = 'Our team typically replies in a few minutes.'
  const historyLabel = document.createElement('div')
  historyLabel.className = 'chatbot-history-label'
  historyLabel.textContent = 'Previous Messages'
  humanHero.append(humanHeroTitle, humanHeroCopy, historyLabel)

  const humanDivider = document.createElement('div')
  humanDivider.className = 'chatbot-divider'
  humanDivider.textContent = 'Previous AI Interaction'

  const messages = document.createElement('div')
  messages.className = 'chatbot-messages'
  messages.setAttribute('aria-live', 'polite')
  messages.appendChild(createBubble(config.welcomeMessage, 'bot', true))

  body.append(intro, humanHero, messages)

  return {
    body,
    humanDivider,
    messages,
  }
}

const buildFooter = (config: ResolvedOptions) => {
  const footer = document.createElement('div')
  footer.className = 'chatbot-footer'

  const inputRow = document.createElement('form')
  inputRow.className = 'chatbot-input-row'

  const input = document.createElement('textarea')
  input.rows = 1
  input.placeholder = config.placeholder

  const sendButton = document.createElement('button')
  sendButton.type = 'submit'
  sendButton.setAttribute('aria-label', 'Send message')
  sendButton.innerHTML = '<i data-lucide="send-horizontal" aria-hidden="true"></i>'

  inputRow.append(input, sendButton)

  const humanButton = document.createElement('button')
  humanButton.type = 'button'
  humanButton.className = 'chatbot-human-button'

  const poweredText = document.createElement('p')
  poweredText.className = 'chatbot-powered'
  poweredText.innerHTML = 'Powered by <strong>AI assistant</strong>'

  footer.append(inputRow, humanButton, poweredText)

  return {
    footer,
    inputRow,
    input,
    humanButton,
  }
}

const buildHumanContainer = () => {
  const humanContainer = document.createElement('div')
  humanContainer.className = 'chatbot-human-container'

  const humanHeader = document.createElement('div')
  humanHeader.className = 'chatbot-human-header'
  const humanTitle = document.createElement('h3')
  humanTitle.textContent = 'Contact Support'
  const humanSubtitle = document.createElement('p')
  humanSubtitle.textContent = 'Please provide your details and we will get back to you shortly.'
  humanHeader.append(humanTitle, humanSubtitle)

  const humanForm = document.createElement('form')
  humanForm.className = 'chatbot-human-form'

  const createFormGroup = (labelStr: string, inputEl: HTMLElement) => {
    const group = document.createElement('div')
    group.className = 'chatbot-form-group'
    const label = document.createElement('label')
    label.textContent = labelStr
    group.append(label, inputEl)
    return group
  }

  const nameInput = document.createElement('input')
  nameInput.type = 'text'
  nameInput.placeholder = 'John Doe'
  nameInput.required = true

  const emailInput = document.createElement('input')
  emailInput.type = 'email'
  emailInput.placeholder = 'john@example.com'
  emailInput.required = true

  const issueTextarea = document.createElement('textarea')
  issueTextarea.placeholder = 'How can we help you?'
  issueTextarea.required = true

  const formActions = document.createElement('div')
  formActions.className = 'chatbot-form-actions'

  const cancelBtn = document.createElement('button')
  cancelBtn.type = 'button'
  cancelBtn.className = 'chatbot-btn-secondary'
  cancelBtn.innerHTML =
    '<i data-lucide=\"arrow-left\" aria-hidden=\"true\" style=\"width: 16px; height: 16px;\"></i> Back'

  const submitBtn = document.createElement('button')
  submitBtn.type = 'submit'
  submitBtn.className = 'chatbot-btn-primary'
  submitBtn.textContent = 'Send Message'

  formActions.append(cancelBtn, submitBtn)
  humanForm.append(
    createFormGroup('Name', nameInput),
    createFormGroup('Email', emailInput),
    createFormGroup('Description', issueTextarea),
    formActions,
  )

  const humanSuccess = document.createElement('div')
  humanSuccess.className = 'chatbot-human-success'

  const successIcon = document.createElement('div')
  successIcon.className = 'chatbot-success-icon'
  successIcon.innerHTML = '<i data-lucide=\"check-circle\" aria-hidden=\"true\"></i>'

  const successTitle = document.createElement('h3')
  successTitle.textContent = 'Message Sent!'

  const successMsg = document.createElement('p')
  successMsg.textContent = 'Our support team will reach out to you via email shortly.'

  const successBackBtn = document.createElement('button')
  successBackBtn.type = 'button'
  successBackBtn.className = 'chatbot-btn-primary'
  successBackBtn.textContent = 'Back to Chat'

  humanSuccess.append(successIcon, successTitle, successMsg, successBackBtn)
  humanContainer.append(humanHeader, humanForm, humanSuccess)

  return {
    humanContainer,
    humanForm,
    cancelBtn,
    successBackBtn,
  }
}

export const createChatbotWidget = (
  options: ChatbotWidgetOptions = {},
): ChatbotWidgetInstance => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    throw new Error('chatbot-package can only run in a browser environment.')
  }

  ensureStyles()

  const config: ResolvedOptions = { ...DEFAULT_OPTIONS, ...options }
  const root = document.createElement('div')
  root.className = `chatbot-widget-root ${
    config.position === 'bottom-left' ? 'left' : 'right'
  }`
  root.style.setProperty('--chatbot-primary', config.primaryColor)
  root.style.zIndex = String(config.zIndex)

  const launcherButton = document.createElement('button')
  launcherButton.type = 'button'
  launcherButton.className = 'chatbot-launcher'
  launcherButton.setAttribute('aria-label', 'Open chatbot')
  launcherButton.setAttribute('aria-expanded', 'false')
  launcherButton.innerHTML = '<i data-lucide="message-circle" aria-hidden="true"></i>'

  const panel = document.createElement('section')
  panel.className = 'chatbot-panel'
  panel.setAttribute('role', 'dialog')
  panel.setAttribute('aria-label', config.title)

  const closePanel = (): void => {
    root.classList.remove('open')
    launcherButton.setAttribute('aria-expanded', 'false')
  }

  const { header, statusText } = buildHeader(config, closePanel)
  const { body, humanDivider, messages } = buildBody(config)
  const { footer, inputRow, input, humanButton } = buildFooter(config)
  const humanButtonMarkup =
    '<i data-lucide="user-round" aria-hidden="true"></i><span>Talk to a real human</span>'
  const aiButtonMarkup =
    '<i data-lucide="bot" aria-hidden="true"></i><span>Talk to AI</span>'
  humanButton.innerHTML = humanButtonMarkup

  const { humanContainer, humanForm, cancelBtn, successBackBtn } = buildHumanContainer()

  panel.append(header, body, footer, humanContainer)
  root.append(panel, launcherButton)
  document.body.appendChild(root)
  hydrateIcons()

  let isOpen = false
  let isDestroyed = false
  let isHumanChatActive = false
  let isHumanAgentConnected = false
  let isHumanConnecting = false
  let agentJoinedNoticeSent = false
  let awaitingHumanIssue = false
  let widgetSocket: Socket | null = null
  let widgetSessionId: string | null = null
  let widgetTicketId: string | null = null
  const seenMessageIds = new Set<string>()

  const appendBotBubble = (text: string, options?: { markdown?: boolean }): void => {
    if (!text.trim()) return
    body.classList.add('has-messages')
    messages.appendChild(createBubble(text.trim(), 'bot', options?.markdown ?? false))
    body.scrollTop = body.scrollHeight
  }

  const setHumanMode = (enabled: boolean): void => {
    body.classList.toggle('human-mode', enabled)
    if (enabled) {
      if (!messages.contains(humanDivider)) {
        messages.insertBefore(humanDivider, messages.firstChild)
      }
      humanButton.innerHTML = aiButtonMarkup
    } else {
      if (messages.contains(humanDivider)) {
        humanDivider.remove()
      }
      humanButton.innerHTML = humanButtonMarkup
    }
    hydrateIcons()
  }

  const setOpen = (nextOpen: boolean): void => {
    if (isDestroyed) {
      return
    }

    isOpen = nextOpen
    root.classList.toggle('open', isOpen)
    launcherButton.setAttribute('aria-expanded', String(isOpen))

    if (isOpen) {
      window.setTimeout(() => input.focus(), 0)
    }
  }

  const appendBotReply = async (message: string): Promise<void> => {
    if (isHumanChatActive && widgetSocket) {
      widgetSocket.emit('widget:message', { text: message })
      return
    }

    if (options.onUserMessage) {
      const result = await options.onUserMessage(message)
      if (typeof result === 'string' && result.trim()) {
        appendBotBubble(result)
      }
      return
    }

    if (options.aiSupport) {
      try {
        const apiBaseUrl = resolveApiBase(options.aiSupport.apiBaseUrl)
        const chatPath = resolveApiPath(options.aiSupport.chatPath || '/rag/chat')
        const response = await fetch(`${apiBaseUrl}${chatPath}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': options.aiSupport.apiKey,
          },
          body: JSON.stringify({
            query: message,
          }),
        })

        if (!response.ok) {
          throw new Error('Unable to fetch chatbot response right now.')
        }

        const data = unwrapResponseData<Record<string, unknown>>(await response.json())
        const answer =
          (typeof data?.answer === 'string' && data.answer) ||
          (typeof data?.response === 'string' && data.response) ||
          (typeof data?.message === 'string' && data.message) ||
          'I processed your question, but no answer text was returned.'
        appendBotBubble(answer, { markdown: true })
        if (data?.raise_ticket && data?.ticket_payload) {
          const payload = data.ticket_payload as {
            summary?: string
            priority?: string
            urgency?: string
          }
          const ticketId =
            (data as any)?.ticket?._id ||
            (data as any)?.ticketId ||
            (data as any)?.ticket_id
          const details = [
            '### Ticket Details',
            payload?.summary ? `- Summary: ${payload.summary}` : null,
            payload?.priority ? `- Priority: ${String(payload.priority).toUpperCase()}` : null,
            payload?.urgency ? `- Urgency: ${String(payload.urgency).toUpperCase()}` : null,
            ticketId ? `- Ticket ID: ${ticketId}` : null,
            '- Status: Pending',
          ].filter(Boolean) as string[]
          appendBotBubble(details.join('\n'), { markdown: true })
        }
      } catch (error) {
        const msg = error instanceof Error
          ? error.message
          : 'Sorry, I am having trouble connecting right now.'
        appendBotBubble(
          msg.includes('Failed to fetch')
            ? 'Unable to reach the AI server. Please try again.'
            : msg,
        )
      }
      return
    }

    appendBotBubble(`Thanks! ${config.botName} received: "${message}"`)
  }

  const connectHumanSupport = async (payload: {
    name: string
    email: string
    issue: string
  }): Promise<void> => {
    if (!config.humanSupport) {
      appendBotBubble('Human support is not configured for this widget yet.')
      return
    }

    const widgetKey = config.humanSupport.widgetKey || options.aiSupport?.apiKey
    if (!widgetKey) {
      throw new Error('Human support requires a widget key or aiSupport.apiKey.')
    }

    const apiBaseUrl = resolveApiBase(config.humanSupport.apiBaseUrl)
    const response = await fetch(`${apiBaseUrl}/widget/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        widgetKey,
        visitorName: payload.name,
        visitorEmail: payload.email,
        issue: payload.issue,
      }),
    })

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => null)
      const msg =
        errorPayload?.message ||
        errorPayload?.error ||
        'Unable to connect to human support right now.'
      throw new Error(msg)
    }

    const sessionData = unwrapResponseData<{
      sessionId: string
      ticketId: string
      chatToken: string
    }>(await response.json())

    widgetSessionId = sessionData.sessionId
    widgetTicketId = sessionData.ticketId
    isHumanChatActive = true
    setHumanMode(true)

    const socket = io(resolveSocketBase(apiBaseUrl), {
      path: '/socket.io',
      transports: ['websocket'],
      auth: {
        token: sessionData.chatToken,
      },
    })
    widgetSocket = socket

    socket.on('connect', () => {
      statusText.textContent = 'Connecting to a human agent...'
    })

    socket.on('disconnect', () => {
      if (isHumanChatActive) {
        statusText.textContent = 'Reconnecting to human support...'
      }
    })

    socket.on(
      'chat:message',
      (event: { _id?: string; sessionId?: string | null; sender?: string; text?: string }) => {
        if (event.sessionId !== widgetSessionId) return
        if (event._id && seenMessageIds.has(event._id)) return
        if (event._id) seenMessageIds.add(event._id)
        if (event.sender === 'agent' && typeof event.text === 'string') {
          if (!isHumanAgentConnected) {
            appendBotBubble('You are now connected to a human agent.')
            messages.appendChild(createBubble('AGENT JOINED THE SESSION', 'system'))
            agentJoinedNoticeSent = true
          }
          appendBotBubble(event.text)
          isHumanAgentConnected = true
        }
      },
    )

    socket.on(
      'chat:ticket_status',
      (event: {
        sessionId?: string | null
        ticketId?: string | null
        status?: string
      }) => {
        const sameSession =
          (event.sessionId && event.sessionId === widgetSessionId) ||
          (event.ticketId && event.ticketId === widgetTicketId)
        if (!sameSession) return

        if (event.status === 'assigned') {
          if (!isHumanAgentConnected) {
            appendBotBubble('A human agent has accepted your chat. You are now connected.')
          }
          isHumanAgentConnected = true
          if (!agentJoinedNoticeSent) {
            messages.appendChild(createBubble('AGENT JOINED THE SESSION', 'system'))
            agentJoinedNoticeSent = true
          }
          statusText.textContent = 'Connected with human support'
          return
        }

        if (event.status === 'pending') {
          statusText.textContent = 'Connecting to a human agent...'
        }
      },
    )

    socket.on('chat:error', (event: { message?: string }) => {
      appendBotBubble(event.message || 'Support connection error. Please try again.')
    })

    socket.emit('widget:request_human', {
      name: payload.name,
      email: payload.email,
      issue: payload.issue,
    })
    statusText.textContent = 'Connecting to a human agent...'
  }

  const sendMessage = async (message: string): Promise<void> => {
    const cleaned = message.trim()
    if (!cleaned || isDestroyed) {
      return
    }

    if (awaitingHumanIssue) {
      body.classList.add('has-messages')
      setHumanMode(true)
      messages.appendChild(createBubble(cleaned, 'user'))
      input.value = ''
      body.scrollTop = body.scrollHeight
      awaitingHumanIssue = false
      try {
        await connectHumanSupport({
          name: 'Website Visitor',
          email: '',
          issue: cleaned,
        })
        appendBotBubble("You're now connected to a support agent. Please wait...")
        humanButton.innerHTML = aiButtonMarkup
        hydrateIcons()
      } catch (error) {
        const msg =
          error instanceof Error ? error.message : 'Unable to connect to support right now.'
        appendBotBubble(msg)
        awaitingHumanIssue = true
      }
      return
    }

    body.classList.add('has-messages')
    setHumanMode(isHumanChatActive)
    messages.appendChild(createBubble(cleaned, 'user'))
    input.value = ''
    body.scrollTop = body.scrollHeight
    await appendBotReply(cleaned)
  }

  launcherButton.addEventListener('click', () => {
    setOpen(!isOpen)
  })

  inputRow.addEventListener('submit', async (event) => {
    event.preventDefault()
    await sendMessage(input.value)
  })

  input.addEventListener('keydown', async (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      await sendMessage(input.value)
    }
  })

  humanButton.addEventListener('click', async () => {
    if (isHumanChatActive) {
      // Switch back to AI mode.
      isHumanChatActive = false
      isHumanAgentConnected = false
      awaitingHumanIssue = false
      setHumanMode(false)
      appendBotBubble('You are now chatting with AI again.')
      return
    }

    if (isHumanConnecting) {
      return
    }
    isHumanConnecting = true
    setHumanMode(true)
    appendBotBubble('Please describe the issue you are facing.')
    awaitingHumanIssue = true
    try {
      humanButton.innerHTML = aiButtonMarkup
      hydrateIcons()
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unable to connect to support right now.'
      appendBotBubble(msg.includes('Failed to fetch') ? 'Unable to reach support server. Please try again.' : msg)
      isHumanChatActive = false
      isHumanAgentConnected = false
      awaitingHumanIssue = false
      setHumanMode(false)
      humanButton.innerHTML = humanButtonMarkup
      hydrateIcons()
    } finally {
      isHumanConnecting = false
    }
  })

  cancelBtn.addEventListener('click', () => {
    // no-op (legacy)
  })

  humanForm.addEventListener('submit', async (event) => {
    event.preventDefault()
    // no-op (legacy)
  })

  successBackBtn.addEventListener('click', () => {
    root.classList.remove('show-human-form')
    root.classList.remove('show-human-success')
    humanForm.reset()
    
    body.classList.add('has-messages')
    messages.appendChild(
      createBubble(
        isHumanChatActive && widgetTicketId
          ? isHumanAgentConnected
            ? `You are now connected with our support team (ticket ${widgetTicketId.slice(-6)}).`
            : `Your ticket ${widgetTicketId.slice(-6)} is waiting for an available human agent.`
          : 'Your issue has been submitted. A human agent will contact you soon.',
        'bot',
      ),
    )
    body.scrollTop = body.scrollHeight
  })

  return {
    open: () => setOpen(true),
    close: () => setOpen(false),
    toggle: () => setOpen(!isOpen),
    sendMessage,
    destroy: () => {
      if (isDestroyed) {
        return
      }

      isDestroyed = true
      if (widgetSocket) {
        widgetSocket.close()
        widgetSocket = null
      }
      root.remove()
    },
  }
}
