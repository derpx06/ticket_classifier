(function(e,t){typeof exports==`object`&&typeof module<`u`?t(exports):typeof define==`function`&&define.amd?define([`exports`],t):(e=typeof globalThis<`u`?globalThis:e||self,t(e.ChatbotPackage={}))})(this,function(e){Object.defineProperty(e,Symbol.toStringTag,{value:`Module`});var t=Object.defineProperty,n=(e,n)=>{let r={};for(var i in e)t(r,i,{get:e[i],enumerable:!0});return n||t(r,Symbol.toStringTag,{value:`Module`}),r},r={xmlns:`http://www.w3.org/2000/svg`,width:24,height:24,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,"stroke-width":2,"stroke-linecap":`round`,"stroke-linejoin":`round`},i=([e,t,n])=>{let r=document.createElementNS(`http://www.w3.org/2000/svg`,e);return Object.keys(t).forEach(e=>{r.setAttribute(e,String(t[e]))}),n?.length&&n.forEach(e=>{let t=i(e);r.appendChild(t)}),r},a=(e,t={})=>i([`svg`,{...r,...t},e]),o=e=>{for(let t in e)if(t.startsWith(`aria-`)||t===`role`||t===`title`)return!0;return!1},s=(...e)=>e.filter((e,t,n)=>!!e&&e.trim()!==``&&n.indexOf(e)===t).join(` `).trim(),c=e=>e.replace(/^([A-Z])|[\s-_]+(\w)/g,(e,t,n)=>n?n.toUpperCase():t.toLowerCase()),l=e=>{let t=c(e);return t.charAt(0).toUpperCase()+t.slice(1)},u=e=>Array.from(e.attributes).reduce((e,t)=>(e[t.name]=t.value,e),{}),ee=e=>typeof e==`string`?e:!e||!e.class?``:e.class&&typeof e.class==`string`?e.class.split(` `):e.class&&Array.isArray(e.class)?e.class:``,d=(e,{nameAttr:t,icons:n,attrs:i})=>{let c=e.getAttribute(t);if(c==null)return;let d=n[l(c)];if(!d)return console.warn(`${e.outerHTML} icon name was not found in the provided icons object.`);let f=u(e),te=o(f)?{}:{"aria-hidden":`true`},p={...r,"data-lucide":c,...te,...i,...f},m=ee(f),h=ee(i),g=s(`lucide`,`lucide-${c}`,...m,...h);g&&Object.assign(p,{class:g});let ne=a(d,p);return e.parentNode?.replaceChild(ne,e)},f=[[`path`,{d:`m12 19-7-7 7-7`}],[`path`,{d:`M19 12H5`}]],te=[[`path`,{d:`M12 8V4H8`}],[`rect`,{width:`16`,height:`12`,x:`4`,y:`8`,rx:`2`}],[`path`,{d:`M2 14h2`}],[`path`,{d:`M20 14h2`}],[`path`,{d:`M15 13v2`}],[`path`,{d:`M9 13v2`}]],p=[[`path`,{d:`M21.801 10A10 10 0 1 1 17 3.335`}],[`path`,{d:`m9 11 3 3L22 4`}]],m=[[`path`,{d:`M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719`}]],h=[[`path`,{d:`M3.714 3.048a.498.498 0 0 0-.683.627l2.843 7.627a2 2 0 0 1 0 1.396l-2.842 7.627a.498.498 0 0 0 .682.627l18-8.5a.5.5 0 0 0 0-.904z`}],[`path`,{d:`M6 12h16`}]],g=[[`circle`,{cx:`12`,cy:`8`,r:`5`}],[`path`,{d:`M20 21a8 8 0 0 0-16 0`}]],ne=[[`path`,{d:`M18 6 6 18`}],[`path`,{d:`m6 6 12 12`}]],re=({icons:e={},nameAttr:t=`data-lucide`,attrs:n={},root:r=document,inTemplates:i}={})=>{if(!Object.values(e).length)throw Error(`Please provide an icons object.
If you want to use all the icons you can import it like:
 \`import { createIcons, icons } from 'lucide';
lucide.createIcons({icons});\``);if(r===void 0)throw Error("`createIcons()` only works in a browser environment.");if(Array.from(r.querySelectorAll(`[${t}]`)).forEach(r=>d(r,{nameAttr:t,icons:e,attrs:n})),i&&Array.from(r.querySelectorAll(`template`)).forEach(r=>re({icons:e,nameAttr:t,attrs:n,root:r.content,inTemplates:i})),t===`data-lucide`){let t=r.querySelectorAll(`[icon-name]`);t.length>0&&(console.warn(`[Lucide] Some icons were found with the now deprecated icon-name attribute. These will still be replaced for backwards compatibility, but will no longer be supported in v1.0 and you should switch to data-lucide`),Array.from(t).forEach(t=>d(t,{nameAttr:`icon-name`,icons:e,attrs:n})))}},_=Object.create(null);_.open=`0`,_.close=`1`,_.ping=`2`,_.pong=`3`,_.message=`4`,_.upgrade=`5`,_.noop=`6`;var v=Object.create(null);Object.keys(_).forEach(e=>{v[_[e]]=e});var ie={type:`error`,data:`parser error`},ae=typeof Blob==`function`||typeof Blob<`u`&&Object.prototype.toString.call(Blob)===`[object BlobConstructor]`,y=typeof ArrayBuffer==`function`,b=e=>typeof ArrayBuffer.isView==`function`?ArrayBuffer.isView(e):e&&e.buffer instanceof ArrayBuffer,x=({type:e,data:t},n,r)=>ae&&t instanceof Blob?n?r(t):S(t,r):y&&(t instanceof ArrayBuffer||b(t))?n?r(t):S(new Blob([t]),r):r(_[e]+(t||``)),S=(e,t)=>{let n=new FileReader;return n.onload=function(){let e=n.result.split(`,`)[1];t(`b`+(e||``))},n.readAsDataURL(e)};function C(e){return e instanceof Uint8Array?e:e instanceof ArrayBuffer?new Uint8Array(e):new Uint8Array(e.buffer,e.byteOffset,e.byteLength)}var w;function T(e,t){if(ae&&e.data instanceof Blob)return e.data.arrayBuffer().then(C).then(t);if(y&&(e.data instanceof ArrayBuffer||b(e.data)))return t(C(e.data));x(e,!1,e=>{w||=new TextEncoder,t(w.encode(e))})}var oe=`ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/`,E=typeof Uint8Array>`u`?[]:new Uint8Array(256);for(let e=0;e<64;e++)E[oe.charCodeAt(e)]=e;var se=e=>{let t=e.length*.75,n=e.length,r,i=0,a,o,s,c;e[e.length-1]===`=`&&(t--,e[e.length-2]===`=`&&t--);let l=new ArrayBuffer(t),u=new Uint8Array(l);for(r=0;r<n;r+=4)a=E[e.charCodeAt(r)],o=E[e.charCodeAt(r+1)],s=E[e.charCodeAt(r+2)],c=E[e.charCodeAt(r+3)],u[i++]=a<<2|o>>4,u[i++]=(o&15)<<4|s>>2,u[i++]=(s&3)<<6|c&63;return l},ce=typeof ArrayBuffer==`function`,D=(e,t)=>{if(typeof e!=`string`)return{type:`message`,data:ue(e,t)};let n=e.charAt(0);return n===`b`?{type:`message`,data:le(e.substring(1),t)}:v[n]?e.length>1?{type:v[n],data:e.substring(1)}:{type:v[n]}:ie},le=(e,t)=>ce?ue(se(e),t):{base64:!0,data:e},ue=(e,t)=>{switch(t){case`blob`:return e instanceof Blob?e:new Blob([e]);default:return e instanceof ArrayBuffer?e:e.buffer}},O=``,de=(e,t)=>{let n=e.length,r=Array(n),i=0;e.forEach((e,a)=>{x(e,!1,e=>{r[a]=e,++i===n&&t(r.join(O))})})},k=(e,t)=>{let n=e.split(O),r=[];for(let e=0;e<n.length;e++){let i=D(n[e],t);if(r.push(i),i.type===`error`)break}return r};function A(){return new TransformStream({transform(e,t){T(e,n=>{let r=n.length,i;if(r<126)i=new Uint8Array(1),new DataView(i.buffer).setUint8(0,r);else if(r<65536){i=new Uint8Array(3);let e=new DataView(i.buffer);e.setUint8(0,126),e.setUint16(1,r)}else{i=new Uint8Array(9);let e=new DataView(i.buffer);e.setUint8(0,127),e.setBigUint64(1,BigInt(r))}e.data&&typeof e.data!=`string`&&(i[0]|=128),t.enqueue(i),t.enqueue(n)})}})}var j;function M(e){return e.reduce((e,t)=>e+t.length,0)}function N(e,t){if(e[0].length===t)return e.shift();let n=new Uint8Array(t),r=0;for(let i=0;i<t;i++)n[i]=e[0][r++],r===e[0].length&&(e.shift(),r=0);return e.length&&r<e[0].length&&(e[0]=e[0].slice(r)),n}function P(e,t){j||=new TextDecoder;let n=[],r=0,i=-1,a=!1;return new TransformStream({transform(o,s){for(n.push(o);;){if(r===0){if(M(n)<1)break;let e=N(n,1);a=(e[0]&128)==128,i=e[0]&127,r=i<126?3:i===126?1:2}else if(r===1){if(M(n)<2)break;let e=N(n,2);i=new DataView(e.buffer,e.byteOffset,e.length).getUint16(0),r=3}else if(r===2){if(M(n)<8)break;let e=N(n,8),t=new DataView(e.buffer,e.byteOffset,e.length),a=t.getUint32(0);if(a>2**21-1){s.enqueue(ie);break}i=a*2**32+t.getUint32(4),r=3}else{if(M(n)<i)break;let e=N(n,i);s.enqueue(D(a?e:j.decode(e),t)),r=0}if(i===0||i>e){s.enqueue(ie);break}}}})}function F(e){if(e)return fe(e)}function fe(e){for(var t in F.prototype)e[t]=F.prototype[t];return e}F.prototype.on=F.prototype.addEventListener=function(e,t){return this._callbacks=this._callbacks||{},(this._callbacks[`$`+e]=this._callbacks[`$`+e]||[]).push(t),this},F.prototype.once=function(e,t){function n(){this.off(e,n),t.apply(this,arguments)}return n.fn=t,this.on(e,n),this},F.prototype.off=F.prototype.removeListener=F.prototype.removeAllListeners=F.prototype.removeEventListener=function(e,t){if(this._callbacks=this._callbacks||{},arguments.length==0)return this._callbacks={},this;var n=this._callbacks[`$`+e];if(!n)return this;if(arguments.length==1)return delete this._callbacks[`$`+e],this;for(var r,i=0;i<n.length;i++)if(r=n[i],r===t||r.fn===t){n.splice(i,1);break}return n.length===0&&delete this._callbacks[`$`+e],this},F.prototype.emit=function(e){this._callbacks=this._callbacks||{};for(var t=Array(arguments.length-1),n=this._callbacks[`$`+e],r=1;r<arguments.length;r++)t[r-1]=arguments[r];if(n){n=n.slice(0);for(var r=0,i=n.length;r<i;++r)n[r].apply(this,t)}return this},F.prototype.emitReserved=F.prototype.emit,F.prototype.listeners=function(e){return this._callbacks=this._callbacks||{},this._callbacks[`$`+e]||[]},F.prototype.hasListeners=function(e){return!!this.listeners(e).length};var I=typeof Promise==`function`&&typeof Promise.resolve==`function`?e=>Promise.resolve().then(e):(e,t)=>t(e,0),L=typeof self<`u`?self:typeof window<`u`?window:Function(`return this`)(),R=`arraybuffer`;function z(e,...t){return t.reduce((t,n)=>(e.hasOwnProperty(n)&&(t[n]=e[n]),t),{})}var pe=L.setTimeout,B=L.clearTimeout;function V(e,t){t.useNativeTimers?(e.setTimeoutFn=pe.bind(L),e.clearTimeoutFn=B.bind(L)):(e.setTimeoutFn=L.setTimeout.bind(L),e.clearTimeoutFn=L.clearTimeout.bind(L))}var me=1.33;function he(e){return typeof e==`string`?H(e):Math.ceil((e.byteLength||e.size)*me)}function H(e){let t=0,n=0;for(let r=0,i=e.length;r<i;r++)t=e.charCodeAt(r),t<128?n+=1:t<2048?n+=2:t<55296||t>=57344?n+=3:(r++,n+=4);return n}function U(){return Date.now().toString(36).substring(3)+Math.random().toString(36).substring(2,5)}function ge(e){let t=``;for(let n in e)e.hasOwnProperty(n)&&(t.length&&(t+=`&`),t+=encodeURIComponent(n)+`=`+encodeURIComponent(e[n]));return t}function W(e){let t={},n=e.split(`&`);for(let e=0,r=n.length;e<r;e++){let r=n[e].split(`=`);t[decodeURIComponent(r[0])]=decodeURIComponent(r[1])}return t}var _e=class extends Error{constructor(e,t,n){super(e),this.description=t,this.context=n,this.type=`TransportError`}},G=class extends F{constructor(e){super(),this.writable=!1,V(this,e),this.opts=e,this.query=e.query,this.socket=e.socket,this.supportsBinary=!e.forceBase64}onError(e,t,n){return super.emitReserved(`error`,new _e(e,t,n)),this}open(){return this.readyState=`opening`,this.doOpen(),this}close(){return(this.readyState===`opening`||this.readyState===`open`)&&(this.doClose(),this.onClose()),this}send(e){this.readyState===`open`&&this.write(e)}onOpen(){this.readyState=`open`,this.writable=!0,super.emitReserved(`open`)}onData(e){let t=D(e,this.socket.binaryType);this.onPacket(t)}onPacket(e){super.emitReserved(`packet`,e)}onClose(e){this.readyState=`closed`,super.emitReserved(`close`,e)}pause(e){}createUri(e,t={}){return e+`://`+this._hostname()+this._port()+this.opts.path+this._query(t)}_hostname(){let e=this.opts.hostname;return e.indexOf(`:`)===-1?e:`[`+e+`]`}_port(){return this.opts.port&&(this.opts.secure&&Number(this.opts.port)!==443||!this.opts.secure&&Number(this.opts.port)!==80)?`:`+this.opts.port:``}_query(e){let t=ge(e);return t.length?`?`+t:``}},K=class extends G{constructor(){super(...arguments),this._polling=!1}get name(){return`polling`}doOpen(){this._poll()}pause(e){this.readyState=`pausing`;let t=()=>{this.readyState=`paused`,e()};if(this._polling||!this.writable){let e=0;this._polling&&(e++,this.once(`pollComplete`,function(){--e||t()})),this.writable||(e++,this.once(`drain`,function(){--e||t()}))}else t()}_poll(){this._polling=!0,this.doPoll(),this.emitReserved(`poll`)}onData(e){k(e,this.socket.binaryType).forEach(e=>{if(this.readyState===`opening`&&e.type===`open`&&this.onOpen(),e.type===`close`)return this.onClose({description:`transport closed by the server`}),!1;this.onPacket(e)}),this.readyState!==`closed`&&(this._polling=!1,this.emitReserved(`pollComplete`),this.readyState===`open`&&this._poll())}doClose(){let e=()=>{this.write([{type:`close`}])};this.readyState===`open`?e():this.once(`open`,e)}write(e){this.writable=!1,de(e,e=>{this.doWrite(e,()=>{this.writable=!0,this.emitReserved(`drain`)})})}uri(){let e=this.opts.secure?`https`:`http`,t=this.query||{};return!1!==this.opts.timestampRequests&&(t[this.opts.timestampParam]=U()),!this.supportsBinary&&!t.sid&&(t.b64=1),this.createUri(e,t)}},q=!1;try{q=typeof XMLHttpRequest<`u`&&`withCredentials`in new XMLHttpRequest}catch{}var ve=q;function ye(){}var be=class extends K{constructor(e){if(super(e),typeof location<`u`){let t=location.protocol===`https:`,n=location.port;n||=t?`443`:`80`,this.xd=typeof location<`u`&&e.hostname!==location.hostname||n!==e.port}}doWrite(e,t){let n=this.request({method:`POST`,data:e});n.on(`success`,t),n.on(`error`,(e,t)=>{this.onError(`xhr post error`,e,t)})}doPoll(){let e=this.request();e.on(`data`,this.onData.bind(this)),e.on(`error`,(e,t)=>{this.onError(`xhr poll error`,e,t)}),this.pollXhr=e}},J=class e extends F{constructor(e,t,n){super(),this.createRequest=e,V(this,n),this._opts=n,this._method=n.method||`GET`,this._uri=t,this._data=n.data===void 0?null:n.data,this._create()}_create(){var t;let n=z(this._opts,`agent`,`pfx`,`key`,`passphrase`,`cert`,`ca`,`ciphers`,`rejectUnauthorized`,`autoUnref`);n.xdomain=!!this._opts.xd;let r=this._xhr=this.createRequest(n);try{r.open(this._method,this._uri,!0);try{if(this._opts.extraHeaders){r.setDisableHeaderCheck&&r.setDisableHeaderCheck(!0);for(let e in this._opts.extraHeaders)this._opts.extraHeaders.hasOwnProperty(e)&&r.setRequestHeader(e,this._opts.extraHeaders[e])}}catch{}if(this._method===`POST`)try{r.setRequestHeader(`Content-type`,`text/plain;charset=UTF-8`)}catch{}try{r.setRequestHeader(`Accept`,`*/*`)}catch{}(t=this._opts.cookieJar)==null||t.addCookies(r),`withCredentials`in r&&(r.withCredentials=this._opts.withCredentials),this._opts.requestTimeout&&(r.timeout=this._opts.requestTimeout),r.onreadystatechange=()=>{var e;r.readyState===3&&((e=this._opts.cookieJar)==null||e.parseCookies(r.getResponseHeader(`set-cookie`))),r.readyState===4&&(r.status===200||r.status===1223?this._onLoad():this.setTimeoutFn(()=>{this._onError(typeof r.status==`number`?r.status:0)},0))},r.send(this._data)}catch(e){this.setTimeoutFn(()=>{this._onError(e)},0);return}typeof document<`u`&&(this._index=e.requestsCount++,e.requests[this._index]=this)}_onError(e){this.emitReserved(`error`,e,this._xhr),this._cleanup(!0)}_cleanup(t){if(!(this._xhr===void 0||this._xhr===null)){if(this._xhr.onreadystatechange=ye,t)try{this._xhr.abort()}catch{}typeof document<`u`&&delete e.requests[this._index],this._xhr=null}}_onLoad(){let e=this._xhr.responseText;e!==null&&(this.emitReserved(`data`,e),this.emitReserved(`success`),this._cleanup())}abort(){this._cleanup()}};if(J.requestsCount=0,J.requests={},typeof document<`u`){if(typeof attachEvent==`function`)attachEvent(`onunload`,xe);else if(typeof addEventListener==`function`){let e=`onpagehide`in L?`pagehide`:`unload`;addEventListener(e,xe,!1)}}function xe(){for(let e in J.requests)J.requests.hasOwnProperty(e)&&J.requests[e].abort()}var Se=(function(){let e=we({xdomain:!1});return e&&e.responseType!==null})(),Ce=class extends be{constructor(e){super(e);let t=e&&e.forceBase64;this.supportsBinary=Se&&!t}request(e={}){return Object.assign(e,{xd:this.xd},this.opts),new J(we,this.uri(),e)}};function we(e){let t=e.xdomain;try{if(typeof XMLHttpRequest<`u`&&(!t||ve))return new XMLHttpRequest}catch{}if(!t)try{return new L[[`Active`,`Object`].join(`X`)](`Microsoft.XMLHTTP`)}catch{}}var Te=typeof navigator<`u`&&typeof navigator.product==`string`&&navigator.product.toLowerCase()===`reactnative`,Ee=class extends G{get name(){return`websocket`}doOpen(){let e=this.uri(),t=this.opts.protocols,n=Te?{}:z(this.opts,`agent`,`perMessageDeflate`,`pfx`,`key`,`passphrase`,`cert`,`ca`,`ciphers`,`rejectUnauthorized`,`localAddress`,`protocolVersion`,`origin`,`maxPayload`,`family`,`checkServerIdentity`);this.opts.extraHeaders&&(n.headers=this.opts.extraHeaders);try{this.ws=this.createSocket(e,t,n)}catch(e){return this.emitReserved(`error`,e)}this.ws.binaryType=this.socket.binaryType,this.addEventListeners()}addEventListeners(){this.ws.onopen=()=>{this.opts.autoUnref&&this.ws._socket.unref(),this.onOpen()},this.ws.onclose=e=>this.onClose({description:`websocket connection closed`,context:e}),this.ws.onmessage=e=>this.onData(e.data),this.ws.onerror=e=>this.onError(`websocket error`,e)}write(e){this.writable=!1;for(let t=0;t<e.length;t++){let n=e[t],r=t===e.length-1;x(n,this.supportsBinary,e=>{try{this.doWrite(n,e)}catch{}r&&I(()=>{this.writable=!0,this.emitReserved(`drain`)},this.setTimeoutFn)})}}doClose(){this.ws!==void 0&&(this.ws.onerror=()=>{},this.ws.close(),this.ws=null)}uri(){let e=this.opts.secure?`wss`:`ws`,t=this.query||{};return this.opts.timestampRequests&&(t[this.opts.timestampParam]=U()),this.supportsBinary||(t.b64=1),this.createUri(e,t)}},De=L.WebSocket||L.MozWebSocket,Oe={websocket:class extends Ee{createSocket(e,t,n){return Te?new De(e,t,n):t?new De(e,t):new De(e)}doWrite(e,t){this.ws.send(t)}},webtransport:class extends G{get name(){return`webtransport`}doOpen(){try{this._transport=new WebTransport(this.createUri(`https`),this.opts.transportOptions[this.name])}catch(e){return this.emitReserved(`error`,e)}this._transport.closed.then(()=>{this.onClose()}).catch(e=>{this.onError(`webtransport error`,e)}),this._transport.ready.then(()=>{this._transport.createBidirectionalStream().then(e=>{let t=P(2**53-1,this.socket.binaryType),n=e.readable.pipeThrough(t).getReader(),r=A();r.readable.pipeTo(e.writable),this._writer=r.writable.getWriter();let i=()=>{n.read().then(({done:e,value:t})=>{e||(this.onPacket(t),i())}).catch(e=>{})};i();let a={type:`open`};this.query.sid&&(a.data=`{"sid":"${this.query.sid}"}`),this._writer.write(a).then(()=>this.onOpen())})})}write(e){this.writable=!1;for(let t=0;t<e.length;t++){let n=e[t],r=t===e.length-1;this._writer.write(n).then(()=>{r&&I(()=>{this.writable=!0,this.emitReserved(`drain`)},this.setTimeoutFn)})}}doClose(){var e;(e=this._transport)==null||e.close()}},polling:Ce},ke=/^(?:(?![^:@\/?#]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@\/?#]*)(?::([^:@\/?#]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/,Ae=[`source`,`protocol`,`authority`,`userInfo`,`user`,`password`,`host`,`port`,`relative`,`path`,`directory`,`file`,`query`,`anchor`];function je(e){if(e.length>8e3)throw`URI too long`;let t=e,n=e.indexOf(`[`),r=e.indexOf(`]`);n!=-1&&r!=-1&&(e=e.substring(0,n)+e.substring(n,r).replace(/:/g,`;`)+e.substring(r,e.length));let i=ke.exec(e||``),a={},o=14;for(;o--;)a[Ae[o]]=i[o]||``;return n!=-1&&r!=-1&&(a.source=t,a.host=a.host.substring(1,a.host.length-1).replace(/;/g,`:`),a.authority=a.authority.replace(`[`,``).replace(`]`,``).replace(/;/g,`:`),a.ipv6uri=!0),a.pathNames=Me(a,a.path),a.queryKey=Ne(a,a.query),a}function Me(e,t){let n=t.replace(/\/{2,9}/g,`/`).split(`/`);return(t.slice(0,1)==`/`||t.length===0)&&n.splice(0,1),t.slice(-1)==`/`&&n.splice(n.length-1,1),n}function Ne(e,t){let n={};return t.replace(/(?:^|&)([^&=]*)=?([^&]*)/g,function(e,t,r){t&&(n[t]=r)}),n}var Pe=typeof addEventListener==`function`&&typeof removeEventListener==`function`,Fe=[];Pe&&addEventListener(`offline`,()=>{Fe.forEach(e=>e())},!1);var Ie=class e extends F{constructor(e,t){if(super(),this.binaryType=R,this.writeBuffer=[],this._prevBufferLen=0,this._pingInterval=-1,this._pingTimeout=-1,this._maxPayload=-1,this._pingTimeoutTime=1/0,e&&typeof e==`object`&&(t=e,e=null),e){let n=je(e);t.hostname=n.host,t.secure=n.protocol===`https`||n.protocol===`wss`,t.port=n.port,n.query&&(t.query=n.query)}else t.host&&(t.hostname=je(t.host).host);V(this,t),this.secure=t.secure==null?typeof location<`u`&&location.protocol===`https:`:t.secure,t.hostname&&!t.port&&(t.port=this.secure?`443`:`80`),this.hostname=t.hostname||(typeof location<`u`?location.hostname:`localhost`),this.port=t.port||(typeof location<`u`&&location.port?location.port:this.secure?`443`:`80`),this.transports=[],this._transportsByName={},t.transports.forEach(e=>{let t=e.prototype.name;this.transports.push(t),this._transportsByName[t]=e}),this.opts=Object.assign({path:`/engine.io`,agent:!1,withCredentials:!1,upgrade:!0,timestampParam:`t`,rememberUpgrade:!1,addTrailingSlash:!0,rejectUnauthorized:!0,perMessageDeflate:{threshold:1024},transportOptions:{},closeOnBeforeunload:!1},t),this.opts.path=this.opts.path.replace(/\/$/,``)+(this.opts.addTrailingSlash?`/`:``),typeof this.opts.query==`string`&&(this.opts.query=W(this.opts.query)),Pe&&(this.opts.closeOnBeforeunload&&(this._beforeunloadEventListener=()=>{this.transport&&(this.transport.removeAllListeners(),this.transport.close())},addEventListener(`beforeunload`,this._beforeunloadEventListener,!1)),this.hostname!==`localhost`&&(this._offlineEventListener=()=>{this._onClose(`transport close`,{description:`network connection lost`})},Fe.push(this._offlineEventListener))),this.opts.withCredentials&&(this._cookieJar=void 0),this._open()}createTransport(e){let t=Object.assign({},this.opts.query);t.EIO=4,t.transport=e,this.id&&(t.sid=this.id);let n=Object.assign({},this.opts,{query:t,socket:this,hostname:this.hostname,secure:this.secure,port:this.port},this.opts.transportOptions[e]);return new this._transportsByName[e](n)}_open(){if(this.transports.length===0){this.setTimeoutFn(()=>{this.emitReserved(`error`,`No transports available`)},0);return}let t=this.opts.rememberUpgrade&&e.priorWebsocketSuccess&&this.transports.indexOf(`websocket`)!==-1?`websocket`:this.transports[0];this.readyState=`opening`;let n=this.createTransport(t);n.open(),this.setTransport(n)}setTransport(e){this.transport&&this.transport.removeAllListeners(),this.transport=e,e.on(`drain`,this._onDrain.bind(this)).on(`packet`,this._onPacket.bind(this)).on(`error`,this._onError.bind(this)).on(`close`,e=>this._onClose(`transport close`,e))}onOpen(){this.readyState=`open`,e.priorWebsocketSuccess=this.transport.name===`websocket`,this.emitReserved(`open`),this.flush()}_onPacket(e){if(this.readyState===`opening`||this.readyState===`open`||this.readyState===`closing`)switch(this.emitReserved(`packet`,e),this.emitReserved(`heartbeat`),e.type){case`open`:this.onHandshake(JSON.parse(e.data));break;case`ping`:this._sendPacket(`pong`),this.emitReserved(`ping`),this.emitReserved(`pong`),this._resetPingTimeout();break;case`error`:let t=Error(`server error`);t.code=e.data,this._onError(t);break;case`message`:this.emitReserved(`data`,e.data),this.emitReserved(`message`,e.data);break}}onHandshake(e){this.emitReserved(`handshake`,e),this.id=e.sid,this.transport.query.sid=e.sid,this._pingInterval=e.pingInterval,this._pingTimeout=e.pingTimeout,this._maxPayload=e.maxPayload,this.onOpen(),this.readyState!==`closed`&&this._resetPingTimeout()}_resetPingTimeout(){this.clearTimeoutFn(this._pingTimeoutTimer);let e=this._pingInterval+this._pingTimeout;this._pingTimeoutTime=Date.now()+e,this._pingTimeoutTimer=this.setTimeoutFn(()=>{this._onClose(`ping timeout`)},e),this.opts.autoUnref&&this._pingTimeoutTimer.unref()}_onDrain(){this.writeBuffer.splice(0,this._prevBufferLen),this._prevBufferLen=0,this.writeBuffer.length===0?this.emitReserved(`drain`):this.flush()}flush(){if(this.readyState!==`closed`&&this.transport.writable&&!this.upgrading&&this.writeBuffer.length){let e=this._getWritablePackets();this.transport.send(e),this._prevBufferLen=e.length,this.emitReserved(`flush`)}}_getWritablePackets(){if(!(this._maxPayload&&this.transport.name===`polling`&&this.writeBuffer.length>1))return this.writeBuffer;let e=1;for(let t=0;t<this.writeBuffer.length;t++){let n=this.writeBuffer[t].data;if(n&&(e+=he(n)),t>0&&e>this._maxPayload)return this.writeBuffer.slice(0,t);e+=2}return this.writeBuffer}_hasPingExpired(){if(!this._pingTimeoutTime)return!0;let e=Date.now()>this._pingTimeoutTime;return e&&(this._pingTimeoutTime=0,I(()=>{this._onClose(`ping timeout`)},this.setTimeoutFn)),e}write(e,t,n){return this._sendPacket(`message`,e,t,n),this}send(e,t,n){return this._sendPacket(`message`,e,t,n),this}_sendPacket(e,t,n,r){if(typeof t==`function`&&(r=t,t=void 0),typeof n==`function`&&(r=n,n=null),this.readyState===`closing`||this.readyState===`closed`)return;n||={},n.compress=!1!==n.compress;let i={type:e,data:t,options:n};this.emitReserved(`packetCreate`,i),this.writeBuffer.push(i),r&&this.once(`flush`,r),this.flush()}close(){let e=()=>{this._onClose(`forced close`),this.transport.close()},t=()=>{this.off(`upgrade`,t),this.off(`upgradeError`,t),e()},n=()=>{this.once(`upgrade`,t),this.once(`upgradeError`,t)};return(this.readyState===`opening`||this.readyState===`open`)&&(this.readyState=`closing`,this.writeBuffer.length?this.once(`drain`,()=>{this.upgrading?n():e()}):this.upgrading?n():e()),this}_onError(t){if(e.priorWebsocketSuccess=!1,this.opts.tryAllTransports&&this.transports.length>1&&this.readyState===`opening`)return this.transports.shift(),this._open();this.emitReserved(`error`,t),this._onClose(`transport error`,t)}_onClose(e,t){if(this.readyState===`opening`||this.readyState===`open`||this.readyState===`closing`){if(this.clearTimeoutFn(this._pingTimeoutTimer),this.transport.removeAllListeners(`close`),this.transport.close(),this.transport.removeAllListeners(),Pe&&(this._beforeunloadEventListener&&removeEventListener(`beforeunload`,this._beforeunloadEventListener,!1),this._offlineEventListener)){let e=Fe.indexOf(this._offlineEventListener);e!==-1&&Fe.splice(e,1)}this.readyState=`closed`,this.id=null,this.emitReserved(`close`,e,t),this.writeBuffer=[],this._prevBufferLen=0}}};Ie.protocol=4;var Le=class extends Ie{constructor(){super(...arguments),this._upgrades=[]}onOpen(){if(super.onOpen(),this.readyState===`open`&&this.opts.upgrade)for(let e=0;e<this._upgrades.length;e++)this._probe(this._upgrades[e])}_probe(e){let t=this.createTransport(e),n=!1;Ie.priorWebsocketSuccess=!1;let r=()=>{n||(t.send([{type:`ping`,data:`probe`}]),t.once(`packet`,e=>{if(!n)if(e.type===`pong`&&e.data===`probe`){if(this.upgrading=!0,this.emitReserved(`upgrading`,t),!t)return;Ie.priorWebsocketSuccess=t.name===`websocket`,this.transport.pause(()=>{n||this.readyState!==`closed`&&(l(),this.setTransport(t),t.send([{type:`upgrade`}]),this.emitReserved(`upgrade`,t),t=null,this.upgrading=!1,this.flush())})}else{let e=Error(`probe error`);e.transport=t.name,this.emitReserved(`upgradeError`,e)}}))};function i(){n||(n=!0,l(),t.close(),t=null)}let a=e=>{let n=Error(`probe error: `+e);n.transport=t.name,i(),this.emitReserved(`upgradeError`,n)};function o(){a(`transport closed`)}function s(){a(`socket closed`)}function c(e){t&&e.name!==t.name&&i()}let l=()=>{t.removeListener(`open`,r),t.removeListener(`error`,a),t.removeListener(`close`,o),this.off(`close`,s),this.off(`upgrading`,c)};t.once(`open`,r),t.once(`error`,a),t.once(`close`,o),this.once(`close`,s),this.once(`upgrading`,c),this._upgrades.indexOf(`webtransport`)!==-1&&e!==`webtransport`?this.setTimeoutFn(()=>{n||t.open()},200):t.open()}onHandshake(e){this._upgrades=this._filterUpgrades(e.upgrades),super.onHandshake(e)}_filterUpgrades(e){let t=[];for(let n=0;n<e.length;n++)~this.transports.indexOf(e[n])&&t.push(e[n]);return t}},Re=class extends Le{constructor(e,t={}){let n=typeof e==`object`?e:t;(!n.transports||n.transports&&typeof n.transports[0]==`string`)&&(n.transports=(n.transports||[`polling`,`websocket`,`webtransport`]).map(e=>Oe[e]).filter(e=>!!e)),super(e,n)}};Re.protocol;function ze(e,t=``,n){let r=e;n||=typeof location<`u`&&location,e??=n.protocol+`//`+n.host,typeof e==`string`&&(e.charAt(0)===`/`&&(e=e.charAt(1)===`/`?n.protocol+e:n.host+e),/^(https?|wss?):\/\//.test(e)||(e=n===void 0?`https://`+e:n.protocol+`//`+e),r=je(e)),r.port||(/^(http|ws)$/.test(r.protocol)?r.port=`80`:/^(http|ws)s$/.test(r.protocol)&&(r.port=`443`)),r.path=r.path||`/`;let i=r.host.indexOf(`:`)===-1?r.host:`[`+r.host+`]`;return r.id=r.protocol+`://`+i+`:`+r.port+t,r.href=r.protocol+`://`+i+(n&&n.port===r.port?``:`:`+r.port),r}var Be=typeof ArrayBuffer==`function`,Ve=e=>typeof ArrayBuffer.isView==`function`?ArrayBuffer.isView(e):e.buffer instanceof ArrayBuffer,He=Object.prototype.toString,Ue=typeof Blob==`function`||typeof Blob<`u`&&He.call(Blob)===`[object BlobConstructor]`,We=typeof File==`function`||typeof File<`u`&&He.call(File)===`[object FileConstructor]`;function Ge(e){return Be&&(e instanceof ArrayBuffer||Ve(e))||Ue&&e instanceof Blob||We&&e instanceof File}function Ke(e,t){if(!e||typeof e!=`object`)return!1;if(Array.isArray(e)){for(let t=0,n=e.length;t<n;t++)if(Ke(e[t]))return!0;return!1}if(Ge(e))return!0;if(e.toJSON&&typeof e.toJSON==`function`&&arguments.length===1)return Ke(e.toJSON(),!0);for(let t in e)if(Object.prototype.hasOwnProperty.call(e,t)&&Ke(e[t]))return!0;return!1}function qe(e){let t=[],n=e.data,r=e;return r.data=Je(n,t),r.attachments=t.length,{packet:r,buffers:t}}function Je(e,t){if(!e)return e;if(Ge(e)){let n={_placeholder:!0,num:t.length};return t.push(e),n}else if(Array.isArray(e)){let n=Array(e.length);for(let r=0;r<e.length;r++)n[r]=Je(e[r],t);return n}else if(typeof e==`object`&&!(e instanceof Date)){let n={};for(let r in e)Object.prototype.hasOwnProperty.call(e,r)&&(n[r]=Je(e[r],t));return n}return e}function Ye(e,t){return e.data=Xe(e.data,t),delete e.attachments,e}function Xe(e,t){if(!e)return e;if(e&&e._placeholder===!0){if(typeof e.num==`number`&&e.num>=0&&e.num<t.length)return t[e.num];throw Error(`illegal attachments`)}else if(Array.isArray(e))for(let n=0;n<e.length;n++)e[n]=Xe(e[n],t);else if(typeof e==`object`)for(let n in e)Object.prototype.hasOwnProperty.call(e,n)&&(e[n]=Xe(e[n],t));return e}var Ze=n({Decoder:()=>et,Encoder:()=>$e,PacketType:()=>Y,isPacketValid:()=>st,protocol:()=>5}),Qe=[`connect`,`connect_error`,`disconnect`,`disconnecting`,`newListener`,`removeListener`],Y;(function(e){e[e.CONNECT=0]=`CONNECT`,e[e.DISCONNECT=1]=`DISCONNECT`,e[e.EVENT=2]=`EVENT`,e[e.ACK=3]=`ACK`,e[e.CONNECT_ERROR=4]=`CONNECT_ERROR`,e[e.BINARY_EVENT=5]=`BINARY_EVENT`,e[e.BINARY_ACK=6]=`BINARY_ACK`})(Y||={});var $e=class{constructor(e){this.replacer=e}encode(e){return(e.type===Y.EVENT||e.type===Y.ACK)&&Ke(e)?this.encodeAsBinary({type:e.type===Y.EVENT?Y.BINARY_EVENT:Y.BINARY_ACK,nsp:e.nsp,data:e.data,id:e.id}):[this.encodeAsString(e)]}encodeAsString(e){let t=``+e.type;return(e.type===Y.BINARY_EVENT||e.type===Y.BINARY_ACK)&&(t+=e.attachments+`-`),e.nsp&&e.nsp!==`/`&&(t+=e.nsp+`,`),e.id!=null&&(t+=e.id),e.data!=null&&(t+=JSON.stringify(e.data,this.replacer)),t}encodeAsBinary(e){let t=qe(e),n=this.encodeAsString(t.packet),r=t.buffers;return r.unshift(n),r}},et=class e extends F{constructor(e){super(),this.opts=Object.assign({reviver:void 0,maxAttachments:10},typeof e==`function`?{reviver:e}:e)}add(e){let t;if(typeof e==`string`){if(this.reconstructor)throw Error(`got plaintext data when reconstructing a packet`);t=this.decodeString(e);let n=t.type===Y.BINARY_EVENT;n||t.type===Y.BINARY_ACK?(t.type=n?Y.EVENT:Y.ACK,this.reconstructor=new tt(t),t.attachments===0&&super.emitReserved(`decoded`,t)):super.emitReserved(`decoded`,t)}else if(Ge(e)||e.base64)if(this.reconstructor)t=this.reconstructor.takeBinaryData(e),t&&(this.reconstructor=null,super.emitReserved(`decoded`,t));else throw Error(`got binary data when not reconstructing a packet`);else throw Error(`Unknown type: `+e)}decodeString(t){let n=0,r={type:Number(t.charAt(0))};if(Y[r.type]===void 0)throw Error(`unknown packet type `+r.type);if(r.type===Y.BINARY_EVENT||r.type===Y.BINARY_ACK){let e=n+1;for(;t.charAt(++n)!==`-`&&n!=t.length;);let i=t.substring(e,n);if(i!=Number(i)||t.charAt(n)!==`-`)throw Error(`Illegal attachments`);let a=Number(i);if(!rt(a)||a<0)throw Error(`Illegal attachments`);if(a>this.opts.maxAttachments)throw Error(`too many attachments`);r.attachments=a}if(t.charAt(n+1)===`/`){let e=n+1;for(;++n&&!(t.charAt(n)===`,`||n===t.length););r.nsp=t.substring(e,n)}else r.nsp=`/`;let i=t.charAt(n+1);if(i!==``&&Number(i)==i){let e=n+1;for(;++n;){let e=t.charAt(n);if(e==null||Number(e)!=e){--n;break}if(n===t.length)break}r.id=Number(t.substring(e,n+1))}if(t.charAt(++n)){let i=this.tryParse(t.substr(n));if(e.isPayloadValid(r.type,i))r.data=i;else throw Error(`invalid payload`)}return r}tryParse(e){try{return JSON.parse(e,this.opts.reviver)}catch{return!1}}static isPayloadValid(e,t){switch(e){case Y.CONNECT:return at(t);case Y.DISCONNECT:return t===void 0;case Y.CONNECT_ERROR:return typeof t==`string`||at(t);case Y.EVENT:case Y.BINARY_EVENT:return Array.isArray(t)&&(typeof t[0]==`number`||typeof t[0]==`string`&&Qe.indexOf(t[0])===-1);case Y.ACK:case Y.BINARY_ACK:return Array.isArray(t)}}destroy(){this.reconstructor&&=(this.reconstructor.finishedReconstruction(),null)}},tt=class{constructor(e){this.packet=e,this.buffers=[],this.reconPack=e}takeBinaryData(e){if(this.buffers.push(e),this.buffers.length===this.reconPack.attachments){let e=Ye(this.reconPack,this.buffers);return this.finishedReconstruction(),e}return null}finishedReconstruction(){this.reconPack=null,this.buffers=[]}};function nt(e){return typeof e==`string`}var rt=Number.isInteger||function(e){return typeof e==`number`&&isFinite(e)&&Math.floor(e)===e};function it(e){return e===void 0||rt(e)}function at(e){return Object.prototype.toString.call(e)===`[object Object]`}function ot(e,t){switch(e){case Y.CONNECT:return t===void 0||at(t);case Y.DISCONNECT:return t===void 0;case Y.EVENT:return Array.isArray(t)&&(typeof t[0]==`number`||typeof t[0]==`string`&&Qe.indexOf(t[0])===-1);case Y.ACK:return Array.isArray(t);case Y.CONNECT_ERROR:return typeof t==`string`||at(t);default:return!1}}function st(e){return nt(e.nsp)&&it(e.id)&&ot(e.type,e.data)}function X(e,t,n){return e.on(t,n),function(){e.off(t,n)}}var ct=Object.freeze({connect:1,connect_error:1,disconnect:1,disconnecting:1,newListener:1,removeListener:1}),lt=class extends F{constructor(e,t,n){super(),this.connected=!1,this.recovered=!1,this.receiveBuffer=[],this.sendBuffer=[],this._queue=[],this._queueSeq=0,this.ids=0,this.acks={},this.flags={},this.io=e,this.nsp=t,n&&n.auth&&(this.auth=n.auth),this._opts=Object.assign({},n),this.io._autoConnect&&this.open()}get disconnected(){return!this.connected}subEvents(){if(this.subs)return;let e=this.io;this.subs=[X(e,`open`,this.onopen.bind(this)),X(e,`packet`,this.onpacket.bind(this)),X(e,`error`,this.onerror.bind(this)),X(e,`close`,this.onclose.bind(this))]}get active(){return!!this.subs}connect(){return this.connected?this:(this.subEvents(),this.io._reconnecting||this.io.open(),this.io._readyState===`open`&&this.onopen(),this)}open(){return this.connect()}send(...e){return e.unshift(`message`),this.emit.apply(this,e),this}emit(e,...t){if(ct.hasOwnProperty(e))throw Error(`"`+e.toString()+`" is a reserved event name`);if(t.unshift(e),this._opts.retries&&!this.flags.fromQueue&&!this.flags.volatile)return this._addToQueue(t),this;let n={type:Y.EVENT,data:t};if(n.options={},n.options.compress=this.flags.compress!==!1,typeof t[t.length-1]==`function`){let e=this.ids++,r=t.pop();this._registerAckCallback(e,r),n.id=e}let r=this.io.engine?.transport?.writable,i=this.connected&&!this.io.engine?._hasPingExpired();return this.flags.volatile&&!r||(i?(this.notifyOutgoingListeners(n),this.packet(n)):this.sendBuffer.push(n)),this.flags={},this}_registerAckCallback(e,t){let n=this.flags.timeout??this._opts.ackTimeout;if(n===void 0){this.acks[e]=t;return}let r=this.io.setTimeoutFn(()=>{delete this.acks[e];for(let t=0;t<this.sendBuffer.length;t++)this.sendBuffer[t].id===e&&this.sendBuffer.splice(t,1);t.call(this,Error(`operation has timed out`))},n),i=(...e)=>{this.io.clearTimeoutFn(r),t.apply(this,e)};i.withError=!0,this.acks[e]=i}emitWithAck(e,...t){return new Promise((n,r)=>{let i=(e,t)=>e?r(e):n(t);i.withError=!0,t.push(i),this.emit(e,...t)})}_addToQueue(e){let t;typeof e[e.length-1]==`function`&&(t=e.pop());let n={id:this._queueSeq++,tryCount:0,pending:!1,args:e,flags:Object.assign({fromQueue:!0},this.flags)};e.push((e,...r)=>(this._queue[0],e===null?(this._queue.shift(),t&&t(null,...r)):n.tryCount>this._opts.retries&&(this._queue.shift(),t&&t(e)),n.pending=!1,this._drainQueue())),this._queue.push(n),this._drainQueue()}_drainQueue(e=!1){if(!this.connected||this._queue.length===0)return;let t=this._queue[0];t.pending&&!e||(t.pending=!0,t.tryCount++,this.flags=t.flags,this.emit.apply(this,t.args))}packet(e){e.nsp=this.nsp,this.io._packet(e)}onopen(){typeof this.auth==`function`?this.auth(e=>{this._sendConnectPacket(e)}):this._sendConnectPacket(this.auth)}_sendConnectPacket(e){this.packet({type:Y.CONNECT,data:this._pid?Object.assign({pid:this._pid,offset:this._lastOffset},e):e})}onerror(e){this.connected||this.emitReserved(`connect_error`,e)}onclose(e,t){this.connected=!1,delete this.id,this.emitReserved(`disconnect`,e,t),this._clearAcks()}_clearAcks(){Object.keys(this.acks).forEach(e=>{if(!this.sendBuffer.some(t=>String(t.id)===e)){let t=this.acks[e];delete this.acks[e],t.withError&&t.call(this,Error(`socket has been disconnected`))}})}onpacket(e){if(e.nsp===this.nsp)switch(e.type){case Y.CONNECT:e.data&&e.data.sid?this.onconnect(e.data.sid,e.data.pid):this.emitReserved(`connect_error`,Error(`It seems you are trying to reach a Socket.IO server in v2.x with a v3.x client, but they are not compatible (more information here: https://socket.io/docs/v3/migrating-from-2-x-to-3-0/)`));break;case Y.EVENT:case Y.BINARY_EVENT:this.onevent(e);break;case Y.ACK:case Y.BINARY_ACK:this.onack(e);break;case Y.DISCONNECT:this.ondisconnect();break;case Y.CONNECT_ERROR:this.destroy();let t=Error(e.data.message);t.data=e.data.data,this.emitReserved(`connect_error`,t);break}}onevent(e){let t=e.data||[];e.id!=null&&t.push(this.ack(e.id)),this.connected?this.emitEvent(t):this.receiveBuffer.push(Object.freeze(t))}emitEvent(e){if(this._anyListeners&&this._anyListeners.length){let t=this._anyListeners.slice();for(let n of t)n.apply(this,e)}super.emit.apply(this,e),this._pid&&e.length&&typeof e[e.length-1]==`string`&&(this._lastOffset=e[e.length-1])}ack(e){let t=this,n=!1;return function(...r){n||(n=!0,t.packet({type:Y.ACK,id:e,data:r}))}}onack(e){let t=this.acks[e.id];typeof t==`function`&&(delete this.acks[e.id],t.withError&&e.data.unshift(null),t.apply(this,e.data))}onconnect(e,t){this.id=e,this.recovered=t&&this._pid===t,this._pid=t,this.connected=!0,this.emitBuffered(),this._drainQueue(!0),this.emitReserved(`connect`)}emitBuffered(){this.receiveBuffer.forEach(e=>this.emitEvent(e)),this.receiveBuffer=[],this.sendBuffer.forEach(e=>{this.notifyOutgoingListeners(e),this.packet(e)}),this.sendBuffer=[]}ondisconnect(){this.destroy(),this.onclose(`io server disconnect`)}destroy(){this.subs&&=(this.subs.forEach(e=>e()),void 0),this.io._destroy(this)}disconnect(){return this.connected&&this.packet({type:Y.DISCONNECT}),this.destroy(),this.connected&&this.onclose(`io client disconnect`),this}close(){return this.disconnect()}compress(e){return this.flags.compress=e,this}get volatile(){return this.flags.volatile=!0,this}timeout(e){return this.flags.timeout=e,this}onAny(e){return this._anyListeners=this._anyListeners||[],this._anyListeners.push(e),this}prependAny(e){return this._anyListeners=this._anyListeners||[],this._anyListeners.unshift(e),this}offAny(e){if(!this._anyListeners)return this;if(e){let t=this._anyListeners;for(let n=0;n<t.length;n++)if(e===t[n])return t.splice(n,1),this}else this._anyListeners=[];return this}listenersAny(){return this._anyListeners||[]}onAnyOutgoing(e){return this._anyOutgoingListeners=this._anyOutgoingListeners||[],this._anyOutgoingListeners.push(e),this}prependAnyOutgoing(e){return this._anyOutgoingListeners=this._anyOutgoingListeners||[],this._anyOutgoingListeners.unshift(e),this}offAnyOutgoing(e){if(!this._anyOutgoingListeners)return this;if(e){let t=this._anyOutgoingListeners;for(let n=0;n<t.length;n++)if(e===t[n])return t.splice(n,1),this}else this._anyOutgoingListeners=[];return this}listenersAnyOutgoing(){return this._anyOutgoingListeners||[]}notifyOutgoingListeners(e){if(this._anyOutgoingListeners&&this._anyOutgoingListeners.length){let t=this._anyOutgoingListeners.slice();for(let n of t)n.apply(this,e.data)}}};function Z(e){e||={},this.ms=e.min||100,this.max=e.max||1e4,this.factor=e.factor||2,this.jitter=e.jitter>0&&e.jitter<=1?e.jitter:0,this.attempts=0}Z.prototype.duration=function(){var e=this.ms*this.factor**+ this.attempts++;if(this.jitter){var t=Math.random(),n=Math.floor(t*this.jitter*e);e=Math.floor(t*10)&1?e+n:e-n}return Math.min(e,this.max)|0},Z.prototype.reset=function(){this.attempts=0},Z.prototype.setMin=function(e){this.ms=e},Z.prototype.setMax=function(e){this.max=e},Z.prototype.setJitter=function(e){this.jitter=e};var ut=class extends F{constructor(e,t){super(),this.nsps={},this.subs=[],e&&typeof e==`object`&&(t=e,e=void 0),t||={},t.path=t.path||`/socket.io`,this.opts=t,V(this,t),this.reconnection(t.reconnection!==!1),this.reconnectionAttempts(t.reconnectionAttempts||1/0),this.reconnectionDelay(t.reconnectionDelay||1e3),this.reconnectionDelayMax(t.reconnectionDelayMax||5e3),this.randomizationFactor(t.randomizationFactor??.5),this.backoff=new Z({min:this.reconnectionDelay(),max:this.reconnectionDelayMax(),jitter:this.randomizationFactor()}),this.timeout(t.timeout==null?2e4:t.timeout),this._readyState=`closed`,this.uri=e;let n=t.parser||Ze;this.encoder=new n.Encoder,this.decoder=new n.Decoder,this._autoConnect=t.autoConnect!==!1,this._autoConnect&&this.open()}reconnection(e){return arguments.length?(this._reconnection=!!e,e||(this.skipReconnect=!0),this):this._reconnection}reconnectionAttempts(e){return e===void 0?this._reconnectionAttempts:(this._reconnectionAttempts=e,this)}reconnectionDelay(e){var t;return e===void 0?this._reconnectionDelay:(this._reconnectionDelay=e,(t=this.backoff)==null||t.setMin(e),this)}randomizationFactor(e){var t;return e===void 0?this._randomizationFactor:(this._randomizationFactor=e,(t=this.backoff)==null||t.setJitter(e),this)}reconnectionDelayMax(e){var t;return e===void 0?this._reconnectionDelayMax:(this._reconnectionDelayMax=e,(t=this.backoff)==null||t.setMax(e),this)}timeout(e){return arguments.length?(this._timeout=e,this):this._timeout}maybeReconnectOnOpen(){!this._reconnecting&&this._reconnection&&this.backoff.attempts===0&&this.reconnect()}open(e){if(~this._readyState.indexOf(`open`))return this;this.engine=new Re(this.uri,this.opts);let t=this.engine,n=this;this._readyState=`opening`,this.skipReconnect=!1;let r=X(t,`open`,function(){n.onopen(),e&&e()}),i=t=>{this.cleanup(),this._readyState=`closed`,this.emitReserved(`error`,t),e?e(t):this.maybeReconnectOnOpen()},a=X(t,`error`,i);if(!1!==this._timeout){let e=this._timeout,n=this.setTimeoutFn(()=>{r(),i(Error(`timeout`)),t.close()},e);this.opts.autoUnref&&n.unref(),this.subs.push(()=>{this.clearTimeoutFn(n)})}return this.subs.push(r),this.subs.push(a),this}connect(e){return this.open(e)}onopen(){this.cleanup(),this._readyState=`open`,this.emitReserved(`open`);let e=this.engine;this.subs.push(X(e,`ping`,this.onping.bind(this)),X(e,`data`,this.ondata.bind(this)),X(e,`error`,this.onerror.bind(this)),X(e,`close`,this.onclose.bind(this)),X(this.decoder,`decoded`,this.ondecoded.bind(this)))}onping(){this.emitReserved(`ping`)}ondata(e){try{this.decoder.add(e)}catch(e){this.onclose(`parse error`,e)}}ondecoded(e){I(()=>{this.emitReserved(`packet`,e)},this.setTimeoutFn)}onerror(e){this.emitReserved(`error`,e)}socket(e,t){let n=this.nsps[e];return n?this._autoConnect&&!n.active&&n.connect():(n=new lt(this,e,t),this.nsps[e]=n),n}_destroy(e){let t=Object.keys(this.nsps);for(let e of t)if(this.nsps[e].active)return;this._close()}_packet(e){let t=this.encoder.encode(e);for(let n=0;n<t.length;n++)this.engine.write(t[n],e.options)}cleanup(){this.subs.forEach(e=>e()),this.subs.length=0,this.decoder.destroy()}_close(){this.skipReconnect=!0,this._reconnecting=!1,this.onclose(`forced close`)}disconnect(){return this._close()}onclose(e,t){var n;this.cleanup(),(n=this.engine)==null||n.close(),this.backoff.reset(),this._readyState=`closed`,this.emitReserved(`close`,e,t),this._reconnection&&!this.skipReconnect&&this.reconnect()}reconnect(){if(this._reconnecting||this.skipReconnect)return this;let e=this;if(this.backoff.attempts>=this._reconnectionAttempts)this.backoff.reset(),this.emitReserved(`reconnect_failed`),this._reconnecting=!1;else{let t=this.backoff.duration();this._reconnecting=!0;let n=this.setTimeoutFn(()=>{e.skipReconnect||(this.emitReserved(`reconnect_attempt`,e.backoff.attempts),!e.skipReconnect&&e.open(t=>{t?(e._reconnecting=!1,e.reconnect(),this.emitReserved(`reconnect_error`,t)):e.onreconnect()}))},t);this.opts.autoUnref&&n.unref(),this.subs.push(()=>{this.clearTimeoutFn(n)})}}onreconnect(){let e=this.backoff.attempts;this._reconnecting=!1,this.backoff.reset(),this.emitReserved(`reconnect`,e)}},dt={};function ft(e,t){typeof e==`object`&&(t=e,e=void 0),t||={};let n=ze(e,t.path||`/socket.io`),r=n.source,i=n.id,a=n.path,o=dt[i]&&a in dt[i].nsps,s=t.forceNew||t[`force new connection`]||!1===t.multiplex||o,c;return s?c=new ut(r,t):(dt[i]||(dt[i]=new ut(r,t)),c=dt[i]),n.query&&!t.query&&(t.query=n.queryKey),c.socket(n.path,t)}Object.assign(ft,{Manager:ut,Socket:lt,io:ft,connect:ft});var pt=`chatbot-package-styles`,mt={botName:`Support Assistant`,title:`Support Assistant`,subtitle:`Online`,welcomeMessage:`Hi there! I am your support assistant. Ask me anything.`,placeholder:`Type your question...`,primaryColor:`#2563eb`,position:`bottom-right`,zIndex:9999},ht=`
.chatbot-widget-root {
  position: fixed;
  bottom: 16px;
  font-family: "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif;
}

.chatbot-widget-root.right {
  right: 16px;
}

.chatbot-widget-root.left {
  left: 16px;
}

.chatbot-launcher {
  width: 56px;
  height: 56px;
  border-radius: 9999px;
  border: 0;
  background: linear-gradient(135deg, var(--chatbot-primary), #1d4ed8);
  color: #ffffff;
  box-shadow: 0 16px 30px rgba(37, 99, 235, 0.35);
  cursor: pointer;
  display: grid;
  place-items: center;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.2px;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.chatbot-launcher svg {
  width: 20px;
  height: 20px;
}

.chatbot-launcher:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 34px rgba(37, 99, 235, 0.42);
}

.chatbot-panel {
  position: absolute;
  bottom: 66px;
  width: min(378px, calc(100vw - 24px));
  height: min(610px, calc(100vh - 88px));
  border-radius: 16px;
  border: 1px solid #dbe4f5;
  overflow: hidden;
  box-shadow: 0 28px 56px rgba(15, 23, 42, 0.24);
  background: #f8fbff;
  display: flex;
  flex-direction: column;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transform: translateY(10px) scale(0.98);
  transition: opacity 0.2s ease, transform 0.2s ease, visibility 0.2s ease;
}

.chatbot-widget-root.right .chatbot-panel {
  right: 0;
  transform-origin: bottom right;
}

.chatbot-widget-root.left .chatbot-panel {
  left: 0;
  transform-origin: bottom left;
}

.chatbot-widget-root.open .chatbot-panel {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
  transform: translateY(0) scale(1);
}

.chatbot-header {
  background: linear-gradient(135deg, var(--chatbot-primary), #1d4ed8);
  color: #ffffff;
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.chatbot-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.chatbot-avatar {
  width: 38px;
  height: 38px;
  border-radius: 9999px;
  background: #ffffff;
  color: var(--chatbot-primary);
  border: 1px solid rgba(255, 255, 255, 0.84);
  display: grid;
  place-items: center;
  font-size: 14px;
  font-weight: 700;
}

.chatbot-avatar svg {
  width: 18px;
  height: 18px;
}

.chatbot-header-info h2 {
  margin: 0;
  font-size: 15px;
  line-height: 1.15;
  font-weight: 700;
}

.chatbot-status {
  margin-top: 3px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
  opacity: 0.95;
}

.chatbot-status-dot {
  width: 8px;
  height: 8px;
  border-radius: 9999px;
  background: #22c55e;
}

.chatbot-controls {
  display: flex;
  align-items: center;
  margin-left: auto;
}

.chatbot-controls button {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.42);
  background: rgba(255, 255, 255, 0.24);
  color: #ffffff;
  cursor: pointer;
  line-height: 0;
  display: grid;
  place-items: center;
  transition: background 0.2s ease, transform 0.2s ease;
}

.chatbot-controls button svg {
  width: 16px;
  height: 16px;
  stroke-width: 2.25;
}

.chatbot-controls button:hover {
  background: rgba(255, 255, 255, 0.36);
  transform: translateY(-1px);
}

.chatbot-body {
  flex: 1;
  overflow-y: auto;
  padding: 14px 12px 10px;
  background: linear-gradient(180deg, #f8fbff 0%, #f1f6ff 100%);
}

.chatbot-body::-webkit-scrollbar {
  width: 8px;
}

.chatbot-body::-webkit-scrollbar-thumb {
  background: #bfdbfe;
  border-radius: 999px;
}

.chatbot-intro {
  text-align: center;
  color: #334155;
  border: 1px solid #dbe4f5;
  background: rgba(255, 255, 255, 0.72);
  border-radius: 14px;
  padding: 16px 12px;
}

.chatbot-intro-icon {
  width: 44px;
  height: 44px;
  border-radius: 9999px;
  background: #dbeafe;
  color: #1d4ed8;
  display: grid;
  place-items: center;
  font-size: 22px;
  font-weight: 700;
  margin: 0 auto 12px;
}

.chatbot-intro h3 {
  margin: 0;
  font-size: 25px;
  color: #0f172a;
}

.chatbot-intro p {
  margin: 10px auto 0;
  max-width: 290px;
  font-size: 13px;
  line-height: 1.45;
  color: #475569;
}

.chatbot-intro .chatbot-human-note {
  margin-top: 12px;
  font-style: italic;
  font-size: 12px;
  color: #6b7a92;
}

.chatbot-messages {
  display: none;
  flex-direction: column;
  gap: 8px;
}

.chatbot-body.has-messages .chatbot-intro {
  display: none;
}

.chatbot-body.has-messages .chatbot-messages {
  display: flex;
}
.chatbot-body.human-mode .chatbot-intro {
  display: none;
}
.chatbot-human-hero {
  display: none;
  text-align: center;
  color: #0f172a;
  border: 1px solid #dbe4f5;
  background: rgba(255, 255, 255, 0.88);
  border-radius: 14px;
  padding: 18px 14px;
}
.chatbot-body.human-mode .chatbot-human-hero {
  display: block;
}
.chatbot-human-hero h3 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
}
.chatbot-human-hero p {
  margin: 8px 0 0;
  font-size: 13px;
  color: #475569;
}
.chatbot-history-label {
  margin-top: 14px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #94a3b8;
  text-align: center;
}
.chatbot-divider {
  display: none;
  align-items: center;
  gap: 10px;
  margin: 16px 0 10px;
  color: #94a3b8;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
.chatbot-divider::before,
.chatbot-divider::after {
  content: "";
  flex: 1;
  height: 1px;
  background: #e2e8f0;
}
.chatbot-body.human-mode .chatbot-divider {
  display: flex;
}

.chatbot-bubble {
  max-width: 86%;
  border-radius: 12px;
  padding: 8px 10px;
  line-height: 1.45;
  font-size: 13px;
  white-space: pre-wrap;
}

.chatbot-bubble.user {
  align-self: flex-end;
  background: linear-gradient(135deg, var(--chatbot-primary), #1d4ed8);
  color: #ffffff;
}

.chatbot-bubble.bot {
  align-self: flex-start;
  background: #e2e8f0;
  color: #1e293b;
}
.chatbot-bubble.bot a {
  color: #1d4ed8;
  text-decoration: underline;
  text-underline-offset: 2px;
}
.chatbot-bubble.bot code {
  background: #e2e8f0;
  border-radius: 6px;
  padding: 1px 4px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
    "Courier New", monospace;
  font-size: 12px;
}
.chatbot-bubble.bot pre {
  margin: 8px 0 0;
  padding: 10px 12px;
  border-radius: 10px;
  background: #0f172a;
  color: #e2e8f0;
  overflow-x: auto;
  font-size: 12px;
  line-height: 1.5;
}
.chatbot-bubble.bot pre code {
  background: transparent;
  padding: 0;
  color: inherit;
}
.chatbot-md-h1,
.chatbot-md-h2,
.chatbot-md-h3 {
  font-weight: 700;
  color: #0f172a;
  margin: 6px 0 4px;
}
.chatbot-md-h1 {
  font-size: 15px;
}
.chatbot-md-h2 {
  font-size: 14px;
}
.chatbot-md-h3 {
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.chatbot-bubble.system {
  align-self: center;
  background: transparent;
  color: #2563eb;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 4px 6px;
  box-shadow: none;
}

.chatbot-footer {
  border-top: 1px solid #dbe4f5;
  background: #f8fbff;
  padding: 10px;
}

.chatbot-input-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
  margin-bottom: 8px;
  align-items: center;
}

.chatbot-input-row input {
  border: 1px solid #bfdbfe;
  border-radius: 10px;
  min-height: 44px;
  padding: 0 12px;
  outline: none;
  font-size: 13px;
  background: #ffffff;
  color: #1e293b;
}
.chatbot-input-row textarea {
  border: 1px solid #bfdbfe;
  border-radius: 12px;
  min-height: 46px;
  padding: 10px 12px;
  outline: none;
  font-size: 13px;
  background: #ffffff;
  color: #1e293b;
  resize: none;
  line-height: 1.4;
  font-family: inherit;
}

.chatbot-input-row input:focus {
  border-color: var(--chatbot-primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
}
.chatbot-input-row textarea:focus {
  border-color: var(--chatbot-primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
}

.chatbot-input-row button {
  width: 46px;
  height: 44px;
  border: 0;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--chatbot-primary), #1d4ed8);
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  padding: 0;
  display: grid;
  place-items: center;
  box-shadow: 0 10px 18px rgba(37, 99, 235, 0.28);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.chatbot-input-row button svg {
  width: 17px;
  height: 17px;
  stroke-width: 2.2;
}

.chatbot-input-row button:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 24px rgba(37, 99, 235, 0.34);
}

.chatbot-human-button {
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  background: #ffffff;
  color: #334155;
  min-height: 44px;
  padding: 0 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: border-color 0.2s ease, background 0.2s ease;
}

.chatbot-human-button:hover {
  background: #f8fafc;
  border-color: #94a3b8;
}

.chatbot-human-button svg {
  width: 16px;
  height: 16px;
  stroke-width: 2.1;
}

.chatbot-powered {
  margin: 8px 0 0;
  text-align: center;
  font-size: 11px;
  color: #94a3b8;
}

.chatbot-powered strong {
  color: #64748b;
}

/* --- Human Form Styles --- */
.chatbot-widget-root.show-human-form .chatbot-body,
.chatbot-widget-root.show-human-form .chatbot-footer {
  display: none !important;
}

.chatbot-human-container {
  display: none;
  flex: 1;
  flex-direction: column;
  background: #f8fbff;
  overflow-y: auto;
}

.chatbot-widget-root.show-human-form .chatbot-human-container {
  display: flex;
}

.chatbot-human-container::-webkit-scrollbar {
  width: 8px;
}

.chatbot-human-container::-webkit-scrollbar-thumb {
  background: #bfdbfe;
  border-radius: 999px;
}

.chatbot-human-header {
  padding: 20px 16px 12px;
  text-align: center;
}

.chatbot-human-header h3 {
  margin: 0 0 6px;
  color: #0f172a;
  font-size: 18px;
}

.chatbot-human-header p {
  margin: 0;
  color: #64748b;
  font-size: 13px;
  line-height: 1.45;
}

.chatbot-human-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 16px 20px;
}

.chatbot-form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.chatbot-form-group label {
  font-size: 13px;
  font-weight: 600;
  color: #334155;
}

.chatbot-form-group input,
.chatbot-form-group textarea {
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  padding: 10px;
  font-size: 13px;
  outline: none;
  background: #ffffff;
  color: #1e293b;
  font-family: inherit;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.chatbot-form-group input:focus,
.chatbot-form-group textarea:focus {
  border-color: var(--chatbot-primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}

.chatbot-form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.chatbot-form-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.chatbot-btn-primary {
  flex: 1;
  background: linear-gradient(135deg, var(--chatbot-primary), #1d4ed8);
  color: white;
  border: none;
  padding: 10px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.chatbot-btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
}

.chatbot-btn-secondary {
  flex: 1;
  background: #e2e8f0;
  color: #334155;
  border: none;
  padding: 10px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.chatbot-btn-secondary:hover {
  background: #cbd5e1;
}

.chatbot-human-success {
  display: none;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 32px 24px;
  height: 100%;
}

.chatbot-widget-root.show-human-success .chatbot-human-success {
  display: flex;
}
.chatbot-widget-root.show-human-success .chatbot-human-form,
.chatbot-widget-root.show-human-success .chatbot-human-header {
  display: none !important;
}

.chatbot-success-icon {
  width: 56px;
  height: 56px;
  background: #dcfce7;
  color: #16a34a;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.chatbot-success-icon svg {
  width: 28px;
  height: 28px;
}

.chatbot-human-success h3 {
  margin: 0 0 8px;
  color: #0f172a;
  font-size: 20px;
}

.chatbot-human-success p {
  margin: 0 0 24px;
  color: #475569;
  font-size: 14px;
  line-height: 1.5;
}

@media (max-width: 640px) {
  .chatbot-widget-root.right,
  .chatbot-widget-root.left {
    right: 10px;
    left: 10px;
  }

  .chatbot-widget-root {
    bottom: 10px;
  }

  .chatbot-panel {
    width: min(360px, calc(100vw - 20px));
    height: min(520px, calc(100vh - 70px));
  }

  .chatbot-intro h3 {
    font-size: 22px;
  }
}
`,gt=()=>{if(document.getElementById(pt))return;let e=document.createElement(`style`);e.id=pt,e.textContent=ht,document.head.appendChild(e)},_t=e=>e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#39;`),vt=e=>e.replace(/^###\s+(.+)$/gm,`<div class="chatbot-md-h3">$1</div>`).replace(/^##\s+(.+)$/gm,`<div class="chatbot-md-h2">$1</div>`).replace(/^#\s+(.+)$/gm,`<div class="chatbot-md-h1">$1</div>`).replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,(e,t,n)=>`<a href="${n}" target="_blank" rel="noopener noreferrer">${t}</a>`).replace(/\*\*([^*]+)\*\*/g,`<strong>$1</strong>`).replace(/\*([^*]+)\*/g,`<em>$1</em>`).replace(/`([^`]+)`/g,`<code>$1</code>`).replace(/^\s*-\s+/gm,`• `).replace(/\n/g,`<br>`),yt=e=>String(e||``).split(/```/).map((e,t)=>t%2==1?`<pre><code>${_t(e.trim())}</code></pre>`:vt(_t(e))).join(``),Q=(e,t,n=!1)=>{let r=document.createElement(`div`);return r.className=`chatbot-bubble ${t}`,n?r.innerHTML=yt(e):r.textContent=e,r},bt=(e,t,n)=>{let r=document.createElement(`button`);return r.type=`button`,r.innerHTML=`<i data-lucide="${e}" aria-hidden="true"></i>`,r.setAttribute(`aria-label`,t),n&&r.addEventListener(`click`,n),r},$=()=>{re({icons:{Bot:te,MessageCircle:m,SendHorizontal:h,UserRound:g,X:ne,CheckCircle:p,ArrowLeft:f}})},xt=e=>{let t=String(e||``).trim().replace(/\/+$/,``);return!t||/^https?:\/\//i.test(t)?t:t.startsWith(`/`)?`${window.location.origin}${t}`:t},St=e=>e.startsWith(`/`)?e:`/${e}`,Ct=e=>e.replace(/\/api\/?$/i,``),wt=e=>e&&typeof e==`object`&&`data`in e?e.data:e;e.createChatbotWidget=(e={})=>{if(typeof window>`u`||typeof document>`u`)throw Error(`chatbot-package can only run in a browser environment.`);gt();let t={...mt,...e},n=document.createElement(`div`);n.className=`chatbot-widget-root ${t.position===`bottom-left`?`left`:`right`}`,n.style.setProperty(`--chatbot-primary`,t.primaryColor),n.style.zIndex=String(t.zIndex);let r=document.createElement(`button`);r.type=`button`,r.className=`chatbot-launcher`,r.setAttribute(`aria-label`,`Open chatbot`),r.setAttribute(`aria-expanded`,`false`),r.innerHTML=`<i data-lucide="message-circle" aria-hidden="true"></i>`;let i=document.createElement(`section`);i.className=`chatbot-panel`,i.setAttribute(`role`,`dialog`),i.setAttribute(`aria-label`,t.title);let a=document.createElement(`header`);a.className=`chatbot-header`;let o=document.createElement(`div`);o.className=`chatbot-header-left`;let s=document.createElement(`div`);s.className=`chatbot-avatar`,s.innerHTML=`<i data-lucide="bot" aria-hidden="true"></i>`;let c=document.createElement(`div`);c.className=`chatbot-header-info`;let l=document.createElement(`h2`);l.textContent=t.title;let u=document.createElement(`div`);u.className=`chatbot-status`;let ee=document.createElement(`span`);ee.className=`chatbot-status-dot`;let d=document.createElement(`span`);d.textContent=t.subtitle,u.append(ee,d),c.append(l,u),o.append(s,c);let f=document.createElement(`div`);f.className=`chatbot-controls`;let te=bt(`x`,`Close chat`,()=>{n.classList.remove(`open`),r.setAttribute(`aria-expanded`,`false`)});f.append(te),a.append(o,f);let p=document.createElement(`div`);p.className=`chatbot-body`;let m=document.createElement(`section`);m.className=`chatbot-intro`;let h=document.createElement(`div`);h.className=`chatbot-intro-icon`,h.textContent=`?`;let g=document.createElement(`h3`);g.textContent=`Hi there!`;let ne=document.createElement(`p`);ne.textContent=`I am your AI support assistant. Ask me anything.`;let re=document.createElement(`p`);re.className=`chatbot-human-note`,re.textContent=`If I cannot help, you can connect with our human support team.`,m.append(h,g,ne,re);let _=document.createElement(`section`);_.className=`chatbot-human-hero`;let v=document.createElement(`h3`);v.textContent=`Talk to Support`;let ie=document.createElement(`p`);ie.textContent=`Our team typically replies in a few minutes.`;let ae=document.createElement(`div`);ae.className=`chatbot-history-label`,ae.textContent=`Previous Messages`,_.append(v,ie,ae);let y=document.createElement(`div`);y.className=`chatbot-divider`,y.textContent=`Previous AI Interaction`;let b=document.createElement(`div`);b.className=`chatbot-messages`,b.setAttribute(`aria-live`,`polite`),b.appendChild(Q(t.welcomeMessage,`bot`,!0)),p.append(m,_,b);let x=document.createElement(`div`);x.className=`chatbot-footer`;let S=document.createElement(`form`);S.className=`chatbot-input-row`;let C=document.createElement(`textarea`);C.rows=1,C.placeholder=t.placeholder;let w=document.createElement(`button`);w.type=`submit`,w.setAttribute(`aria-label`,`Send message`),w.innerHTML=`<i data-lucide="send-horizontal" aria-hidden="true"></i>`,S.append(C,w);let T=document.createElement(`button`);T.type=`button`,T.className=`chatbot-human-button`;let oe=`<i data-lucide="user-round" aria-hidden="true"></i><span>Talk to a real human</span>`,E=`<i data-lucide="bot" aria-hidden="true"></i><span>Talk to AI</span>`;T.innerHTML=oe;let se=document.createElement(`p`);se.className=`chatbot-powered`,se.innerHTML=`Powered by <strong>AI assistant</strong>`,x.append(S,T,se);let ce=document.createElement(`div`);ce.className=`chatbot-human-container`;let D=document.createElement(`div`);D.className=`chatbot-human-header`;let le=document.createElement(`h3`);le.textContent=`Contact Support`;let ue=document.createElement(`p`);ue.textContent=`Please provide your details and we will get back to you shortly.`,D.append(le,ue);let O=document.createElement(`form`);O.className=`chatbot-human-form`;let de=(e,t)=>{let n=document.createElement(`div`);n.className=`chatbot-form-group`;let r=document.createElement(`label`);return r.textContent=e,n.append(r,t),n},k=document.createElement(`input`);k.type=`text`,k.placeholder=`John Doe`,k.required=!0;let A=document.createElement(`input`);A.type=`email`,A.placeholder=`john@example.com`,A.required=!0;let j=document.createElement(`textarea`);j.placeholder=`How can we help you?`,j.required=!0;let M=document.createElement(`div`);M.className=`chatbot-form-actions`;let N=document.createElement(`button`);N.type=`button`,N.className=`chatbot-btn-secondary`,N.innerHTML=`<i data-lucide="arrow-left" aria-hidden="true" style="width: 16px; height: 16px;"></i> Back`;let P=document.createElement(`button`);P.type=`submit`,P.className=`chatbot-btn-primary`,P.textContent=`Send Message`,M.append(N,P),O.append(de(`Name`,k),de(`Email`,A),de(`Description`,j),M);let F=document.createElement(`div`);F.className=`chatbot-human-success`;let fe=document.createElement(`div`);fe.className=`chatbot-success-icon`,fe.innerHTML=`<i data-lucide="check-circle" aria-hidden="true"></i>`;let I=document.createElement(`h3`);I.textContent=`Message Sent!`;let L=document.createElement(`p`);L.textContent=`Our support team will reach out to you via email shortly.`;let R=document.createElement(`button`);R.type=`button`,R.className=`chatbot-btn-primary`,R.textContent=`Back to Chat`,F.append(fe,I,L,R),ce.append(D,O,F),i.append(a,p,x,ce),n.append(i,r),document.body.appendChild(n),$();let z=!1,pe=!1,B=!1,V=!1,me=!1,he=!1,H=!1,U=null,ge=null,W=null,_e=new Set,G=(e,t)=>{e.trim()&&(p.classList.add(`has-messages`),b.appendChild(Q(e.trim(),`bot`,t?.markdown??!1)),p.scrollTop=p.scrollHeight)},K=e=>{p.classList.toggle(`human-mode`,e),e?(b.contains(y)||b.insertBefore(y,b.firstChild),T.innerHTML=E):(b.contains(y)&&y.remove(),T.innerHTML=oe),$()},q=e=>{pe||(z=e,n.classList.toggle(`open`,z),r.setAttribute(`aria-expanded`,String(z)),z&&window.setTimeout(()=>C.focus(),0))},ve=async n=>{if(B&&U){U.emit(`widget:message`,{text:n});return}if(e.onUserMessage){let t=await e.onUserMessage(n);typeof t==`string`&&t.trim()&&G(t);return}if(e.aiSupport){try{let t=xt(e.aiSupport.apiBaseUrl),r=St(e.aiSupport.chatPath||`/rag/chat`),i=await fetch(`${t}${r}`,{method:`POST`,headers:{"Content-Type":`application/json`,"x-api-key":e.aiSupport.apiKey},body:JSON.stringify({query:n})});if(!i.ok)throw Error(`Unable to fetch chatbot response right now.`);let a=wt(await i.json());if(G(typeof a?.answer==`string`&&a.answer||typeof a?.response==`string`&&a.response||typeof a?.message==`string`&&a.message||`I processed your question, but no answer text was returned.`,{markdown:!0}),a?.raise_ticket&&a?.ticket_payload){let e=a.ticket_payload,t=a?.ticket?._id||a?.ticketId||a?.ticket_id;G([`### Ticket Details`,e?.summary?`- Summary: ${e.summary}`:null,e?.priority?`- Priority: ${String(e.priority).toUpperCase()}`:null,e?.urgency?`- Urgency: ${String(e.urgency).toUpperCase()}`:null,t?`- Ticket ID: ${t}`:null,`- Status: Pending`].filter(Boolean).join(`
`),{markdown:!0})}}catch(e){let t=e instanceof Error?e.message:`Sorry, I am having trouble connecting right now.`;G(t.includes(`Failed to fetch`)?`Unable to reach the AI server. Please try again.`:t)}return}G(`Thanks! ${t.botName} received: "${n}"`)},ye=async n=>{if(!t.humanSupport){G(`Human support is not configured for this widget yet.`);return}let r=t.humanSupport.widgetKey||e.aiSupport?.apiKey;if(!r)throw Error(`Human support requires a widget key or aiSupport.apiKey.`);let i=xt(t.humanSupport.apiBaseUrl),a=await fetch(`${i}/widget/session`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({widgetKey:r,visitorName:n.name,visitorEmail:n.email,issue:n.issue})});if(!a.ok){let e=await a.json().catch(()=>null),t=e?.message||e?.error||`Unable to connect to human support right now.`;throw Error(t)}let o=wt(await a.json());ge=o.sessionId,W=o.ticketId,B=!0,K(!0);let s=ft(Ct(i),{path:`/socket.io`,transports:[`websocket`],auth:{token:o.chatToken}});U=s,s.on(`connect`,()=>{d.textContent=`Connecting to a human agent...`}),s.on(`disconnect`,()=>{B&&(d.textContent=`Reconnecting to human support...`)}),s.on(`chat:message`,e=>{e.sessionId===ge&&(e._id&&_e.has(e._id)||(e._id&&_e.add(e._id),e.sender===`agent`&&typeof e.text==`string`&&(V||(G(`You are now connected to a human agent.`),b.appendChild(Q(`AGENT JOINED THE SESSION`,`system`)),he=!0),G(e.text),V=!0)))}),s.on(`chat:ticket_status`,e=>{if(e.sessionId&&e.sessionId===ge||e.ticketId&&e.ticketId===W){if(e.status===`assigned`){V||G(`A human agent has accepted your chat. You are now connected.`),V=!0,he||=(b.appendChild(Q(`AGENT JOINED THE SESSION`,`system`)),!0),d.textContent=`Connected with human support`;return}e.status===`pending`&&(d.textContent=`Connecting to a human agent...`)}}),s.on(`chat:error`,e=>{G(e.message||`Support connection error. Please try again.`)}),s.emit(`widget:request_human`,{name:n.name,email:n.email,issue:n.issue}),d.textContent=`Connecting to a human agent...`},be=async e=>{let t=e.trim();if(!(!t||pe)){if(H){p.classList.add(`has-messages`),K(!0),b.appendChild(Q(t,`user`)),C.value=``,p.scrollTop=p.scrollHeight,H=!1;try{await ye({name:`Website Visitor`,email:``,issue:t}),G(`You're now connected to a support agent. Please wait...`),T.innerHTML=E,$()}catch(e){G(e instanceof Error?e.message:`Unable to connect to support right now.`),H=!0}return}p.classList.add(`has-messages`),K(B),b.appendChild(Q(t,`user`)),C.value=``,p.scrollTop=p.scrollHeight,await ve(t)}};return r.addEventListener(`click`,()=>{q(!z)}),S.addEventListener(`submit`,async e=>{e.preventDefault(),await be(C.value)}),C.addEventListener(`keydown`,async e=>{e.key===`Enter`&&!e.shiftKey&&(e.preventDefault(),await be(C.value))}),T.addEventListener(`click`,async()=>{if(B){B=!1,V=!1,H=!1,K(!1),G(`You are now chatting with AI again.`);return}if(!me){me=!0,K(!0),G(`Please describe the issue you are facing.`),H=!0;try{T.innerHTML=E,$()}catch(e){let t=e instanceof Error?e.message:`Unable to connect to support right now.`;G(t.includes(`Failed to fetch`)?`Unable to reach support server. Please try again.`:t),B=!1,V=!1,H=!1,K(!1),T.innerHTML=oe,$()}finally{me=!1}}}),N.addEventListener(`click`,()=>{}),O.addEventListener(`submit`,async e=>{e.preventDefault()}),R.addEventListener(`click`,()=>{n.classList.remove(`show-human-form`),n.classList.remove(`show-human-success`),O.reset(),p.classList.add(`has-messages`),b.appendChild(Q(B&&W?V?`You are now connected with our support team (ticket ${W.slice(-6)}).`:`Your ticket ${W.slice(-6)} is waiting for an available human agent.`:`Your issue has been submitted. A human agent will contact you soon.`,`bot`)),p.scrollTop=p.scrollHeight}),{open:()=>q(!0),close:()=>q(!1),toggle:()=>q(!z),sendMessage:be,destroy:()=>{pe||(pe=!0,U&&=(U.close(),null),n.remove())}}}});