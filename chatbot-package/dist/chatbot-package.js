//#region src/chatbotWidget.ts
var e = "chatbot-package-styles", t = {
	botName: "Support Assistant",
	title: "Support Assistant",
	subtitle: "Online",
	welcomeMessage: "Hi there! I am your support assistant. Ask me anything.",
	placeholder: "Type your question...",
	primaryColor: "#ea7d80",
	position: "bottom-right",
	zIndex: 9999
}, n = "\n.chatbot-widget-root {\n  position: fixed;\n  bottom: 20px;\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n  font-family: \"Segoe UI\", Tahoma, Geneva, Verdana, sans-serif;\n}\n\n.chatbot-widget-root.right {\n  right: 20px;\n}\n\n.chatbot-widget-root.left {\n  left: 20px;\n}\n\n.chatbot-launcher {\n  width: 58px;\n  height: 58px;\n  border-radius: 9999px;\n  border: 0;\n  background: var(--chatbot-primary);\n  color: #ffffff;\n  box-shadow: 0 12px 26px rgba(22, 28, 45, 0.25);\n  cursor: pointer;\n  display: grid;\n  place-items: center;\n  font-size: 14px;\n  font-weight: 700;\n  transition: transform 0.18s ease, box-shadow 0.18s ease;\n}\n\n.chatbot-launcher:hover {\n  transform: translateY(-2px);\n  box-shadow: 0 16px 30px rgba(22, 28, 45, 0.3);\n}\n\n.chatbot-panel {\n  width: min(500px, calc(100vw - 30px));\n  height: min(720px, calc(100vh - 100px));\n  border-radius: 16px;\n  border: 1px solid #e5e7eb;\n  overflow: hidden;\n  box-shadow: 0 22px 50px rgba(15, 23, 42, 0.22);\n  background: #f9fafb;\n  display: none;\n  flex-direction: column;\n}\n\n.chatbot-widget-root.open .chatbot-panel {\n  display: flex;\n}\n\n.chatbot-header {\n  background: var(--chatbot-primary);\n  color: #ffffff;\n  padding: 14px 16px;\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 12px;\n}\n\n.chatbot-header-left {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n}\n\n.chatbot-avatar {\n  width: 46px;\n  height: 46px;\n  border-radius: 9999px;\n  background: #ffffff;\n  color: var(--chatbot-primary);\n  border: 2px solid rgba(255, 255, 255, 0.7);\n  display: grid;\n  place-items: center;\n  font-size: 18px;\n  font-weight: 700;\n}\n\n.chatbot-header-info h2 {\n  margin: 0;\n  font-size: 30px;\n  line-height: 1;\n  font-weight: 700;\n}\n\n.chatbot-status {\n  margin-top: 4px;\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  font-size: 24px;\n  font-weight: 500;\n}\n\n.chatbot-status-dot {\n  width: 10px;\n  height: 10px;\n  border-radius: 9999px;\n  background: #22c55e;\n}\n\n.chatbot-controls {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n\n.chatbot-controls button {\n  width: 36px;\n  height: 36px;\n  border-radius: 8px;\n  border: 1px solid rgba(255, 255, 255, 0.38);\n  background: rgba(255, 255, 255, 0.2);\n  color: #ffffff;\n  cursor: pointer;\n  font-size: 18px;\n  line-height: 1;\n  display: grid;\n  place-items: center;\n}\n\n.chatbot-body {\n  flex: 1;\n  overflow-y: auto;\n  padding: 22px 16px 12px;\n  background: #f3f4f6;\n}\n\n.chatbot-intro {\n  text-align: center;\n  color: #334155;\n}\n\n.chatbot-intro-icon {\n  width: 54px;\n  height: 54px;\n  border-radius: 9999px;\n  background: #f3ced2;\n  color: var(--chatbot-primary);\n  display: grid;\n  place-items: center;\n  font-size: 28px;\n  font-weight: 700;\n  margin: 0 auto 18px;\n}\n\n.chatbot-intro h3 {\n  margin: 0;\n  font-size: 42px;\n  color: #0f172a;\n}\n\n.chatbot-intro p {\n  margin: 14px auto 0;\n  max-width: 420px;\n  font-size: 17px;\n  line-height: 1.45;\n  color: #475569;\n}\n\n.chatbot-intro .chatbot-human-note {\n  margin-top: 20px;\n  font-style: italic;\n  color: #7c8697;\n}\n\n.chatbot-messages {\n  display: none;\n  flex-direction: column;\n  gap: 10px;\n  margin-top: 18px;\n}\n\n.chatbot-body.has-messages .chatbot-intro {\n  display: none;\n}\n\n.chatbot-body.has-messages .chatbot-messages {\n  display: flex;\n}\n\n.chatbot-bubble {\n  max-width: 86%;\n  border-radius: 12px;\n  padding: 10px 12px;\n  line-height: 1.4;\n  font-size: 14px;\n  white-space: pre-wrap;\n}\n\n.chatbot-bubble.user {\n  align-self: flex-end;\n  background: var(--chatbot-primary);\n  color: #ffffff;\n}\n\n.chatbot-bubble.bot {\n  align-self: flex-start;\n  background: #e6e9ee;\n  color: #1e293b;\n}\n\n.chatbot-footer {\n  border-top: 1px solid #e5e7eb;\n  background: #f9fafb;\n  padding: 12px 14px 14px;\n}\n\n.chatbot-input-row {\n  display: grid;\n  grid-template-columns: 1fr auto;\n  gap: 8px;\n  margin-bottom: 10px;\n}\n\n.chatbot-input-row input {\n  border: 2px solid #f39da4;\n  border-radius: 12px;\n  padding: 12px 14px;\n  outline: none;\n  font-size: 16px;\n  background: #ffffff;\n}\n\n.chatbot-input-row input:focus {\n  border-color: var(--chatbot-primary);\n  box-shadow: 0 0 0 3px rgba(234, 125, 128, 0.16);\n}\n\n.chatbot-input-row button {\n  width: 56px;\n  border: 0;\n  border-radius: 12px;\n  background: #efc0c4;\n  color: #ffffff;\n  font-size: 22px;\n  cursor: pointer;\n}\n\n.chatbot-human-button {\n  width: 100%;\n  border: 1px solid #d4d8df;\n  border-radius: 12px;\n  background: #ffffff;\n  color: #334155;\n  padding: 11px 12px;\n  font-size: 18px;\n  cursor: pointer;\n}\n\n.chatbot-powered {\n  margin: 10px 0 0;\n  text-align: center;\n  font-size: 12px;\n  color: #98a2b3;\n}\n\n.chatbot-powered strong {\n  color: #5f6d85;\n}\n\n@media (max-width: 640px) {\n  .chatbot-widget-root.right,\n  .chatbot-widget-root.left {\n    right: 10px;\n    left: 10px;\n  }\n\n  .chatbot-panel {\n    width: 100%;\n    height: min(700px, calc(100vh - 90px));\n  }\n\n  .chatbot-header-info h2 {\n    font-size: 24px;\n  }\n\n  .chatbot-status {\n    font-size: 18px;\n  }\n\n  .chatbot-intro h3 {\n    font-size: 34px;\n  }\n}\n", r = () => {
	if (document.getElementById(e)) return;
	let t = document.createElement("style");
	t.id = e, t.textContent = n, document.head.appendChild(t);
}, i = (e, t) => {
	let n = document.createElement("div");
	return n.className = `chatbot-bubble ${t}`, n.textContent = e, n;
}, a = (e, t, n) => {
	let r = document.createElement("button");
	return r.type = "button", r.textContent = e, r.setAttribute("aria-label", t), n && r.addEventListener("click", n), r;
}, o = (e = {}) => {
	if (typeof window > "u" || typeof document > "u") throw Error("chatbot-package can only run in a browser environment.");
	r();
	let n = {
		...t,
		...e
	}, o = document.createElement("div");
	o.className = `chatbot-widget-root ${n.position === "bottom-left" ? "left" : "right"}`, o.style.setProperty("--chatbot-primary", n.primaryColor), o.style.zIndex = String(n.zIndex);
	let s = document.createElement("button");
	s.type = "button", s.className = "chatbot-launcher", s.setAttribute("aria-label", "Open chatbot"), s.setAttribute("aria-expanded", "false"), s.textContent = "Chat";
	let c = document.createElement("section");
	c.className = "chatbot-panel", c.setAttribute("role", "dialog"), c.setAttribute("aria-label", n.title);
	let l = document.createElement("header");
	l.className = "chatbot-header";
	let u = document.createElement("div");
	u.className = "chatbot-header-left";
	let d = document.createElement("div");
	d.className = "chatbot-avatar", d.textContent = "A";
	let f = document.createElement("div");
	f.className = "chatbot-header-info";
	let p = document.createElement("h2");
	p.textContent = n.title;
	let m = document.createElement("div");
	m.className = "chatbot-status";
	let h = document.createElement("span");
	h.className = "chatbot-status-dot";
	let g = document.createElement("span");
	g.textContent = n.subtitle, m.append(h, g), f.append(p, m), u.append(d, f);
	let _ = document.createElement("div");
	_.className = "chatbot-controls";
	let v = a("o", "Help"), y = a("-", "Minimize chat", () => {
		o.classList.remove("open"), s.setAttribute("aria-expanded", "false");
	}), b = a("x", "Close chat", () => {
		o.classList.remove("open"), s.setAttribute("aria-expanded", "false");
	});
	_.append(v, y, b), l.append(u, _);
	let x = document.createElement("div");
	x.className = "chatbot-body";
	let S = document.createElement("section");
	S.className = "chatbot-intro";
	let C = document.createElement("div");
	C.className = "chatbot-intro-icon", C.textContent = "?";
	let w = document.createElement("h3");
	w.textContent = "Hi there!";
	let T = document.createElement("p");
	T.textContent = "I am your hopefully not annoying AI support assistant. Ask me anything!";
	let E = document.createElement("p");
	E.className = "chatbot-human-note", E.textContent = "If I cannot help, you can connect with our human support team.", S.append(C, w, T, E);
	let D = document.createElement("div");
	D.className = "chatbot-messages", D.appendChild(i(n.welcomeMessage, "bot")), x.append(S, D);
	let O = document.createElement("div");
	O.className = "chatbot-footer";
	let k = document.createElement("form");
	k.className = "chatbot-input-row";
	let A = document.createElement("input");
	A.type = "text", A.placeholder = n.placeholder;
	let j = document.createElement("button");
	j.type = "submit", j.textContent = ">", k.append(A, j);
	let M = document.createElement("button");
	M.type = "button", M.className = "chatbot-human-button", M.textContent = "Talk to a real human";
	let N = document.createElement("p");
	N.className = "chatbot-powered", N.innerHTML = "Powered by <strong>AI assistant</strong>", O.append(k, M, N), c.append(l, x, O), o.append(c, s), document.body.appendChild(o);
	let P = !1, F = !1, I = (e) => {
		F || (P = e, o.classList.toggle("open", P), s.setAttribute("aria-expanded", String(P)), P && window.setTimeout(() => A.focus(), 0));
	}, L = async (t) => {
		if (e.onUserMessage) {
			let n = await e.onUserMessage(t);
			typeof n == "string" && n.trim() && D.appendChild(i(n.trim(), "bot"));
		} else D.appendChild(i(`Thanks! ${n.botName} received: "${t}"`, "bot"));
		x.classList.add("has-messages"), x.scrollTop = x.scrollHeight;
	}, R = async (e) => {
		let t = e.trim();
		!t || F || (x.classList.add("has-messages"), D.appendChild(i(t, "user")), A.value = "", x.scrollTop = x.scrollHeight, await L(t));
	};
	return s.addEventListener("click", () => {
		I(!P);
	}), k.addEventListener("submit", async (e) => {
		e.preventDefault(), await R(A.value);
	}), {
		open: () => I(!0),
		close: () => I(!1),
		toggle: () => I(!P),
		sendMessage: R,
		destroy: () => {
			F || (F = !0, o.remove());
		}
	};
};
//#endregion
export { o as createChatbotWidget };
