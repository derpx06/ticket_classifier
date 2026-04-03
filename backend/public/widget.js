(function () {
    // 1. Configuration
    const config = window.SUPPORT_BOT_CONFIG || {};
    const API_BASE = "http://localhost:3000/api"; // Update this for production

    // 2. State
    let isOpen = false;
    let sessionId = 'sess_' + Math.random().toString(36).substring(7);

    // 3. Create UI
    const container = document.createElement('div');
    container.id = 'support-bot-container';
    document.body.appendChild(container);

    const style = document.createElement('style');
    style.textContent = `
    #support-bot-bubble {
      position: fixed; bottom: 20px; right: 20px;
      width: 60px; height: 60px; border-radius: 30px;
      background: #4f46e5; color: white;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 999998; transition: transform 0.2s;
    }
    #support-bot-bubble:hover { transform: scale(1.05); }
    #support-bot-window {
      position: fixed; bottom: 90px; right: 20px;
      width: 380px; height: 500px; border-radius: 20px;
      background: white; border: 1px solid #e2e8f0;
      box-shadow: 0 10px 25px rgba(0,0,0,0.1);
      z-index: 999999; display: none; flex-direction: column;
      overflow: hidden; font-family: sans-serif;
    }
    #support-bot-header {
      background: #4f46e5; color: white; padding: 20px;
      font-weight: bold; font-size: 16px; display: flex; justify-content: space-between;
    }
    #support-bot-messages {
      flex: 1; padding: 20px; overflow-y: auto; background: #f8fafc;
      display: flex; flex-direction: column; gap: 12px;
    }
    .sb-msg { padding: 10px 14px; border-radius: 12px; max-width: 80%; font-size: 14px; line-height: 1.4; }
    .sb-msg-user { align-self: flex-end; background: #4f46e5; color: white; }
    .sb-msg-bot { align-self: flex-start; background: white; border: 1px solid #e2e8f0; color: #1e293b; }
    #support-bot-input-area { padding: 15px; border-top: 1px solid #e2e8f0; display: flex; gap: 10px; }
    #support-bot-input {
      flex: 1; border: 1px solid #e2e8f0; border-radius: 8px;
      padding: 8px 12px; outline: none; font-size: 14px;
    }
    #support-bot-send {
      background: #4f46e5; color: white; border: none;
      padding: 8px 15px; border-radius: 8px; cursor: pointer; font-weight: bold;
    }
  `;
    document.head.appendChild(style);

    container.innerHTML = `
    <div id="support-bot-bubble">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
    </div>
    <div id="support-bot-window">
      <div id="support-bot-header">
        <span>Support Assistant</span>
        <span id="sb-close" style="cursor:pointer">×</span>
      </div>
      <div id="support-bot-messages">
        <div class="sb-msg sb-msg-bot">Hi! How can I help you today?</div>
      </div>
      <form id="support-bot-input-area">
        <input type="text" id="support-bot-input" placeholder="Type a message..." autocomplete="off">
        <button type="submit" id="support-bot-send">Send</button>
      </form>
    </div>
  `;

    // 4. Logic
    const bubble = document.getElementById('support-bot-bubble');
    const windowEl = document.getElementById('support-bot-window');
    const closeBtn = document.getElementById('sb-close');
    const messages = document.getElementById('support-bot-messages');
    const form = document.getElementById('support-bot-input-area');
    const input = document.getElementById('support-bot-input');

    bubble.onclick = () => {
        isOpen = !isOpen;
        windowEl.style.display = isOpen ? 'flex' : 'none';
    };
    closeBtn.onclick = () => {
        isOpen = false;
        windowEl.style.display = 'none';
    };

    form.onsubmit = async (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;

        // Add user message
        addMessage(text, 'user');
        input.value = '';

        // Add loading indicator
        const loading = addMessage('...', 'bot');

        try {
            const response = await fetch(\`\${API_BASE}/rag/chat\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': config.apiKey || ''
        },
        body: JSON.stringify({
          query: text,
          sessionId: sessionId
        })
      });

      const data = await response.json();
      loading.remove();
      addMessage(data.answer, 'bot');
    } catch (err) {
      loading.remove();
      addMessage("Sorry, I'm having trouble connecting. Please try again later.", 'bot');
    }
  };

  function addMessage(text, role) {
    const div = document.createElement('div');
    div.className = \`sb-msg sb-msg-\${role}\`;
    div.innerText = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
    return div;
  }
})();
