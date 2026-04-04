# ticket_classifier
An integrated support platform with:
- AI + human support chat widget
- Ticketing + agent dashboard
- Knowledge base indexing per website
- Vector search for smart query matching

## Projects
- `backend/` API + crawling + vector indexing
- `frontend/` main dashboard
- `dashboard-demo/` demo site that embeds the widget
- `chatbot-package/` widget package (builds into `dist/`)

## Quick Start
1. **Backend**
   - Configure env in `backend/.env`
   - Run: `npm run dev` in `backend/`
2. **Frontend**
   - Run: `npm run dev` in `frontend/`
3. **Widget package**
   - Run: `npm run build` in `chatbot-package/`

## Knowledge Base (per website)
- Each website has its own vector collection and stats.
- Crawls add pages to the same website knowledge base (not replace).

## API Key vs Widget Key
- **API Key** is used for AI chat and determines which website knowledge base is used.
- **Widget Key** is used for human support sessions.
- The widget package can auto-fetch a widget key from the backend using your API key.

## dashboard-demo configuration
In the demo UI:
- Use **API Base URL** (e.g. `http://127.0.0.1:5001/api`)
- Paste the **API key** from Knowledge Base → Deployment

## References
AI replies now append a **References** section when sources are returned from the backend.
