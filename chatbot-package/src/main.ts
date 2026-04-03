import { createChatbotWidget } from './index'

createChatbotWidget({
  title: 'Demo Assistant',
  subtitle: 'Widget preview running from chatbot-package',
  welcomeMessage: 'Hello! This is your chatbot widget preview.',
})

const app = document.getElementById('app')

if (app) {
  app.innerHTML = `
    <main style="font-family: Inter, Segoe UI, sans-serif; max-width: 720px; margin: 40px auto; padding: 0 16px; line-height: 1.5; color: #0f172a;">
      <h1 style="font-size: 2rem; margin-bottom: 0.5rem;">chatbot-package demo</h1>
      <p style="margin: 0; color: #475569;">Use the floating chat button in the bottom-right corner.</p>
    </main>
  `
}
