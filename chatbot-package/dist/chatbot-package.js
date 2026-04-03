//#region node_modules/lucide/dist/esm/defaultAttributes.js
var e = {
	xmlns: "http://www.w3.org/2000/svg",
	width: 24,
	height: 24,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	"stroke-width": 2,
	"stroke-linecap": "round",
	"stroke-linejoin": "round"
}, t = ([e, n, r]) => {
	let i = document.createElementNS("http://www.w3.org/2000/svg", e);
	return Object.keys(n).forEach((e) => {
		i.setAttribute(e, String(n[e]));
	}), r?.length && r.forEach((e) => {
		let n = t(e);
		i.appendChild(n);
	}), i;
}, n = (n, r = {}) => t([
	"svg",
	{
		...e,
		...r
	},
	n
]), r = (e) => {
	for (let t in e) if (t.startsWith("aria-") || t === "role" || t === "title") return !0;
	return !1;
}, i = (...e) => e.filter((e, t, n) => !!e && e.trim() !== "" && n.indexOf(e) === t).join(" ").trim(), a = (e) => e.replace(/^([A-Z])|[\s-_]+(\w)/g, (e, t, n) => n ? n.toUpperCase() : t.toLowerCase()), o = (e) => {
	let t = a(e);
	return t.charAt(0).toUpperCase() + t.slice(1);
}, s = (e) => Array.from(e.attributes).reduce((e, t) => (e[t.name] = t.value, e), {}), c = (e) => typeof e == "string" ? e : !e || !e.class ? "" : e.class && typeof e.class == "string" ? e.class.split(" ") : e.class && Array.isArray(e.class) ? e.class : "", l = (t, { nameAttr: a, icons: l, attrs: u }) => {
	let d = t.getAttribute(a);
	if (d == null) return;
	let f = l[o(d)];
	if (!f) return console.warn(`${t.outerHTML} icon name was not found in the provided icons object.`);
	let p = s(t), m = r(p) ? {} : { "aria-hidden": "true" }, h = {
		...e,
		"data-lucide": d,
		...m,
		...u,
		...p
	}, g = c(p), _ = c(u), v = i("lucide", `lucide-${d}`, ...g, ..._);
	v && Object.assign(h, { class: v });
	let y = n(f, h);
	return t.parentNode?.replaceChild(y, t);
}, u = [
	["path", { d: "M12 8V4H8" }],
	["rect", {
		width: "16",
		height: "12",
		x: "4",
		y: "8",
		rx: "2"
	}],
	["path", { d: "M2 14h2" }],
	["path", { d: "M20 14h2" }],
	["path", { d: "M15 13v2" }],
	["path", { d: "M9 13v2" }]
], d = [["path", { d: "M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719" }]], f = [["path", { d: "M3.714 3.048a.498.498 0 0 0-.683.627l2.843 7.627a2 2 0 0 1 0 1.396l-2.842 7.627a.498.498 0 0 0 .682.627l18-8.5a.5.5 0 0 0 0-.904z" }], ["path", { d: "M6 12h16" }]], p = [["circle", {
	cx: "12",
	cy: "8",
	r: "5"
}], ["path", { d: "M20 21a8 8 0 0 0-16 0" }]], m = [["path", { d: "M18 6 6 18" }], ["path", { d: "m6 6 12 12" }]], h = ({ icons: e = {}, nameAttr: t = "data-lucide", attrs: n = {}, root: r = document, inTemplates: i } = {}) => {
	if (!Object.values(e).length) throw Error("Please provide an icons object.\nIf you want to use all the icons you can import it like:\n `import { createIcons, icons } from 'lucide';\nlucide.createIcons({icons});`");
	if (r === void 0) throw Error("`createIcons()` only works in a browser environment.");
	if (Array.from(r.querySelectorAll(`[${t}]`)).forEach((r) => l(r, {
		nameAttr: t,
		icons: e,
		attrs: n
	})), i && Array.from(r.querySelectorAll("template")).forEach((r) => h({
		icons: e,
		nameAttr: t,
		attrs: n,
		root: r.content,
		inTemplates: i
	})), t === "data-lucide") {
		let t = r.querySelectorAll("[icon-name]");
		t.length > 0 && (console.warn("[Lucide] Some icons were found with the now deprecated icon-name attribute. These will still be replaced for backwards compatibility, but will no longer be supported in v1.0 and you should switch to data-lucide"), Array.from(t).forEach((t) => l(t, {
			nameAttr: "icon-name",
			icons: e,
			attrs: n
		})));
	}
}, g = "chatbot-package-styles", _ = {
	botName: "Support Assistant",
	title: "Support Assistant",
	subtitle: "Online",
	welcomeMessage: "Hi there! I am your support assistant. Ask me anything.",
	placeholder: "Type your question...",
	primaryColor: "#2563eb",
	position: "bottom-right",
	zIndex: 9999
}, v = "\n.chatbot-widget-root {\n  position: fixed;\n  bottom: 16px;\n  font-family: \"Segoe UI\", -apple-system, BlinkMacSystemFont, sans-serif;\n}\n\n.chatbot-widget-root.right {\n  right: 16px;\n}\n\n.chatbot-widget-root.left {\n  left: 16px;\n}\n\n.chatbot-launcher {\n  width: 56px;\n  height: 56px;\n  border-radius: 9999px;\n  border: 0;\n  background: linear-gradient(135deg, var(--chatbot-primary), #1d4ed8);\n  color: #ffffff;\n  box-shadow: 0 16px 30px rgba(37, 99, 235, 0.35);\n  cursor: pointer;\n  display: grid;\n  place-items: center;\n  font-size: 12px;\n  font-weight: 700;\n  letter-spacing: 0.2px;\n  transition: transform 0.18s ease, box-shadow 0.18s ease;\n}\n\n.chatbot-launcher svg {\n  width: 20px;\n  height: 20px;\n}\n\n.chatbot-launcher:hover {\n  transform: translateY(-2px);\n  box-shadow: 0 20px 34px rgba(37, 99, 235, 0.42);\n}\n\n.chatbot-panel {\n  position: absolute;\n  bottom: 66px;\n  width: min(378px, calc(100vw - 24px));\n  height: min(610px, calc(100vh - 88px));\n  border-radius: 16px;\n  border: 1px solid #dbe4f5;\n  overflow: hidden;\n  box-shadow: 0 28px 56px rgba(15, 23, 42, 0.24);\n  background: #f8fbff;\n  display: flex;\n  flex-direction: column;\n  opacity: 0;\n  visibility: hidden;\n  pointer-events: none;\n  transform: translateY(10px) scale(0.98);\n  transition: opacity 0.2s ease, transform 0.2s ease, visibility 0.2s ease;\n}\n\n.chatbot-widget-root.right .chatbot-panel {\n  right: 0;\n  transform-origin: bottom right;\n}\n\n.chatbot-widget-root.left .chatbot-panel {\n  left: 0;\n  transform-origin: bottom left;\n}\n\n.chatbot-widget-root.open .chatbot-panel {\n  opacity: 1;\n  visibility: visible;\n  pointer-events: auto;\n  transform: translateY(0) scale(1);\n}\n\n.chatbot-header {\n  background: linear-gradient(135deg, var(--chatbot-primary), #1d4ed8);\n  color: #ffffff;\n  padding: 12px;\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 10px;\n}\n\n.chatbot-header-left {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n}\n\n.chatbot-avatar {\n  width: 38px;\n  height: 38px;\n  border-radius: 9999px;\n  background: #ffffff;\n  color: var(--chatbot-primary);\n  border: 1px solid rgba(255, 255, 255, 0.84);\n  display: grid;\n  place-items: center;\n  font-size: 14px;\n  font-weight: 700;\n}\n\n.chatbot-avatar svg {\n  width: 18px;\n  height: 18px;\n}\n\n.chatbot-header-info h2 {\n  margin: 0;\n  font-size: 15px;\n  line-height: 1.15;\n  font-weight: 700;\n}\n\n.chatbot-status {\n  margin-top: 3px;\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  font-size: 12px;\n  font-weight: 500;\n  opacity: 0.95;\n}\n\n.chatbot-status-dot {\n  width: 8px;\n  height: 8px;\n  border-radius: 9999px;\n  background: #22c55e;\n}\n\n.chatbot-controls {\n  display: flex;\n  align-items: center;\n  margin-left: auto;\n}\n\n.chatbot-controls button {\n  width: 34px;\n  height: 34px;\n  border-radius: 8px;\n  border: 1px solid rgba(255, 255, 255, 0.42);\n  background: rgba(255, 255, 255, 0.24);\n  color: #ffffff;\n  cursor: pointer;\n  line-height: 0;\n  display: grid;\n  place-items: center;\n  transition: background 0.2s ease, transform 0.2s ease;\n}\n\n.chatbot-controls button svg {\n  width: 16px;\n  height: 16px;\n  stroke-width: 2.25;\n}\n\n.chatbot-controls button:hover {\n  background: rgba(255, 255, 255, 0.36);\n  transform: translateY(-1px);\n}\n\n.chatbot-body {\n  flex: 1;\n  overflow-y: auto;\n  padding: 14px 12px 10px;\n  background: linear-gradient(180deg, #f8fbff 0%, #f1f6ff 100%);\n}\n\n.chatbot-body::-webkit-scrollbar {\n  width: 8px;\n}\n\n.chatbot-body::-webkit-scrollbar-thumb {\n  background: #bfdbfe;\n  border-radius: 999px;\n}\n\n.chatbot-intro {\n  text-align: center;\n  color: #334155;\n  border: 1px solid #dbe4f5;\n  background: rgba(255, 255, 255, 0.72);\n  border-radius: 14px;\n  padding: 16px 12px;\n}\n\n.chatbot-intro-icon {\n  width: 44px;\n  height: 44px;\n  border-radius: 9999px;\n  background: #dbeafe;\n  color: #1d4ed8;\n  display: grid;\n  place-items: center;\n  font-size: 22px;\n  font-weight: 700;\n  margin: 0 auto 12px;\n}\n\n.chatbot-intro h3 {\n  margin: 0;\n  font-size: 25px;\n  color: #0f172a;\n}\n\n.chatbot-intro p {\n  margin: 10px auto 0;\n  max-width: 290px;\n  font-size: 13px;\n  line-height: 1.45;\n  color: #475569;\n}\n\n.chatbot-intro .chatbot-human-note {\n  margin-top: 12px;\n  font-style: italic;\n  font-size: 12px;\n  color: #6b7a92;\n}\n\n.chatbot-messages {\n  display: none;\n  flex-direction: column;\n  gap: 8px;\n}\n\n.chatbot-body.has-messages .chatbot-intro {\n  display: none;\n}\n\n.chatbot-body.has-messages .chatbot-messages {\n  display: flex;\n}\n\n.chatbot-bubble {\n  max-width: 86%;\n  border-radius: 12px;\n  padding: 8px 10px;\n  line-height: 1.45;\n  font-size: 13px;\n  white-space: pre-wrap;\n}\n\n.chatbot-bubble.user {\n  align-self: flex-end;\n  background: linear-gradient(135deg, var(--chatbot-primary), #1d4ed8);\n  color: #ffffff;\n}\n\n.chatbot-bubble.bot {\n  align-self: flex-start;\n  background: #e2e8f0;\n  color: #1e293b;\n}\n\n.chatbot-footer {\n  border-top: 1px solid #dbe4f5;\n  background: #f8fbff;\n  padding: 10px;\n}\n\n.chatbot-input-row {\n  display: grid;\n  grid-template-columns: 1fr auto;\n  gap: 8px;\n  margin-bottom: 8px;\n  align-items: center;\n}\n\n.chatbot-input-row input {\n  border: 1px solid #bfdbfe;\n  border-radius: 10px;\n  min-height: 44px;\n  padding: 0 12px;\n  outline: none;\n  font-size: 13px;\n  background: #ffffff;\n  color: #1e293b;\n}\n\n.chatbot-input-row input:focus {\n  border-color: var(--chatbot-primary);\n  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);\n}\n\n.chatbot-input-row button {\n  width: 46px;\n  height: 44px;\n  border: 0;\n  border-radius: 12px;\n  background: linear-gradient(135deg, var(--chatbot-primary), #1d4ed8);\n  color: #ffffff;\n  font-size: 14px;\n  font-weight: 700;\n  cursor: pointer;\n  padding: 0;\n  display: grid;\n  place-items: center;\n  box-shadow: 0 10px 18px rgba(37, 99, 235, 0.28);\n  transition: transform 0.2s ease, box-shadow 0.2s ease;\n}\n\n.chatbot-input-row button svg {\n  width: 17px;\n  height: 17px;\n  stroke-width: 2.2;\n}\n\n.chatbot-input-row button:hover {\n  transform: translateY(-1px);\n  box-shadow: 0 14px 24px rgba(37, 99, 235, 0.34);\n}\n\n.chatbot-human-button {\n  width: 100%;\n  border: 1px solid #cbd5e1;\n  border-radius: 12px;\n  background: #ffffff;\n  color: #334155;\n  min-height: 44px;\n  padding: 0 12px;\n  font-size: 14px;\n  font-weight: 600;\n  cursor: pointer;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  gap: 8px;\n  transition: border-color 0.2s ease, background 0.2s ease;\n}\n\n.chatbot-human-button:hover {\n  background: #f8fafc;\n  border-color: #94a3b8;\n}\n\n.chatbot-human-button svg {\n  width: 16px;\n  height: 16px;\n  stroke-width: 2.1;\n}\n\n.chatbot-powered {\n  margin: 8px 0 0;\n  text-align: center;\n  font-size: 11px;\n  color: #94a3b8;\n}\n\n.chatbot-powered strong {\n  color: #64748b;\n}\n\n@media (max-width: 640px) {\n  .chatbot-widget-root.right,\n  .chatbot-widget-root.left {\n    right: 10px;\n    left: 10px;\n  }\n\n  .chatbot-widget-root {\n    bottom: 10px;\n  }\n\n  .chatbot-panel {\n    width: min(360px, calc(100vw - 20px));\n    height: min(520px, calc(100vh - 70px));\n  }\n\n  .chatbot-intro h3 {\n    font-size: 22px;\n  }\n}\n", y = () => {
	if (document.getElementById(g)) return;
	let e = document.createElement("style");
	e.id = g, e.textContent = v, document.head.appendChild(e);
}, b = (e, t) => {
	let n = document.createElement("div");
	return n.className = `chatbot-bubble ${t}`, n.textContent = e, n;
}, x = (e, t, n) => {
	let r = document.createElement("button");
	return r.type = "button", r.innerHTML = `<i data-lucide="${e}" aria-hidden="true"></i>`, r.setAttribute("aria-label", t), n && r.addEventListener("click", n), r;
}, S = () => {
	h({ icons: {
		Bot: u,
		MessageCircle: d,
		SendHorizontal: f,
		UserRound: p,
		X: m
	} });
}, C = (e = {}) => {
	if (typeof window > "u" || typeof document > "u") throw Error("chatbot-package can only run in a browser environment.");
	y();
	let t = {
		..._,
		...e
	}, n = document.createElement("div");
	n.className = `chatbot-widget-root ${t.position === "bottom-left" ? "left" : "right"}`, n.style.setProperty("--chatbot-primary", t.primaryColor), n.style.zIndex = String(t.zIndex);
	let r = document.createElement("button");
	r.type = "button", r.className = "chatbot-launcher", r.setAttribute("aria-label", "Open chatbot"), r.setAttribute("aria-expanded", "false"), r.innerHTML = "<i data-lucide=\"message-circle\" aria-hidden=\"true\"></i>";
	let i = document.createElement("section");
	i.className = "chatbot-panel", i.setAttribute("role", "dialog"), i.setAttribute("aria-label", t.title);
	let a = document.createElement("header");
	a.className = "chatbot-header";
	let o = document.createElement("div");
	o.className = "chatbot-header-left";
	let s = document.createElement("div");
	s.className = "chatbot-avatar", s.innerHTML = "<i data-lucide=\"bot\" aria-hidden=\"true\"></i>";
	let c = document.createElement("div");
	c.className = "chatbot-header-info";
	let l = document.createElement("h2");
	l.textContent = t.title;
	let u = document.createElement("div");
	u.className = "chatbot-status";
	let d = document.createElement("span");
	d.className = "chatbot-status-dot";
	let f = document.createElement("span");
	f.textContent = t.subtitle, u.append(d, f), c.append(l, u), o.append(s, c);
	let p = document.createElement("div");
	p.className = "chatbot-controls";
	let m = x("x", "Close chat", () => {
		n.classList.remove("open"), r.setAttribute("aria-expanded", "false");
	});
	p.append(m), a.append(o, p);
	let h = document.createElement("div");
	h.className = "chatbot-body";
	let g = document.createElement("section");
	g.className = "chatbot-intro";
	let v = document.createElement("div");
	v.className = "chatbot-intro-icon", v.textContent = "?";
	let C = document.createElement("h3");
	C.textContent = "Hi there!";
	let w = document.createElement("p");
	w.textContent = "I am your AI support assistant. Ask me anything.";
	let T = document.createElement("p");
	T.className = "chatbot-human-note", T.textContent = "If I cannot help, you can connect with our human support team.", g.append(v, C, w, T);
	let E = document.createElement("div");
	E.className = "chatbot-messages", E.setAttribute("aria-live", "polite"), E.appendChild(b(t.welcomeMessage, "bot")), h.append(g, E);
	let D = document.createElement("div");
	D.className = "chatbot-footer";
	let O = document.createElement("form");
	O.className = "chatbot-input-row";
	let k = document.createElement("input");
	k.type = "text", k.placeholder = t.placeholder;
	let A = document.createElement("button");
	A.type = "submit", A.setAttribute("aria-label", "Send message"), A.innerHTML = "<i data-lucide=\"send-horizontal\" aria-hidden=\"true\"></i>", O.append(k, A);
	let j = document.createElement("button");
	j.type = "button", j.className = "chatbot-human-button", j.innerHTML = "<i data-lucide=\"user-round\" aria-hidden=\"true\"></i><span>Talk to a real human</span>";
	let M = document.createElement("p");
	M.className = "chatbot-powered", M.innerHTML = "Powered by <strong>AI assistant</strong>", D.append(O, j, M), i.append(a, h, D), n.append(i, r), document.body.appendChild(n), S();
	let N = !1, P = !1, F = (e) => {
		P || (N = e, n.classList.toggle("open", N), r.setAttribute("aria-expanded", String(N)), N && window.setTimeout(() => k.focus(), 0));
	}, I = async (n) => {
		if (e.onUserMessage) {
			let t = await e.onUserMessage(n);
			typeof t == "string" && t.trim() && E.appendChild(b(t.trim(), "bot"));
		} else E.appendChild(b(`Thanks! ${t.botName} received: "${n}"`, "bot"));
		h.classList.add("has-messages"), h.scrollTop = h.scrollHeight;
	}, L = async (e) => {
		let t = e.trim();
		!t || P || (h.classList.add("has-messages"), E.appendChild(b(t, "user")), k.value = "", h.scrollTop = h.scrollHeight, await I(t));
	};
	return r.addEventListener("click", () => {
		F(!N);
	}), O.addEventListener("submit", async (e) => {
		e.preventDefault(), await L(k.value);
	}), j.addEventListener("click", () => {
		h.classList.add("has-messages"), E.appendChild(b("Sure - we will connect you with a human support teammate.", "bot")), h.scrollTop = h.scrollHeight;
	}), {
		open: () => F(!0),
		close: () => F(!1),
		toggle: () => F(!N),
		sendMessage: L,
		destroy: () => {
			P || (P = !0, n.remove());
		}
	};
};
//#endregion
export { C as createChatbotWidget };
