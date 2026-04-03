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
  primaryColor: '#ea7d80',
  position: 'bottom-right',
  zIndex: 9999,
}

const WIDGET_CSS = `
.chatbot-widget-root {
  position: fixed;
  bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

.chatbot-widget-root.right {
  right: 20px;
}

.chatbot-widget-root.left {
  left: 20px;
}

.chatbot-launcher {
  width: 58px;
  height: 58px;
  border-radius: 9999px;
  border: 0;
  background: var(--chatbot-primary);
  color: #ffffff;
  box-shadow: 0 12px 26px rgba(22, 28, 45, 0.25);
  cursor: pointer;
  display: grid;
  place-items: center;
  font-size: 14px;
  font-weight: 700;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.chatbot-launcher:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 30px rgba(22, 28, 45, 0.3);
}

.chatbot-panel {
  width: min(500px, calc(100vw - 30px));
  height: min(720px, calc(100vh - 100px));
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  box-shadow: 0 22px 50px rgba(15, 23, 42, 0.22);
  background: #f9fafb;
  display: none;
  flex-direction: column;
}

.chatbot-widget-root.open .chatbot-panel {
  display: flex;
}

.chatbot-header {
  background: var(--chatbot-primary);
  color: #ffffff;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.chatbot-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.chatbot-avatar {
  width: 46px;
  height: 46px;
  border-radius: 9999px;
  background: #ffffff;
  color: var(--chatbot-primary);
  border: 2px solid rgba(255, 255, 255, 0.7);
  display: grid;
  place-items: center;
  font-size: 18px;
  font-weight: 700;
}

.chatbot-header-info h2 {
  margin: 0;
  font-size: 30px;
  line-height: 1;
  font-weight: 700;
}

.chatbot-status {
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 24px;
  font-weight: 500;
}

.chatbot-status-dot {
  width: 10px;
  height: 10px;
  border-radius: 9999px;
  background: #22c55e;
}

.chatbot-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.chatbot-controls button {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.38);
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  display: grid;
  place-items: center;
}

.chatbot-body {
  flex: 1;
  overflow-y: auto;
  padding: 22px 16px 12px;
  background: #f3f4f6;
}

.chatbot-intro {
  text-align: center;
  color: #334155;
}

.chatbot-intro-icon {
  width: 54px;
  height: 54px;
  border-radius: 9999px;
  background: #f3ced2;
  color: var(--chatbot-primary);
  display: grid;
  place-items: center;
  font-size: 28px;
  font-weight: 700;
  margin: 0 auto 18px;
}

.chatbot-intro h3 {
  margin: 0;
  font-size: 42px;
  color: #0f172a;
}

.chatbot-intro p {
  margin: 14px auto 0;
  max-width: 420px;
  font-size: 17px;
  line-height: 1.45;
  color: #475569;
}

.chatbot-intro .chatbot-human-note {
  margin-top: 20px;
  font-style: italic;
  color: #7c8697;
}

.chatbot-messages {
  display: none;
  flex-direction: column;
  gap: 10px;
  margin-top: 18px;
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
  padding: 10px 12px;
  line-height: 1.4;
  font-size: 14px;
  white-space: pre-wrap;
}

.chatbot-bubble.user {
  align-self: flex-end;
  background: var(--chatbot-primary);
  color: #ffffff;
}

.chatbot-bubble.bot {
  align-self: flex-start;
  background: #e6e9ee;
  color: #1e293b;
}

.chatbot-footer {
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
  padding: 12px 14px 14px;
}

.chatbot-input-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
  margin-bottom: 10px;
}

.chatbot-input-row input {
  border: 2px solid #f39da4;
  border-radius: 12px;
  padding: 12px 14px;
  outline: none;
  font-size: 16px;
  background: #ffffff;
}

.chatbot-input-row input:focus {
  border-color: var(--chatbot-primary);
  box-shadow: 0 0 0 3px rgba(234, 125, 128, 0.16);
}

.chatbot-input-row button {
  width: 56px;
  border: 0;
  border-radius: 12px;
  background: #efc0c4;
  color: #ffffff;
  font-size: 22px;
  cursor: pointer;
}

.chatbot-human-button {
  width: 100%;
  border: 1px solid #d4d8df;
  border-radius: 12px;
  background: #ffffff;
  color: #334155;
  padding: 11px 12px;
  font-size: 18px;
  cursor: pointer;
}

.chatbot-powered {
  margin: 10px 0 0;
  text-align: center;
  font-size: 12px;
  color: #98a2b3;
}

.chatbot-powered strong {
  color: #5f6d85;
}

@media (max-width: 640px) {
  .chatbot-widget-root.right,
  .chatbot-widget-root.left {
    right: 10px;
    left: 10px;
  }

  .chatbot-panel {
    width: 100%;
    height: min(700px, calc(100vh - 90px));
  }

  .chatbot-header-info h2 {
    font-size: 24px;
  }

  .chatbot-status {
    font-size: 18px;
  }

  .chatbot-intro h3 {
    font-size: 34px;
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
  label: string,
  ariaLabel: string,
  onClick?: () => void,
): HTMLButtonElement => {
  const button = document.createElement('button')
  button.type = 'button'
  button.textContent = label
  button.setAttribute('aria-label', ariaLabel)
  if (onClick) {
    button.addEventListener('click', onClick)
  }
  return button
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
  launcherButton.textContent = 'Chat'

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
  avatar.textContent = 'A'

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

  const helpControl = createControlButton('o', 'Help')
  const minimizeControl = createControlButton('-', 'Minimize chat', () => {
    root.classList.remove('open')
    launcherButton.setAttribute('aria-expanded', 'false')
  })
  const closeControl = createControlButton('x', 'Close chat', () => {
    root.classList.remove('open')
    launcherButton.setAttribute('aria-expanded', 'false')
  })

  controls.append(helpControl, minimizeControl, closeControl)
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
  introDescription.textContent =
    'I am your hopefully not annoying AI support assistant. Ask me anything!'

  const introHumanNote = document.createElement('p')
  introHumanNote.className = 'chatbot-human-note'
  introHumanNote.textContent =
    "If I cannot help, you can connect with our human support team."

  intro.append(introIcon, introTitle, introDescription, introHumanNote)

  const messages = document.createElement('div')
  messages.className = 'chatbot-messages'
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
  sendButton.textContent = '>'

  inputRow.append(input, sendButton)

  const humanButton = document.createElement('button')
  humanButton.type = 'button'
  humanButton.className = 'chatbot-human-button'
  humanButton.textContent = 'Talk to a real human'

  const poweredText = document.createElement('p')
  poweredText.className = 'chatbot-powered'
  poweredText.innerHTML = 'Powered by <strong>AI assistant</strong>'

  footer.append(inputRow, humanButton, poweredText)

  panel.append(header, body, footer)
  root.append(panel, launcherButton)
  document.body.appendChild(root)

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
