(function(e,t){typeof exports==`object`&&typeof module<`u`?t(exports):typeof define==`function`&&define.amd?define([`exports`],t):(e=typeof globalThis<`u`?globalThis:e||self,t(e.ChatbotPackage={}))})(this,function(e){Object.defineProperty(e,Symbol.toStringTag,{value:`Module`});var t=`chatbot-package-styles`,n={botName:`Support Assistant`,title:`Support Assistant`,subtitle:`Online`,welcomeMessage:`Hi there! I am your support assistant. Ask me anything.`,placeholder:`Type your question...`,primaryColor:`#ea7d80`,position:`bottom-right`,zIndex:9999},r=`
.chatbot-widget-root {
  position: fixed;
  bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

.chatbot-widget-root.right {
  right: 20px;
}

.chatbot-widget-root.left {
  left: 20px;
}

.chatbot-launcher {
  width: 58px;
  height: 58px;
  border-radius: 9999px;
  border: 0;
  background: var(--chatbot-primary);
  color: #ffffff;
  box-shadow: 0 12px 26px rgba(22, 28, 45, 0.25);
  cursor: pointer;
  display: grid;
  place-items: center;
  font-size: 14px;
  font-weight: 700;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.chatbot-launcher:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 30px rgba(22, 28, 45, 0.3);
}

.chatbot-panel {
  width: min(500px, calc(100vw - 30px));
  height: min(720px, calc(100vh - 100px));
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  box-shadow: 0 22px 50px rgba(15, 23, 42, 0.22);
  background: #f9fafb;
  display: none;
  flex-direction: column;
}

.chatbot-widget-root.open .chatbot-panel {
  display: flex;
}

.chatbot-header {
  background: var(--chatbot-primary);
  color: #ffffff;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.chatbot-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.chatbot-avatar {
  width: 46px;
  height: 46px;
  border-radius: 9999px;
  background: #ffffff;
  color: var(--chatbot-primary);
  border: 2px solid rgba(255, 255, 255, 0.7);
  display: grid;
  place-items: center;
  font-size: 18px;
  font-weight: 700;
}

.chatbot-header-info h2 {
  margin: 0;
  font-size: 30px;
  line-height: 1;
  font-weight: 700;
}

.chatbot-status {
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 24px;
  font-weight: 500;
}

.chatbot-status-dot {
  width: 10px;
  height: 10px;
  border-radius: 9999px;
  background: #22c55e;
}

.chatbot-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.chatbot-controls button {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.38);
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  display: grid;
  place-items: center;
}

.chatbot-body {
  flex: 1;
  overflow-y: auto;
  padding: 22px 16px 12px;
  background: #f3f4f6;
}

.chatbot-intro {
  text-align: center;
  color: #334155;
}

.chatbot-intro-icon {
  width: 54px;
  height: 54px;
  border-radius: 9999px;
  background: #f3ced2;
  color: var(--chatbot-primary);
  display: grid;
  place-items: center;
  font-size: 28px;
  font-weight: 700;
  margin: 0 auto 18px;
}

.chatbot-intro h3 {
  margin: 0;
  font-size: 42px;
  color: #0f172a;
}

.chatbot-intro p {
  margin: 14px auto 0;
  max-width: 420px;
  font-size: 17px;
  line-height: 1.45;
  color: #475569;
}

.chatbot-intro .chatbot-human-note {
  margin-top: 20px;
  font-style: italic;
  color: #7c8697;
}

.chatbot-messages {
  display: none;
  flex-direction: column;
  gap: 10px;
  margin-top: 18px;
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
  padding: 10px 12px;
  line-height: 1.4;
  font-size: 14px;
  white-space: pre-wrap;
}

.chatbot-bubble.user {
  align-self: flex-end;
  background: var(--chatbot-primary);
  color: #ffffff;
}

.chatbot-bubble.bot {
  align-self: flex-start;
  background: #e6e9ee;
  color: #1e293b;
}

.chatbot-footer {
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
  padding: 12px 14px 14px;
}

.chatbot-input-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
  margin-bottom: 10px;
}

.chatbot-input-row input {
  border: 2px solid #f39da4;
  border-radius: 12px;
  padding: 12px 14px;
  outline: none;
  font-size: 16px;
  background: #ffffff;
}

.chatbot-input-row input:focus {
  border-color: var(--chatbot-primary);
  box-shadow: 0 0 0 3px rgba(234, 125, 128, 0.16);
}

.chatbot-input-row button {
  width: 56px;
  border: 0;
  border-radius: 12px;
  background: #efc0c4;
  color: #ffffff;
  font-size: 22px;
  cursor: pointer;
}

.chatbot-human-button {
  width: 100%;
  border: 1px solid #d4d8df;
  border-radius: 12px;
  background: #ffffff;
  color: #334155;
  padding: 11px 12px;
  font-size: 18px;
  cursor: pointer;
}

.chatbot-powered {
  margin: 10px 0 0;
  text-align: center;
  font-size: 12px;
  color: #98a2b3;
}

.chatbot-powered strong {
  color: #5f6d85;
}

@media (max-width: 640px) {
  .chatbot-widget-root.right,
  .chatbot-widget-root.left {
    right: 10px;
    left: 10px;
  }

  .chatbot-panel {
    width: 100%;
    height: min(700px, calc(100vh - 90px));
  }

  .chatbot-header-info h2 {
    font-size: 24px;
  }

  .chatbot-status {
    font-size: 18px;
  }

  .chatbot-intro h3 {
    font-size: 34px;
  }
}
`,i=()=>{if(document.getElementById(t))return;let e=document.createElement(`style`);e.id=t,e.textContent=r,document.head.appendChild(e)},a=(e,t)=>{let n=document.createElement(`div`);return n.className=`chatbot-bubble ${t}`,n.textContent=e,n},o=(e,t,n)=>{let r=document.createElement(`button`);return r.type=`button`,r.textContent=e,r.setAttribute(`aria-label`,t),n&&r.addEventListener(`click`,n),r};e.createChatbotWidget=(e={})=>{if(typeof window>`u`||typeof document>`u`)throw Error(`chatbot-package can only run in a browser environment.`);i();let t={...n,...e},r=document.createElement(`div`);r.className=`chatbot-widget-root ${t.position===`bottom-left`?`left`:`right`}`,r.style.setProperty(`--chatbot-primary`,t.primaryColor),r.style.zIndex=String(t.zIndex);let s=document.createElement(`button`);s.type=`button`,s.className=`chatbot-launcher`,s.setAttribute(`aria-label`,`Open chatbot`),s.setAttribute(`aria-expanded`,`false`),s.textContent=`Chat`;let c=document.createElement(`section`);c.className=`chatbot-panel`,c.setAttribute(`role`,`dialog`),c.setAttribute(`aria-label`,t.title);let l=document.createElement(`header`);l.className=`chatbot-header`;let u=document.createElement(`div`);u.className=`chatbot-header-left`;let d=document.createElement(`div`);d.className=`chatbot-avatar`,d.textContent=`A`;let f=document.createElement(`div`);f.className=`chatbot-header-info`;let p=document.createElement(`h2`);p.textContent=t.title;let m=document.createElement(`div`);m.className=`chatbot-status`;let h=document.createElement(`span`);h.className=`chatbot-status-dot`;let g=document.createElement(`span`);g.textContent=t.subtitle,m.append(h,g),f.append(p,m),u.append(d,f);let _=document.createElement(`div`);_.className=`chatbot-controls`;let v=o(`o`,`Help`),y=o(`-`,`Minimize chat`,()=>{r.classList.remove(`open`),s.setAttribute(`aria-expanded`,`false`)}),b=o(`x`,`Close chat`,()=>{r.classList.remove(`open`),s.setAttribute(`aria-expanded`,`false`)});_.append(v,y,b),l.append(u,_);let x=document.createElement(`div`);x.className=`chatbot-body`;let S=document.createElement(`section`);S.className=`chatbot-intro`;let C=document.createElement(`div`);C.className=`chatbot-intro-icon`,C.textContent=`?`;let w=document.createElement(`h3`);w.textContent=`Hi there!`;let T=document.createElement(`p`);T.textContent=`I am your hopefully not annoying AI support assistant. Ask me anything!`;let E=document.createElement(`p`);E.className=`chatbot-human-note`,E.textContent=`If I cannot help, you can connect with our human support team.`,S.append(C,w,T,E);let D=document.createElement(`div`);D.className=`chatbot-messages`,D.appendChild(a(t.welcomeMessage,`bot`)),x.append(S,D);let O=document.createElement(`div`);O.className=`chatbot-footer`;let k=document.createElement(`form`);k.className=`chatbot-input-row`;let A=document.createElement(`input`);A.type=`text`,A.placeholder=t.placeholder;let j=document.createElement(`button`);j.type=`submit`,j.textContent=`>`,k.append(A,j);let M=document.createElement(`button`);M.type=`button`,M.className=`chatbot-human-button`,M.textContent=`Talk to a real human`;let N=document.createElement(`p`);N.className=`chatbot-powered`,N.innerHTML=`Powered by <strong>AI assistant</strong>`,O.append(k,M,N),c.append(l,x,O),r.append(c,s),document.body.appendChild(r);let P=!1,F=!1,I=e=>{F||(P=e,r.classList.toggle(`open`,P),s.setAttribute(`aria-expanded`,String(P)),P&&window.setTimeout(()=>A.focus(),0))},L=async n=>{if(e.onUserMessage){let t=await e.onUserMessage(n);typeof t==`string`&&t.trim()&&D.appendChild(a(t.trim(),`bot`))}else D.appendChild(a(`Thanks! ${t.botName} received: "${n}"`,`bot`));x.classList.add(`has-messages`),x.scrollTop=x.scrollHeight},R=async e=>{let t=e.trim();!t||F||(x.classList.add(`has-messages`),D.appendChild(a(t,`user`)),A.value=``,x.scrollTop=x.scrollHeight,await L(t))};return s.addEventListener(`click`,()=>{I(!P)}),k.addEventListener(`submit`,async e=>{e.preventDefault(),await R(A.value)}),{open:()=>I(!0),close:()=>I(!1),toggle:()=>I(!P),sendMessage:R,destroy:()=>{F||(F=!0,r.remove())}}}});