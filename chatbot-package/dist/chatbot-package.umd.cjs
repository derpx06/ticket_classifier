(function(e,t){typeof exports==`object`&&typeof module<`u`?t(exports):typeof define==`function`&&define.amd?define([`exports`],t):(e=typeof globalThis<`u`?globalThis:e||self,t(e.ChatbotPackage={}))})(this,function(e){Object.defineProperty(e,Symbol.toStringTag,{value:`Module`});var t={xmlns:`http://www.w3.org/2000/svg`,width:24,height:24,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,"stroke-width":2,"stroke-linecap":`round`,"stroke-linejoin":`round`},n=([e,t,r])=>{let i=document.createElementNS(`http://www.w3.org/2000/svg`,e);return Object.keys(t).forEach(e=>{i.setAttribute(e,String(t[e]))}),r?.length&&r.forEach(e=>{let t=n(e);i.appendChild(t)}),i},r=(e,r={})=>n([`svg`,{...t,...r},e]),i=e=>{for(let t in e)if(t.startsWith(`aria-`)||t===`role`||t===`title`)return!0;return!1},a=(...e)=>e.filter((e,t,n)=>!!e&&e.trim()!==``&&n.indexOf(e)===t).join(` `).trim(),o=e=>e.replace(/^([A-Z])|[\s-_]+(\w)/g,(e,t,n)=>n?n.toUpperCase():t.toLowerCase()),s=e=>{let t=o(e);return t.charAt(0).toUpperCase()+t.slice(1)},c=e=>Array.from(e.attributes).reduce((e,t)=>(e[t.name]=t.value,e),{}),l=e=>typeof e==`string`?e:!e||!e.class?``:e.class&&typeof e.class==`string`?e.class.split(` `):e.class&&Array.isArray(e.class)?e.class:``,u=(e,{nameAttr:n,icons:o,attrs:u})=>{let d=e.getAttribute(n);if(d==null)return;let f=o[s(d)];if(!f)return console.warn(`${e.outerHTML} icon name was not found in the provided icons object.`);let p=c(e),m=i(p)?{}:{"aria-hidden":`true`},h={...t,"data-lucide":d,...m,...u,...p},g=l(p),_=l(u),v=a(`lucide`,`lucide-${d}`,...g,..._);v&&Object.assign(h,{class:v});let y=r(f,h);return e.parentNode?.replaceChild(y,e)},d=[[`path`,{d:`M12 8V4H8`}],[`rect`,{width:`16`,height:`12`,x:`4`,y:`8`,rx:`2`}],[`path`,{d:`M2 14h2`}],[`path`,{d:`M20 14h2`}],[`path`,{d:`M15 13v2`}],[`path`,{d:`M9 13v2`}]],f=[[`path`,{d:`M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719`}]],p=[[`path`,{d:`M3.714 3.048a.498.498 0 0 0-.683.627l2.843 7.627a2 2 0 0 1 0 1.396l-2.842 7.627a.498.498 0 0 0 .682.627l18-8.5a.5.5 0 0 0 0-.904z`}],[`path`,{d:`M6 12h16`}]],m=[[`circle`,{cx:`12`,cy:`8`,r:`5`}],[`path`,{d:`M20 21a8 8 0 0 0-16 0`}]],h=[[`path`,{d:`M18 6 6 18`}],[`path`,{d:`m6 6 12 12`}]],g=({icons:e={},nameAttr:t=`data-lucide`,attrs:n={},root:r=document,inTemplates:i}={})=>{if(!Object.values(e).length)throw Error(`Please provide an icons object.
If you want to use all the icons you can import it like:
 \`import { createIcons, icons } from 'lucide';
lucide.createIcons({icons});\``);if(r===void 0)throw Error("`createIcons()` only works in a browser environment.");if(Array.from(r.querySelectorAll(`[${t}]`)).forEach(r=>u(r,{nameAttr:t,icons:e,attrs:n})),i&&Array.from(r.querySelectorAll(`template`)).forEach(r=>g({icons:e,nameAttr:t,attrs:n,root:r.content,inTemplates:i})),t===`data-lucide`){let t=r.querySelectorAll(`[icon-name]`);t.length>0&&(console.warn(`[Lucide] Some icons were found with the now deprecated icon-name attribute. These will still be replaced for backwards compatibility, but will no longer be supported in v1.0 and you should switch to data-lucide`),Array.from(t).forEach(t=>u(t,{nameAttr:`icon-name`,icons:e,attrs:n})))}},_=`chatbot-package-styles`,v={botName:`Support Assistant`,title:`Support Assistant`,subtitle:`Online`,welcomeMessage:`Hi there! I am your support assistant. Ask me anything.`,placeholder:`Type your question...`,primaryColor:`#2563eb`,position:`bottom-right`,zIndex:9999},y=`
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

.chatbot-input-row input:focus {
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
`,b=()=>{if(document.getElementById(_))return;let e=document.createElement(`style`);e.id=_,e.textContent=y,document.head.appendChild(e)},x=(e,t)=>{let n=document.createElement(`div`);return n.className=`chatbot-bubble ${t}`,n.textContent=e,n},S=(e,t,n)=>{let r=document.createElement(`button`);return r.type=`button`,r.innerHTML=`<i data-lucide="${e}" aria-hidden="true"></i>`,r.setAttribute(`aria-label`,t),n&&r.addEventListener(`click`,n),r},C=()=>{g({icons:{Bot:d,MessageCircle:f,SendHorizontal:p,UserRound:m,X:h}})};e.createChatbotWidget=(e={})=>{if(typeof window>`u`||typeof document>`u`)throw Error(`chatbot-package can only run in a browser environment.`);b();let t={...v,...e},n=document.createElement(`div`);n.className=`chatbot-widget-root ${t.position===`bottom-left`?`left`:`right`}`,n.style.setProperty(`--chatbot-primary`,t.primaryColor),n.style.zIndex=String(t.zIndex);let r=document.createElement(`button`);r.type=`button`,r.className=`chatbot-launcher`,r.setAttribute(`aria-label`,`Open chatbot`),r.setAttribute(`aria-expanded`,`false`),r.innerHTML=`<i data-lucide="message-circle" aria-hidden="true"></i>`;let i=document.createElement(`section`);i.className=`chatbot-panel`,i.setAttribute(`role`,`dialog`),i.setAttribute(`aria-label`,t.title);let a=document.createElement(`header`);a.className=`chatbot-header`;let o=document.createElement(`div`);o.className=`chatbot-header-left`;let s=document.createElement(`div`);s.className=`chatbot-avatar`,s.innerHTML=`<i data-lucide="bot" aria-hidden="true"></i>`;let c=document.createElement(`div`);c.className=`chatbot-header-info`;let l=document.createElement(`h2`);l.textContent=t.title;let u=document.createElement(`div`);u.className=`chatbot-status`;let d=document.createElement(`span`);d.className=`chatbot-status-dot`;let f=document.createElement(`span`);f.textContent=t.subtitle,u.append(d,f),c.append(l,u),o.append(s,c);let p=document.createElement(`div`);p.className=`chatbot-controls`;let m=S(`x`,`Close chat`,()=>{n.classList.remove(`open`),r.setAttribute(`aria-expanded`,`false`)});p.append(m),a.append(o,p);let h=document.createElement(`div`);h.className=`chatbot-body`;let g=document.createElement(`section`);g.className=`chatbot-intro`;let _=document.createElement(`div`);_.className=`chatbot-intro-icon`,_.textContent=`?`;let y=document.createElement(`h3`);y.textContent=`Hi there!`;let w=document.createElement(`p`);w.textContent=`I am your AI support assistant. Ask me anything.`;let T=document.createElement(`p`);T.className=`chatbot-human-note`,T.textContent=`If I cannot help, you can connect with our human support team.`,g.append(_,y,w,T);let E=document.createElement(`div`);E.className=`chatbot-messages`,E.setAttribute(`aria-live`,`polite`),E.appendChild(x(t.welcomeMessage,`bot`)),h.append(g,E);let D=document.createElement(`div`);D.className=`chatbot-footer`;let O=document.createElement(`form`);O.className=`chatbot-input-row`;let k=document.createElement(`input`);k.type=`text`,k.placeholder=t.placeholder;let A=document.createElement(`button`);A.type=`submit`,A.setAttribute(`aria-label`,`Send message`),A.innerHTML=`<i data-lucide="send-horizontal" aria-hidden="true"></i>`,O.append(k,A);let j=document.createElement(`button`);j.type=`button`,j.className=`chatbot-human-button`,j.innerHTML=`<i data-lucide="user-round" aria-hidden="true"></i><span>Talk to a real human</span>`;let M=document.createElement(`p`);M.className=`chatbot-powered`,M.innerHTML=`Powered by <strong>AI assistant</strong>`,D.append(O,j,M),i.append(a,h,D),n.append(i,r),document.body.appendChild(n),C();let N=!1,P=!1,F=e=>{P||(N=e,n.classList.toggle(`open`,N),r.setAttribute(`aria-expanded`,String(N)),N&&window.setTimeout(()=>k.focus(),0))},I=async n=>{if(e.onUserMessage){let t=await e.onUserMessage(n);typeof t==`string`&&t.trim()&&E.appendChild(x(t.trim(),`bot`))}else E.appendChild(x(`Thanks! ${t.botName} received: "${n}"`,`bot`));h.classList.add(`has-messages`),h.scrollTop=h.scrollHeight},L=async e=>{let t=e.trim();!t||P||(h.classList.add(`has-messages`),E.appendChild(x(t,`user`)),k.value=``,h.scrollTop=h.scrollHeight,await I(t))};return r.addEventListener(`click`,()=>{F(!N)}),O.addEventListener(`submit`,async e=>{e.preventDefault(),await L(k.value)}),j.addEventListener(`click`,()=>{h.classList.add(`has-messages`),E.appendChild(x(`Sure - we will connect you with a human support teammate.`,`bot`)),h.scrollTop=h.scrollHeight}),{open:()=>F(!0),close:()=>F(!1),toggle:()=>F(!N),sendMessage:L,destroy:()=>{P||(P=!0,n.remove())}}}});