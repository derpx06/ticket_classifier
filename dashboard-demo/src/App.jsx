import { useEffect } from 'react'
import { createChatbotWidget } from 'chatbot-package'

const stats = [
  { title: 'Open Tickets', value: '124' },
  { title: 'Resolved Today', value: '39' },
  { title: 'Avg. Response', value: '6m' },
]

const tickets = [
  { id: '#1041', customer: 'Acme Corp', issue: 'Billing cycle confusion', status: 'Open' },
  { id: '#1042', customer: 'GreenHub', issue: 'Email verification failed', status: 'In Progress' },
  { id: '#1043', customer: 'Nova Retail', issue: 'Unable to add team member', status: 'Open' },
]

export default function App() {
  useEffect(() => {
    const testCompanyKey = '74a7902e-f67c-429b-8e35-ee212a6a0d8d'
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'

    const widget = createChatbotWidget({
      title: 'Support Assistant',
      subtitle: 'Online',
      welcomeMessage: 'Hi! Welcome to the React dashboard demo. How can I help?',
      placeholder: 'Ask a support question...',
      primaryColor: '#2563eb',
      onUserMessage: async (message) => {
        try {
          const response = await fetch(`${apiBaseUrl}/api/rag/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: message, sessionId: 'demo-session' })
          });
          const data = await response.json();
          return data.answer;
        } catch (error) {
          console.error('Chat error:', error);
          return "Sorry, I'm having trouble connecting to the support server.";
        }
      },
      onTalkToHumanClick: async () => {
        try {
          const response = await fetch(`${apiBaseUrl}/api/createTicket`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              apiKey: testCompanyKey,
              companyId: testCompanyKey,
              customerName: 'Dashboard Demo User',
              message: 'Customer clicked Talk to a real human from dashboard demo (static test ticket).',
              category: 'other',
              priority: 'medium',
              urgency: 'medium',
              chatHistory: [
                { role: 'user', text: 'I need to speak with a human agent.' },
                { role: 'bot', text: 'Sure, creating a ticket for handoff.' },
              ],
            }),
          })

          const data = await response.json().catch(() => null)

          if (!response.ok) {
            const apiMessage = data?.message || data?.error || 'Unable to create ticket.'
            throw new Error(
              `createTicket failed (${response.status} ${response.statusText}): ${apiMessage}`,
            )
          }

          const ticketId = data?.ticketId || data?.data?.ticketId || data?.data?._id || 'created'
          return `Ticket ${ticketId} created. A human agent will follow up shortly.`
        } catch (error) {
          console.error('Create ticket error:', {
            error,
            message: error?.message,
          })
          return `Could not create ticket: ${error?.message || 'Unknown error'}`
        }
      },

    })

    return () => widget.destroy()
  }, [])

  return (
    <div className="layout">
      <aside className="sidebar">
        <h2>Demo Admin</h2>
        <nav>
          <a href="#" className="active">Overview</a>
          <a href="#">Customers</a>
          <a href="#">Tickets</a>
          <a href="#">Reports</a>
          <a href="#">Settings</a>
        </nav>
      </aside>

      <main className="content">
        <header className="topbar">
          <h1>Support Dashboard</h1>
          <button type="button">Create Ticket</button>
        </header>

        <section className="cards">
          {stats.map((item) => (
            <article key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.value}</p>
            </article>
          ))}
        </section>

        <section className="table-wrap">
          <h2>Recent Issues</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Issue</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((row) => (
                <tr key={row.id}>
                  <td>{row.id}</td>
                  <td>{row.customer}</td>
                  <td>{row.issue}</td>
                  <td><span className="pill">{row.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  )
}
