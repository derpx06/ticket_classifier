# ticket_classifier
An integrated support platform with:
- AI + human support chat widget
- Ticketing + agent dashboard
- Knowledge base indexing per website
- Vector search for smart query matching
<img width="1600" height="911" alt="image" src="https://github.com/user-attachments/assets/6dc0c52d-a7f4-4102-95b9-553e390ba8d9" />
<img width="1600" height="911" alt="image" src="https://github.com/user-attachments/assets/185014f8-3d83-4872-960f-407276e683fa" />
<img width="1600" height="911" alt="image" src="https://github.com/user-attachments/assets/8eb25a42-4f68-4c1e-a998-dbf6f28a2b8f" />
<img width="1600" height="911" alt="image" src="https://github.com/user-attachments/assets/8a66f3aa-04ca-4192-99c1-8ef9873d9644" />
<img width="1600" height="904" alt="image" src="https://github.com/user-attachments/assets/dd333895-bd8a-4e4d-bf3c-e1a3f1e0befe" />
<img width="1855" height="1158" alt="image" src="https://github.com/user-attachments/assets/058df3b6-29bb-4a21-9a3c-88e5e203a934" />

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
