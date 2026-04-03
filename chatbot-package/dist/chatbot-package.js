//#region \0rolldown/runtime.js
var e = Object.defineProperty, t = (t, n) => {
	let r = {};
	for (var i in t) e(r, i, {
		get: t[i],
		enumerable: !0
	});
	return n || e(r, Symbol.toStringTag, { value: "Module" }), r;
}, n = {
	xmlns: "http://www.w3.org/2000/svg",
	width: 24,
	height: 24,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	"stroke-width": 2,
	"stroke-linecap": "round",
	"stroke-linejoin": "round"
}, r = ([e, t, n]) => {
	let i = document.createElementNS("http://www.w3.org/2000/svg", e);
	return Object.keys(t).forEach((e) => {
		i.setAttribute(e, String(t[e]));
	}), n?.length && n.forEach((e) => {
		let t = r(e);
		i.appendChild(t);
	}), i;
}, i = (e, t = {}) => r([
	"svg",
	{
		...n,
		...t
	},
	e
]), a = (e) => {
	for (let t in e) if (t.startsWith("aria-") || t === "role" || t === "title") return !0;
	return !1;
}, o = (...e) => e.filter((e, t, n) => !!e && e.trim() !== "" && n.indexOf(e) === t).join(" ").trim(), s = (e) => e.replace(/^([A-Z])|[\s-_]+(\w)/g, (e, t, n) => n ? n.toUpperCase() : t.toLowerCase()), c = (e) => {
	let t = s(e);
	return t.charAt(0).toUpperCase() + t.slice(1);
}, l = (e) => Array.from(e.attributes).reduce((e, t) => (e[t.name] = t.value, e), {}), u = (e) => typeof e == "string" ? e : !e || !e.class ? "" : e.class && typeof e.class == "string" ? e.class.split(" ") : e.class && Array.isArray(e.class) ? e.class : "", d = (e, { nameAttr: t, icons: r, attrs: s }) => {
	let d = e.getAttribute(t);
	if (d == null) return;
	let f = r[c(d)];
	if (!f) return console.warn(`${e.outerHTML} icon name was not found in the provided icons object.`);
	let p = l(e), ee = a(p) ? {} : { "aria-hidden": "true" }, m = {
		...n,
		"data-lucide": d,
		...ee,
		...s,
		...p
	}, h = u(p), g = u(s), _ = o("lucide", `lucide-${d}`, ...h, ...g);
	_ && Object.assign(m, { class: _ });
	let v = i(f, m);
	return e.parentNode?.replaceChild(v, e);
}, f = [["path", { d: "m12 19-7-7 7-7" }], ["path", { d: "M19 12H5" }]], p = [
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
], ee = [["path", { d: "M21.801 10A10 10 0 1 1 17 3.335" }], ["path", { d: "m9 11 3 3L22 4" }]], m = [["path", { d: "M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719" }]], h = [["path", { d: "M3.714 3.048a.498.498 0 0 0-.683.627l2.843 7.627a2 2 0 0 1 0 1.396l-2.842 7.627a.498.498 0 0 0 .682.627l18-8.5a.5.5 0 0 0 0-.904z" }], ["path", { d: "M6 12h16" }]], g = [["circle", {
	cx: "12",
	cy: "8",
	r: "5"
}], ["path", { d: "M20 21a8 8 0 0 0-16 0" }]], _ = [["path", { d: "M18 6 6 18" }], ["path", { d: "m6 6 12 12" }]], v = ({ icons: e = {}, nameAttr: t = "data-lucide", attrs: n = {}, root: r = document, inTemplates: i } = {}) => {
	if (!Object.values(e).length) throw Error("Please provide an icons object.\nIf you want to use all the icons you can import it like:\n `import { createIcons, icons } from 'lucide';\nlucide.createIcons({icons});`");
	if (r === void 0) throw Error("`createIcons()` only works in a browser environment.");
	if (Array.from(r.querySelectorAll(`[${t}]`)).forEach((r) => d(r, {
		nameAttr: t,
		icons: e,
		attrs: n
	})), i && Array.from(r.querySelectorAll("template")).forEach((r) => v({
		icons: e,
		nameAttr: t,
		attrs: n,
		root: r.content,
		inTemplates: i
	})), t === "data-lucide") {
		let t = r.querySelectorAll("[icon-name]");
		t.length > 0 && (console.warn("[Lucide] Some icons were found with the now deprecated icon-name attribute. These will still be replaced for backwards compatibility, but will no longer be supported in v1.0 and you should switch to data-lucide"), Array.from(t).forEach((t) => d(t, {
			nameAttr: "icon-name",
			icons: e,
			attrs: n
		})));
	}
}, y = Object.create(null);
y.open = "0", y.close = "1", y.ping = "2", y.pong = "3", y.message = "4", y.upgrade = "5", y.noop = "6";
var b = Object.create(null);
Object.keys(y).forEach((e) => {
	b[y[e]] = e;
});
var x = {
	type: "error",
	data: "parser error"
}, S = typeof Blob == "function" || typeof Blob < "u" && Object.prototype.toString.call(Blob) === "[object BlobConstructor]", C = typeof ArrayBuffer == "function", w = (e) => typeof ArrayBuffer.isView == "function" ? ArrayBuffer.isView(e) : e && e.buffer instanceof ArrayBuffer, T = ({ type: e, data: t }, n, r) => S && t instanceof Blob ? n ? r(t) : E(t, r) : C && (t instanceof ArrayBuffer || w(t)) ? n ? r(t) : E(new Blob([t]), r) : r(y[e] + (t || "")), E = (e, t) => {
	let n = new FileReader();
	return n.onload = function() {
		let e = n.result.split(",")[1];
		t("b" + (e || ""));
	}, n.readAsDataURL(e);
};
function D(e) {
	return e instanceof Uint8Array ? e : e instanceof ArrayBuffer ? new Uint8Array(e) : new Uint8Array(e.buffer, e.byteOffset, e.byteLength);
}
var O;
function te(e, t) {
	if (S && e.data instanceof Blob) return e.data.arrayBuffer().then(D).then(t);
	if (C && (e.data instanceof ArrayBuffer || w(e.data))) return t(D(e.data));
	T(e, !1, (e) => {
		O ||= new TextEncoder(), t(O.encode(e));
	});
}
//#endregion
//#region node_modules/engine.io-parser/build/esm/contrib/base64-arraybuffer.js
var ne = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", k = typeof Uint8Array > "u" ? [] : new Uint8Array(256);
for (let e = 0; e < 64; e++) k[ne.charCodeAt(e)] = e;
var re = (e) => {
	let t = e.length * .75, n = e.length, r, i = 0, a, o, s, c;
	e[e.length - 1] === "=" && (t--, e[e.length - 2] === "=" && t--);
	let l = new ArrayBuffer(t), u = new Uint8Array(l);
	for (r = 0; r < n; r += 4) a = k[e.charCodeAt(r)], o = k[e.charCodeAt(r + 1)], s = k[e.charCodeAt(r + 2)], c = k[e.charCodeAt(r + 3)], u[i++] = a << 2 | o >> 4, u[i++] = (o & 15) << 4 | s >> 2, u[i++] = (s & 3) << 6 | c & 63;
	return l;
}, A = typeof ArrayBuffer == "function", j = (e, t) => {
	if (typeof e != "string") return {
		type: "message",
		data: N(e, t)
	};
	let n = e.charAt(0);
	return n === "b" ? {
		type: "message",
		data: M(e.substring(1), t)
	} : b[n] ? e.length > 1 ? {
		type: b[n],
		data: e.substring(1)
	} : { type: b[n] } : x;
}, M = (e, t) => A ? N(re(e), t) : {
	base64: !0,
	data: e
}, N = (e, t) => {
	switch (t) {
		case "blob": return e instanceof Blob ? e : new Blob([e]);
		default: return e instanceof ArrayBuffer ? e : e.buffer;
	}
}, P = "", F = (e, t) => {
	let n = e.length, r = Array(n), i = 0;
	e.forEach((e, a) => {
		T(e, !1, (e) => {
			r[a] = e, ++i === n && t(r.join(P));
		});
	});
}, ie = (e, t) => {
	let n = e.split(P), r = [];
	for (let e = 0; e < n.length; e++) {
		let i = j(n[e], t);
		if (r.push(i), i.type === "error") break;
	}
	return r;
};
function I() {
	return new TransformStream({ transform(e, t) {
		te(e, (n) => {
			let r = n.length, i;
			if (r < 126) i = new Uint8Array(1), new DataView(i.buffer).setUint8(0, r);
			else if (r < 65536) {
				i = new Uint8Array(3);
				let e = new DataView(i.buffer);
				e.setUint8(0, 126), e.setUint16(1, r);
			} else {
				i = new Uint8Array(9);
				let e = new DataView(i.buffer);
				e.setUint8(0, 127), e.setBigUint64(1, BigInt(r));
			}
			e.data && typeof e.data != "string" && (i[0] |= 128), t.enqueue(i), t.enqueue(n);
		});
	} });
}
var L;
function R(e) {
	return e.reduce((e, t) => e + t.length, 0);
}
function z(e, t) {
	if (e[0].length === t) return e.shift();
	let n = new Uint8Array(t), r = 0;
	for (let i = 0; i < t; i++) n[i] = e[0][r++], r === e[0].length && (e.shift(), r = 0);
	return e.length && r < e[0].length && (e[0] = e[0].slice(r)), n;
}
function B(e, t) {
	L ||= new TextDecoder();
	let n = [], r = 0, i = -1, a = !1;
	return new TransformStream({ transform(o, s) {
		for (n.push(o);;) {
			if (r === 0) {
				if (R(n) < 1) break;
				let e = z(n, 1);
				a = (e[0] & 128) == 128, i = e[0] & 127, r = i < 126 ? 3 : i === 126 ? 1 : 2;
			} else if (r === 1) {
				if (R(n) < 2) break;
				let e = z(n, 2);
				i = new DataView(e.buffer, e.byteOffset, e.length).getUint16(0), r = 3;
			} else if (r === 2) {
				if (R(n) < 8) break;
				let e = z(n, 8), t = new DataView(e.buffer, e.byteOffset, e.length), a = t.getUint32(0);
				if (a > 2 ** 21 - 1) {
					s.enqueue(x);
					break;
				}
				i = a * 2 ** 32 + t.getUint32(4), r = 3;
			} else {
				if (R(n) < i) break;
				let e = z(n, i);
				s.enqueue(j(a ? e : L.decode(e), t)), r = 0;
			}
			if (i === 0 || i > e) {
				s.enqueue(x);
				break;
			}
		}
	} });
}
//#endregion
//#region node_modules/@socket.io/component-emitter/lib/esm/index.js
function V(e) {
	if (e) return H(e);
}
function H(e) {
	for (var t in V.prototype) e[t] = V.prototype[t];
	return e;
}
V.prototype.on = V.prototype.addEventListener = function(e, t) {
	return this._callbacks = this._callbacks || {}, (this._callbacks["$" + e] = this._callbacks["$" + e] || []).push(t), this;
}, V.prototype.once = function(e, t) {
	function n() {
		this.off(e, n), t.apply(this, arguments);
	}
	return n.fn = t, this.on(e, n), this;
}, V.prototype.off = V.prototype.removeListener = V.prototype.removeAllListeners = V.prototype.removeEventListener = function(e, t) {
	if (this._callbacks = this._callbacks || {}, arguments.length == 0) return this._callbacks = {}, this;
	var n = this._callbacks["$" + e];
	if (!n) return this;
	if (arguments.length == 1) return delete this._callbacks["$" + e], this;
	for (var r, i = 0; i < n.length; i++) if (r = n[i], r === t || r.fn === t) {
		n.splice(i, 1);
		break;
	}
	return n.length === 0 && delete this._callbacks["$" + e], this;
}, V.prototype.emit = function(e) {
	this._callbacks = this._callbacks || {};
	for (var t = Array(arguments.length - 1), n = this._callbacks["$" + e], r = 1; r < arguments.length; r++) t[r - 1] = arguments[r];
	if (n) {
		n = n.slice(0);
		for (var r = 0, i = n.length; r < i; ++r) n[r].apply(this, t);
	}
	return this;
}, V.prototype.emitReserved = V.prototype.emit, V.prototype.listeners = function(e) {
	return this._callbacks = this._callbacks || {}, this._callbacks["$" + e] || [];
}, V.prototype.hasListeners = function(e) {
	return !!this.listeners(e).length;
};
//#endregion
//#region node_modules/engine.io-client/build/esm/globals.js
var U = typeof Promise == "function" && typeof Promise.resolve == "function" ? (e) => Promise.resolve().then(e) : (e, t) => t(e, 0), W = typeof self < "u" ? self : typeof window < "u" ? window : Function("return this")(), ae = "arraybuffer";
//#endregion
//#region node_modules/engine.io-client/build/esm/util.js
function G(e, ...t) {
	return t.reduce((t, n) => (e.hasOwnProperty(n) && (t[n] = e[n]), t), {});
}
var K = W.setTimeout, oe = W.clearTimeout;
function q(e, t) {
	t.useNativeTimers ? (e.setTimeoutFn = K.bind(W), e.clearTimeoutFn = oe.bind(W)) : (e.setTimeoutFn = W.setTimeout.bind(W), e.clearTimeoutFn = W.clearTimeout.bind(W));
}
var se = 1.33;
function ce(e) {
	return typeof e == "string" ? le(e) : Math.ceil((e.byteLength || e.size) * se);
}
function le(e) {
	let t = 0, n = 0;
	for (let r = 0, i = e.length; r < i; r++) t = e.charCodeAt(r), t < 128 ? n += 1 : t < 2048 ? n += 2 : t < 55296 || t >= 57344 ? n += 3 : (r++, n += 4);
	return n;
}
function ue() {
	return Date.now().toString(36).substring(3) + Math.random().toString(36).substring(2, 5);
}
//#endregion
//#region node_modules/engine.io-client/build/esm/contrib/parseqs.js
function de(e) {
	let t = "";
	for (let n in e) e.hasOwnProperty(n) && (t.length && (t += "&"), t += encodeURIComponent(n) + "=" + encodeURIComponent(e[n]));
	return t;
}
function fe(e) {
	let t = {}, n = e.split("&");
	for (let e = 0, r = n.length; e < r; e++) {
		let r = n[e].split("=");
		t[decodeURIComponent(r[0])] = decodeURIComponent(r[1]);
	}
	return t;
}
//#endregion
//#region node_modules/engine.io-client/build/esm/transport.js
var pe = class extends Error {
	constructor(e, t, n) {
		super(e), this.description = t, this.context = n, this.type = "TransportError";
	}
}, me = class extends V {
	constructor(e) {
		super(), this.writable = !1, q(this, e), this.opts = e, this.query = e.query, this.socket = e.socket, this.supportsBinary = !e.forceBase64;
	}
	onError(e, t, n) {
		return super.emitReserved("error", new pe(e, t, n)), this;
	}
	open() {
		return this.readyState = "opening", this.doOpen(), this;
	}
	close() {
		return (this.readyState === "opening" || this.readyState === "open") && (this.doClose(), this.onClose()), this;
	}
	send(e) {
		this.readyState === "open" && this.write(e);
	}
	onOpen() {
		this.readyState = "open", this.writable = !0, super.emitReserved("open");
	}
	onData(e) {
		let t = j(e, this.socket.binaryType);
		this.onPacket(t);
	}
	onPacket(e) {
		super.emitReserved("packet", e);
	}
	onClose(e) {
		this.readyState = "closed", super.emitReserved("close", e);
	}
	pause(e) {}
	createUri(e, t = {}) {
		return e + "://" + this._hostname() + this._port() + this.opts.path + this._query(t);
	}
	_hostname() {
		let e = this.opts.hostname;
		return e.indexOf(":") === -1 ? e : "[" + e + "]";
	}
	_port() {
		return this.opts.port && (this.opts.secure && Number(this.opts.port) !== 443 || !this.opts.secure && Number(this.opts.port) !== 80) ? ":" + this.opts.port : "";
	}
	_query(e) {
		let t = de(e);
		return t.length ? "?" + t : "";
	}
}, he = class extends me {
	constructor() {
		super(...arguments), this._polling = !1;
	}
	get name() {
		return "polling";
	}
	doOpen() {
		this._poll();
	}
	pause(e) {
		this.readyState = "pausing";
		let t = () => {
			this.readyState = "paused", e();
		};
		if (this._polling || !this.writable) {
			let e = 0;
			this._polling && (e++, this.once("pollComplete", function() {
				--e || t();
			})), this.writable || (e++, this.once("drain", function() {
				--e || t();
			}));
		} else t();
	}
	_poll() {
		this._polling = !0, this.doPoll(), this.emitReserved("poll");
	}
	onData(e) {
		ie(e, this.socket.binaryType).forEach((e) => {
			if (this.readyState === "opening" && e.type === "open" && this.onOpen(), e.type === "close") return this.onClose({ description: "transport closed by the server" }), !1;
			this.onPacket(e);
		}), this.readyState !== "closed" && (this._polling = !1, this.emitReserved("pollComplete"), this.readyState === "open" && this._poll());
	}
	doClose() {
		let e = () => {
			this.write([{ type: "close" }]);
		};
		this.readyState === "open" ? e() : this.once("open", e);
	}
	write(e) {
		this.writable = !1, F(e, (e) => {
			this.doWrite(e, () => {
				this.writable = !0, this.emitReserved("drain");
			});
		});
	}
	uri() {
		let e = this.opts.secure ? "https" : "http", t = this.query || {};
		return !1 !== this.opts.timestampRequests && (t[this.opts.timestampParam] = ue()), !this.supportsBinary && !t.sid && (t.b64 = 1), this.createUri(e, t);
	}
}, ge = !1;
try {
	ge = typeof XMLHttpRequest < "u" && "withCredentials" in new XMLHttpRequest();
} catch {}
var _e = ge;
//#endregion
//#region node_modules/engine.io-client/build/esm/transports/polling-xhr.js
function ve() {}
var ye = class extends he {
	constructor(e) {
		if (super(e), typeof location < "u") {
			let t = location.protocol === "https:", n = location.port;
			n ||= t ? "443" : "80", this.xd = typeof location < "u" && e.hostname !== location.hostname || n !== e.port;
		}
	}
	doWrite(e, t) {
		let n = this.request({
			method: "POST",
			data: e
		});
		n.on("success", t), n.on("error", (e, t) => {
			this.onError("xhr post error", e, t);
		});
	}
	doPoll() {
		let e = this.request();
		e.on("data", this.onData.bind(this)), e.on("error", (e, t) => {
			this.onError("xhr poll error", e, t);
		}), this.pollXhr = e;
	}
}, J = class e extends V {
	constructor(e, t, n) {
		super(), this.createRequest = e, q(this, n), this._opts = n, this._method = n.method || "GET", this._uri = t, this._data = n.data === void 0 ? null : n.data, this._create();
	}
	_create() {
		var t;
		let n = G(this._opts, "agent", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "autoUnref");
		n.xdomain = !!this._opts.xd;
		let r = this._xhr = this.createRequest(n);
		try {
			r.open(this._method, this._uri, !0);
			try {
				if (this._opts.extraHeaders) {
					r.setDisableHeaderCheck && r.setDisableHeaderCheck(!0);
					for (let e in this._opts.extraHeaders) this._opts.extraHeaders.hasOwnProperty(e) && r.setRequestHeader(e, this._opts.extraHeaders[e]);
				}
			} catch {}
			if (this._method === "POST") try {
				r.setRequestHeader("Content-type", "text/plain;charset=UTF-8");
			} catch {}
			try {
				r.setRequestHeader("Accept", "*/*");
			} catch {}
			(t = this._opts.cookieJar) == null || t.addCookies(r), "withCredentials" in r && (r.withCredentials = this._opts.withCredentials), this._opts.requestTimeout && (r.timeout = this._opts.requestTimeout), r.onreadystatechange = () => {
				var e;
				r.readyState === 3 && ((e = this._opts.cookieJar) == null || e.parseCookies(r.getResponseHeader("set-cookie"))), r.readyState === 4 && (r.status === 200 || r.status === 1223 ? this._onLoad() : this.setTimeoutFn(() => {
					this._onError(typeof r.status == "number" ? r.status : 0);
				}, 0));
			}, r.send(this._data);
		} catch (e) {
			this.setTimeoutFn(() => {
				this._onError(e);
			}, 0);
			return;
		}
		typeof document < "u" && (this._index = e.requestsCount++, e.requests[this._index] = this);
	}
	_onError(e) {
		this.emitReserved("error", e, this._xhr), this._cleanup(!0);
	}
	_cleanup(t) {
		if (!(this._xhr === void 0 || this._xhr === null)) {
			if (this._xhr.onreadystatechange = ve, t) try {
				this._xhr.abort();
			} catch {}
			typeof document < "u" && delete e.requests[this._index], this._xhr = null;
		}
	}
	_onLoad() {
		let e = this._xhr.responseText;
		e !== null && (this.emitReserved("data", e), this.emitReserved("success"), this._cleanup());
	}
	abort() {
		this._cleanup();
	}
};
if (J.requestsCount = 0, J.requests = {}, typeof document < "u") {
	if (typeof attachEvent == "function") attachEvent("onunload", be);
	else if (typeof addEventListener == "function") {
		let e = "onpagehide" in W ? "pagehide" : "unload";
		addEventListener(e, be, !1);
	}
}
function be() {
	for (let e in J.requests) J.requests.hasOwnProperty(e) && J.requests[e].abort();
}
var xe = (function() {
	let e = Ce({ xdomain: !1 });
	return e && e.responseType !== null;
})(), Se = class extends ye {
	constructor(e) {
		super(e);
		let t = e && e.forceBase64;
		this.supportsBinary = xe && !t;
	}
	request(e = {}) {
		return Object.assign(e, { xd: this.xd }, this.opts), new J(Ce, this.uri(), e);
	}
};
function Ce(e) {
	let t = e.xdomain;
	try {
		if (typeof XMLHttpRequest < "u" && (!t || _e)) return new XMLHttpRequest();
	} catch {}
	if (!t) try {
		return new W[["Active", "Object"].join("X")]("Microsoft.XMLHTTP");
	} catch {}
}
//#endregion
//#region node_modules/engine.io-client/build/esm/transports/websocket.js
var we = typeof navigator < "u" && typeof navigator.product == "string" && navigator.product.toLowerCase() === "reactnative", Te = class extends me {
	get name() {
		return "websocket";
	}
	doOpen() {
		let e = this.uri(), t = this.opts.protocols, n = we ? {} : G(this.opts, "agent", "perMessageDeflate", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "localAddress", "protocolVersion", "origin", "maxPayload", "family", "checkServerIdentity");
		this.opts.extraHeaders && (n.headers = this.opts.extraHeaders);
		try {
			this.ws = this.createSocket(e, t, n);
		} catch (e) {
			return this.emitReserved("error", e);
		}
		this.ws.binaryType = this.socket.binaryType, this.addEventListeners();
	}
	addEventListeners() {
		this.ws.onopen = () => {
			this.opts.autoUnref && this.ws._socket.unref(), this.onOpen();
		}, this.ws.onclose = (e) => this.onClose({
			description: "websocket connection closed",
			context: e
		}), this.ws.onmessage = (e) => this.onData(e.data), this.ws.onerror = (e) => this.onError("websocket error", e);
	}
	write(e) {
		this.writable = !1;
		for (let t = 0; t < e.length; t++) {
			let n = e[t], r = t === e.length - 1;
			T(n, this.supportsBinary, (e) => {
				try {
					this.doWrite(n, e);
				} catch {}
				r && U(() => {
					this.writable = !0, this.emitReserved("drain");
				}, this.setTimeoutFn);
			});
		}
	}
	doClose() {
		this.ws !== void 0 && (this.ws.onerror = () => {}, this.ws.close(), this.ws = null);
	}
	uri() {
		let e = this.opts.secure ? "wss" : "ws", t = this.query || {};
		return this.opts.timestampRequests && (t[this.opts.timestampParam] = ue()), this.supportsBinary || (t.b64 = 1), this.createUri(e, t);
	}
}, Ee = W.WebSocket || W.MozWebSocket, De = {
	websocket: class extends Te {
		createSocket(e, t, n) {
			return we ? new Ee(e, t, n) : t ? new Ee(e, t) : new Ee(e);
		}
		doWrite(e, t) {
			this.ws.send(t);
		}
	},
	webtransport: class extends me {
		get name() {
			return "webtransport";
		}
		doOpen() {
			try {
				this._transport = new WebTransport(this.createUri("https"), this.opts.transportOptions[this.name]);
			} catch (e) {
				return this.emitReserved("error", e);
			}
			this._transport.closed.then(() => {
				this.onClose();
			}).catch((e) => {
				this.onError("webtransport error", e);
			}), this._transport.ready.then(() => {
				this._transport.createBidirectionalStream().then((e) => {
					let t = B(2 ** 53 - 1, this.socket.binaryType), n = e.readable.pipeThrough(t).getReader(), r = I();
					r.readable.pipeTo(e.writable), this._writer = r.writable.getWriter();
					let i = () => {
						n.read().then(({ done: e, value: t }) => {
							e || (this.onPacket(t), i());
						}).catch((e) => {});
					};
					i();
					let a = { type: "open" };
					this.query.sid && (a.data = `{"sid":"${this.query.sid}"}`), this._writer.write(a).then(() => this.onOpen());
				});
			});
		}
		write(e) {
			this.writable = !1;
			for (let t = 0; t < e.length; t++) {
				let n = e[t], r = t === e.length - 1;
				this._writer.write(n).then(() => {
					r && U(() => {
						this.writable = !0, this.emitReserved("drain");
					}, this.setTimeoutFn);
				});
			}
		}
		doClose() {
			var e;
			(e = this._transport) == null || e.close();
		}
	},
	polling: Se
}, Oe = /^(?:(?![^:@\/?#]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@\/?#]*)(?::([^:@\/?#]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/, ke = [
	"source",
	"protocol",
	"authority",
	"userInfo",
	"user",
	"password",
	"host",
	"port",
	"relative",
	"path",
	"directory",
	"file",
	"query",
	"anchor"
];
function Ae(e) {
	if (e.length > 8e3) throw "URI too long";
	let t = e, n = e.indexOf("["), r = e.indexOf("]");
	n != -1 && r != -1 && (e = e.substring(0, n) + e.substring(n, r).replace(/:/g, ";") + e.substring(r, e.length));
	let i = Oe.exec(e || ""), a = {}, o = 14;
	for (; o--;) a[ke[o]] = i[o] || "";
	return n != -1 && r != -1 && (a.source = t, a.host = a.host.substring(1, a.host.length - 1).replace(/;/g, ":"), a.authority = a.authority.replace("[", "").replace("]", "").replace(/;/g, ":"), a.ipv6uri = !0), a.pathNames = je(a, a.path), a.queryKey = Me(a, a.query), a;
}
function je(e, t) {
	let n = t.replace(/\/{2,9}/g, "/").split("/");
	return (t.slice(0, 1) == "/" || t.length === 0) && n.splice(0, 1), t.slice(-1) == "/" && n.splice(n.length - 1, 1), n;
}
function Me(e, t) {
	let n = {};
	return t.replace(/(?:^|&)([^&=]*)=?([^&]*)/g, function(e, t, r) {
		t && (n[t] = r);
	}), n;
}
//#endregion
//#region node_modules/engine.io-client/build/esm/socket.js
var Ne = typeof addEventListener == "function" && typeof removeEventListener == "function", Pe = [];
Ne && addEventListener("offline", () => {
	Pe.forEach((e) => e());
}, !1);
var Fe = class e extends V {
	constructor(e, t) {
		if (super(), this.binaryType = ae, this.writeBuffer = [], this._prevBufferLen = 0, this._pingInterval = -1, this._pingTimeout = -1, this._maxPayload = -1, this._pingTimeoutTime = Infinity, e && typeof e == "object" && (t = e, e = null), e) {
			let n = Ae(e);
			t.hostname = n.host, t.secure = n.protocol === "https" || n.protocol === "wss", t.port = n.port, n.query && (t.query = n.query);
		} else t.host && (t.hostname = Ae(t.host).host);
		q(this, t), this.secure = t.secure == null ? typeof location < "u" && location.protocol === "https:" : t.secure, t.hostname && !t.port && (t.port = this.secure ? "443" : "80"), this.hostname = t.hostname || (typeof location < "u" ? location.hostname : "localhost"), this.port = t.port || (typeof location < "u" && location.port ? location.port : this.secure ? "443" : "80"), this.transports = [], this._transportsByName = {}, t.transports.forEach((e) => {
			let t = e.prototype.name;
			this.transports.push(t), this._transportsByName[t] = e;
		}), this.opts = Object.assign({
			path: "/engine.io",
			agent: !1,
			withCredentials: !1,
			upgrade: !0,
			timestampParam: "t",
			rememberUpgrade: !1,
			addTrailingSlash: !0,
			rejectUnauthorized: !0,
			perMessageDeflate: { threshold: 1024 },
			transportOptions: {},
			closeOnBeforeunload: !1
		}, t), this.opts.path = this.opts.path.replace(/\/$/, "") + (this.opts.addTrailingSlash ? "/" : ""), typeof this.opts.query == "string" && (this.opts.query = fe(this.opts.query)), Ne && (this.opts.closeOnBeforeunload && (this._beforeunloadEventListener = () => {
			this.transport && (this.transport.removeAllListeners(), this.transport.close());
		}, addEventListener("beforeunload", this._beforeunloadEventListener, !1)), this.hostname !== "localhost" && (this._offlineEventListener = () => {
			this._onClose("transport close", { description: "network connection lost" });
		}, Pe.push(this._offlineEventListener))), this.opts.withCredentials && (this._cookieJar = void 0), this._open();
	}
	createTransport(e) {
		let t = Object.assign({}, this.opts.query);
		t.EIO = 4, t.transport = e, this.id && (t.sid = this.id);
		let n = Object.assign({}, this.opts, {
			query: t,
			socket: this,
			hostname: this.hostname,
			secure: this.secure,
			port: this.port
		}, this.opts.transportOptions[e]);
		return new this._transportsByName[e](n);
	}
	_open() {
		if (this.transports.length === 0) {
			this.setTimeoutFn(() => {
				this.emitReserved("error", "No transports available");
			}, 0);
			return;
		}
		let t = this.opts.rememberUpgrade && e.priorWebsocketSuccess && this.transports.indexOf("websocket") !== -1 ? "websocket" : this.transports[0];
		this.readyState = "opening";
		let n = this.createTransport(t);
		n.open(), this.setTransport(n);
	}
	setTransport(e) {
		this.transport && this.transport.removeAllListeners(), this.transport = e, e.on("drain", this._onDrain.bind(this)).on("packet", this._onPacket.bind(this)).on("error", this._onError.bind(this)).on("close", (e) => this._onClose("transport close", e));
	}
	onOpen() {
		this.readyState = "open", e.priorWebsocketSuccess = this.transport.name === "websocket", this.emitReserved("open"), this.flush();
	}
	_onPacket(e) {
		if (this.readyState === "opening" || this.readyState === "open" || this.readyState === "closing") switch (this.emitReserved("packet", e), this.emitReserved("heartbeat"), e.type) {
			case "open":
				this.onHandshake(JSON.parse(e.data));
				break;
			case "ping":
				this._sendPacket("pong"), this.emitReserved("ping"), this.emitReserved("pong"), this._resetPingTimeout();
				break;
			case "error":
				let t = /* @__PURE__ */ Error("server error");
				t.code = e.data, this._onError(t);
				break;
			case "message":
				this.emitReserved("data", e.data), this.emitReserved("message", e.data);
				break;
		}
	}
	onHandshake(e) {
		this.emitReserved("handshake", e), this.id = e.sid, this.transport.query.sid = e.sid, this._pingInterval = e.pingInterval, this._pingTimeout = e.pingTimeout, this._maxPayload = e.maxPayload, this.onOpen(), this.readyState !== "closed" && this._resetPingTimeout();
	}
	_resetPingTimeout() {
		this.clearTimeoutFn(this._pingTimeoutTimer);
		let e = this._pingInterval + this._pingTimeout;
		this._pingTimeoutTime = Date.now() + e, this._pingTimeoutTimer = this.setTimeoutFn(() => {
			this._onClose("ping timeout");
		}, e), this.opts.autoUnref && this._pingTimeoutTimer.unref();
	}
	_onDrain() {
		this.writeBuffer.splice(0, this._prevBufferLen), this._prevBufferLen = 0, this.writeBuffer.length === 0 ? this.emitReserved("drain") : this.flush();
	}
	flush() {
		if (this.readyState !== "closed" && this.transport.writable && !this.upgrading && this.writeBuffer.length) {
			let e = this._getWritablePackets();
			this.transport.send(e), this._prevBufferLen = e.length, this.emitReserved("flush");
		}
	}
	_getWritablePackets() {
		if (!(this._maxPayload && this.transport.name === "polling" && this.writeBuffer.length > 1)) return this.writeBuffer;
		let e = 1;
		for (let t = 0; t < this.writeBuffer.length; t++) {
			let n = this.writeBuffer[t].data;
			if (n && (e += ce(n)), t > 0 && e > this._maxPayload) return this.writeBuffer.slice(0, t);
			e += 2;
		}
		return this.writeBuffer;
	}
	_hasPingExpired() {
		if (!this._pingTimeoutTime) return !0;
		let e = Date.now() > this._pingTimeoutTime;
		return e && (this._pingTimeoutTime = 0, U(() => {
			this._onClose("ping timeout");
		}, this.setTimeoutFn)), e;
	}
	write(e, t, n) {
		return this._sendPacket("message", e, t, n), this;
	}
	send(e, t, n) {
		return this._sendPacket("message", e, t, n), this;
	}
	_sendPacket(e, t, n, r) {
		if (typeof t == "function" && (r = t, t = void 0), typeof n == "function" && (r = n, n = null), this.readyState === "closing" || this.readyState === "closed") return;
		n ||= {}, n.compress = !1 !== n.compress;
		let i = {
			type: e,
			data: t,
			options: n
		};
		this.emitReserved("packetCreate", i), this.writeBuffer.push(i), r && this.once("flush", r), this.flush();
	}
	close() {
		let e = () => {
			this._onClose("forced close"), this.transport.close();
		}, t = () => {
			this.off("upgrade", t), this.off("upgradeError", t), e();
		}, n = () => {
			this.once("upgrade", t), this.once("upgradeError", t);
		};
		return (this.readyState === "opening" || this.readyState === "open") && (this.readyState = "closing", this.writeBuffer.length ? this.once("drain", () => {
			this.upgrading ? n() : e();
		}) : this.upgrading ? n() : e()), this;
	}
	_onError(t) {
		if (e.priorWebsocketSuccess = !1, this.opts.tryAllTransports && this.transports.length > 1 && this.readyState === "opening") return this.transports.shift(), this._open();
		this.emitReserved("error", t), this._onClose("transport error", t);
	}
	_onClose(e, t) {
		if (this.readyState === "opening" || this.readyState === "open" || this.readyState === "closing") {
			if (this.clearTimeoutFn(this._pingTimeoutTimer), this.transport.removeAllListeners("close"), this.transport.close(), this.transport.removeAllListeners(), Ne && (this._beforeunloadEventListener && removeEventListener("beforeunload", this._beforeunloadEventListener, !1), this._offlineEventListener)) {
				let e = Pe.indexOf(this._offlineEventListener);
				e !== -1 && Pe.splice(e, 1);
			}
			this.readyState = "closed", this.id = null, this.emitReserved("close", e, t), this.writeBuffer = [], this._prevBufferLen = 0;
		}
	}
};
Fe.protocol = 4;
var Ie = class extends Fe {
	constructor() {
		super(...arguments), this._upgrades = [];
	}
	onOpen() {
		if (super.onOpen(), this.readyState === "open" && this.opts.upgrade) for (let e = 0; e < this._upgrades.length; e++) this._probe(this._upgrades[e]);
	}
	_probe(e) {
		let t = this.createTransport(e), n = !1;
		Fe.priorWebsocketSuccess = !1;
		let r = () => {
			n || (t.send([{
				type: "ping",
				data: "probe"
			}]), t.once("packet", (e) => {
				if (!n) if (e.type === "pong" && e.data === "probe") {
					if (this.upgrading = !0, this.emitReserved("upgrading", t), !t) return;
					Fe.priorWebsocketSuccess = t.name === "websocket", this.transport.pause(() => {
						n || this.readyState !== "closed" && (l(), this.setTransport(t), t.send([{ type: "upgrade" }]), this.emitReserved("upgrade", t), t = null, this.upgrading = !1, this.flush());
					});
				} else {
					let e = /* @__PURE__ */ Error("probe error");
					e.transport = t.name, this.emitReserved("upgradeError", e);
				}
			}));
		};
		function i() {
			n || (n = !0, l(), t.close(), t = null);
		}
		let a = (e) => {
			let n = /* @__PURE__ */ Error("probe error: " + e);
			n.transport = t.name, i(), this.emitReserved("upgradeError", n);
		};
		function o() {
			a("transport closed");
		}
		function s() {
			a("socket closed");
		}
		function c(e) {
			t && e.name !== t.name && i();
		}
		let l = () => {
			t.removeListener("open", r), t.removeListener("error", a), t.removeListener("close", o), this.off("close", s), this.off("upgrading", c);
		};
		t.once("open", r), t.once("error", a), t.once("close", o), this.once("close", s), this.once("upgrading", c), this._upgrades.indexOf("webtransport") !== -1 && e !== "webtransport" ? this.setTimeoutFn(() => {
			n || t.open();
		}, 200) : t.open();
	}
	onHandshake(e) {
		this._upgrades = this._filterUpgrades(e.upgrades), super.onHandshake(e);
	}
	_filterUpgrades(e) {
		let t = [];
		for (let n = 0; n < e.length; n++) ~this.transports.indexOf(e[n]) && t.push(e[n]);
		return t;
	}
}, Le = class extends Ie {
	constructor(e, t = {}) {
		let n = typeof e == "object" ? e : t;
		(!n.transports || n.transports && typeof n.transports[0] == "string") && (n.transports = (n.transports || [
			"polling",
			"websocket",
			"webtransport"
		]).map((e) => De[e]).filter((e) => !!e)), super(e, n);
	}
};
Le.protocol;
//#endregion
//#region node_modules/socket.io-client/build/esm/url.js
function Re(e, t = "", n) {
	let r = e;
	n ||= typeof location < "u" && location, e ??= n.protocol + "//" + n.host, typeof e == "string" && (e.charAt(0) === "/" && (e = e.charAt(1) === "/" ? n.protocol + e : n.host + e), /^(https?|wss?):\/\//.test(e) || (e = n === void 0 ? "https://" + e : n.protocol + "//" + e), r = Ae(e)), r.port || (/^(http|ws)$/.test(r.protocol) ? r.port = "80" : /^(http|ws)s$/.test(r.protocol) && (r.port = "443")), r.path = r.path || "/";
	let i = r.host.indexOf(":") === -1 ? r.host : "[" + r.host + "]";
	return r.id = r.protocol + "://" + i + ":" + r.port + t, r.href = r.protocol + "://" + i + (n && n.port === r.port ? "" : ":" + r.port), r;
}
//#endregion
//#region node_modules/socket.io-parser/build/esm/is-binary.js
var ze = typeof ArrayBuffer == "function", Be = (e) => typeof ArrayBuffer.isView == "function" ? ArrayBuffer.isView(e) : e.buffer instanceof ArrayBuffer, Ve = Object.prototype.toString, He = typeof Blob == "function" || typeof Blob < "u" && Ve.call(Blob) === "[object BlobConstructor]", Ue = typeof File == "function" || typeof File < "u" && Ve.call(File) === "[object FileConstructor]";
function We(e) {
	return ze && (e instanceof ArrayBuffer || Be(e)) || He && e instanceof Blob || Ue && e instanceof File;
}
function Ge(e, t) {
	if (!e || typeof e != "object") return !1;
	if (Array.isArray(e)) {
		for (let t = 0, n = e.length; t < n; t++) if (Ge(e[t])) return !0;
		return !1;
	}
	if (We(e)) return !0;
	if (e.toJSON && typeof e.toJSON == "function" && arguments.length === 1) return Ge(e.toJSON(), !0);
	for (let t in e) if (Object.prototype.hasOwnProperty.call(e, t) && Ge(e[t])) return !0;
	return !1;
}
//#endregion
//#region node_modules/socket.io-parser/build/esm/binary.js
function Ke(e) {
	let t = [], n = e.data, r = e;
	return r.data = qe(n, t), r.attachments = t.length, {
		packet: r,
		buffers: t
	};
}
function qe(e, t) {
	if (!e) return e;
	if (We(e)) {
		let n = {
			_placeholder: !0,
			num: t.length
		};
		return t.push(e), n;
	} else if (Array.isArray(e)) {
		let n = Array(e.length);
		for (let r = 0; r < e.length; r++) n[r] = qe(e[r], t);
		return n;
	} else if (typeof e == "object" && !(e instanceof Date)) {
		let n = {};
		for (let r in e) Object.prototype.hasOwnProperty.call(e, r) && (n[r] = qe(e[r], t));
		return n;
	}
	return e;
}
function Je(e, t) {
	return e.data = Ye(e.data, t), delete e.attachments, e;
}
function Ye(e, t) {
	if (!e) return e;
	if (e && e._placeholder === !0) {
		if (typeof e.num == "number" && e.num >= 0 && e.num < t.length) return t[e.num];
		throw Error("illegal attachments");
	} else if (Array.isArray(e)) for (let n = 0; n < e.length; n++) e[n] = Ye(e[n], t);
	else if (typeof e == "object") for (let n in e) Object.prototype.hasOwnProperty.call(e, n) && (e[n] = Ye(e[n], t));
	return e;
}
//#endregion
//#region node_modules/socket.io-parser/build/esm/index.js
var Xe = /* @__PURE__ */ t({
	Decoder: () => $e,
	Encoder: () => Qe,
	PacketType: () => Y,
	isPacketValid: () => at,
	protocol: () => 5
}), Ze = [
	"connect",
	"connect_error",
	"disconnect",
	"disconnecting",
	"newListener",
	"removeListener"
], Y;
(function(e) {
	e[e.CONNECT = 0] = "CONNECT", e[e.DISCONNECT = 1] = "DISCONNECT", e[e.EVENT = 2] = "EVENT", e[e.ACK = 3] = "ACK", e[e.CONNECT_ERROR = 4] = "CONNECT_ERROR", e[e.BINARY_EVENT = 5] = "BINARY_EVENT", e[e.BINARY_ACK = 6] = "BINARY_ACK";
})(Y ||= {});
var Qe = class {
	constructor(e) {
		this.replacer = e;
	}
	encode(e) {
		return (e.type === Y.EVENT || e.type === Y.ACK) && Ge(e) ? this.encodeAsBinary({
			type: e.type === Y.EVENT ? Y.BINARY_EVENT : Y.BINARY_ACK,
			nsp: e.nsp,
			data: e.data,
			id: e.id
		}) : [this.encodeAsString(e)];
	}
	encodeAsString(e) {
		let t = "" + e.type;
		return (e.type === Y.BINARY_EVENT || e.type === Y.BINARY_ACK) && (t += e.attachments + "-"), e.nsp && e.nsp !== "/" && (t += e.nsp + ","), e.id != null && (t += e.id), e.data != null && (t += JSON.stringify(e.data, this.replacer)), t;
	}
	encodeAsBinary(e) {
		let t = Ke(e), n = this.encodeAsString(t.packet), r = t.buffers;
		return r.unshift(n), r;
	}
}, $e = class e extends V {
	constructor(e) {
		super(), this.opts = Object.assign({
			reviver: void 0,
			maxAttachments: 10
		}, typeof e == "function" ? { reviver: e } : e);
	}
	add(e) {
		let t;
		if (typeof e == "string") {
			if (this.reconstructor) throw Error("got plaintext data when reconstructing a packet");
			t = this.decodeString(e);
			let n = t.type === Y.BINARY_EVENT;
			n || t.type === Y.BINARY_ACK ? (t.type = n ? Y.EVENT : Y.ACK, this.reconstructor = new et(t), t.attachments === 0 && super.emitReserved("decoded", t)) : super.emitReserved("decoded", t);
		} else if (We(e) || e.base64) if (this.reconstructor) t = this.reconstructor.takeBinaryData(e), t && (this.reconstructor = null, super.emitReserved("decoded", t));
		else throw Error("got binary data when not reconstructing a packet");
		else throw Error("Unknown type: " + e);
	}
	decodeString(t) {
		let n = 0, r = { type: Number(t.charAt(0)) };
		if (Y[r.type] === void 0) throw Error("unknown packet type " + r.type);
		if (r.type === Y.BINARY_EVENT || r.type === Y.BINARY_ACK) {
			let e = n + 1;
			for (; t.charAt(++n) !== "-" && n != t.length;);
			let i = t.substring(e, n);
			if (i != Number(i) || t.charAt(n) !== "-") throw Error("Illegal attachments");
			let a = Number(i);
			if (!nt(a) || a < 0) throw Error("Illegal attachments");
			if (a > this.opts.maxAttachments) throw Error("too many attachments");
			r.attachments = a;
		}
		if (t.charAt(n + 1) === "/") {
			let e = n + 1;
			for (; ++n && !(t.charAt(n) === "," || n === t.length););
			r.nsp = t.substring(e, n);
		} else r.nsp = "/";
		let i = t.charAt(n + 1);
		if (i !== "" && Number(i) == i) {
			let e = n + 1;
			for (; ++n;) {
				let e = t.charAt(n);
				if (e == null || Number(e) != e) {
					--n;
					break;
				}
				if (n === t.length) break;
			}
			r.id = Number(t.substring(e, n + 1));
		}
		if (t.charAt(++n)) {
			let i = this.tryParse(t.substr(n));
			if (e.isPayloadValid(r.type, i)) r.data = i;
			else throw Error("invalid payload");
		}
		return r;
	}
	tryParse(e) {
		try {
			return JSON.parse(e, this.opts.reviver);
		} catch {
			return !1;
		}
	}
	static isPayloadValid(e, t) {
		switch (e) {
			case Y.CONNECT: return X(t);
			case Y.DISCONNECT: return t === void 0;
			case Y.CONNECT_ERROR: return typeof t == "string" || X(t);
			case Y.EVENT:
			case Y.BINARY_EVENT: return Array.isArray(t) && (typeof t[0] == "number" || typeof t[0] == "string" && Ze.indexOf(t[0]) === -1);
			case Y.ACK:
			case Y.BINARY_ACK: return Array.isArray(t);
		}
	}
	destroy() {
		this.reconstructor &&= (this.reconstructor.finishedReconstruction(), null);
	}
}, et = class {
	constructor(e) {
		this.packet = e, this.buffers = [], this.reconPack = e;
	}
	takeBinaryData(e) {
		if (this.buffers.push(e), this.buffers.length === this.reconPack.attachments) {
			let e = Je(this.reconPack, this.buffers);
			return this.finishedReconstruction(), e;
		}
		return null;
	}
	finishedReconstruction() {
		this.reconPack = null, this.buffers = [];
	}
};
function tt(e) {
	return typeof e == "string";
}
var nt = Number.isInteger || function(e) {
	return typeof e == "number" && isFinite(e) && Math.floor(e) === e;
};
function rt(e) {
	return e === void 0 || nt(e);
}
function X(e) {
	return Object.prototype.toString.call(e) === "[object Object]";
}
function it(e, t) {
	switch (e) {
		case Y.CONNECT: return t === void 0 || X(t);
		case Y.DISCONNECT: return t === void 0;
		case Y.EVENT: return Array.isArray(t) && (typeof t[0] == "number" || typeof t[0] == "string" && Ze.indexOf(t[0]) === -1);
		case Y.ACK: return Array.isArray(t);
		case Y.CONNECT_ERROR: return typeof t == "string" || X(t);
		default: return !1;
	}
}
function at(e) {
	return tt(e.nsp) && rt(e.id) && it(e.type, e.data);
}
//#endregion
//#region node_modules/socket.io-client/build/esm/on.js
function Z(e, t, n) {
	return e.on(t, n), function() {
		e.off(t, n);
	};
}
//#endregion
//#region node_modules/socket.io-client/build/esm/socket.js
var ot = Object.freeze({
	connect: 1,
	connect_error: 1,
	disconnect: 1,
	disconnecting: 1,
	newListener: 1,
	removeListener: 1
}), st = class extends V {
	constructor(e, t, n) {
		super(), this.connected = !1, this.recovered = !1, this.receiveBuffer = [], this.sendBuffer = [], this._queue = [], this._queueSeq = 0, this.ids = 0, this.acks = {}, this.flags = {}, this.io = e, this.nsp = t, n && n.auth && (this.auth = n.auth), this._opts = Object.assign({}, n), this.io._autoConnect && this.open();
	}
	get disconnected() {
		return !this.connected;
	}
	subEvents() {
		if (this.subs) return;
		let e = this.io;
		this.subs = [
			Z(e, "open", this.onopen.bind(this)),
			Z(e, "packet", this.onpacket.bind(this)),
			Z(e, "error", this.onerror.bind(this)),
			Z(e, "close", this.onclose.bind(this))
		];
	}
	get active() {
		return !!this.subs;
	}
	connect() {
		return this.connected ? this : (this.subEvents(), this.io._reconnecting || this.io.open(), this.io._readyState === "open" && this.onopen(), this);
	}
	open() {
		return this.connect();
	}
	send(...e) {
		return e.unshift("message"), this.emit.apply(this, e), this;
	}
	emit(e, ...t) {
		if (ot.hasOwnProperty(e)) throw Error("\"" + e.toString() + "\" is a reserved event name");
		if (t.unshift(e), this._opts.retries && !this.flags.fromQueue && !this.flags.volatile) return this._addToQueue(t), this;
		let n = {
			type: Y.EVENT,
			data: t
		};
		if (n.options = {}, n.options.compress = this.flags.compress !== !1, typeof t[t.length - 1] == "function") {
			let e = this.ids++, r = t.pop();
			this._registerAckCallback(e, r), n.id = e;
		}
		let r = this.io.engine?.transport?.writable, i = this.connected && !this.io.engine?._hasPingExpired();
		return this.flags.volatile && !r || (i ? (this.notifyOutgoingListeners(n), this.packet(n)) : this.sendBuffer.push(n)), this.flags = {}, this;
	}
	_registerAckCallback(e, t) {
		let n = this.flags.timeout ?? this._opts.ackTimeout;
		if (n === void 0) {
			this.acks[e] = t;
			return;
		}
		let r = this.io.setTimeoutFn(() => {
			delete this.acks[e];
			for (let t = 0; t < this.sendBuffer.length; t++) this.sendBuffer[t].id === e && this.sendBuffer.splice(t, 1);
			t.call(this, /* @__PURE__ */ Error("operation has timed out"));
		}, n), i = (...e) => {
			this.io.clearTimeoutFn(r), t.apply(this, e);
		};
		i.withError = !0, this.acks[e] = i;
	}
	emitWithAck(e, ...t) {
		return new Promise((n, r) => {
			let i = (e, t) => e ? r(e) : n(t);
			i.withError = !0, t.push(i), this.emit(e, ...t);
		});
	}
	_addToQueue(e) {
		let t;
		typeof e[e.length - 1] == "function" && (t = e.pop());
		let n = {
			id: this._queueSeq++,
			tryCount: 0,
			pending: !1,
			args: e,
			flags: Object.assign({ fromQueue: !0 }, this.flags)
		};
		e.push((e, ...r) => (this._queue[0], e === null ? (this._queue.shift(), t && t(null, ...r)) : n.tryCount > this._opts.retries && (this._queue.shift(), t && t(e)), n.pending = !1, this._drainQueue())), this._queue.push(n), this._drainQueue();
	}
	_drainQueue(e = !1) {
		if (!this.connected || this._queue.length === 0) return;
		let t = this._queue[0];
		t.pending && !e || (t.pending = !0, t.tryCount++, this.flags = t.flags, this.emit.apply(this, t.args));
	}
	packet(e) {
		e.nsp = this.nsp, this.io._packet(e);
	}
	onopen() {
		typeof this.auth == "function" ? this.auth((e) => {
			this._sendConnectPacket(e);
		}) : this._sendConnectPacket(this.auth);
	}
	_sendConnectPacket(e) {
		this.packet({
			type: Y.CONNECT,
			data: this._pid ? Object.assign({
				pid: this._pid,
				offset: this._lastOffset
			}, e) : e
		});
	}
	onerror(e) {
		this.connected || this.emitReserved("connect_error", e);
	}
	onclose(e, t) {
		this.connected = !1, delete this.id, this.emitReserved("disconnect", e, t), this._clearAcks();
	}
	_clearAcks() {
		Object.keys(this.acks).forEach((e) => {
			if (!this.sendBuffer.some((t) => String(t.id) === e)) {
				let t = this.acks[e];
				delete this.acks[e], t.withError && t.call(this, /* @__PURE__ */ Error("socket has been disconnected"));
			}
		});
	}
	onpacket(e) {
		if (e.nsp === this.nsp) switch (e.type) {
			case Y.CONNECT:
				e.data && e.data.sid ? this.onconnect(e.data.sid, e.data.pid) : this.emitReserved("connect_error", /* @__PURE__ */ Error("It seems you are trying to reach a Socket.IO server in v2.x with a v3.x client, but they are not compatible (more information here: https://socket.io/docs/v3/migrating-from-2-x-to-3-0/)"));
				break;
			case Y.EVENT:
			case Y.BINARY_EVENT:
				this.onevent(e);
				break;
			case Y.ACK:
			case Y.BINARY_ACK:
				this.onack(e);
				break;
			case Y.DISCONNECT:
				this.ondisconnect();
				break;
			case Y.CONNECT_ERROR:
				this.destroy();
				let t = Error(e.data.message);
				t.data = e.data.data, this.emitReserved("connect_error", t);
				break;
		}
	}
	onevent(e) {
		let t = e.data || [];
		e.id != null && t.push(this.ack(e.id)), this.connected ? this.emitEvent(t) : this.receiveBuffer.push(Object.freeze(t));
	}
	emitEvent(e) {
		if (this._anyListeners && this._anyListeners.length) {
			let t = this._anyListeners.slice();
			for (let n of t) n.apply(this, e);
		}
		super.emit.apply(this, e), this._pid && e.length && typeof e[e.length - 1] == "string" && (this._lastOffset = e[e.length - 1]);
	}
	ack(e) {
		let t = this, n = !1;
		return function(...r) {
			n || (n = !0, t.packet({
				type: Y.ACK,
				id: e,
				data: r
			}));
		};
	}
	onack(e) {
		let t = this.acks[e.id];
		typeof t == "function" && (delete this.acks[e.id], t.withError && e.data.unshift(null), t.apply(this, e.data));
	}
	onconnect(e, t) {
		this.id = e, this.recovered = t && this._pid === t, this._pid = t, this.connected = !0, this.emitBuffered(), this._drainQueue(!0), this.emitReserved("connect");
	}
	emitBuffered() {
		this.receiveBuffer.forEach((e) => this.emitEvent(e)), this.receiveBuffer = [], this.sendBuffer.forEach((e) => {
			this.notifyOutgoingListeners(e), this.packet(e);
		}), this.sendBuffer = [];
	}
	ondisconnect() {
		this.destroy(), this.onclose("io server disconnect");
	}
	destroy() {
		this.subs &&= (this.subs.forEach((e) => e()), void 0), this.io._destroy(this);
	}
	disconnect() {
		return this.connected && this.packet({ type: Y.DISCONNECT }), this.destroy(), this.connected && this.onclose("io client disconnect"), this;
	}
	close() {
		return this.disconnect();
	}
	compress(e) {
		return this.flags.compress = e, this;
	}
	get volatile() {
		return this.flags.volatile = !0, this;
	}
	timeout(e) {
		return this.flags.timeout = e, this;
	}
	onAny(e) {
		return this._anyListeners = this._anyListeners || [], this._anyListeners.push(e), this;
	}
	prependAny(e) {
		return this._anyListeners = this._anyListeners || [], this._anyListeners.unshift(e), this;
	}
	offAny(e) {
		if (!this._anyListeners) return this;
		if (e) {
			let t = this._anyListeners;
			for (let n = 0; n < t.length; n++) if (e === t[n]) return t.splice(n, 1), this;
		} else this._anyListeners = [];
		return this;
	}
	listenersAny() {
		return this._anyListeners || [];
	}
	onAnyOutgoing(e) {
		return this._anyOutgoingListeners = this._anyOutgoingListeners || [], this._anyOutgoingListeners.push(e), this;
	}
	prependAnyOutgoing(e) {
		return this._anyOutgoingListeners = this._anyOutgoingListeners || [], this._anyOutgoingListeners.unshift(e), this;
	}
	offAnyOutgoing(e) {
		if (!this._anyOutgoingListeners) return this;
		if (e) {
			let t = this._anyOutgoingListeners;
			for (let n = 0; n < t.length; n++) if (e === t[n]) return t.splice(n, 1), this;
		} else this._anyOutgoingListeners = [];
		return this;
	}
	listenersAnyOutgoing() {
		return this._anyOutgoingListeners || [];
	}
	notifyOutgoingListeners(e) {
		if (this._anyOutgoingListeners && this._anyOutgoingListeners.length) {
			let t = this._anyOutgoingListeners.slice();
			for (let n of t) n.apply(this, e.data);
		}
	}
};
//#endregion
//#region node_modules/socket.io-client/build/esm/contrib/backo2.js
function Q(e) {
	e ||= {}, this.ms = e.min || 100, this.max = e.max || 1e4, this.factor = e.factor || 2, this.jitter = e.jitter > 0 && e.jitter <= 1 ? e.jitter : 0, this.attempts = 0;
}
Q.prototype.duration = function() {
	var e = this.ms * this.factor ** + this.attempts++;
	if (this.jitter) {
		var t = Math.random(), n = Math.floor(t * this.jitter * e);
		e = Math.floor(t * 10) & 1 ? e + n : e - n;
	}
	return Math.min(e, this.max) | 0;
}, Q.prototype.reset = function() {
	this.attempts = 0;
}, Q.prototype.setMin = function(e) {
	this.ms = e;
}, Q.prototype.setMax = function(e) {
	this.max = e;
}, Q.prototype.setJitter = function(e) {
	this.jitter = e;
};
//#endregion
//#region node_modules/socket.io-client/build/esm/manager.js
var ct = class extends V {
	constructor(e, t) {
		super(), this.nsps = {}, this.subs = [], e && typeof e == "object" && (t = e, e = void 0), t ||= {}, t.path = t.path || "/socket.io", this.opts = t, q(this, t), this.reconnection(t.reconnection !== !1), this.reconnectionAttempts(t.reconnectionAttempts || Infinity), this.reconnectionDelay(t.reconnectionDelay || 1e3), this.reconnectionDelayMax(t.reconnectionDelayMax || 5e3), this.randomizationFactor(t.randomizationFactor ?? .5), this.backoff = new Q({
			min: this.reconnectionDelay(),
			max: this.reconnectionDelayMax(),
			jitter: this.randomizationFactor()
		}), this.timeout(t.timeout == null ? 2e4 : t.timeout), this._readyState = "closed", this.uri = e;
		let n = t.parser || Xe;
		this.encoder = new n.Encoder(), this.decoder = new n.Decoder(), this._autoConnect = t.autoConnect !== !1, this._autoConnect && this.open();
	}
	reconnection(e) {
		return arguments.length ? (this._reconnection = !!e, e || (this.skipReconnect = !0), this) : this._reconnection;
	}
	reconnectionAttempts(e) {
		return e === void 0 ? this._reconnectionAttempts : (this._reconnectionAttempts = e, this);
	}
	reconnectionDelay(e) {
		var t;
		return e === void 0 ? this._reconnectionDelay : (this._reconnectionDelay = e, (t = this.backoff) == null || t.setMin(e), this);
	}
	randomizationFactor(e) {
		var t;
		return e === void 0 ? this._randomizationFactor : (this._randomizationFactor = e, (t = this.backoff) == null || t.setJitter(e), this);
	}
	reconnectionDelayMax(e) {
		var t;
		return e === void 0 ? this._reconnectionDelayMax : (this._reconnectionDelayMax = e, (t = this.backoff) == null || t.setMax(e), this);
	}
	timeout(e) {
		return arguments.length ? (this._timeout = e, this) : this._timeout;
	}
	maybeReconnectOnOpen() {
		!this._reconnecting && this._reconnection && this.backoff.attempts === 0 && this.reconnect();
	}
	open(e) {
		if (~this._readyState.indexOf("open")) return this;
		this.engine = new Le(this.uri, this.opts);
		let t = this.engine, n = this;
		this._readyState = "opening", this.skipReconnect = !1;
		let r = Z(t, "open", function() {
			n.onopen(), e && e();
		}), i = (t) => {
			this.cleanup(), this._readyState = "closed", this.emitReserved("error", t), e ? e(t) : this.maybeReconnectOnOpen();
		}, a = Z(t, "error", i);
		if (!1 !== this._timeout) {
			let e = this._timeout, n = this.setTimeoutFn(() => {
				r(), i(/* @__PURE__ */ Error("timeout")), t.close();
			}, e);
			this.opts.autoUnref && n.unref(), this.subs.push(() => {
				this.clearTimeoutFn(n);
			});
		}
		return this.subs.push(r), this.subs.push(a), this;
	}
	connect(e) {
		return this.open(e);
	}
	onopen() {
		this.cleanup(), this._readyState = "open", this.emitReserved("open");
		let e = this.engine;
		this.subs.push(Z(e, "ping", this.onping.bind(this)), Z(e, "data", this.ondata.bind(this)), Z(e, "error", this.onerror.bind(this)), Z(e, "close", this.onclose.bind(this)), Z(this.decoder, "decoded", this.ondecoded.bind(this)));
	}
	onping() {
		this.emitReserved("ping");
	}
	ondata(e) {
		try {
			this.decoder.add(e);
		} catch (e) {
			this.onclose("parse error", e);
		}
	}
	ondecoded(e) {
		U(() => {
			this.emitReserved("packet", e);
		}, this.setTimeoutFn);
	}
	onerror(e) {
		this.emitReserved("error", e);
	}
	socket(e, t) {
		let n = this.nsps[e];
		return n ? this._autoConnect && !n.active && n.connect() : (n = new st(this, e, t), this.nsps[e] = n), n;
	}
	_destroy(e) {
		let t = Object.keys(this.nsps);
		for (let e of t) if (this.nsps[e].active) return;
		this._close();
	}
	_packet(e) {
		let t = this.encoder.encode(e);
		for (let n = 0; n < t.length; n++) this.engine.write(t[n], e.options);
	}
	cleanup() {
		this.subs.forEach((e) => e()), this.subs.length = 0, this.decoder.destroy();
	}
	_close() {
		this.skipReconnect = !0, this._reconnecting = !1, this.onclose("forced close");
	}
	disconnect() {
		return this._close();
	}
	onclose(e, t) {
		var n;
		this.cleanup(), (n = this.engine) == null || n.close(), this.backoff.reset(), this._readyState = "closed", this.emitReserved("close", e, t), this._reconnection && !this.skipReconnect && this.reconnect();
	}
	reconnect() {
		if (this._reconnecting || this.skipReconnect) return this;
		let e = this;
		if (this.backoff.attempts >= this._reconnectionAttempts) this.backoff.reset(), this.emitReserved("reconnect_failed"), this._reconnecting = !1;
		else {
			let t = this.backoff.duration();
			this._reconnecting = !0;
			let n = this.setTimeoutFn(() => {
				e.skipReconnect || (this.emitReserved("reconnect_attempt", e.backoff.attempts), !e.skipReconnect && e.open((t) => {
					t ? (e._reconnecting = !1, e.reconnect(), this.emitReserved("reconnect_error", t)) : e.onreconnect();
				}));
			}, t);
			this.opts.autoUnref && n.unref(), this.subs.push(() => {
				this.clearTimeoutFn(n);
			});
		}
	}
	onreconnect() {
		let e = this.backoff.attempts;
		this._reconnecting = !1, this.backoff.reset(), this.emitReserved("reconnect", e);
	}
}, $ = {};
function lt(e, t) {
	typeof e == "object" && (t = e, e = void 0), t ||= {};
	let n = Re(e, t.path || "/socket.io"), r = n.source, i = n.id, a = n.path, o = $[i] && a in $[i].nsps, s = t.forceNew || t["force new connection"] || !1 === t.multiplex || o, c;
	return s ? c = new ct(r, t) : ($[i] || ($[i] = new ct(r, t)), c = $[i]), n.query && !t.query && (t.query = n.queryKey), c.socket(n.path, t);
}
Object.assign(lt, {
	Manager: ct,
	Socket: st,
	io: lt,
	connect: lt
});
//#endregion
//#region src/chatbotWidget.ts
var ut = "chatbot-package-styles", dt = {
	botName: "Support Assistant",
	title: "Support Assistant",
	subtitle: "Online",
	welcomeMessage: "Hi there! I am your support assistant. Ask me anything.",
	placeholder: "Type your question...",
	primaryColor: "#2563eb",
	position: "bottom-right",
	zIndex: 9999
}, ft = "\n.chatbot-widget-root {\n  position: fixed;\n  bottom: 16px;\n  font-family: \"Segoe UI\", -apple-system, BlinkMacSystemFont, sans-serif;\n}\n\n.chatbot-widget-root.right {\n  right: 16px;\n}\n\n.chatbot-widget-root.left {\n  left: 16px;\n}\n\n.chatbot-launcher {\n  width: 56px;\n  height: 56px;\n  border-radius: 9999px;\n  border: 0;\n  background: linear-gradient(135deg, var(--chatbot-primary), #1d4ed8);\n  color: #ffffff;\n  box-shadow: 0 16px 30px rgba(37, 99, 235, 0.35);\n  cursor: pointer;\n  display: grid;\n  place-items: center;\n  font-size: 12px;\n  font-weight: 700;\n  letter-spacing: 0.2px;\n  transition: transform 0.18s ease, box-shadow 0.18s ease;\n}\n\n.chatbot-launcher svg {\n  width: 20px;\n  height: 20px;\n}\n\n.chatbot-launcher:hover {\n  transform: translateY(-2px);\n  box-shadow: 0 20px 34px rgba(37, 99, 235, 0.42);\n}\n\n.chatbot-panel {\n  position: absolute;\n  bottom: 66px;\n  width: min(378px, calc(100vw - 24px));\n  height: min(610px, calc(100vh - 88px));\n  border-radius: 16px;\n  border: 1px solid #dbe4f5;\n  overflow: hidden;\n  box-shadow: 0 28px 56px rgba(15, 23, 42, 0.24);\n  background: #f8fbff;\n  display: flex;\n  flex-direction: column;\n  opacity: 0;\n  visibility: hidden;\n  pointer-events: none;\n  transform: translateY(10px) scale(0.98);\n  transition: opacity 0.2s ease, transform 0.2s ease, visibility 0.2s ease;\n}\n\n.chatbot-widget-root.right .chatbot-panel {\n  right: 0;\n  transform-origin: bottom right;\n}\n\n.chatbot-widget-root.left .chatbot-panel {\n  left: 0;\n  transform-origin: bottom left;\n}\n\n.chatbot-widget-root.open .chatbot-panel {\n  opacity: 1;\n  visibility: visible;\n  pointer-events: auto;\n  transform: translateY(0) scale(1);\n}\n\n.chatbot-header {\n  background: linear-gradient(135deg, var(--chatbot-primary), #1d4ed8);\n  color: #ffffff;\n  padding: 12px;\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 10px;\n}\n\n.chatbot-header-left {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n}\n\n.chatbot-avatar {\n  width: 38px;\n  height: 38px;\n  border-radius: 9999px;\n  background: #ffffff;\n  color: var(--chatbot-primary);\n  border: 1px solid rgba(255, 255, 255, 0.84);\n  display: grid;\n  place-items: center;\n  font-size: 14px;\n  font-weight: 700;\n}\n\n.chatbot-avatar svg {\n  width: 18px;\n  height: 18px;\n}\n\n.chatbot-header-info h2 {\n  margin: 0;\n  font-size: 15px;\n  line-height: 1.15;\n  font-weight: 700;\n}\n\n.chatbot-status {\n  margin-top: 3px;\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  font-size: 12px;\n  font-weight: 500;\n  opacity: 0.95;\n}\n\n.chatbot-status-dot {\n  width: 8px;\n  height: 8px;\n  border-radius: 9999px;\n  background: #22c55e;\n}\n\n.chatbot-controls {\n  display: flex;\n  align-items: center;\n  margin-left: auto;\n}\n\n.chatbot-controls button {\n  width: 34px;\n  height: 34px;\n  border-radius: 8px;\n  border: 1px solid rgba(255, 255, 255, 0.42);\n  background: rgba(255, 255, 255, 0.24);\n  color: #ffffff;\n  cursor: pointer;\n  line-height: 0;\n  display: grid;\n  place-items: center;\n  transition: background 0.2s ease, transform 0.2s ease;\n}\n\n.chatbot-controls button svg {\n  width: 16px;\n  height: 16px;\n  stroke-width: 2.25;\n}\n\n.chatbot-controls button:hover {\n  background: rgba(255, 255, 255, 0.36);\n  transform: translateY(-1px);\n}\n\n.chatbot-body {\n  flex: 1;\n  overflow-y: auto;\n  padding: 14px 12px 10px;\n  background: linear-gradient(180deg, #f8fbff 0%, #f1f6ff 100%);\n}\n\n.chatbot-body::-webkit-scrollbar {\n  width: 8px;\n}\n\n.chatbot-body::-webkit-scrollbar-thumb {\n  background: #bfdbfe;\n  border-radius: 999px;\n}\n\n.chatbot-intro {\n  text-align: center;\n  color: #334155;\n  border: 1px solid #dbe4f5;\n  background: rgba(255, 255, 255, 0.72);\n  border-radius: 14px;\n  padding: 16px 12px;\n}\n\n.chatbot-intro-icon {\n  width: 44px;\n  height: 44px;\n  border-radius: 9999px;\n  background: #dbeafe;\n  color: #1d4ed8;\n  display: grid;\n  place-items: center;\n  font-size: 22px;\n  font-weight: 700;\n  margin: 0 auto 12px;\n}\n\n.chatbot-intro h3 {\n  margin: 0;\n  font-size: 25px;\n  color: #0f172a;\n}\n\n.chatbot-intro p {\n  margin: 10px auto 0;\n  max-width: 290px;\n  font-size: 13px;\n  line-height: 1.45;\n  color: #475569;\n}\n\n.chatbot-intro .chatbot-human-note {\n  margin-top: 12px;\n  font-style: italic;\n  font-size: 12px;\n  color: #6b7a92;\n}\n\n.chatbot-messages {\n  display: none;\n  flex-direction: column;\n  gap: 8px;\n}\n\n.chatbot-body.has-messages .chatbot-intro {\n  display: none;\n}\n\n.chatbot-body.has-messages .chatbot-messages {\n  display: flex;\n}\n\n.chatbot-bubble {\n  max-width: 86%;\n  border-radius: 12px;\n  padding: 8px 10px;\n  line-height: 1.45;\n  font-size: 13px;\n  white-space: pre-wrap;\n}\n\n.chatbot-bubble.user {\n  align-self: flex-end;\n  background: linear-gradient(135deg, var(--chatbot-primary), #1d4ed8);\n  color: #ffffff;\n}\n\n.chatbot-bubble.bot {\n  align-self: flex-start;\n  background: #e2e8f0;\n  color: #1e293b;\n}\n\n.chatbot-footer {\n  border-top: 1px solid #dbe4f5;\n  background: #f8fbff;\n  padding: 10px;\n}\n\n.chatbot-input-row {\n  display: grid;\n  grid-template-columns: 1fr auto;\n  gap: 8px;\n  margin-bottom: 8px;\n  align-items: center;\n}\n\n.chatbot-input-row input {\n  border: 1px solid #bfdbfe;\n  border-radius: 10px;\n  min-height: 44px;\n  padding: 0 12px;\n  outline: none;\n  font-size: 13px;\n  background: #ffffff;\n  color: #1e293b;\n}\n\n.chatbot-input-row input:focus {\n  border-color: var(--chatbot-primary);\n  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);\n}\n\n.chatbot-input-row button {\n  width: 46px;\n  height: 44px;\n  border: 0;\n  border-radius: 12px;\n  background: linear-gradient(135deg, var(--chatbot-primary), #1d4ed8);\n  color: #ffffff;\n  font-size: 14px;\n  font-weight: 700;\n  cursor: pointer;\n  padding: 0;\n  display: grid;\n  place-items: center;\n  box-shadow: 0 10px 18px rgba(37, 99, 235, 0.28);\n  transition: transform 0.2s ease, box-shadow 0.2s ease;\n}\n\n.chatbot-input-row button svg {\n  width: 17px;\n  height: 17px;\n  stroke-width: 2.2;\n}\n\n.chatbot-input-row button:hover {\n  transform: translateY(-1px);\n  box-shadow: 0 14px 24px rgba(37, 99, 235, 0.34);\n}\n\n.chatbot-human-button {\n  width: 100%;\n  border: 1px solid #cbd5e1;\n  border-radius: 12px;\n  background: #ffffff;\n  color: #334155;\n  min-height: 44px;\n  padding: 0 12px;\n  font-size: 14px;\n  font-weight: 600;\n  cursor: pointer;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  gap: 8px;\n  transition: border-color 0.2s ease, background 0.2s ease;\n}\n\n.chatbot-human-button:hover {\n  background: #f8fafc;\n  border-color: #94a3b8;\n}\n\n.chatbot-human-button svg {\n  width: 16px;\n  height: 16px;\n  stroke-width: 2.1;\n}\n\n.chatbot-powered {\n  margin: 8px 0 0;\n  text-align: center;\n  font-size: 11px;\n  color: #94a3b8;\n}\n\n.chatbot-powered strong {\n  color: #64748b;\n}\n\n/* --- Human Form Styles --- */\n.chatbot-widget-root.show-human-form .chatbot-body,\n.chatbot-widget-root.show-human-form .chatbot-footer {\n  display: none !important;\n}\n\n.chatbot-human-container {\n  display: none;\n  flex: 1;\n  flex-direction: column;\n  background: #f8fbff;\n  overflow-y: auto;\n}\n\n.chatbot-widget-root.show-human-form .chatbot-human-container {\n  display: flex;\n}\n\n.chatbot-human-container::-webkit-scrollbar {\n  width: 8px;\n}\n\n.chatbot-human-container::-webkit-scrollbar-thumb {\n  background: #bfdbfe;\n  border-radius: 999px;\n}\n\n.chatbot-human-header {\n  padding: 20px 16px 12px;\n  text-align: center;\n}\n\n.chatbot-human-header h3 {\n  margin: 0 0 6px;\n  color: #0f172a;\n  font-size: 18px;\n}\n\n.chatbot-human-header p {\n  margin: 0;\n  color: #64748b;\n  font-size: 13px;\n  line-height: 1.45;\n}\n\n.chatbot-human-form {\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n  padding: 0 16px 20px;\n}\n\n.chatbot-form-group {\n  display: flex;\n  flex-direction: column;\n  gap: 6px;\n}\n\n.chatbot-form-group label {\n  font-size: 13px;\n  font-weight: 600;\n  color: #334155;\n}\n\n.chatbot-form-group input,\n.chatbot-form-group textarea {\n  border: 1px solid #bfdbfe;\n  border-radius: 8px;\n  padding: 10px;\n  font-size: 13px;\n  outline: none;\n  background: #ffffff;\n  color: #1e293b;\n  font-family: inherit;\n  transition: border-color 0.2s, box-shadow 0.2s;\n}\n\n.chatbot-form-group input:focus,\n.chatbot-form-group textarea:focus {\n  border-color: var(--chatbot-primary);\n  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);\n}\n\n.chatbot-form-group textarea {\n  resize: vertical;\n  min-height: 80px;\n}\n\n.chatbot-form-actions {\n  display: flex;\n  gap: 12px;\n  margin-top: 8px;\n}\n\n.chatbot-btn-primary {\n  flex: 1;\n  background: linear-gradient(135deg, var(--chatbot-primary), #1d4ed8);\n  color: white;\n  border: none;\n  padding: 10px;\n  border-radius: 8px;\n  font-weight: 600;\n  cursor: pointer;\n  transition: transform 0.2s, box-shadow 0.2s;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  gap: 6px;\n}\n\n.chatbot-btn-primary:hover {\n  transform: translateY(-1px);\n  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);\n}\n\n.chatbot-btn-secondary {\n  flex: 1;\n  background: #e2e8f0;\n  color: #334155;\n  border: none;\n  padding: 10px;\n  border-radius: 8px;\n  font-weight: 600;\n  cursor: pointer;\n  transition: background 0.2s;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  gap: 6px;\n}\n\n.chatbot-btn-secondary:hover {\n  background: #cbd5e1;\n}\n\n.chatbot-human-success {\n  display: none;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  text-align: center;\n  padding: 32px 24px;\n  height: 100%;\n}\n\n.chatbot-widget-root.show-human-success .chatbot-human-success {\n  display: flex;\n}\n.chatbot-widget-root.show-human-success .chatbot-human-form,\n.chatbot-widget-root.show-human-success .chatbot-human-header {\n  display: none !important;\n}\n\n.chatbot-success-icon {\n  width: 56px;\n  height: 56px;\n  background: #dcfce7;\n  color: #16a34a;\n  border-radius: 50%;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  margin-bottom: 20px;\n}\n\n.chatbot-success-icon svg {\n  width: 28px;\n  height: 28px;\n}\n\n.chatbot-human-success h3 {\n  margin: 0 0 8px;\n  color: #0f172a;\n  font-size: 20px;\n}\n\n.chatbot-human-success p {\n  margin: 0 0 24px;\n  color: #475569;\n  font-size: 14px;\n  line-height: 1.5;\n}\n\n@media (max-width: 640px) {\n  .chatbot-widget-root.right,\n  .chatbot-widget-root.left {\n    right: 10px;\n    left: 10px;\n  }\n\n  .chatbot-widget-root {\n    bottom: 10px;\n  }\n\n  .chatbot-panel {\n    width: min(360px, calc(100vw - 20px));\n    height: min(520px, calc(100vh - 70px));\n  }\n\n  .chatbot-intro h3 {\n    font-size: 22px;\n  }\n}\n", pt = () => {
	if (document.getElementById(ut)) return;
	let e = document.createElement("style");
	e.id = ut, e.textContent = ft, document.head.appendChild(e);
}, mt = (e, t) => {
	let n = document.createElement("div");
	return n.className = `chatbot-bubble ${t}`, n.textContent = e, n;
}, ht = (e, t, n) => {
	let r = document.createElement("button");
	return r.type = "button", r.innerHTML = `<i data-lucide="${e}" aria-hidden="true"></i>`, r.setAttribute("aria-label", t), n && r.addEventListener("click", n), r;
}, gt = () => {
	v({ icons: {
		Bot: p,
		MessageCircle: m,
		SendHorizontal: h,
		UserRound: g,
		X: _,
		CheckCircle: ee,
		ArrowLeft: f
	} });
}, _t = (e) => e.replace(/\/+$/, ""), vt = (e) => e.replace(/\/api\/?$/i, ""), yt = (e) => e && typeof e == "object" && "data" in e ? e.data : e, bt = (e = {}) => {
	if (typeof window > "u" || typeof document > "u") throw Error("chatbot-package can only run in a browser environment.");
	pt();
	let t = {
		...dt,
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
	let ee = ht("x", "Close chat", () => {
		n.classList.remove("open"), r.setAttribute("aria-expanded", "false");
	});
	p.append(ee), a.append(o, p);
	let m = document.createElement("div");
	m.className = "chatbot-body";
	let h = document.createElement("section");
	h.className = "chatbot-intro";
	let g = document.createElement("div");
	g.className = "chatbot-intro-icon", g.textContent = "?";
	let _ = document.createElement("h3");
	_.textContent = "Hi there!";
	let v = document.createElement("p");
	v.textContent = "I am your AI support assistant. Ask me anything.";
	let y = document.createElement("p");
	y.className = "chatbot-human-note", y.textContent = "If I cannot help, you can connect with our human support team.", h.append(g, _, v, y);
	let b = document.createElement("div");
	b.className = "chatbot-messages", b.setAttribute("aria-live", "polite"), b.appendChild(mt(t.welcomeMessage, "bot")), m.append(h, b);
	let x = document.createElement("div");
	x.className = "chatbot-footer";
	let S = document.createElement("form");
	S.className = "chatbot-input-row";
	let C = document.createElement("input");
	C.type = "text", C.placeholder = t.placeholder;
	let w = document.createElement("button");
	w.type = "submit", w.setAttribute("aria-label", "Send message"), w.innerHTML = "<i data-lucide=\"send-horizontal\" aria-hidden=\"true\"></i>", S.append(C, w);
	let T = document.createElement("button");
	T.type = "button", T.className = "chatbot-human-button", T.innerHTML = "<i data-lucide=\"user-round\" aria-hidden=\"true\"></i><span>Talk to a real human</span>";
	let E = document.createElement("p");
	E.className = "chatbot-powered", E.innerHTML = "Powered by <strong>AI assistant</strong>", x.append(S, T, E);
	let D = document.createElement("div");
	D.className = "chatbot-human-container";
	let O = document.createElement("div");
	O.className = "chatbot-human-header";
	let te = document.createElement("h3");
	te.textContent = "Contact Support";
	let ne = document.createElement("p");
	ne.textContent = "Please provide your details and we will get back to you shortly.", O.append(te, ne);
	let k = document.createElement("form");
	k.className = "chatbot-human-form";
	let re = (e, t) => {
		let n = document.createElement("div");
		n.className = "chatbot-form-group";
		let r = document.createElement("label");
		return r.textContent = e, n.append(r, t), n;
	}, A = document.createElement("input");
	A.type = "text", A.placeholder = "John Doe", A.required = !0;
	let j = document.createElement("input");
	j.type = "email", j.placeholder = "john@example.com", j.required = !0;
	let M = document.createElement("textarea");
	M.placeholder = "How can we help you?", M.required = !0;
	let N = document.createElement("div");
	N.className = "chatbot-form-actions";
	let P = document.createElement("button");
	P.type = "button", P.className = "chatbot-btn-secondary", P.innerHTML = "<i data-lucide=\"arrow-left\" aria-hidden=\"true\" style=\"width: 16px; height: 16px;\"></i> Back";
	let F = document.createElement("button");
	F.type = "submit", F.className = "chatbot-btn-primary", F.textContent = "Send Message", N.append(P, F), k.append(re("Name", A), re("Email", j), re("Description", M), N);
	let ie = document.createElement("div");
	ie.className = "chatbot-human-success";
	let I = document.createElement("div");
	I.className = "chatbot-success-icon", I.innerHTML = "<i data-lucide=\"check-circle\" aria-hidden=\"true\"></i>";
	let L = document.createElement("h3");
	L.textContent = "Message Sent!";
	let R = document.createElement("p");
	R.textContent = "Our support team will reach out to you via email shortly.";
	let z = document.createElement("button");
	z.type = "button", z.className = "chatbot-btn-primary", z.textContent = "Back to Chat", ie.append(I, L, R, z), D.append(O, k, ie), i.append(a, m, x, D), n.append(i, r), document.body.appendChild(n), gt();
	let B = !1, V = !1, H = !1, U = null, W = null, ae = null, G = (e) => {
		e.trim() && (m.classList.add("has-messages"), b.appendChild(mt(e.trim(), "bot")), m.scrollTop = m.scrollHeight);
	}, K = (e) => {
		V || (B = e, n.classList.toggle("open", B), r.setAttribute("aria-expanded", String(B)), B && window.setTimeout(() => C.focus(), 0));
	}, oe = async (n) => {
		if (H && U) {
			U.emit("widget:message", { text: n });
			return;
		}
		if (e.onUserMessage) {
			let t = await e.onUserMessage(n);
			typeof t == "string" && t.trim() && G(t);
			return;
		}
		G(`Thanks! ${t.botName} received: "${n}"`);
	}, q = async (e) => {
		if (!t.humanSupport) {
			G("Human support is not configured for this widget yet.");
			return;
		}
		let n = _t(t.humanSupport.apiBaseUrl), r = await fetch(`${n}/widget/session`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				widgetKey: t.humanSupport.widgetKey,
				visitorName: e.name,
				visitorEmail: e.email,
				issue: e.issue
			})
		});
		if (!r.ok) throw Error("Unable to connect to human support right now.");
		let i = yt(await r.json());
		W = i.sessionId, ae = i.ticketId, H = !0;
		let a = lt(vt(n), {
			path: "/socket.io",
			transports: ["websocket"],
			auth: { token: i.chatToken }
		});
		U = a, a.on("connect", () => {
			f.textContent = "Connected with human support";
		}), a.on("disconnect", () => {
			H && (f.textContent = "Reconnecting to human support...");
		}), a.on("chat:message", (e) => {
			e.sessionId === W && e.sender === "agent" && typeof e.text == "string" && G(e.text);
		}), a.on("chat:error", (e) => {
			G(e.message || "Support connection error. Please try again.");
		}), a.emit("widget:request_human", {
			name: e.name,
			email: e.email,
			issue: e.issue
		});
	}, se = async (e) => {
		let t = e.trim();
		!t || V || (m.classList.add("has-messages"), b.appendChild(mt(t, "user")), C.value = "", m.scrollTop = m.scrollHeight, await oe(t));
	};
	return r.addEventListener("click", () => {
		K(!B);
	}), S.addEventListener("submit", async (e) => {
		e.preventDefault(), await se(C.value);
	}), T.addEventListener("click", () => {
		n.classList.add("show-human-form"), n.classList.remove("show-human-success");
	}), P.addEventListener("click", () => {
		n.classList.remove("show-human-form");
	}), k.addEventListener("submit", async (e) => {
		e.preventDefault(), F.disabled = !0, F.textContent = "Connecting...";
		try {
			await q({
				name: A.value.trim(),
				email: j.value.trim(),
				issue: M.value.trim()
			}), n.classList.add("show-human-success"), L.textContent = "Connected to Support", R.textContent = "You can now continue chatting with a human support agent.", F.textContent = "Send Message";
		} catch (e) {
			G(e instanceof Error ? e.message : "Unable to connect to support right now."), F.textContent = "Send Message";
		} finally {
			F.disabled = !1;
		}
	}), z.addEventListener("click", () => {
		n.classList.remove("show-human-form"), n.classList.remove("show-human-success"), k.reset(), m.classList.add("has-messages"), b.appendChild(mt(H && ae ? `You are now connected with our support team (ticket ${ae.slice(-6)}).` : "Your issue has been submitted. A human agent will contact you soon.", "bot")), m.scrollTop = m.scrollHeight;
	}), {
		open: () => K(!0),
		close: () => K(!1),
		toggle: () => K(!B),
		sendMessage: se,
		destroy: () => {
			V || (V = !0, U &&= (U.close(), null), n.remove());
		}
	};
};
//#endregion
export { bt as createChatbotWidget };
