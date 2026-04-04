//#region \0rolldown/runtime.js
var e = Object.defineProperty, t = (t, n) => {
	let r = {};
	for (var i in t) e(r, i, {
		get: t[i],
		enumerable: !0
	});
	return n || e(r, Symbol.toStringTag, { value: "Module" }), r;
}, n = Object.create(null);
n.open = "0", n.close = "1", n.ping = "2", n.pong = "3", n.message = "4", n.upgrade = "5", n.noop = "6";
var r = Object.create(null);
Object.keys(n).forEach((e) => {
	r[n[e]] = e;
});
var i = {
	type: "error",
	data: "parser error"
}, a = typeof Blob == "function" || typeof Blob < "u" && Object.prototype.toString.call(Blob) === "[object BlobConstructor]", o = typeof ArrayBuffer == "function", s = (e) => typeof ArrayBuffer.isView == "function" ? ArrayBuffer.isView(e) : e && e.buffer instanceof ArrayBuffer, c = ({ type: e, data: t }, r, i) => a && t instanceof Blob ? r ? i(t) : l(t, i) : o && (t instanceof ArrayBuffer || s(t)) ? r ? i(t) : l(new Blob([t]), i) : i(n[e] + (t || "")), l = (e, t) => {
	let n = new FileReader();
	return n.onload = function() {
		let e = n.result.split(",")[1];
		t("b" + (e || ""));
	}, n.readAsDataURL(e);
};
function u(e) {
	return e instanceof Uint8Array ? e : e instanceof ArrayBuffer ? new Uint8Array(e) : new Uint8Array(e.buffer, e.byteOffset, e.byteLength);
}
var d;
function f(e, t) {
	if (a && e.data instanceof Blob) return e.data.arrayBuffer().then(u).then(t);
	if (o && (e.data instanceof ArrayBuffer || s(e.data))) return t(u(e.data));
	c(e, !1, (e) => {
		d ||= new TextEncoder(), t(d.encode(e));
	});
}
//#endregion
//#region node_modules/engine.io-parser/build/esm/contrib/base64-arraybuffer.js
var p = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", m = typeof Uint8Array > "u" ? [] : new Uint8Array(256);
for (let e = 0; e < 64; e++) m[p.charCodeAt(e)] = e;
var h = (e) => {
	let t = e.length * .75, n = e.length, r, i = 0, a, o, s, c;
	e[e.length - 1] === "=" && (t--, e[e.length - 2] === "=" && t--);
	let l = new ArrayBuffer(t), u = new Uint8Array(l);
	for (r = 0; r < n; r += 4) a = m[e.charCodeAt(r)], o = m[e.charCodeAt(r + 1)], s = m[e.charCodeAt(r + 2)], c = m[e.charCodeAt(r + 3)], u[i++] = a << 2 | o >> 4, u[i++] = (o & 15) << 4 | s >> 2, u[i++] = (s & 3) << 6 | c & 63;
	return l;
}, g = typeof ArrayBuffer == "function", _ = (e, t) => {
	if (typeof e != "string") return {
		type: "message",
		data: ee(e, t)
	};
	let n = e.charAt(0);
	return n === "b" ? {
		type: "message",
		data: v(e.substring(1), t)
	} : r[n] ? e.length > 1 ? {
		type: r[n],
		data: e.substring(1)
	} : { type: r[n] } : i;
}, v = (e, t) => g ? ee(h(e), t) : {
	base64: !0,
	data: e
}, ee = (e, t) => {
	switch (t) {
		case "blob": return e instanceof Blob ? e : new Blob([e]);
		default: return e instanceof ArrayBuffer ? e : e.buffer;
	}
}, te = "", ne = (e, t) => {
	let n = e.length, r = Array(n), i = 0;
	e.forEach((e, a) => {
		c(e, !1, (e) => {
			r[a] = e, ++i === n && t(r.join(te));
		});
	});
}, re = (e, t) => {
	let n = e.split(te), r = [];
	for (let e = 0; e < n.length; e++) {
		let i = _(n[e], t);
		if (r.push(i), i.type === "error") break;
	}
	return r;
};
function y() {
	return new TransformStream({ transform(e, t) {
		f(e, (n) => {
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
var b;
function x(e) {
	return e.reduce((e, t) => e + t.length, 0);
}
function S(e, t) {
	if (e[0].length === t) return e.shift();
	let n = new Uint8Array(t), r = 0;
	for (let i = 0; i < t; i++) n[i] = e[0][r++], r === e[0].length && (e.shift(), r = 0);
	return e.length && r < e[0].length && (e[0] = e[0].slice(r)), n;
}
function C(e, t) {
	b ||= new TextDecoder();
	let n = [], r = 0, a = -1, o = !1;
	return new TransformStream({ transform(s, c) {
		for (n.push(s);;) {
			if (r === 0) {
				if (x(n) < 1) break;
				let e = S(n, 1);
				o = (e[0] & 128) == 128, a = e[0] & 127, r = a < 126 ? 3 : a === 126 ? 1 : 2;
			} else if (r === 1) {
				if (x(n) < 2) break;
				let e = S(n, 2);
				a = new DataView(e.buffer, e.byteOffset, e.length).getUint16(0), r = 3;
			} else if (r === 2) {
				if (x(n) < 8) break;
				let e = S(n, 8), t = new DataView(e.buffer, e.byteOffset, e.length), o = t.getUint32(0);
				if (o > 2 ** 21 - 1) {
					c.enqueue(i);
					break;
				}
				a = o * 2 ** 32 + t.getUint32(4), r = 3;
			} else {
				if (x(n) < a) break;
				let e = S(n, a);
				c.enqueue(_(o ? e : b.decode(e), t)), r = 0;
			}
			if (a === 0 || a > e) {
				c.enqueue(i);
				break;
			}
		}
	} });
}
//#endregion
//#region node_modules/@socket.io/component-emitter/lib/esm/index.js
function w(e) {
	if (e) return T(e);
}
function T(e) {
	for (var t in w.prototype) e[t] = w.prototype[t];
	return e;
}
w.prototype.on = w.prototype.addEventListener = function(e, t) {
	return this._callbacks = this._callbacks || {}, (this._callbacks["$" + e] = this._callbacks["$" + e] || []).push(t), this;
}, w.prototype.once = function(e, t) {
	function n() {
		this.off(e, n), t.apply(this, arguments);
	}
	return n.fn = t, this.on(e, n), this;
}, w.prototype.off = w.prototype.removeListener = w.prototype.removeAllListeners = w.prototype.removeEventListener = function(e, t) {
	if (this._callbacks = this._callbacks || {}, arguments.length == 0) return this._callbacks = {}, this;
	var n = this._callbacks["$" + e];
	if (!n) return this;
	if (arguments.length == 1) return delete this._callbacks["$" + e], this;
	for (var r, i = 0; i < n.length; i++) if (r = n[i], r === t || r.fn === t) {
		n.splice(i, 1);
		break;
	}
	return n.length === 0 && delete this._callbacks["$" + e], this;
}, w.prototype.emit = function(e) {
	this._callbacks = this._callbacks || {};
	for (var t = Array(arguments.length - 1), n = this._callbacks["$" + e], r = 1; r < arguments.length; r++) t[r - 1] = arguments[r];
	if (n) {
		n = n.slice(0);
		for (var r = 0, i = n.length; r < i; ++r) n[r].apply(this, t);
	}
	return this;
}, w.prototype.emitReserved = w.prototype.emit, w.prototype.listeners = function(e) {
	return this._callbacks = this._callbacks || {}, this._callbacks["$" + e] || [];
}, w.prototype.hasListeners = function(e) {
	return !!this.listeners(e).length;
};
//#endregion
//#region node_modules/engine.io-client/build/esm/globals.js
var E = typeof Promise == "function" && typeof Promise.resolve == "function" ? (e) => Promise.resolve().then(e) : (e, t) => t(e, 0), D = typeof self < "u" ? self : typeof window < "u" ? window : Function("return this")(), ie = "arraybuffer";
//#endregion
//#region node_modules/engine.io-client/build/esm/util.js
function ae(e, ...t) {
	return t.reduce((t, n) => (e.hasOwnProperty(n) && (t[n] = e[n]), t), {});
}
var oe = D.setTimeout, O = D.clearTimeout;
function k(e, t) {
	t.useNativeTimers ? (e.setTimeoutFn = oe.bind(D), e.clearTimeoutFn = O.bind(D)) : (e.setTimeoutFn = D.setTimeout.bind(D), e.clearTimeoutFn = D.clearTimeout.bind(D));
}
var A = 1.33;
function j(e) {
	return typeof e == "string" ? se(e) : Math.ceil((e.byteLength || e.size) * A);
}
function se(e) {
	let t = 0, n = 0;
	for (let r = 0, i = e.length; r < i; r++) t = e.charCodeAt(r), t < 128 ? n += 1 : t < 2048 ? n += 2 : t < 55296 || t >= 57344 ? n += 3 : (r++, n += 4);
	return n;
}
function M() {
	return Date.now().toString(36).substring(3) + Math.random().toString(36).substring(2, 5);
}
//#endregion
//#region node_modules/engine.io-client/build/esm/contrib/parseqs.js
function N(e) {
	let t = "";
	for (let n in e) e.hasOwnProperty(n) && (t.length && (t += "&"), t += encodeURIComponent(n) + "=" + encodeURIComponent(e[n]));
	return t;
}
function P(e) {
	let t = {}, n = e.split("&");
	for (let e = 0, r = n.length; e < r; e++) {
		let r = n[e].split("=");
		t[decodeURIComponent(r[0])] = decodeURIComponent(r[1]);
	}
	return t;
}
//#endregion
//#region node_modules/engine.io-client/build/esm/transport.js
var F = class extends Error {
	constructor(e, t, n) {
		super(e), this.description = t, this.context = n, this.type = "TransportError";
	}
}, I = class extends w {
	constructor(e) {
		super(), this.writable = !1, k(this, e), this.opts = e, this.query = e.query, this.socket = e.socket, this.supportsBinary = !e.forceBase64;
	}
	onError(e, t, n) {
		return super.emitReserved("error", new F(e, t, n)), this;
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
		let t = _(e, this.socket.binaryType);
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
		let t = N(e);
		return t.length ? "?" + t : "";
	}
}, ce = class extends I {
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
		re(e, this.socket.binaryType).forEach((e) => {
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
		this.writable = !1, ne(e, (e) => {
			this.doWrite(e, () => {
				this.writable = !0, this.emitReserved("drain");
			});
		});
	}
	uri() {
		let e = this.opts.secure ? "https" : "http", t = this.query || {};
		return !1 !== this.opts.timestampRequests && (t[this.opts.timestampParam] = M()), !this.supportsBinary && !t.sid && (t.b64 = 1), this.createUri(e, t);
	}
}, L = !1;
try {
	L = typeof XMLHttpRequest < "u" && "withCredentials" in new XMLHttpRequest();
} catch {}
var R = L;
//#endregion
//#region node_modules/engine.io-client/build/esm/transports/polling-xhr.js
function z() {}
var B = class extends ce {
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
}, V = class e extends w {
	constructor(e, t, n) {
		super(), this.createRequest = e, k(this, n), this._opts = n, this._method = n.method || "GET", this._uri = t, this._data = n.data === void 0 ? null : n.data, this._create();
	}
	_create() {
		var t;
		let n = ae(this._opts, "agent", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "autoUnref");
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
			if (this._xhr.onreadystatechange = z, t) try {
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
if (V.requestsCount = 0, V.requests = {}, typeof document < "u") {
	if (typeof attachEvent == "function") attachEvent("onunload", le);
	else if (typeof addEventListener == "function") {
		let e = "onpagehide" in D ? "pagehide" : "unload";
		addEventListener(e, le, !1);
	}
}
function le() {
	for (let e in V.requests) V.requests.hasOwnProperty(e) && V.requests[e].abort();
}
var ue = (function() {
	let e = U({ xdomain: !1 });
	return e && e.responseType !== null;
})(), H = class extends B {
	constructor(e) {
		super(e);
		let t = e && e.forceBase64;
		this.supportsBinary = ue && !t;
	}
	request(e = {}) {
		return Object.assign(e, { xd: this.xd }, this.opts), new V(U, this.uri(), e);
	}
};
function U(e) {
	let t = e.xdomain;
	try {
		if (typeof XMLHttpRequest < "u" && (!t || R)) return new XMLHttpRequest();
	} catch {}
	if (!t) try {
		return new D[["Active", "Object"].join("X")]("Microsoft.XMLHTTP");
	} catch {}
}
//#endregion
//#region node_modules/engine.io-client/build/esm/transports/websocket.js
var W = typeof navigator < "u" && typeof navigator.product == "string" && navigator.product.toLowerCase() === "reactnative", G = class extends I {
	get name() {
		return "websocket";
	}
	doOpen() {
		let e = this.uri(), t = this.opts.protocols, n = W ? {} : ae(this.opts, "agent", "perMessageDeflate", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "localAddress", "protocolVersion", "origin", "maxPayload", "family", "checkServerIdentity");
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
			c(n, this.supportsBinary, (e) => {
				try {
					this.doWrite(n, e);
				} catch {}
				r && E(() => {
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
		return this.opts.timestampRequests && (t[this.opts.timestampParam] = M()), this.supportsBinary || (t.b64 = 1), this.createUri(e, t);
	}
}, de = D.WebSocket || D.MozWebSocket, fe = {
	websocket: class extends G {
		createSocket(e, t, n) {
			return W ? new de(e, t, n) : t ? new de(e, t) : new de(e);
		}
		doWrite(e, t) {
			this.ws.send(t);
		}
	},
	webtransport: class extends I {
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
					let t = C(2 ** 53 - 1, this.socket.binaryType), n = e.readable.pipeThrough(t).getReader(), r = y();
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
					r && E(() => {
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
	polling: H
}, pe = /^(?:(?![^:@\/?#]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@\/?#]*)(?::([^:@\/?#]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/, me = [
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
function he(e) {
	if (e.length > 8e3) throw "URI too long";
	let t = e, n = e.indexOf("["), r = e.indexOf("]");
	n != -1 && r != -1 && (e = e.substring(0, n) + e.substring(n, r).replace(/:/g, ";") + e.substring(r, e.length));
	let i = pe.exec(e || ""), a = {}, o = 14;
	for (; o--;) a[me[o]] = i[o] || "";
	return n != -1 && r != -1 && (a.source = t, a.host = a.host.substring(1, a.host.length - 1).replace(/;/g, ":"), a.authority = a.authority.replace("[", "").replace("]", "").replace(/;/g, ":"), a.ipv6uri = !0), a.pathNames = ge(a, a.path), a.queryKey = _e(a, a.query), a;
}
function ge(e, t) {
	let n = t.replace(/\/{2,9}/g, "/").split("/");
	return (t.slice(0, 1) == "/" || t.length === 0) && n.splice(0, 1), t.slice(-1) == "/" && n.splice(n.length - 1, 1), n;
}
function _e(e, t) {
	let n = {};
	return t.replace(/(?:^|&)([^&=]*)=?([^&]*)/g, function(e, t, r) {
		t && (n[t] = r);
	}), n;
}
//#endregion
//#region node_modules/engine.io-client/build/esm/socket.js
var ve = typeof addEventListener == "function" && typeof removeEventListener == "function", ye = [];
ve && addEventListener("offline", () => {
	ye.forEach((e) => e());
}, !1);
var be = class e extends w {
	constructor(e, t) {
		if (super(), this.binaryType = ie, this.writeBuffer = [], this._prevBufferLen = 0, this._pingInterval = -1, this._pingTimeout = -1, this._maxPayload = -1, this._pingTimeoutTime = Infinity, e && typeof e == "object" && (t = e, e = null), e) {
			let n = he(e);
			t.hostname = n.host, t.secure = n.protocol === "https" || n.protocol === "wss", t.port = n.port, n.query && (t.query = n.query);
		} else t.host && (t.hostname = he(t.host).host);
		k(this, t), this.secure = t.secure == null ? typeof location < "u" && location.protocol === "https:" : t.secure, t.hostname && !t.port && (t.port = this.secure ? "443" : "80"), this.hostname = t.hostname || (typeof location < "u" ? location.hostname : "localhost"), this.port = t.port || (typeof location < "u" && location.port ? location.port : this.secure ? "443" : "80"), this.transports = [], this._transportsByName = {}, t.transports.forEach((e) => {
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
		}, t), this.opts.path = this.opts.path.replace(/\/$/, "") + (this.opts.addTrailingSlash ? "/" : ""), typeof this.opts.query == "string" && (this.opts.query = P(this.opts.query)), ve && (this.opts.closeOnBeforeunload && (this._beforeunloadEventListener = () => {
			this.transport && (this.transport.removeAllListeners(), this.transport.close());
		}, addEventListener("beforeunload", this._beforeunloadEventListener, !1)), this.hostname !== "localhost" && (this._offlineEventListener = () => {
			this._onClose("transport close", { description: "network connection lost" });
		}, ye.push(this._offlineEventListener))), this.opts.withCredentials && (this._cookieJar = void 0), this._open();
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
			if (n && (e += j(n)), t > 0 && e > this._maxPayload) return this.writeBuffer.slice(0, t);
			e += 2;
		}
		return this.writeBuffer;
	}
	_hasPingExpired() {
		if (!this._pingTimeoutTime) return !0;
		let e = Date.now() > this._pingTimeoutTime;
		return e && (this._pingTimeoutTime = 0, E(() => {
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
			if (this.clearTimeoutFn(this._pingTimeoutTimer), this.transport.removeAllListeners("close"), this.transport.close(), this.transport.removeAllListeners(), ve && (this._beforeunloadEventListener && removeEventListener("beforeunload", this._beforeunloadEventListener, !1), this._offlineEventListener)) {
				let e = ye.indexOf(this._offlineEventListener);
				e !== -1 && ye.splice(e, 1);
			}
			this.readyState = "closed", this.id = null, this.emitReserved("close", e, t), this.writeBuffer = [], this._prevBufferLen = 0;
		}
	}
};
be.protocol = 4;
var xe = class extends be {
	constructor() {
		super(...arguments), this._upgrades = [];
	}
	onOpen() {
		if (super.onOpen(), this.readyState === "open" && this.opts.upgrade) for (let e = 0; e < this._upgrades.length; e++) this._probe(this._upgrades[e]);
	}
	_probe(e) {
		let t = this.createTransport(e), n = !1;
		be.priorWebsocketSuccess = !1;
		let r = () => {
			n || (t.send([{
				type: "ping",
				data: "probe"
			}]), t.once("packet", (e) => {
				if (!n) if (e.type === "pong" && e.data === "probe") {
					if (this.upgrading = !0, this.emitReserved("upgrading", t), !t) return;
					be.priorWebsocketSuccess = t.name === "websocket", this.transport.pause(() => {
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
}, Se = class extends xe {
	constructor(e, t = {}) {
		let n = typeof e == "object" ? e : t;
		(!n.transports || n.transports && typeof n.transports[0] == "string") && (n.transports = (n.transports || [
			"polling",
			"websocket",
			"webtransport"
		]).map((e) => fe[e]).filter((e) => !!e)), super(e, n);
	}
};
Se.protocol;
//#endregion
//#region node_modules/socket.io-client/build/esm/url.js
function Ce(e, t = "", n) {
	let r = e;
	n ||= typeof location < "u" && location, e ??= n.protocol + "//" + n.host, typeof e == "string" && (e.charAt(0) === "/" && (e = e.charAt(1) === "/" ? n.protocol + e : n.host + e), /^(https?|wss?):\/\//.test(e) || (e = n === void 0 ? "https://" + e : n.protocol + "//" + e), r = he(e)), r.port || (/^(http|ws)$/.test(r.protocol) ? r.port = "80" : /^(http|ws)s$/.test(r.protocol) && (r.port = "443")), r.path = r.path || "/";
	let i = r.host.indexOf(":") === -1 ? r.host : "[" + r.host + "]";
	return r.id = r.protocol + "://" + i + ":" + r.port + t, r.href = r.protocol + "://" + i + (n && n.port === r.port ? "" : ":" + r.port), r;
}
//#endregion
//#region node_modules/socket.io-parser/build/esm/is-binary.js
var we = typeof ArrayBuffer == "function", Te = (e) => typeof ArrayBuffer.isView == "function" ? ArrayBuffer.isView(e) : e.buffer instanceof ArrayBuffer, Ee = Object.prototype.toString, De = typeof Blob == "function" || typeof Blob < "u" && Ee.call(Blob) === "[object BlobConstructor]", Oe = typeof File == "function" || typeof File < "u" && Ee.call(File) === "[object FileConstructor]";
function ke(e) {
	return we && (e instanceof ArrayBuffer || Te(e)) || De && e instanceof Blob || Oe && e instanceof File;
}
function Ae(e, t) {
	if (!e || typeof e != "object") return !1;
	if (Array.isArray(e)) {
		for (let t = 0, n = e.length; t < n; t++) if (Ae(e[t])) return !0;
		return !1;
	}
	if (ke(e)) return !0;
	if (e.toJSON && typeof e.toJSON == "function" && arguments.length === 1) return Ae(e.toJSON(), !0);
	for (let t in e) if (Object.prototype.hasOwnProperty.call(e, t) && Ae(e[t])) return !0;
	return !1;
}
//#endregion
//#region node_modules/socket.io-parser/build/esm/binary.js
function je(e) {
	let t = [], n = e.data, r = e;
	return r.data = Me(n, t), r.attachments = t.length, {
		packet: r,
		buffers: t
	};
}
function Me(e, t) {
	if (!e) return e;
	if (ke(e)) {
		let n = {
			_placeholder: !0,
			num: t.length
		};
		return t.push(e), n;
	} else if (Array.isArray(e)) {
		let n = Array(e.length);
		for (let r = 0; r < e.length; r++) n[r] = Me(e[r], t);
		return n;
	} else if (typeof e == "object" && !(e instanceof Date)) {
		let n = {};
		for (let r in e) Object.prototype.hasOwnProperty.call(e, r) && (n[r] = Me(e[r], t));
		return n;
	}
	return e;
}
function Ne(e, t) {
	return e.data = Pe(e.data, t), delete e.attachments, e;
}
function Pe(e, t) {
	if (!e) return e;
	if (e && e._placeholder === !0) {
		if (typeof e.num == "number" && e.num >= 0 && e.num < t.length) return t[e.num];
		throw Error("illegal attachments");
	} else if (Array.isArray(e)) for (let n = 0; n < e.length; n++) e[n] = Pe(e[n], t);
	else if (typeof e == "object") for (let n in e) Object.prototype.hasOwnProperty.call(e, n) && (e[n] = Pe(e[n], t));
	return e;
}
//#endregion
//#region node_modules/socket.io-parser/build/esm/index.js
var Fe = /* @__PURE__ */ t({
	Decoder: () => Re,
	Encoder: () => Le,
	PacketType: () => K,
	isPacketValid: () => Ge,
	protocol: () => 5
}), Ie = [
	"connect",
	"connect_error",
	"disconnect",
	"disconnecting",
	"newListener",
	"removeListener"
], K;
(function(e) {
	e[e.CONNECT = 0] = "CONNECT", e[e.DISCONNECT = 1] = "DISCONNECT", e[e.EVENT = 2] = "EVENT", e[e.ACK = 3] = "ACK", e[e.CONNECT_ERROR = 4] = "CONNECT_ERROR", e[e.BINARY_EVENT = 5] = "BINARY_EVENT", e[e.BINARY_ACK = 6] = "BINARY_ACK";
})(K ||= {});
var Le = class {
	constructor(e) {
		this.replacer = e;
	}
	encode(e) {
		return (e.type === K.EVENT || e.type === K.ACK) && Ae(e) ? this.encodeAsBinary({
			type: e.type === K.EVENT ? K.BINARY_EVENT : K.BINARY_ACK,
			nsp: e.nsp,
			data: e.data,
			id: e.id
		}) : [this.encodeAsString(e)];
	}
	encodeAsString(e) {
		let t = "" + e.type;
		return (e.type === K.BINARY_EVENT || e.type === K.BINARY_ACK) && (t += e.attachments + "-"), e.nsp && e.nsp !== "/" && (t += e.nsp + ","), e.id != null && (t += e.id), e.data != null && (t += JSON.stringify(e.data, this.replacer)), t;
	}
	encodeAsBinary(e) {
		let t = je(e), n = this.encodeAsString(t.packet), r = t.buffers;
		return r.unshift(n), r;
	}
}, Re = class e extends w {
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
			let n = t.type === K.BINARY_EVENT;
			n || t.type === K.BINARY_ACK ? (t.type = n ? K.EVENT : K.ACK, this.reconstructor = new ze(t), t.attachments === 0 && super.emitReserved("decoded", t)) : super.emitReserved("decoded", t);
		} else if (ke(e) || e.base64) if (this.reconstructor) t = this.reconstructor.takeBinaryData(e), t && (this.reconstructor = null, super.emitReserved("decoded", t));
		else throw Error("got binary data when not reconstructing a packet");
		else throw Error("Unknown type: " + e);
	}
	decodeString(t) {
		let n = 0, r = { type: Number(t.charAt(0)) };
		if (K[r.type] === void 0) throw Error("unknown packet type " + r.type);
		if (r.type === K.BINARY_EVENT || r.type === K.BINARY_ACK) {
			let e = n + 1;
			for (; t.charAt(++n) !== "-" && n != t.length;);
			let i = t.substring(e, n);
			if (i != Number(i) || t.charAt(n) !== "-") throw Error("Illegal attachments");
			let a = Number(i);
			if (!Ve(a) || a < 0) throw Error("Illegal attachments");
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
			case K.CONNECT: return Ue(t);
			case K.DISCONNECT: return t === void 0;
			case K.CONNECT_ERROR: return typeof t == "string" || Ue(t);
			case K.EVENT:
			case K.BINARY_EVENT: return Array.isArray(t) && (typeof t[0] == "number" || typeof t[0] == "string" && Ie.indexOf(t[0]) === -1);
			case K.ACK:
			case K.BINARY_ACK: return Array.isArray(t);
		}
	}
	destroy() {
		this.reconstructor &&= (this.reconstructor.finishedReconstruction(), null);
	}
}, ze = class {
	constructor(e) {
		this.packet = e, this.buffers = [], this.reconPack = e;
	}
	takeBinaryData(e) {
		if (this.buffers.push(e), this.buffers.length === this.reconPack.attachments) {
			let e = Ne(this.reconPack, this.buffers);
			return this.finishedReconstruction(), e;
		}
		return null;
	}
	finishedReconstruction() {
		this.reconPack = null, this.buffers = [];
	}
};
function Be(e) {
	return typeof e == "string";
}
var Ve = Number.isInteger || function(e) {
	return typeof e == "number" && isFinite(e) && Math.floor(e) === e;
};
function He(e) {
	return e === void 0 || Ve(e);
}
function Ue(e) {
	return Object.prototype.toString.call(e) === "[object Object]";
}
function We(e, t) {
	switch (e) {
		case K.CONNECT: return t === void 0 || Ue(t);
		case K.DISCONNECT: return t === void 0;
		case K.EVENT: return Array.isArray(t) && (typeof t[0] == "number" || typeof t[0] == "string" && Ie.indexOf(t[0]) === -1);
		case K.ACK: return Array.isArray(t);
		case K.CONNECT_ERROR: return typeof t == "string" || Ue(t);
		default: return !1;
	}
}
function Ge(e) {
	return Be(e.nsp) && He(e.id) && We(e.type, e.data);
}
//#endregion
//#region node_modules/socket.io-client/build/esm/on.js
function q(e, t, n) {
	return e.on(t, n), function() {
		e.off(t, n);
	};
}
//#endregion
//#region node_modules/socket.io-client/build/esm/socket.js
var Ke = Object.freeze({
	connect: 1,
	connect_error: 1,
	disconnect: 1,
	disconnecting: 1,
	newListener: 1,
	removeListener: 1
}), qe = class extends w {
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
			q(e, "open", this.onopen.bind(this)),
			q(e, "packet", this.onpacket.bind(this)),
			q(e, "error", this.onerror.bind(this)),
			q(e, "close", this.onclose.bind(this))
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
		if (Ke.hasOwnProperty(e)) throw Error("\"" + e.toString() + "\" is a reserved event name");
		if (t.unshift(e), this._opts.retries && !this.flags.fromQueue && !this.flags.volatile) return this._addToQueue(t), this;
		let n = {
			type: K.EVENT,
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
			type: K.CONNECT,
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
			case K.CONNECT:
				e.data && e.data.sid ? this.onconnect(e.data.sid, e.data.pid) : this.emitReserved("connect_error", /* @__PURE__ */ Error("It seems you are trying to reach a Socket.IO server in v2.x with a v3.x client, but they are not compatible (more information here: https://socket.io/docs/v3/migrating-from-2-x-to-3-0/)"));
				break;
			case K.EVENT:
			case K.BINARY_EVENT:
				this.onevent(e);
				break;
			case K.ACK:
			case K.BINARY_ACK:
				this.onack(e);
				break;
			case K.DISCONNECT:
				this.ondisconnect();
				break;
			case K.CONNECT_ERROR:
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
				type: K.ACK,
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
		return this.connected && this.packet({ type: K.DISCONNECT }), this.destroy(), this.connected && this.onclose("io client disconnect"), this;
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
function J(e) {
	e ||= {}, this.ms = e.min || 100, this.max = e.max || 1e4, this.factor = e.factor || 2, this.jitter = e.jitter > 0 && e.jitter <= 1 ? e.jitter : 0, this.attempts = 0;
}
J.prototype.duration = function() {
	var e = this.ms * this.factor ** + this.attempts++;
	if (this.jitter) {
		var t = Math.random(), n = Math.floor(t * this.jitter * e);
		e = Math.floor(t * 10) & 1 ? e + n : e - n;
	}
	return Math.min(e, this.max) | 0;
}, J.prototype.reset = function() {
	this.attempts = 0;
}, J.prototype.setMin = function(e) {
	this.ms = e;
}, J.prototype.setMax = function(e) {
	this.max = e;
}, J.prototype.setJitter = function(e) {
	this.jitter = e;
};
//#endregion
//#region node_modules/socket.io-client/build/esm/manager.js
var Je = class extends w {
	constructor(e, t) {
		super(), this.nsps = {}, this.subs = [], e && typeof e == "object" && (t = e, e = void 0), t ||= {}, t.path = t.path || "/socket.io", this.opts = t, k(this, t), this.reconnection(t.reconnection !== !1), this.reconnectionAttempts(t.reconnectionAttempts || Infinity), this.reconnectionDelay(t.reconnectionDelay || 1e3), this.reconnectionDelayMax(t.reconnectionDelayMax || 5e3), this.randomizationFactor(t.randomizationFactor ?? .5), this.backoff = new J({
			min: this.reconnectionDelay(),
			max: this.reconnectionDelayMax(),
			jitter: this.randomizationFactor()
		}), this.timeout(t.timeout == null ? 2e4 : t.timeout), this._readyState = "closed", this.uri = e;
		let n = t.parser || Fe;
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
		this.engine = new Se(this.uri, this.opts);
		let t = this.engine, n = this;
		this._readyState = "opening", this.skipReconnect = !1;
		let r = q(t, "open", function() {
			n.onopen(), e && e();
		}), i = (t) => {
			this.cleanup(), this._readyState = "closed", this.emitReserved("error", t), e ? e(t) : this.maybeReconnectOnOpen();
		}, a = q(t, "error", i);
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
		this.subs.push(q(e, "ping", this.onping.bind(this)), q(e, "data", this.ondata.bind(this)), q(e, "error", this.onerror.bind(this)), q(e, "close", this.onclose.bind(this)), q(this.decoder, "decoded", this.ondecoded.bind(this)));
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
		E(() => {
			this.emitReserved("packet", e);
		}, this.setTimeoutFn);
	}
	onerror(e) {
		this.emitReserved("error", e);
	}
	socket(e, t) {
		let n = this.nsps[e];
		return n ? this._autoConnect && !n.active && n.connect() : (n = new qe(this, e, t), this.nsps[e] = n), n;
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
}, Y = {};
function Ye(e, t) {
	typeof e == "object" && (t = e, e = void 0), t ||= {};
	let n = Ce(e, t.path || "/socket.io"), r = n.source, i = n.id, a = n.path, o = Y[i] && a in Y[i].nsps, s = t.forceNew || t["force new connection"] || !1 === t.multiplex || o, c;
	return s ? c = new Je(r, t) : (Y[i] || (Y[i] = new Je(r, t)), c = Y[i]), n.query && !t.query && (t.query = n.queryKey), c.socket(n.path, t);
}
Object.assign(Ye, {
	Manager: Je,
	Socket: qe,
	io: Ye,
	connect: Ye
});
//#endregion
//#region src/widget/constants.ts
var Xe = "chatbot-package-styles", Ze = {
	botName: "Support Assistant",
	title: "Support Assistant",
	subtitle: "Online",
	welcomeMessage: "Hi there! I am your support assistant. Ask me anything.",
	placeholder: "Type your question...",
	primaryColor: "#2563eb",
	position: "bottom-right",
	zIndex: 9999
}, Qe = "\n.chatbot-widget-root {\n  position: fixed;\n  bottom: 16px;\n  font-family: \"Segoe UI\", -apple-system, BlinkMacSystemFont, sans-serif;\n}\n\n.chatbot-widget-root.right {\n  right: 16px;\n}\n\n.chatbot-widget-root.left {\n  left: 16px;\n}\n\n.chatbot-launcher {\n  width: 56px;\n  height: 56px;\n  border-radius: 9999px;\n  border: 0;\n  background: linear-gradient(135deg, var(--chatbot-primary), #1d4ed8);\n  color: #ffffff;\n  box-shadow: 0 16px 30px rgba(37, 99, 235, 0.35);\n  cursor: pointer;\n  display: grid;\n  place-items: center;\n  font-size: 12px;\n  font-weight: 700;\n  letter-spacing: 0.2px;\n  transition: transform 0.18s ease, box-shadow 0.18s ease;\n}\n\n.chatbot-launcher svg {\n  width: 20px;\n  height: 20px;\n}\n\n.chatbot-launcher:hover {\n  transform: translateY(-2px);\n  box-shadow: 0 20px 34px rgba(37, 99, 235, 0.42);\n}\n\n.chatbot-panel {\n  position: absolute;\n  bottom: 66px;\n  width: min(378px, calc(100vw - 24px));\n  height: min(610px, calc(100vh - 88px));\n  border-radius: 16px;\n  border: 1px solid #dbe4f5;\n  overflow: hidden;\n  box-shadow: 0 28px 56px rgba(15, 23, 42, 0.24);\n  background: #f8fbff;\n  display: flex;\n  flex-direction: column;\n  opacity: 0;\n  visibility: hidden;\n  pointer-events: none;\n  transform: translateY(10px) scale(0.98);\n  transition: opacity 0.2s ease, transform 0.2s ease, visibility 0.2s ease;\n}\n\n.chatbot-widget-root.right .chatbot-panel {\n  right: 0;\n  transform-origin: bottom right;\n}\n\n.chatbot-widget-root.left .chatbot-panel {\n  left: 0;\n  transform-origin: bottom left;\n}\n\n.chatbot-widget-root.open .chatbot-panel {\n  opacity: 1;\n  visibility: visible;\n  pointer-events: auto;\n  transform: translateY(0) scale(1);\n}\n\n.chatbot-header {\n  background: linear-gradient(135deg, var(--chatbot-primary), #1d4ed8);\n  color: #ffffff;\n  padding: 12px;\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 10px;\n}\n\n.chatbot-header-left {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n}\n\n.chatbot-avatar {\n  width: 38px;\n  height: 38px;\n  border-radius: 9999px;\n  background: #ffffff;\n  color: var(--chatbot-primary);\n  border: 1px solid rgba(255, 255, 255, 0.84);\n  display: grid;\n  place-items: center;\n  font-size: 14px;\n  font-weight: 700;\n}\n\n.chatbot-avatar svg {\n  width: 18px;\n  height: 18px;\n}\n\n.chatbot-header-info h2 {\n  margin: 0;\n  font-size: 15px;\n  line-height: 1.15;\n  font-weight: 700;\n}\n\n.chatbot-status {\n  margin-top: 3px;\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  font-size: 12px;\n  font-weight: 500;\n  opacity: 0.95;\n}\n\n.chatbot-status-dot {\n  width: 8px;\n  height: 8px;\n  border-radius: 9999px;\n  background: #22c55e;\n}\n\n.chatbot-controls {\n  display: flex;\n  align-items: center;\n  margin-left: auto;\n  gap: 6px;\n}\n\n.chatbot-controls button {\n  width: 34px;\n  height: 34px;\n  border-radius: 8px;\n  border: 1px solid rgba(255, 255, 255, 0.42);\n  background: rgba(255, 255, 255, 0.24);\n  color: #ffffff;\n  cursor: pointer;\n  line-height: 0;\n  display: grid;\n  place-items: center;\n  font-size: 14px;\n  transition: background 0.2s ease, transform 0.2s ease;\n}\n\n.chatbot-controls button svg {\n  width: 16px;\n  height: 16px;\n  stroke-width: 2.25;\n}\n\n.chatbot-controls button:hover {\n  background: rgba(255, 255, 255, 0.36);\n  transform: translateY(-1px);\n}\n\n.chatbot-body {\n  flex: 1;\n  overflow-y: auto;\n  padding: 14px 12px 10px;\n  background: linear-gradient(180deg, #f8fbff 0%, #f1f6ff 100%);\n}\n\n.chatbot-body::-webkit-scrollbar {\n  width: 8px;\n}\n\n.chatbot-body::-webkit-scrollbar-thumb {\n  background: #bfdbfe;\n  border-radius: 999px;\n}\n\n.chatbot-body-content {\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n}\n\n.chatbot-intro {\n  text-align: center;\n  color: #334155;\n  border: 1px solid #dbe4f5;\n  background: rgba(255, 255, 255, 0.72);\n  border-radius: 14px;\n  padding: 16px 12px;\n}\n\n.chatbot-intro-icon {\n  width: 44px;\n  height: 44px;\n  border-radius: 9999px;\n  background: #dbeafe;\n  color: #1d4ed8;\n  display: grid;\n  place-items: center;\n  font-size: 22px;\n  font-weight: 700;\n  margin: 0 auto 12px;\n}\n\n.chatbot-intro h3 {\n  margin: 0;\n  font-size: 25px;\n  color: #0f172a;\n}\n\n.chatbot-intro p {\n  margin: 10px auto 0;\n  max-width: 290px;\n  font-size: 13px;\n  line-height: 1.45;\n  color: #475569;\n}\n\n.chatbot-intro .chatbot-human-note {\n  margin-top: 12px;\n  font-style: italic;\n  font-size: 12px;\n  color: #6b7a92;\n}\n\n.chatbot-messages {\n  display: none;\n  flex-direction: column;\n  gap: 8px;\n}\n\n.chatbot-body.has-messages .chatbot-intro {\n  display: none;\n}\n\n.chatbot-body.has-messages .chatbot-messages {\n  display: flex;\n}\n.chatbot-body.human-mode .chatbot-intro {\n  display: none;\n}\n.chatbot-human-hero {\n  display: none;\n  text-align: center;\n  color: #0f172a;\n  border: 1px solid #dbe4f5;\n  background: rgba(255, 255, 255, 0.88);\n  border-radius: 14px;\n  padding: 18px 14px;\n}\n.chatbot-body.human-mode .chatbot-human-hero {\n  display: block;\n}\n.chatbot-human-hero h3 {\n  margin: 0;\n  font-size: 22px;\n  font-weight: 700;\n}\n.chatbot-human-hero p {\n  margin: 8px 0 0;\n  font-size: 13px;\n  color: #475569;\n}\n.chatbot-history-label {\n  margin-top: 14px;\n  font-size: 11px;\n  font-weight: 700;\n  letter-spacing: 0.12em;\n  text-transform: uppercase;\n  color: #94a3b8;\n  text-align: center;\n}\n.chatbot-divider {\n  display: none;\n  align-items: center;\n  gap: 10px;\n  margin: 16px 0 10px;\n  color: #94a3b8;\n  font-size: 11px;\n  font-weight: 700;\n  letter-spacing: 0.14em;\n  text-transform: uppercase;\n}\n.chatbot-divider::before,\n.chatbot-divider::after {\n  content: \"\";\n  flex: 1;\n  height: 1px;\n  background: #e2e8f0;\n}\n.chatbot-body.human-mode .chatbot-divider {\n  display: flex;\n}\n\n.chatbot-recent-history {\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n}\n\n.chatbot-recent-label {\n  text-align: center;\n  font-size: 10px;\n  font-weight: 700;\n  letter-spacing: 0.18em;\n  text-transform: uppercase;\n  color: #94a3b8;\n}\n\n\n.chatbot-bubble {\n  position: relative;\n  max-width: 84%;\n  border-radius: 14px;\n  padding: 8px 10px;\n  line-height: 1.42;\n  font-size: 12.5px;\n  white-space: pre-wrap;\n  word-break: break-word;\n  animation: chatbot-bubble-in 0.22s ease;\n}\n\n.chatbot-bubble.user {\n  align-self: flex-end;\n  background: linear-gradient(145deg, var(--chatbot-primary), #1d4ed8);\n  color: #ffffff;\n  border: 1px solid rgba(255, 255, 255, 0.2);\n  border-bottom-right-radius: 6px;\n  box-shadow: 0 10px 26px rgba(37, 99, 235, 0.28);\n}\n\n.chatbot-bubble.user::after {\n  content: \"\";\n  position: absolute;\n  right: -6px;\n  bottom: 8px;\n  width: 12px;\n  height: 12px;\n  background: #1d4ed8;\n  border-radius: 2px 0 10px 0;\n  transform: rotate(35deg);\n}\n\n.chatbot-bubble.bot {\n  align-self: flex-start;\n  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);\n  color: #0f172a;\n  border: 1px solid #d7e3f8;\n  border-bottom-left-radius: 6px;\n  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.1);\n}\n\n.chatbot-bubble.bot::after {\n  content: \"\";\n  position: absolute;\n  left: -6px;\n  bottom: 8px;\n  width: 12px;\n  height: 12px;\n  background: #ffffff;\n  border-left: 1px solid #d7e3f8;\n  border-bottom: 1px solid #d7e3f8;\n  border-radius: 0 0 0 9px;\n  transform: rotate(35deg);\n}\n\n.chatbot-bubble.system {\n  align-self: center;\n  text-transform: uppercase;\n  letter-spacing: 0.18em;\n  font-weight: 700;\n  font-size: 10px;\n  padding: 6px 12px;\n  border-radius: 999px;\n  background: #dbeafe;\n  color: #1e3a8a;\n}\n\n.chatbot-bubble.typing {\n  min-width: 52px;\n  padding: 6px 10px;\n  background: linear-gradient(180deg, #ffffff 0%, #f1f5ff 100%);\n  border: 1px solid #dbeafe;\n  box-shadow: 0 10px 22px rgba(30, 64, 175, 0.12);\n}\n\n.chatbot-bubble.typing .chatbot-typing {\n  justify-content: center;\n}\n\n.chatbot-bubble p,\n.chatbot-bubble ul,\n.chatbot-bubble ol,\n.chatbot-bubble pre {\n  margin: 0;\n}\n\n.chatbot-bubble ul,\n.chatbot-bubble ol {\n  padding-left: 18px;\n  margin-top: 6px;\n}\n\n.chatbot-bubble li + li {\n  margin-top: 3px;\n}\n\n.chatbot-bubble.user a {\n  color: #dbeafe;\n}\n\n.chatbot-md-h1 {\n  font-size: 16px;\n  font-weight: 700;\n  margin: 0 0 6px;\n}\n.chatbot-md-h2 {\n  font-size: 15px;\n  font-weight: 700;\n  margin: 0 0 6px;\n}\n.chatbot-md-h3 {\n  font-size: 14px;\n  font-weight: 700;\n  margin: 0 0 6px;\n}\n.chatbot-bubble a {\n  color: #2563eb;\n  text-decoration: underline;\n}\n.chatbot-bubble code {\n  font-family: \"SFMono-Regular\", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,\n    \"Liberation Mono\", \"Courier New\", monospace;\n  font-size: 12px;\n  background: #eff6ff;\n  padding: 2px 4px;\n  border-radius: 6px;\n}\n.chatbot-bubble pre {\n  background: #eff6ff;\n  border-radius: 10px;\n  padding: 8px;\n  overflow-x: auto;\n  margin-top: 6px;\n}\n\n.chatbot-typing {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  font-size: 11px;\n  color: #475569;\n  font-weight: 500;\n}\n\n.chatbot-typing span {\n  width: 6px;\n  height: 6px;\n  border-radius: 999px;\n  background: linear-gradient(135deg, #1d4ed8, #60a5fa);\n  animation: typing-bounce 1.05s infinite ease-in-out;\n}\n\n.chatbot-typing span:nth-child(2) {\n  animation-delay: 0.2s;\n}\n\n.chatbot-typing span:nth-child(3) {\n  animation-delay: 0.4s;\n}\n\n@keyframes typing-bounce {\n  0%,\n  100% {\n    transform: translateY(0) scale(0.9);\n    opacity: 0.7;\n  }\n  50% {\n    transform: translateY(-5px) scale(1);\n    opacity: 1;\n  }\n}\n\n@keyframes chatbot-bubble-in {\n  from {\n    opacity: 0;\n    transform: translateY(4px);\n  }\n  to {\n    opacity: 1;\n    transform: translateY(0);\n  }\n}\n\n\n.chatbot-ref-chips {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 6px;\n  margin-top: 8px;\n}\n\n.chatbot-ref-chip {\n  display: inline-flex;\n  align-items: center;\n  gap: 6px;\n  padding: 2px 8px;\n  font-size: 10px;\n  font-weight: 600;\n  border-radius: 999px;\n  background: #eef2ff;\n  color: #1e40af;\n  text-decoration: none;\n  border: 1px solid #e0e7ff;\n}\n\n.chatbot-ref-chip:hover {\n  background: #e0e7ff;\n}\n\n.chatbot-image {\n  display: block;\n  max-width: 100%;\n  height: auto;\n  border-radius: 10px;\n  margin-top: 6px;\n  border: 1px solid #e2e8f0;\n}\n\n.chatbot-md-p {\n  margin: 0;\n  font-size: 13px;\n  line-height: 1.55;\n  color: inherit;\n}\n\n.chatbot-md-spacer {\n  height: 8px;\n}\n\n.chatbot-md-list {\n  margin: 6px 0 0;\n  padding-left: 18px;\n  font-size: 13px;\n  line-height: 1.5;\n}\n\n.chatbot-md-list li + li {\n  margin-top: 4px;\n}\n\n.chatbot-footer {\n  border-top: 1px solid #dbe4f5;\n  padding: 12px;\n  background: #ffffff;\n  display: flex;\n  flex-direction: column;\n  gap: 10px;\n}\n\n.chatbot-loading-row {\n  display: none;\n  align-items: center;\n  justify-content: center;\n  gap: 8px;\n  padding: 6px 10px;\n  border-radius: 999px;\n  background: #f1f5ff;\n  border: 1px solid #dbeafe;\n  color: #1e40af;\n  font-size: 11px;\n  font-weight: 600;\n  letter-spacing: 0.08em;\n  text-transform: uppercase;\n}\n\n.chatbot-loading-dots {\n  display: inline-flex;\n  gap: 4px;\n}\n\n.chatbot-loading-dots span {\n  width: 6px;\n  height: 6px;\n  border-radius: 999px;\n  background: #1d4ed8;\n  animation: chatbot-loading-pulse 1.2s infinite ease-in-out;\n}\n\n.chatbot-loading-dots span:nth-child(2) {\n  animation-delay: 0.2s;\n}\n\n.chatbot-loading-dots span:nth-child(3) {\n  animation-delay: 0.4s;\n}\n\n@keyframes chatbot-loading-pulse {\n  0%,\n  100% {\n    transform: translateY(0);\n    opacity: 0.5;\n  }\n  50% {\n    transform: translateY(-3px);\n    opacity: 1;\n  }\n}\n\n.chatbot-input-row {\n  display: flex;\n  gap: 8px;\n}\n\n.chatbot-input {\n  flex: 1;\n  border-radius: 12px;\n  border: 1px solid #dbe4f5;\n  padding: 10px 12px;\n  font-size: 13px;\n  resize: none;\n  min-height: 44px;\n  max-height: 110px;\n  font-family: \"Segoe UI\", -apple-system, BlinkMacSystemFont, sans-serif;\n  line-height: 1.4;\n  color: #0f172a;\n  transition: border 0.2s ease;\n}\n\n.chatbot-input:focus {\n  outline: none;\n  border-color: var(--chatbot-primary);\n  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15);\n}\n\n.chatbot-input::placeholder {\n  color: #94a3b8;\n}\n\n.chatbot-attach-input {\n  display: none;\n}\n\n.chatbot-attach {\n  width: 44px;\n  height: 44px;\n  border-radius: 12px;\n  border: 1px solid #e2e8f0;\n  background: #ffffff;\n  color: #0f172a;\n  display: grid;\n  place-items: center;\n  cursor: pointer;\n  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;\n}\n\n.chatbot-attach svg {\n  width: 18px;\n  height: 18px;\n}\n\n.chatbot-attach:hover {\n  transform: translateY(-1px);\n  border-color: #cbd5f0;\n  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.12);\n}\n\n.chatbot-send {\n  width: 44px;\n  height: 44px;\n  border-radius: 12px;\n  border: 0;\n  background: var(--chatbot-primary);\n  color: #ffffff;\n  display: grid;\n  place-items: center;\n  cursor: pointer;\n  transition: transform 0.18s ease, box-shadow 0.18s ease;\n}\n\n.chatbot-send svg {\n  width: 18px;\n  height: 18px;\n}\n\n.chatbot-send:hover {\n  transform: translateY(-1px);\n  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.32);\n}\n\n.chatbot-footer .chatbot-human-button {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  gap: 10px;\n  background: #eff6ff;\n  border: 1px solid #dbeafe;\n  color: #1d4ed8;\n  font-weight: 600;\n  border-radius: 12px;\n  padding: 10px 12px;\n  cursor: pointer;\n  transition: background 0.2s ease, border 0.2s ease;\n}\n\n.chatbot-footer .chatbot-human-button:hover {\n  background: #dbeafe;\n}\n\n.chatbot-footer .chatbot-human-button svg {\n  width: 16px;\n  height: 16px;\n}\n\n.chatbot-powered {\n  margin: 0;\n  font-size: 10px;\n  color: #94a3b8;\n  text-align: center;\n}\n\n.chatbot-widget-root.show-human-form .chatbot-body,\n.chatbot-widget-root.show-human-form .chatbot-footer {\n  display: none;\n}\n\n.chatbot-widget-root.show-human-form .chatbot-human-container {\n  display: flex;\n}\n\n.chatbot-human-container {\n  flex: 1;\n  display: none;\n  flex-direction: column;\n  padding: 18px 14px;\n  gap: 16px;\n  overflow: auto;\n  background: #f8fbff;\n}\n\n.chatbot-human-header {\n  background: #ffffff;\n  border: 1px solid #dbe4f5;\n  border-radius: 14px;\n  padding: 14px;\n  text-align: center;\n}\n\n.chatbot-human-header h3 {\n  margin: 0;\n  font-size: 18px;\n  font-weight: 700;\n  color: #0f172a;\n}\n\n.chatbot-human-header p {\n  margin: 6px 0 0;\n  font-size: 13px;\n  color: #64748b;\n}\n\n.chatbot-human-form {\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n}\n\n.chatbot-form-group {\n  display: flex;\n  flex-direction: column;\n  gap: 6px;\n  font-size: 12px;\n  font-weight: 600;\n  color: #334155;\n}\n\n.chatbot-form-group input,\n.chatbot-form-group textarea {\n  border-radius: 10px;\n  border: 1px solid #dbe4f5;\n  padding: 10px 12px;\n  font-size: 13px;\n  font-family: \"Segoe UI\", -apple-system, BlinkMacSystemFont, sans-serif;\n  color: #0f172a;\n  background: #ffffff;\n}\n\n.chatbot-form-group input:focus,\n.chatbot-form-group textarea:focus {\n  outline: none;\n  border-color: var(--chatbot-primary);\n  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15);\n}\n\n.chatbot-form-group textarea {\n  min-height: 110px;\n  resize: vertical;\n}\n\n.chatbot-form-actions {\n  display: flex;\n  gap: 10px;\n  justify-content: space-between;\n}\n\n.chatbot-btn-primary {\n  flex: 1;\n  border-radius: 12px;\n  border: 0;\n  background: var(--chatbot-primary);\n  color: #ffffff;\n  font-weight: 600;\n  padding: 10px 12px;\n  cursor: pointer;\n}\n\n.chatbot-btn-secondary {\n  flex: 1;\n  border-radius: 12px;\n  border: 1px solid #dbe4f5;\n  background: #ffffff;\n  color: #334155;\n  font-weight: 600;\n  padding: 10px 12px;\n  cursor: pointer;\n}\n\n.chatbot-human-success {\n  display: none;\n  flex-direction: column;\n  align-items: center;\n  text-align: center;\n  gap: 12px;\n  padding: 24px 16px;\n  border-radius: 14px;\n  border: 1px solid #dbe4f5;\n  background: #ffffff;\n}\n\n.chatbot-widget-root.show-human-success .chatbot-body,\n.chatbot-widget-root.show-human-success .chatbot-footer {\n  display: none;\n}\n\n.chatbot-widget-root.show-human-success .chatbot-human-container {\n  display: flex;\n}\n\n.chatbot-widget-root.show-human-success .chatbot-human-form {\n  display: none;\n}\n\n.chatbot-widget-root.show-human-success .chatbot-human-success {\n  display: flex;\n}\n\n.chatbot-success-icon {\n  width: 54px;\n  height: 54px;\n  border-radius: 999px;\n  background: #dcfce7;\n  color: #16a34a;\n  display: grid;\n  place-items: center;\n  font-size: 26px;\n}\n\n.chatbot-human-success h3 {\n  margin: 0;\n  font-size: 18px;\n  font-weight: 700;\n  color: #0f172a;\n}\n\n.chatbot-human-success p {\n  margin: 0;\n  font-size: 13px;\n  color: #64748b;\n}\n\n.chatbot-widget-root.show-human-form .chatbot-footer,\n.chatbot-widget-root.show-human-success .chatbot-footer {\n  display: none;\n}\n\n.chatbot-error {\n  color: #dc2626;\n  font-size: 12px;\n  text-align: center;\n}\n\n.chatbot-loading {\n  text-align: center;\n  font-size: 12px;\n  color: #64748b;\n}\n\n.chatbot-human-note {\n  font-size: 12px;\n  color: #475569;\n  text-align: center;\n}\n\n.chatbot-human-note span {\n  font-weight: 600;\n}\n\n@media (max-width: 520px) {\n  .chatbot-panel {\n    height: min(560px, calc(100vh - 80px));\n    width: min(360px, calc(100vw - 20px));\n  }\n\n  .chatbot-widget-root.right,\n  .chatbot-widget-root.left {\n    right: 10px;\n    left: 10px;\n  }\n\n  .chatbot-widget-root {\n    bottom: 10px;\n  }\n\n  .chatbot-panel {\n    width: min(360px, calc(100vw - 20px));\n    height: min(520px, calc(100vh - 70px));\n  }\n\n  .chatbot-intro h3 {\n    font-size: 22px;\n  }\n}\n", $e = () => {
	if (document.getElementById("chatbot-package-styles")) return;
	let e = document.createElement("style");
	e.id = Xe, e.textContent = Qe, document.head.appendChild(e);
}, et = {
	xmlns: "http://www.w3.org/2000/svg",
	width: 24,
	height: 24,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	"stroke-width": 2,
	"stroke-linecap": "round",
	"stroke-linejoin": "round"
}, tt = ([e, t, n]) => {
	let r = document.createElementNS("http://www.w3.org/2000/svg", e);
	return Object.keys(t).forEach((e) => {
		r.setAttribute(e, String(t[e]));
	}), n?.length && n.forEach((e) => {
		let t = tt(e);
		r.appendChild(t);
	}), r;
}, nt = (e, t = {}) => tt([
	"svg",
	{
		...et,
		...t
	},
	e
]), rt = (e) => {
	for (let t in e) if (t.startsWith("aria-") || t === "role" || t === "title") return !0;
	return !1;
}, it = (...e) => e.filter((e, t, n) => !!e && e.trim() !== "" && n.indexOf(e) === t).join(" ").trim(), at = (e) => e.replace(/^([A-Z])|[\s-_]+(\w)/g, (e, t, n) => n ? n.toUpperCase() : t.toLowerCase()), ot = (e) => {
	let t = at(e);
	return t.charAt(0).toUpperCase() + t.slice(1);
}, st = (e) => Array.from(e.attributes).reduce((e, t) => (e[t.name] = t.value, e), {}), ct = (e) => typeof e == "string" ? e : !e || !e.class ? "" : e.class && typeof e.class == "string" ? e.class.split(" ") : e.class && Array.isArray(e.class) ? e.class : "", lt = (e, { nameAttr: t, icons: n, attrs: r }) => {
	let i = e.getAttribute(t);
	if (i == null) return;
	let a = n[ot(i)];
	if (!a) return console.warn(`${e.outerHTML} icon name was not found in the provided icons object.`);
	let o = st(e), s = rt(o) ? {} : { "aria-hidden": "true" }, c = {
		...et,
		"data-lucide": i,
		...s,
		...r,
		...o
	}, l = ct(o), u = ct(r), d = it("lucide", `lucide-${i}`, ...l, ...u);
	d && Object.assign(c, { class: d });
	let f = nt(a, c);
	return e.parentNode?.replaceChild(f, e);
}, ut = [["path", { d: "m12 19-7-7 7-7" }], ["path", { d: "M19 12H5" }]], dt = [
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
], ft = [["path", { d: "M21.801 10A10 10 0 1 1 17 3.335" }], ["path", { d: "m9 11 3 3L22 4" }]], pt = [["path", { d: "M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719" }]], mt = [["path", { d: "M5 12h14" }], ["path", { d: "M12 5v14" }]], ht = [["path", { d: "M3.714 3.048a.498.498 0 0 0-.683.627l2.843 7.627a2 2 0 0 1 0 1.396l-2.842 7.627a.498.498 0 0 0 .682.627l18-8.5a.5.5 0 0 0 0-.904z" }], ["path", { d: "M6 12h16" }]], gt = [["circle", {
	cx: "12",
	cy: "8",
	r: "5"
}], ["path", { d: "M20 21a8 8 0 0 0-16 0" }]], _t = [["path", { d: "M18 6 6 18" }], ["path", { d: "m6 6 12 12" }]], vt = ({ icons: e = {}, nameAttr: t = "data-lucide", attrs: n = {}, root: r = document, inTemplates: i } = {}) => {
	if (!Object.values(e).length) throw Error("Please provide an icons object.\nIf you want to use all the icons you can import it like:\n `import { createIcons, icons } from 'lucide';\nlucide.createIcons({icons});`");
	if (r === void 0) throw Error("`createIcons()` only works in a browser environment.");
	if (Array.from(r.querySelectorAll(`[${t}]`)).forEach((r) => lt(r, {
		nameAttr: t,
		icons: e,
		attrs: n
	})), i && Array.from(r.querySelectorAll("template")).forEach((r) => vt({
		icons: e,
		nameAttr: t,
		attrs: n,
		root: r.content,
		inTemplates: i
	})), t === "data-lucide") {
		let t = r.querySelectorAll("[icon-name]");
		t.length > 0 && (console.warn("[Lucide] Some icons were found with the now deprecated icon-name attribute. These will still be replaced for backwards compatibility, but will no longer be supported in v1.0 and you should switch to data-lucide"), Array.from(t).forEach((t) => lt(t, {
			nameAttr: "icon-name",
			icons: e,
			attrs: n
		})));
	}
}, X = () => {
	vt({ icons: {
		Bot: dt,
		MessageCircle: pt,
		SendHorizontal: ht,
		UserRound: gt,
		X: _t,
		Plus: mt,
		CheckCircle: ft,
		ArrowLeft: ut
	} });
}, Z = (e) => {
	let t = String(e || "").trim().replace(/\/+$/, "");
	return !t || /^https?:\/\//i.test(t) ? t : t.startsWith("/") ? `${window.location.origin}${t}` : t;
}, yt = (e) => e.startsWith("/") ? e : `/${e}`, bt = (e) => e.replace(/\/api\/?$/i, ""), xt = (e) => e && typeof e == "object" && "data" in e ? e.data : e, St = (e) => {
	let t = "chatbot_ai_history", n = e?.aiSupport?.apiKey || e?.humanSupport?.widgetKey || "";
	return n ? `${t}:${n}` : typeof window < "u" ? `${t}:${window.location.origin}` : t;
}, Ct = (e) => {
	if (typeof localStorage > "u") return [];
	try {
		let t = localStorage.getItem(e);
		if (!t) return [];
		let n = JSON.parse(t);
		return Array.isArray(n) ? n.filter((e) => e && (e.role === "user" || e.role === "bot")).map((e) => ({
			role: e.role,
			text: String(e.text || "")
		})) : [];
	} catch {
		return [];
	}
}, wt = (e, t) => {
	if (!(typeof localStorage > "u")) try {
		localStorage.setItem(e, JSON.stringify(t));
	} catch {}
}, Tt = (e, t, n) => {
	t.push(n), wt(e, t);
}, Et = (e, t) => {
	if (t.splice(0, t.length), !(typeof localStorage > "u")) try {
		localStorage.removeItem(e);
	} catch {}
}, Q = (e) => e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;"), Dt = (e) => e.replace(/!\[([^\]]*)\]\((https?:\/\/[^)]+)\)/g, (e, t, n) => `<img class="chatbot-image" src="${n}" alt="${t || "uploaded image"}" />`).replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, (e, t, n) => `<a href="${n}" target="_blank" rel="noopener noreferrer">${t}</a>`).replace(/&lt;(https?:\/\/[^&]+)&gt;/g, (e, t) => `<a href="${t}" target="_blank" rel="noopener noreferrer">${t}</a>`).replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/\*([^*]+)\*/g, "<em>$1</em>").replace(/`([^`]+)`/g, "<code>$1</code>"), Ot = (e) => {
	let t = e.split(/\r?\n/), n = [], r = 0, i = (e) => {
		let t = e.trim();
		t && n.push(`<p class="chatbot-md-p">${Dt(t)}</p>`);
	};
	for (; r < t.length;) {
		let e = t[r] ?? "";
		if (!e.trim()) {
			n.push("<div class=\"chatbot-md-spacer\"></div>"), r += 1;
			continue;
		}
		let a = e.match(/^###\s+(.+)$/), o = e.match(/^##\s+(.+)$/), s = e.match(/^#\s+(.+)$/);
		if (a || o || s) {
			let e = Dt(Q((a || o || s)?.[1] || "")), t = a ? "chatbot-md-h3" : o ? "chatbot-md-h2" : "chatbot-md-h1";
			n.push(`<div class="${t}">${e}</div>`), r += 1;
			continue;
		}
		if (e.match(/^\s*[-*+]\s+(.+)$/)) {
			let e = [];
			for (; r < t.length;) {
				let n = (t[r] ?? "").match(/^\s*[-*+]\s+(.+)$/);
				if (!n) break;
				e.push(`<li>${Dt(Q(n[1]))}</li>`), r += 1;
			}
			n.push(`<ul class="chatbot-md-list">${e.join("")}</ul>`);
			continue;
		}
		if (e.match(/^\s*\d+\.\s+(.+)$/)) {
			let e = [];
			for (; r < t.length;) {
				let n = (t[r] ?? "").match(/^\s*\d+\.\s+(.+)$/);
				if (!n) break;
				e.push(`<li>${Dt(Q(n[1]))}</li>`), r += 1;
			}
			n.push(`<ol class="chatbot-md-list ordered">${e.join("")}</ol>`);
			continue;
		}
		let c = [];
		for (; r < t.length;) {
			let e = t[r] ?? "", n = e.trim();
			if (!n || /^###\s+/.test(e) || /^##\s+/.test(e) || /^#\s+/.test(e) || /^\s*[-*+]\s+/.test(e) || /^\s*\d+\.\s+/.test(e)) break;
			c.push(n), r += 1;
		}
		i(Q(c.join(" ")));
	}
	return n.join("");
}, kt = (e) => {
	let t = String(e || ""), n = t.match(/^##+\s+References\s*$/im) || t.match(/^References\s*$/im);
	if (!n || n.index == null) return [];
	let r = n.index + n[0].length, i = t.slice(r).split(/\r?\n/), a = [];
	for (let e of i) {
		let t = e.trim();
		if (!t) continue;
		if (/^##+/.test(t)) break;
		let n = t.match(/^\s*[-*]\s*\[([^\]]+)\]\((https?:\/\/[^)]+)\)/i);
		if (n) {
			a.push({
				label: n[1],
				url: n[2]
			});
			continue;
		}
		let r = t.match(/(https?:\/\/\S+)/i);
		r && a.push({
			label: r[1],
			url: r[1]
		});
	}
	return a;
}, At = (e) => {
	let t = String(e || ""), n = t.match(/^##+\s+References\s*$/im) || t.match(/^References\s*$/im);
	return !n || n.index == null ? t : t.slice(0, n.index).trimEnd();
}, jt = (e) => {
	let t = kt(e), n = At(e), r = String(n || "").split(/```/).map((e, t) => t % 2 == 1 ? `<pre><code>${Q(e.trim())}</code></pre>` : Ot(Q(e))).join("");
	return t.length === 0 ? r : `${r}<div class="chatbot-ref-chips">${t.map((e) => `<a class="chatbot-ref-chip" href="${e.url}" target="_blank" rel="noopener noreferrer">${Q(e.label)}</a>`).join("")}</div>`;
}, $ = (e, t, n = !1) => {
	let r = document.createElement("div");
	return r.className = `chatbot-bubble ${t}`, n ? r.innerHTML = jt(e) : r.textContent = e, r;
}, Mt = () => {
	let e = document.createElement("div");
	return e.className = "chatbot-bubble bot typing", e.setAttribute("aria-label", "Assistant is typing"), e.innerHTML = "\n    <div class=\"chatbot-typing\" aria-hidden=\"true\">\n      <span></span>\n      <span></span>\n      <span></span>\n    </div>\n  ", e;
}, Nt = (e, t, n) => {
	let r = document.createElement("button");
	return r.type = "button", r.innerHTML = `<i data-lucide="${e}" aria-hidden="true"></i>`, r.setAttribute("aria-label", t), n && r.addEventListener("click", n), r;
}, Pt = (e, t) => {
	let n = document.createElement("header");
	n.className = "chatbot-header";
	let r = document.createElement("div");
	r.className = "chatbot-header-left";
	let i = document.createElement("div");
	i.className = "chatbot-avatar", i.innerHTML = "<i data-lucide=\"bot\" aria-hidden=\"true\"></i>";
	let a = document.createElement("div");
	a.className = "chatbot-header-info";
	let o = document.createElement("h2");
	o.textContent = e.title;
	let s = document.createElement("div");
	s.className = "chatbot-status";
	let c = document.createElement("span");
	c.className = "chatbot-status-dot";
	let l = document.createElement("span");
	l.textContent = e.subtitle, s.append(c, l), a.append(o, s), r.append(i, a);
	let u = document.createElement("div");
	u.className = "chatbot-controls";
	let d = Nt("x", "Close chat", t);
	return u.append(d), n.append(r, u), {
		header: n,
		statusText: l
	};
}, Ft = (e) => {
	let t = document.createElement("div");
	t.className = "chatbot-body";
	let n = document.createElement("section");
	n.className = "chatbot-intro";
	let r = document.createElement("div");
	r.className = "chatbot-intro-icon", r.textContent = "?";
	let i = document.createElement("h3");
	i.textContent = "Hi there!";
	let a = document.createElement("p");
	a.textContent = "I am your AI support assistant. Ask me anything.";
	let o = document.createElement("p");
	o.className = "chatbot-human-note", o.textContent = "If I cannot help, you can connect with our human support team.", n.append(r, i, a, o);
	let s = document.createElement("section");
	s.className = "chatbot-human-hero";
	let c = document.createElement("h3");
	c.textContent = "Talk to Support";
	let l = document.createElement("p");
	l.textContent = "Our team typically replies in a few minutes.";
	let u = document.createElement("div");
	u.className = "chatbot-history-label", u.textContent = "Previous Messages", s.append(c, l, u);
	let d = document.createElement("div");
	d.className = "chatbot-divider", d.textContent = "Previous Messages";
	let f = document.createElement("div");
	return f.className = "chatbot-messages", f.setAttribute("aria-live", "polite"), f.appendChild($(e.welcomeMessage, "bot", !0)), t.append(n, s, f), {
		body: t,
		humanDivider: d,
		messages: f
	};
}, It = (e) => {
	let t = document.createElement("div");
	t.className = "chatbot-footer";
	let n = document.createElement("form");
	n.className = "chatbot-input-row";
	let r = document.createElement("textarea");
	r.className = "chatbot-input", r.rows = 1, r.placeholder = e.placeholder;
	let i = document.createElement("input");
	i.type = "file", i.accept = "image/*", i.className = "chatbot-attach-input";
	let a = document.createElement("button");
	a.type = "button", a.className = "chatbot-attach", a.setAttribute("aria-label", "Upload image"), a.innerHTML = "<i data-lucide=\"image\" aria-hidden=\"true\"></i>";
	let o = document.createElement("button");
	o.type = "submit", o.className = "chatbot-send", o.setAttribute("aria-label", "Send message"), o.innerHTML = "<i data-lucide=\"send-horizontal\" aria-hidden=\"true\"></i>", n.append(r, a, o, i);
	let s = document.createElement("button");
	s.type = "button", s.className = "chatbot-human-button";
	let c = document.createElement("p");
	c.className = "chatbot-powered", c.innerHTML = "Powered by <strong>AI assistant</strong>";
	let l = document.createElement("div");
	return l.className = "chatbot-loading-row", l.innerHTML = "\n    <span class=\"chatbot-loading-label\">Waiting for support</span>\n    <span class=\"chatbot-loading-dots\" aria-hidden=\"true\">\n      <span></span><span></span><span></span>\n    </span>\n  ", t.append(n, l, s, c), {
		footer: t,
		inputRow: n,
		input: r,
		humanButton: s,
		loadingRow: l,
		attachInput: i,
		attachButton: a
	};
}, Lt = () => {
	let e = document.createElement("div");
	e.className = "chatbot-human-container";
	let t = document.createElement("div");
	t.className = "chatbot-human-header";
	let n = document.createElement("h3");
	n.textContent = "Contact Support";
	let r = document.createElement("p");
	r.textContent = "Please provide your details and we will get back to you shortly.", t.append(n, r);
	let i = document.createElement("form");
	i.className = "chatbot-human-form";
	let a = (e, t) => {
		let n = document.createElement("div");
		n.className = "chatbot-form-group";
		let r = document.createElement("label");
		return r.textContent = e, n.append(r, t), n;
	}, o = document.createElement("input");
	o.type = "text", o.placeholder = "John Doe", o.required = !0;
	let s = document.createElement("input");
	s.type = "email", s.placeholder = "john@example.com", s.required = !0;
	let c = document.createElement("textarea");
	c.placeholder = "How can we help you?", c.required = !0;
	let l = document.createElement("div");
	l.className = "chatbot-form-actions";
	let u = document.createElement("button");
	u.type = "button", u.className = "chatbot-btn-secondary", u.innerHTML = "<i data-lucide=\"arrow-left\" aria-hidden=\"true\" style=\"width: 16px; height: 16px;\"></i> Back";
	let d = document.createElement("button");
	d.type = "submit", d.className = "chatbot-btn-primary", d.textContent = "Send Message", l.append(u, d), i.append(a("Name", o), a("Email", s), a("Description", c), l);
	let f = document.createElement("div");
	f.className = "chatbot-human-success";
	let p = document.createElement("div");
	p.className = "chatbot-success-icon", p.innerHTML = "<i data-lucide=\"check-circle\" aria-hidden=\"true\"></i>";
	let m = document.createElement("h3");
	m.textContent = "Message Sent!";
	let h = document.createElement("p");
	h.textContent = "Our support team will reach out to you via email shortly.";
	let g = document.createElement("button");
	return g.type = "button", g.className = "chatbot-btn-primary", g.textContent = "Back to Chat", f.append(p, m, h, g), e.append(t, i, f), {
		humanContainer: e,
		humanForm: i,
		cancelBtn: u,
		successBackBtn: g
	};
}, Rt = (e = {}) => {
	if (typeof window > "u" || typeof document > "u") throw Error("chatbot-package can only run in a browser environment.");
	$e();
	let t = {
		...Ze,
		...e
	}, n = document.createElement("div");
	n.className = `chatbot-widget-root ${t.position === "bottom-left" ? "left" : "right"}`, n.style.setProperty("--chatbot-primary", t.primaryColor), n.style.zIndex = String(t.zIndex);
	let r = document.createElement("button");
	r.type = "button", r.className = "chatbot-launcher", r.setAttribute("aria-label", "Open chatbot"), r.setAttribute("aria-expanded", "false"), r.innerHTML = "<i data-lucide=\"message-circle\" aria-hidden=\"true\"></i>";
	let i = document.createElement("section");
	i.className = "chatbot-panel", i.setAttribute("role", "dialog"), i.setAttribute("aria-label", t.title);
	let { header: a, statusText: o } = Pt(t, () => {
		n.classList.remove("open"), r.setAttribute("aria-expanded", "false");
	}), { body: s, humanDivider: c, messages: l } = Ft(t), { footer: u, inputRow: d, input: f, humanButton: p, loadingRow: m, attachInput: h, attachButton: g } = It(t), _ = "<i data-lucide=\"user-round\" aria-hidden=\"true\"></i><span>Talk to a real human</span>", v = "<i data-lucide=\"bot\" aria-hidden=\"true\"></i><span>Talk to AI</span>";
	p.innerHTML = _;
	let { humanContainer: ee, humanForm: te, cancelBtn: ne, successBackBtn: re } = Lt(), y = St(e), b = Ct(y), x = [], S = [], C = !0, w = Math.max(b.length - 30, 0), T = !1, E = () => l.contains(c) ? c.nextSibling : l.firstChild, D = () => {
		l.innerHTML = "";
		let e = b.slice(w);
		e.length !== 0 && (s.classList.add("has-messages"), e.forEach((e) => {
			l.appendChild($(e.text, e.role, e.role === "bot"));
		}), s.scrollTop = s.scrollHeight);
	}, ie = () => {
		if (l.innerHTML = "", x.length === 0) {
			let e = S.length > 0 ? S[S.length - 1] : [];
			if (e.length === 0 || !C) {
				s.classList.remove("has-messages");
				return;
			}
			s.classList.add("has-messages");
			let t = document.createElement("div");
			t.className = "chatbot-recent-history";
			let n = document.createElement("div");
			n.className = "chatbot-recent-label", n.textContent = "Previous Messages", t.appendChild(n), e.slice(-6).forEach((e) => {
				let n = e.role === "bot" || (typeof e.markdown == "boolean" ? e.markdown : !1);
				t.appendChild($(e.text, e.role, n));
			}), l.appendChild(t), s.scrollTop = s.scrollHeight;
			return;
		}
		s.classList.add("has-messages"), x.forEach((e) => {
			l.appendChild($(e.text, e.role, e.markdown ?? !1));
		}), s.scrollTop = s.scrollHeight;
	}, ae = () => {
		if (T || w === 0) return;
		T = !0;
		let e = Math.max(w - 30, 0), t = b.slice(e, w);
		if (t.length === 0) {
			T = !1;
			return;
		}
		let n = s.scrollHeight, r = s.scrollTop, i = E();
		t.forEach((e) => {
			l.insertBefore($(e.text, e.role, e.role === "bot"), i);
		}), w = e, s.scrollTop = r + (s.scrollHeight - n), T = !1;
	}, oe = () => {
		w !== 0 && s.scrollTop <= 12 && ae();
	};
	b.length > 0 && D(), s.addEventListener("scroll", oe), i.append(a, s, u, ee), n.append(i, r), document.body.appendChild(n), X();
	let O = !1, k = !1, A = !1, j = !1, se = !1, M = !1, N = !1, P = null, F = null, I = null, ce = /* @__PURE__ */ new Set(), L = (e, t) => {
		e.trim() && (s.classList.add("has-messages"), l.appendChild($(e.trim(), "bot", t?.markdown ?? !0)), s.scrollTop = s.scrollHeight, t?.store && !A && !N && Tt(y, b, {
			role: "bot",
			text: e.trim()
		}));
	}, R = (e, t, n) => {
		e.trim() && (s.classList.add("has-messages"), x.push({
			role: t,
			text: e.trim(),
			markdown: n?.markdown ?? !1
		}), l.appendChild($(e.trim(), t, n?.markdown ?? !1)), s.scrollTop = s.scrollHeight);
	}, z = (e, t) => {
		if (m) {
			if (t) {
				let e = m.querySelector(".chatbot-loading-label");
				e && (e.textContent = t);
			}
			m.style.display = e ? "flex" : "none";
		}
	}, B = () => {
		if (!g) return;
		let e = A && !N;
		g.style.display = e ? "grid" : "none";
	}, V = (e) => new Promise((t, n) => {
		let r = new FileReader();
		r.onload = () => t(String(r.result || "")), r.onerror = () => n(/* @__PURE__ */ Error("Unable to read file.")), r.readAsDataURL(e);
	}), le = async () => {
		if (t.humanSupport?.widgetKey) return t.humanSupport.widgetKey;
		if (e.aiSupport?.apiKey && t.humanSupport?.apiBaseUrl) {
			let n = Z(t.humanSupport.apiBaseUrl), r = /\/api$/i.test(n) ? `${n}/widget/key` : `${n}/api/widget/key`, i = await fetch(r, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ apiKey: e.aiSupport.apiKey })
			});
			if (!i.ok) return null;
			let a = xt(await i.json());
			if (a?.widgetKey) return t.humanSupport.widgetKey = a.widgetKey, a.widgetKey;
		}
		return null;
	}, ue = async (n) => {
		let r = await le();
		if (!r) throw Error("Widget key is required for uploads.");
		let i = Z(t.humanSupport?.apiBaseUrl || e.aiSupport?.apiBaseUrl || ""), a = /\/api$/i.test(i) ? `${i}/uploads/chat-image` : `${i}/api/uploads/chat-image`, o = await V(n), s = await fetch(a, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				widgetKey: r,
				fileName: n.name,
				dataUrl: o
			})
		});
		if (!s.ok) {
			let e = await s.json().catch(() => null), t = e?.message || e?.error || "Unable to upload image right now.";
			throw Error(t);
		}
		let c = xt(await s.json());
		if (!c?.url) throw Error("Upload succeeded but no URL was returned.");
		return c.url;
	}, H = null, U = (e) => {
		s.classList.toggle("human-mode", e), e ? (l.contains(c) || l.insertBefore(c, l.firstChild), p.innerHTML = v) : (l.contains(c) && c.remove(), p.innerHTML = _), X(), B();
	}, W = a.querySelector(".chatbot-controls");
	if (W) {
		let e = document.createElement("button");
		e.type = "button", e.setAttribute("aria-label", "Clear AI chat"), e.innerHTML = "<i data-lucide=\"x\" aria-hidden=\"true\"></i>", W.appendChild(e);
		let n = document.createElement("button");
		n.type = "button", n.setAttribute("aria-label", "Start new human session"), n.innerHTML = "<i data-lucide=\"plus\" aria-hidden=\"true\"></i>", W.appendChild(n);
		let r = (t) => {
			e.style.display = t ? "none" : "grid", n.style.display = t ? "grid" : "none";
		};
		r(!1), e.addEventListener("click", () => {
			A || (Et(y, b), w = Math.max(b.length - 30, 0), l.innerHTML = "", s.classList.remove("has-messages"), l.appendChild($(t.welcomeMessage, "bot", !0)), s.scrollTop = s.scrollHeight);
		}), n.addEventListener("click", () => {
			x.length > 0 && S.push([...x]), P &&= (P.close(), null), F = null, I = null, A = !1, j = !1, M = !1, N = !0, x.splice(0, x.length), C = !1, U(!0), ie(), R("Please describe the issue you are facing.", "bot"), p.innerHTML = v, X();
		});
		let i = U;
		U = (e) => {
			i(e), r(e), e ? (C = !0, ie()) : b.length > 0 ? (w = Math.max(b.length - 30, 0), D()) : (l.innerHTML = "", s.classList.remove("has-messages"), l.appendChild($(t.welcomeMessage, "bot", !0)));
		};
	}
	let G = (e) => {
		k || (O = e, n.classList.toggle("open", O), r.setAttribute("aria-expanded", String(O)), O && window.setTimeout(() => f.focus(), 0));
	}, de = async (n) => {
		if (A && P) {
			P.emit("widget:message", { text: n });
			return;
		}
		if (e.onUserMessage) {
			let t = await e.onUserMessage(n);
			typeof t == "string" && t.trim() && L(t, { store: !0 });
			return;
		}
		if (e.aiSupport) {
			try {
				let t = Z(e.aiSupport.apiBaseUrl), r = yt(e.aiSupport.chatPath || "/rag/chat"), i = await fetch(`${t}${r}`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						"x-api-key": e.aiSupport.apiKey
					},
					body: JSON.stringify({ query: n })
				});
				if (!i.ok) throw Error("Unable to fetch chatbot response right now.");
				let a = xt(await i.json());
				L(typeof a?.answer == "string" && a.answer || typeof a?.response == "string" && a.response || typeof a?.message == "string" && a.message || "I processed your question, but no answer text was returned.", {
					markdown: !0,
					store: !0
				});
				let o = Array.isArray(a?.sources) && a.sources || Array.isArray(a?.references) && a.references || [];
				if (o.length > 0) {
					let e = o.slice(0, 5).map((e) => {
						let t = e?.url || e?.link;
						return t ? `- [${e?.title || e?.name || t}](${t})` : null;
					}).filter(Boolean);
					e.length > 0 && L(["### References", ...e].join("\n"), {
						markdown: !0,
						store: !0
					});
				}
				if (a?.raise_ticket && a?.ticket_payload) {
					let e = a.ticket_payload, t = a?.ticket?._id || a?.ticketId || a?.ticket_id;
					L([
						"### Ticket Details",
						e?.summary ? `- Summary: ${e.summary}` : null,
						e?.priority ? `- Priority: ${String(e.priority).toUpperCase()}` : null,
						e?.urgency ? `- Urgency: ${String(e.urgency).toUpperCase()}` : null,
						t ? `- Ticket ID: ${t}` : null,
						"- Status: Pending"
					].filter(Boolean).join("\n"), {
						markdown: !0,
						store: !0
					});
				}
			} catch (e) {
				let t = e instanceof Error ? e.message : "Sorry, I am having trouble connecting right now.";
				L(t.includes("Failed to fetch") ? "Unable to reach the AI server. Please try again." : t);
			}
			return;
		}
		L(`Thanks! ${t.botName} received: "${n}"`, { store: !0 });
	}, fe = async (e) => {
		if (!t.humanSupport) {
			R("Human support is not configured for this widget yet.", "bot");
			return;
		}
		let n = await le();
		if (!n) throw Error("Human support requires a widget key or aiSupport.apiKey.");
		let r = Z(t.humanSupport.apiBaseUrl), i = /\/api$/i.test(r) ? `${r}/widget/session` : `${r}/api/widget/session`, a = await fetch(i, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				widgetKey: n,
				visitorName: e.name,
				visitorEmail: e.email,
				issue: e.issue,
				chatHistory: b
			})
		});
		if (!a.ok) {
			let e = await a.json().catch(() => null), t = e?.message || e?.error || "Unable to connect to human support right now.";
			throw Error(t);
		}
		let s = xt(await a.json());
		F = s.sessionId, I = s.ticketId, A = !0, U(!0);
		let c = Ye(bt(r), {
			path: "/socket.io",
			transports: ["websocket"],
			auth: { token: s.chatToken }
		});
		P = c, c.on("connect", () => {
			o.textContent = "Connecting to a human agent...";
		}), c.on("disconnect", () => {
			A && (o.textContent = "Reconnecting to human support...");
		}), c.on("chat:message", (e) => {
			e.sessionId === F && (e._id && ce.has(e._id) || (e._id && ce.add(e._id), e.sender === "agent" && typeof e.text == "string" && (j || (R("You are now connected to a human agent.", "bot"), R("AGENT JOINED THE SESSION", "system"), M = !0), z(!1), R(e.text, "bot", { markdown: !0 }), j = !0)));
		}), c.on("chat:ticket_status", (e) => {
			if (e.sessionId && e.sessionId === F || e.ticketId && e.ticketId === I) {
				if (e.status === "assigned") {
					j || R("A human agent has accepted your chat. You are now connected.", "bot"), j = !0, z(!1), M ||= (R("AGENT JOINED THE SESSION", "system"), !0), o.textContent = "Connected with human support";
					return;
				}
				e.status === "pending" && (o.textContent = "Connecting to a human agent...");
			}
		}), c.on("chat:error", (e) => {
			R(e.message || "Support connection error. Please try again.", "bot");
		}), c.emit("widget:request_human", {
			name: e.name,
			email: e.email,
			issue: e.issue
		}), o.textContent = "Connecting to a human agent...", z(!0, "Connecting to support");
	}, pe = async (e) => {
		let t = e.trim(), n = H;
		if (!t && !n || k) {
			n && (H = n);
			return;
		}
		n && (H = null);
		let r = n ? `${t || "Attached image:"}\n\n![Uploaded image](${n})` : t;
		if (N) {
			s.classList.add("has-messages"), U(!0), R(r, "user", { markdown: !0 }), !A && !N && Tt(y, b, {
				role: "user",
				text: r
			}), f.value = "", s.scrollTop = s.scrollHeight, N = !1, B();
			try {
				await fe({
					name: "Website Visitor",
					email: "",
					issue: r
				}), R("You're now connected to a support agent. Please wait...", "bot"), z(!0, "Waiting for support"), p.innerHTML = v, X();
			} catch (e) {
				R(e instanceof Error ? e.message : "Unable to connect to support right now.", "bot"), z(!1), N = !0;
			}
			return;
		}
		s.classList.add("has-messages"), U(A), A ? (R(r, "user", { markdown: !!n }), z(!0, "Waiting for support")) : l.appendChild($(r, "user", !!n)), B(), !A && !N && Tt(y, b, {
			role: "user",
			text: r
		}), f.value = "", s.scrollTop = s.scrollHeight;
		let i = A ? null : Mt();
		i && (l.appendChild(i), s.scrollTop = s.scrollHeight);
		try {
			await de(r);
		} finally {
			i?.isConnected && i.remove();
		}
	};
	return r.addEventListener("click", () => {
		G(!O);
	}), d.addEventListener("submit", async (e) => {
		e.preventDefault(), await pe(f.value);
	}), g.addEventListener("click", () => {
		h.click();
	}), h.addEventListener("change", async () => {
		let e = h.files?.[0];
		if (h.value = "", e) {
			if (!A && !N) {
				L("Image uploads are available in human support chat.");
				return;
			}
			try {
				H = await ue(e), R("Image attached. Please include it with your message.", "system"), B();
			} catch (e) {
				R(e instanceof Error ? e.message : "Unable to upload image right now.", "bot");
			}
		}
	}), f.addEventListener("keydown", async (e) => {
		e.key === "Enter" && !e.shiftKey && (e.preventDefault(), await pe(f.value));
	}), p.addEventListener("click", async () => {
		if (!A && N) {
			N = !1, U(!1), z(!1), p.innerHTML = _, X();
			return;
		}
		if (A) {
			x.length > 0 && (S.push([...x]), x.splice(0, x.length)), A = !1, j = !1, z(!1), N = !1, U(!1), L("You are now chatting with AI again."), p.innerHTML = _, X();
			return;
		}
		if (!se) {
			se = !0, U(!0), N || (R("Please describe the issue you are facing.", "bot"), N = !0, B());
			try {
				p.innerHTML = v, X();
			} catch (e) {
				let t = e instanceof Error ? e.message : "Unable to connect to support right now.";
				L(t.includes("Failed to fetch") ? "Unable to reach support server. Please try again." : t), A = !1, j = !1, z(!1), N = !1, U(!1), p.innerHTML = _, X();
			} finally {
				se = !1;
			}
		}
	}), ne.addEventListener("click", () => {}), te.addEventListener("submit", async (e) => {
		e.preventDefault();
	}), re.addEventListener("click", () => {
		n.classList.remove("show-human-form"), n.classList.remove("show-human-success"), te.reset(), s.classList.add("has-messages"), l.appendChild($(A && I ? j ? `You are now connected with our support team (ticket ${I.slice(-6)}).` : `Your ticket ${I.slice(-6)} is waiting for an available human agent.` : "Your issue has been submitted. A human agent will contact you soon.", "bot")), s.scrollTop = s.scrollHeight;
	}), {
		open: () => G(!0),
		close: () => G(!1),
		toggle: () => G(!O),
		sendMessage: pe,
		destroy: () => {
			k || (k = !0, s.removeEventListener("scroll", oe), P &&= (P.close(), null), n.remove());
		}
	};
};
//#endregion
export { Rt as createChatbotWidget };
