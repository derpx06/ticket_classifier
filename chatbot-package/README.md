# chatbot-package

Embeddable chatbot widget for websites.

## Install

```bash
npm install chatbot-package
```

## Usage

```ts
import { createChatbotWidget } from 'chatbot-package'

createChatbotWidget({
  title: 'Support',
  subtitle: 'We are online',
  welcomeMessage: 'Hi! Tell us how we can help.',
  primaryColor: '#0f766e',
  onUserMessage: async (message) => {
    // Call your backend/API here
    return `You said: ${message}`
  },
})
```

This creates:
- A floating circular chat button in the bottom-right corner
- A chat screen that opens when the button is clicked

## Options

- `botName?: string`
- `title?: string`
- `subtitle?: string`
- `welcomeMessage?: string`
- `placeholder?: string`
- `primaryColor?: string`
- `position?: 'bottom-right' | 'bottom-left'`
- `zIndex?: number`
- `onUserMessage?: (message: string) => string | Promise<string> | void`

## CLI

Use CLI like this:

```bash
npm run cli -- <command>
```

Interactive commands:

```bash
npm run cli -- crawl
npm run cli -- config
npm run cli -- ingest
npm run cli -- classify
npm run cli -- ask
npm run cli -- navigate
npm run cli -- act
npm run cli -- status
npm run cli -- hello
```

Each command asks for required parameters after command trigger.
Example: `npm run cli -- crawl` will ask URL and crawl depth interactively.

## Build

```bash
npm run build
```
