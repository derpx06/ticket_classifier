import { io, type Socket } from 'socket.io-client'
import { DEFAULT_OPTIONS, HISTORY_PAGE_SIZE } from './widget/constants'
import { ensureStyles } from './widget/styles'
import { hydrateIcons } from './widget/icons'
import {
  resolveApiBase,
  resolveApiPath,
  resolveSocketBase,
  unwrapResponseData,
} from './widget/utils'
import { resolveHistoryKey, loadHistory, pushHistory } from './widget/history'
import {
  buildBody,
  buildFooter,
  buildHeader,
  buildHumanContainer,
  createBubble,
} from './widget/ui'
import type {
  ChatbotWidgetInstance,
  ChatbotWidgetOptions,
  ResolvedOptions,
} from './widget/types'

export type { ChatbotWidgetInstance, ChatbotWidgetOptions }

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
  const aiButtonMarkup = '<i data-lucide="bot" aria-hidden="true"></i><span>Talk to AI</span>'
  humanButton.innerHTML = humanButtonMarkup

  const { humanContainer, humanForm, cancelBtn, successBackBtn } = buildHumanContainer()

  const historyStorageKey = resolveHistoryKey(options)
  const messageHistory = loadHistory(historyStorageKey)
  let historyOffset = Math.max(messageHistory.length - HISTORY_PAGE_SIZE, 0)
  let isHistoryPaging = false

  const getHistoryInsertAnchor = (): ChildNode | null => {
    if (messages.contains(humanDivider)) {
      return humanDivider.nextSibling
    }
    return messages.firstChild
  }

  const renderHistoryWindow = (): void => {
    messages.innerHTML = ''
    const windowItems = messageHistory.slice(historyOffset)
    if (windowItems.length === 0) {
      return
    }
    body.classList.add('has-messages')
    windowItems.forEach((entry) => {
      messages.appendChild(createBubble(entry.text, entry.role, entry.role === 'bot'))
    })
    body.scrollTop = body.scrollHeight
  }

  const prependHistoryPage = (): void => {
    if (isHistoryPaging || historyOffset === 0) return
    isHistoryPaging = true
    const nextOffset = Math.max(historyOffset - HISTORY_PAGE_SIZE, 0)
    const chunk = messageHistory.slice(nextOffset, historyOffset)
    if (chunk.length === 0) {
      isHistoryPaging = false
      return
    }
    const prevScrollHeight = body.scrollHeight
    const prevScrollTop = body.scrollTop
    const anchor = getHistoryInsertAnchor()
    chunk.forEach((entry) => {
      messages.insertBefore(createBubble(entry.text, entry.role, entry.role === 'bot'), anchor)
    })
    historyOffset = nextOffset
    body.scrollTop = prevScrollTop + (body.scrollHeight - prevScrollHeight)
    isHistoryPaging = false
  }

  const handleHistoryScroll = (): void => {
    if (historyOffset === 0) return
    if (body.scrollTop <= 12) {
      prependHistoryPage()
    }
  }

  if (messageHistory.length > 0) {
    renderHistoryWindow()
  }

  body.addEventListener('scroll', handleHistoryScroll)

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

  const appendBotBubble = (
    text: string,
    options?: { markdown?: boolean; store?: boolean },
  ): void => {
    if (!text.trim()) return
    body.classList.add('has-messages')
    messages.appendChild(createBubble(text.trim(), 'bot', options?.markdown ?? false))
    body.scrollTop = body.scrollHeight
    if (options?.store && !isHumanChatActive) {
      pushHistory(historyStorageKey, messageHistory, { role: 'bot', text: text.trim() })
    }
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
        appendBotBubble(result, { store: true })
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
        appendBotBubble(answer, { markdown: true, store: true })
        if (data?.raise_ticket && data?.ticket_payload) {
          const payload = data.ticket_payload as {
            summary?: string
            priority?: string
            urgency?: string
          }
          const ticketId =
            (data as any)?.ticket?._id || (data as any)?.ticketId || (data as any)?.ticket_id
          const details = [
            '### Ticket Details',
            payload?.summary ? `- Summary: ${payload.summary}` : null,
            payload?.priority ? `- Priority: ${String(payload.priority).toUpperCase()}` : null,
            payload?.urgency ? `- Urgency: ${String(payload.urgency).toUpperCase()}` : null,
            ticketId ? `- Ticket ID: ${ticketId}` : null,
            '- Status: Pending',
          ].filter(Boolean) as string[]
          appendBotBubble(details.join('\n'), { markdown: true, store: true })
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

    appendBotBubble(`Thanks! ${config.botName} received: "${message}"`, { store: true })
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
        chatHistory: messageHistory,
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
      (event: { sessionId?: string | null; ticketId?: string | null; status?: string }) => {
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
      if (!isHumanChatActive) {
        pushHistory(historyStorageKey, messageHistory, { role: 'user', text: cleaned })
      }
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
    if (!isHumanChatActive) {
      pushHistory(historyStorageKey, messageHistory, { role: 'user', text: cleaned })
    }
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
    if (!awaitingHumanIssue) {
      appendBotBubble('Please describe the issue you are facing.')
      awaitingHumanIssue = true
    }
    try {
      humanButton.innerHTML = aiButtonMarkup
      hydrateIcons()
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unable to connect to support right now.'
      appendBotBubble(
        msg.includes('Failed to fetch') ? 'Unable to reach support server. Please try again.' : msg,
      )
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
      body.removeEventListener('scroll', handleHistoryScroll)
      if (widgetSocket) {
        widgetSocket.close()
        widgetSocket = null
      }
      root.remove()
    },
  }
}
