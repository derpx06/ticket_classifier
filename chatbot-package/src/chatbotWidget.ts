import {
  Bot,
  MessageCircle,
  SendHorizontal,
  UserRound,
  X,
  createIcons,
} from 'lucide'

export interface ChatbotWidgetOptions {
  botName?: string
  title?: string
  subtitle?: string
  welcomeMessage?: string
  placeholder?: string
  primaryColor?: string
  position?: 'bottom-right' | 'bottom-left'
  zIndex?: number
  onUserMessage?: (message: string) => string | Promise<string> | void
}

export interface ChatbotWidgetInstance {
  open: () => void
  close: () => void
  toggle: () => void
  destroy: () => void
  sendMessage: (message: string) => Promise<void>
}

const STYLE_ID = 'chatbot-package-styles'

const DEFAULT_OPTIONS: Required<Omit<ChatbotWidgetOptions, 'onUserMessage'>> = {
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

.chatbot-input-row input:focus {
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

const createBubble = (text: string, role: 'user' | 'bot'): HTMLDivElement => {
  const bubble = document.createElement('div')
  bubble.className = `chatbot-bubble ${role}`
  bubble.textContent = text
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
    },
  })
}

export const createChatbotWidget = (
  options: ChatbotWidgetOptions = {},
): ChatbotWidgetInstance => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    throw new Error('chatbot-package can only run in a browser environment.')
  }

  ensureStyles()

  const config = { ...DEFAULT_OPTIONS, ...options }
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

  const closePanel = (): void => {
    root.classList.remove('open')
    launcherButton.setAttribute('aria-expanded', 'false')
  }

  const closeControl = createControlButton('x', 'Close chat', closePanel)

  controls.append(closeControl)
  header.append(headerLeft, controls)

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

  const messages = document.createElement('div')
  messages.className = 'chatbot-messages'
  messages.setAttribute('aria-live', 'polite')
  messages.appendChild(createBubble(config.welcomeMessage, 'bot'))

  body.append(intro, messages)

  const footer = document.createElement('div')
  footer.className = 'chatbot-footer'

  const inputRow = document.createElement('form')
  inputRow.className = 'chatbot-input-row'

  const input = document.createElement('input')
  input.type = 'text'
  input.placeholder = config.placeholder

  const sendButton = document.createElement('button')
  sendButton.type = 'submit'
  sendButton.setAttribute('aria-label', 'Send message')
  sendButton.innerHTML = '<i data-lucide="send-horizontal" aria-hidden="true"></i>'

  inputRow.append(input, sendButton)

  const humanButton = document.createElement('button')
  humanButton.type = 'button'
  humanButton.className = 'chatbot-human-button'
  humanButton.innerHTML =
    '<i data-lucide="user-round" aria-hidden="true"></i><span>Talk to a real human</span>'

  const poweredText = document.createElement('p')
  poweredText.className = 'chatbot-powered'
  poweredText.innerHTML = 'Powered by <strong>AI assistant</strong>'

  footer.append(inputRow, humanButton, poweredText)

  panel.append(header, body, footer)
  root.append(panel, launcherButton)
  document.body.appendChild(root)
  hydrateIcons()

  let isOpen = false
  let isDestroyed = false

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
    if (options.onUserMessage) {
      const result = await options.onUserMessage(message)
      if (typeof result === 'string' && result.trim()) {
        messages.appendChild(createBubble(result.trim(), 'bot'))
      }
    } else {
      messages.appendChild(
        createBubble(`Thanks! ${config.botName} received: "${message}"`, 'bot'),
      )
    }

    body.classList.add('has-messages')
    body.scrollTop = body.scrollHeight
  }

  const sendMessage = async (message: string): Promise<void> => {
    const cleaned = message.trim()
    if (!cleaned || isDestroyed) {
      return
    }

    body.classList.add('has-messages')
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

  humanButton.addEventListener('click', () => {
    body.classList.add('has-messages')
    messages.appendChild(
      createBubble('Sure - we will connect you with a human support teammate.', 'bot'),
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
      root.remove()
    },
  }
}
