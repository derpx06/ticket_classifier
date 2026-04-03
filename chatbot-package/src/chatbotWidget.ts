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
  botName: 'Assistant',
  title: 'Chat Support',
  subtitle: 'We usually reply in a few minutes',
  welcomeMessage: 'Hi! How can I help you today?',
  placeholder: 'Type your message...',
  primaryColor: '#2563eb',
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
  font-family: "Inter", "Segoe UI", Tahoma, sans-serif;
}

.chatbot-widget-root.right {
  right: 20px;
}

.chatbot-widget-root.left {
  left: 20px;
}

.chatbot-launcher {
  width: 56px;
  height: 56px;
  border-radius: 9999px;
  border: 0;
  background: var(--chatbot-primary);
  color: #ffffff;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  display: grid;
  place-items: center;
  font-size: 13px;
  font-weight: 700;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.chatbot-launcher:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 24px rgba(0, 0, 0, 0.25);
}

.chatbot-panel {
  width: min(360px, calc(100vw - 40px));
  height: min(520px, calc(100vh - 110px));
  border-radius: 18px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.25);
  background: #ffffff;
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
}

.chatbot-header h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
}

.chatbot-header p {
  margin: 4px 0 0;
  font-size: 12px;
  opacity: 0.92;
}

.chatbot-messages {
  flex: 1;
  padding: 14px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: #f8fafc;
}

.chatbot-bubble {
  max-width: 85%;
  border-radius: 12px;
  padding: 10px 12px;
  line-height: 1.35;
  font-size: 14px;
  white-space: pre-wrap;
}

.chatbot-bubble.bot {
  align-self: flex-start;
  background: #e2e8f0;
  color: #0f172a;
}

.chatbot-bubble.user {
  align-self: flex-end;
  background: var(--chatbot-primary);
  color: #ffffff;
}

.chatbot-input-row {
  border-top: 1px solid #e2e8f0;
  padding: 10px;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
  background: #ffffff;
}

.chatbot-input-row input {
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 10px 12px;
  outline: none;
  font-size: 14px;
}

.chatbot-input-row input:focus {
  border-color: var(--chatbot-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--chatbot-primary) 20%, transparent);
}

.chatbot-input-row button {
  border: 0;
  border-radius: 10px;
  background: var(--chatbot-primary);
  color: #ffffff;
  padding: 0 14px;
  font-weight: 600;
  cursor: pointer;
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
  launcherButton.ariaLabel = 'Open chatbot'
  launcherButton.setAttribute('aria-expanded', 'false')
  launcherButton.textContent = 'Chat'

  const panel = document.createElement('section')
  panel.className = 'chatbot-panel'
  panel.setAttribute('role', 'dialog')
  panel.setAttribute('aria-label', config.title)

  const header = document.createElement('header')
  header.className = 'chatbot-header'
  const title = document.createElement('h2')
  title.textContent = config.title
  const subtitle = document.createElement('p')
  subtitle.textContent = config.subtitle
  header.append(title, subtitle)

  const messages = document.createElement('div')
  messages.className = 'chatbot-messages'
  messages.appendChild(createBubble(config.welcomeMessage, 'bot'))

  const inputRow = document.createElement('form')
  inputRow.className = 'chatbot-input-row'

  const input = document.createElement('input')
  input.type = 'text'
  input.placeholder = config.placeholder

  const sendButton = document.createElement('button')
  sendButton.type = 'submit'
  sendButton.textContent = 'Send'

  inputRow.append(input, sendButton)
  panel.append(header, messages, inputRow)
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

    messages.scrollTop = messages.scrollHeight
  }

  const sendMessage = async (message: string): Promise<void> => {
    const cleaned = message.trim()
    if (!cleaned || isDestroyed) {
      return
    }

    messages.appendChild(createBubble(cleaned, 'user'))
    input.value = ''
    messages.scrollTop = messages.scrollHeight
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
