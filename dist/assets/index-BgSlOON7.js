(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))s(n);new MutationObserver(n=>{for(const o of n)if(o.type==="childList")for(const a of o.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&s(a)}).observe(document,{childList:!0,subtree:!0});function t(n){const o={};return n.integrity&&(o.integrity=n.integrity),n.referrerPolicy&&(o.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?o.credentials="include":n.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function s(n){if(n.ep)return;n.ep=!0;const o=t(n);fetch(n.href,o)}})();function C(r){return JSON.parse(JSON.stringify(r))}function q(r){const e=[...r];for(let t=e.length-1;t>0;t--){const s=Math.floor(Math.random()*(t+1));[e[t],e[s]]=[e[s],e[t]]}return e}function A(r){const e=[];return(!r.title||typeof r.title!="string")&&e.push("Quiz must have a title (string)"),!r.questions||!Array.isArray(r.questions)||r.questions.length===0?e.push("Quiz must have at least one question"):r.questions.forEach((t,s)=>{var n,o;t.id||e.push(`Question ${s+1}: missing id`),(!t.type||!["multiple_choice","multiple_select","open_ended"].includes(t.type))&&e.push(`Question ${t.id||s+1}: invalid type (must be multiple_choice, multiple_select, or open_ended)`),(!t.question||typeof t.question!="string")&&e.push(`Question ${t.id||s+1}: missing question text`),t.type==="multiple_choice"&&((!Array.isArray(t.options)||t.options.length<2)&&e.push(`Question ${t.id}: multiple_choice needs at least 2 options`),(typeof t.correct!="number"||t.correct<0||t.correct>=(((n=t.options)==null?void 0:n.length)||0))&&e.push(`Question ${t.id}: correct index out of bounds`)),t.type==="multiple_select"&&((!Array.isArray(t.options)||t.options.length<2)&&e.push(`Question ${t.id}: multiple_select needs at least 2 options`),(!Array.isArray(t.correct)||t.correct.length===0)&&e.push(`Question ${t.id}: multiple_select needs correct array with at least one index`),(o=t.correct)==null||o.forEach(a=>{var l;(typeof a!="number"||a<0||a>=(((l=t.options)==null?void 0:l.length)||0))&&e.push(`Question ${t.id}: correct index ${a} out of bounds`)})),t.type==="open_ended"&&(!Array.isArray(t.expected_keywords)||t.expected_keywords.length===0)&&e.push(`Question ${t.id}: open_ended needs expected_keywords array`)}),{valid:e.length===0,errors:e}}function _(r,e){if(!r||!(e!=null&&e.length))return{matched:[],missing:e||[]};const t=r.toLowerCase(),s=[],n=[];return e.forEach(o=>{const a=o.toLowerCase();t.includes(a)||t.split(/\W+/).some(c=>c.includes(a)||a.includes(c))?s.push(o):n.push(o)}),{matched:s,missing:n}}function b(r,e){return e===0?0:Math.round(r/e*100)}const u={get(r,e=null){try{const t=localStorage.getItem(r);return t?JSON.parse(t):e}catch{return e}},set(r,e){try{return localStorage.setItem(r,JSON.stringify(e)),!0}catch{return!1}},remove(r){try{return localStorage.removeItem(r),!0}catch{return!1}}};function g(r,e="info",t=3e3){const s=L(),n=document.createElement("div");return n.className=`toast ${e}`,n.innerHTML=`
    <span>${r}</span>
    <button class="btn btn-ghost btn-sm" aria-label="Cerrar">✕</button>
  `,n.querySelector("button").addEventListener("click",()=>n.remove()),s.appendChild(n),t>0&&setTimeout(()=>n.remove(),t),n}function L(){let r=document.querySelector(".toast-container");return r||(r=document.createElement("div"),r.className="toast-container",document.body.appendChild(r)),r}function T(r){return new Promise((e,t)=>{const s=new FileReader;s.onload=n=>{try{const o=n.target.result,a=JSON.parse(o);e(a)}catch(o){t(new Error("Archivo JSON inválido: "+o.message))}},s.onerror=()=>t(new Error("Error al leer el archivo")),s.readAsText(r)})}const O=Object.freeze(Object.defineProperty({__proto__:null,calculateScore:b,createToast:g,deepClone:C,matchKeywords:_,parseQuizFile:T,shuffleArray:q,storage:u,validateQuiz:A},Symbol.toStringTag,{value:"Module"})),M="modulepreload",N=function(r){return"/"+r},x={},P=function(e,t,s){let n=Promise.resolve();if(t&&t.length>0){document.getElementsByTagName("link");const a=document.querySelector("meta[property=csp-nonce]"),l=(a==null?void 0:a.nonce)||(a==null?void 0:a.getAttribute("nonce"));n=Promise.allSettled(t.map(c=>{if(c=N(c),c in x)return;x[c]=!0;const d=c.endsWith(".css"),v=d?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${c}"]${v}`))return;const h=document.createElement("link");if(h.rel=d?"stylesheet":M,d||(h.as="script"),h.crossOrigin="",h.href=c,l&&h.setAttribute("nonce",l),document.head.appendChild(h),d)return new Promise((m,R)=>{h.addEventListener("load",m),h.addEventListener("error",()=>R(new Error(`Unable to preload CSS for ${c}`)))})}))}function o(a){const l=new Event("vite:preloadError",{cancelable:!0});if(l.payload=a,window.dispatchEvent(l),!l.defaultPrevented)throw a}return n.then(a=>{for(const l of a||[])l.status==="rejected"&&o(l.reason);return e().catch(o)})};class H{static parse(e){const t=C(e);t.questions=t.questions.map((n,o)=>({...n,id:n.id||`q${o+1}`,type:n.type||"multiple_choice"}));const s=A(t);if(!s.valid)throw new Error(`Quiz inválido:
${s.errors.join(`
`)}`);return t.questions=t.questions.map(n=>({...n,explanation:n.explanation||"",points:n.points||1})),t}static async loadFromFile(e){const{parseQuizFile:t}=await P(async()=>{const{parseQuizFile:n}=await Promise.resolve().then(()=>O);return{parseQuizFile:n}},void 0),s=await t(e);return this.parse(s)}static async loadFromUrl(e){const t=await fetch(e);if(!t.ok)throw new Error(`Error cargando quiz: ${t.status}`);const s=await t.json();return this.parse(s)}}const p={CURRENT_QUIZ:"repasos_current_quiz",QUIZ_PROGRESS:"repasos_quiz_progress",QUIZ_ANSWERS:"repasos_quiz_answers",QUIZ_HISTORY:"repasos_quiz_history",SETTINGS:"repasos_settings"};class f{static saveQuiz(e){u.set(p.CURRENT_QUIZ,e)}static loadQuiz(){return u.get(p.CURRENT_QUIZ)}static clearQuiz(){u.remove(p.CURRENT_QUIZ),u.remove(p.QUIZ_PROGRESS),u.remove(p.QUIZ_ANSWERS)}static saveProgress(e,t){u.set(p.QUIZ_PROGRESS,{currentQuestionIndex:e,totalQuestions:t,timestamp:Date.now()})}static loadProgress(){return u.get(p.QUIZ_PROGRESS)}static saveAnswers(e){u.set(p.QUIZ_ANSWERS,e)}static loadAnswers(){return u.get(p.QUIZ_ANSWERS,{})}static saveResult(e){const t=u.get(p.QUIZ_HISTORY,[]);t.unshift({...e,timestamp:Date.now()}),u.set(p.QUIZ_HISTORY,t.slice(0,50))}static loadHistory(){return u.get(p.QUIZ_HISTORY,[])}static saveSettings(e){const t=u.get(p.SETTINGS,{});u.set(p.SETTINGS,{...t,...e})}static loadSettings(){return u.get(p.SETTINGS,{shuffleQuestions:!1,showExplanationImmediately:!1,timerEnabled:!1,timerDuration:0})}}class F{constructor(e){this.onQuizLoad=e,this.element=null,this.dragCounter=0}render(){return this.element=document.createElement("section"),this.element.className="card",this.element.innerHTML=`
      <div class="drop-zone" id="dropZone">
        <svg class="drop-zone-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
        </svg>
        <h2 class="drop-zone-title">Arrastra tu quiz aquí</h2>
        <p class="drop-zone-desc">O haz clic para seleccionar un archivo <strong>.json</strong></p>
        <p class="drop-zone-formats">Formatos: JSON con estructura de quiz (ver ejemplo abajo)</p>
        <input type="file" id="fileInput" class="sr-only" accept=".json" aria-label="Seleccionar archivo quiz">
      </div>

      <details class="mt-3" style="border: 1px solid var(--color-border); border-radius: var(--radius); overflow: hidden;">
        <summary style="padding: 0.75rem 1rem; background: var(--color-bg); cursor: pointer; font-weight: 500;">
          Ver estructura de archivo JSON esperada
        </summary>
        <pre style="padding: 1rem; overflow-x: auto; font-size: 0.75rem; line-height: 1.5; background: var(--color-bg);"><code id="jsonExample"></code></pre>
      </details>
    `,this.bindEvents(),this.renderJsonExample(),this.element}bindEvents(){const e=this.element.querySelector("#dropZone"),t=this.element.querySelector("#fileInput");e.addEventListener("click",()=>t.click()),["dragenter","dragover"].forEach(s=>{e.addEventListener(s,n=>{n.preventDefault(),n.stopPropagation(),this.dragCounter++,e.classList.add("drag-over")})}),["dragleave","drop"].forEach(s=>{e.addEventListener(s,n=>{if(n.preventDefault(),n.stopPropagation(),s==="dragleave")this.dragCounter--,this.dragCounter===0&&e.classList.remove("drag-over");else{this.dragCounter=0,e.classList.remove("drag-over");const o=n.dataTransfer.files[0];o&&this.handleFile(o)}})}),t.addEventListener("change",s=>{const n=s.target.files[0];n&&this.handleFile(n),t.value=""})}async handleFile(e){if(!e.name.endsWith(".json")){g("Por favor selecciona un archivo .json","error");return}try{g("Cargando quiz...","info",0);const t=await H.loadFromFile(e);f.saveQuiz(t),f.clearQuiz(),g(`Quiz "${t.title}" cargado correctamente`,"success"),this.onQuizLoad(t)}catch(t){g(`Error: ${t.message}`,"error"),console.error(t)}}renderJsonExample(){const e={title:"Mi Examen de Repaso",description:"Descripción opcional del quiz",questions:[{id:"q1",type:"multiple_choice",question:"¿Cuál es la capital de Francia?",options:["Madrid","París","Roma","Berlín"],correct:1,explanation:"París es la capital y ciudad más poblada de Francia.",points:1},{id:"q2",type:"multiple_select",question:"Selecciona los planetas del sistema solar:",options:["Marte","Sirio","Júpiter","Alpha Centauri"],correct:[0,2],explanation:"Marte y Júpiter son planetas de nuestro sistema solar. Sirio y Alpha Centauri son estrellas.",points:2},{id:"q3",type:"open_ended",question:"Explica qué es la fotosíntesis",expected_keywords:["plantas","luz","dióxido de carbono","oxígeno","clorofila","glucosa"],explanation:"La fotosíntesis es el proceso por el cual las plantas convierten luz, CO2 y agua en glucosa y oxígeno usando clorofila.",points:3}]};this.element.querySelector("#jsonExample").textContent=JSON.stringify(e,null,2)}destroy(){var e;(e=this.element)==null||e.remove(),this.element=null}}class ${constructor(e,t,s,n={}){this.question=e,this.userAnswer=t,this.onAnswerChange=s,this.showFeedback=n.showFeedback||!1,this.isReview=n.isReview||!1,this.element=null}render(){this.element=document.createElement("article"),this.element.className="question-card card",this.element.dataset.questionId=this.question.id;const e=this.renderHeader(),t=this.renderContent(),s=this.showFeedback||this.isReview?this.renderFeedback():"";return this.element.innerHTML=`${e}${t}${s}`,this.bindEvents(),this.element}renderHeader(){const e={multiple_choice:"Opción única",multiple_select:"Múltiple selección",open_ended:"Respuesta abierta"};return`
      <div class="question-header">
        <div class="question-number">${this.question._index||""}</div>
        <div style="flex: 1;">
          <p class="question-text">${this.escapeHtml(this.question.question)}</p>
          <span class="question-type-badge">${e[this.question.type]}</span>
        </div>
      </div>
    `}renderContent(){switch(this.question.type){case"multiple_choice":return this.renderMultipleChoice();case"multiple_select":return this.renderMultipleSelect();case"open_ended":return this.renderOpenEnded();default:return'<p class="text-muted">Tipo de pregunta no soportado</p>'}}renderMultipleChoice(){return`
      <div class="options-list" role="radiogroup" aria-label="Opciones de respuesta">
        ${this.question.options.map((e,t)=>`
          <label class="option-item ${this.getOptionClass("multiple_choice",t)}" data-index="${t}" tabindex="0" role="radio" aria-checked="${this.userAnswer===t}">
            <span class="option-radio" aria-hidden="true"></span>
            <span class="option-text">${this.escapeHtml(e)}</span>
            ${this.renderOptionFeedback("multiple_choice",t)}
          </label>
        `).join("")}
      </div>
    `}renderMultipleSelect(){return`
      <div class="options-list" role="group" aria-label="Opciones de respuesta (múltiple)">
        ${this.question.options.map((e,t)=>{const s=Array.isArray(this.userAnswer)&&this.userAnswer.includes(t);return`
            <label class="option-item ${this.getOptionClass("multiple_select",t)}" data-index="${t}" tabindex="0" role="checkbox" aria-checked="${s}">
              <span class="option-checkbox" aria-hidden="true"></span>
              <span class="option-text">${this.escapeHtml(e)}</span>
              ${this.renderOptionFeedback("multiple_select",t)}
            </label>
          `}).join("")}
      </div>
    `}renderOpenEnded(){const e=this.userAnswer||"";return`
      <div class="form-group">
        <textarea
          class="textarea open-ended-textarea"
          id="answer-${this.question.id}"
          placeholder="Escribe tu respuesta aquí..."
          aria-label="Tu respuesta"
          ${this.isReview?"readonly":""}
        >${this.escapeHtml(e)}</textarea>
        ${this.renderKeywordsFeedback()}
      </div>
    `}getOptionClass(e,t){if(!this.showFeedback&&!this.isReview)return(e==="multiple_choice"?this.userAnswer===t:Array.isArray(this.userAnswer)&&this.userAnswer.includes(t))?"selected":"";if(e==="multiple_choice")return t===this.question.correct?"correct":this.userAnswer===t?"incorrect":"";{const s=this.question.correct.includes(t),n=Array.isArray(this.userAnswer)&&this.userAnswer.includes(t);return s&&n?"correct":!s&&n?"incorrect":s&&!n?"correct":""}}renderOptionFeedback(e,t){if(!this.showFeedback&&!this.isReview)return"";if(e==="multiple_choice"){if(t===this.question.correct)return'<span class="option-feedback correct">✓ Correcta</span>';if(this.userAnswer===t)return'<span class="option-feedback incorrect">✗ Incorrecta</span>'}else{const s=this.question.correct.includes(t),n=Array.isArray(this.userAnswer)&&this.userAnswer.includes(t);if(s&&n)return'<span class="option-feedback correct">✓ Correcta</span>';if(!s&&n)return'<span class="option-feedback incorrect">✗ Incorrecta</span>';if(s&&!n)return'<span class="option-feedback correct">✓ Correcta (no seleccionada)</span>'}return""}renderKeywordsFeedback(){if(!this.isReview||this.question.type!=="open_ended")return"";const{matchKeywords:e}=require("../utils/helpers.js"),{matched:t,missing:s}=e(this.userAnswer||"",this.question.expected_keywords);return t.length===0&&s.length===0?"":`
      <div class="explanation-box" style="margin-top: 1rem;">
        <div class="explanation-title">🔍 Palabras clave:</div>
        <div class="keywords-list">
          ${t.map(n=>`<span class="keyword-tag found">${this.escapeHtml(n)} ✓</span>`).join("")}
          ${s.map(n=>`<span class="keyword-tag missing">${this.escapeHtml(n)} ✗</span>`).join("")}
        </div>
      </div>
    `}renderFeedback(){return this.question.explanation?`
      <div class="explanation-box">
        <div class="explanation-title">💡 Explicación:</div>
        <div class="explanation-content">${this.escapeHtml(this.question.explanation)}</div>
      </div>
    `:""}bindEvents(){if(this.isReview)return;const e=this.element;if(this.question.type==="multiple_choice")e.querySelectorAll(".option-item").forEach(t=>{t.addEventListener("click",()=>{const s=parseInt(t.dataset.index,10);this.onAnswerChange(this.question.id,s)}),t.addEventListener("keydown",s=>{(s.key==="Enter"||s.key===" ")&&(s.preventDefault(),t.click())})});else if(this.question.type==="multiple_select")e.querySelectorAll(".option-item").forEach(t=>{t.addEventListener("click",()=>{const s=parseInt(t.dataset.index,10),n=Array.isArray(this.userAnswer)?[...this.userAnswer]:[],o=n.includes(s)?n.filter(a=>a!==s):[...n,s];this.onAnswerChange(this.question.id,o)}),t.addEventListener("keydown",s=>{(s.key==="Enter"||s.key===" ")&&(s.preventDefault(),t.click())})});else if(this.question.type==="open_ended"){const t=e.querySelector(`#answer-${this.question.id}`);t&&t.addEventListener("input",U(()=>{this.onAnswerChange(this.question.id,t.value)},300))}}update(e,t,s={}){var n;this.question=e,this.userAnswer=t,this.showFeedback=s.showFeedback||!1,this.isReview=s.isReview||!1,this.element.outerHTML=this.render().outerHTML,this.element=(n=this.element.parentElement)==null?void 0:n.querySelector(`[data-question-id="${this.question.id}"]`)}escapeHtml(e){const t=document.createElement("div");return t.textContent=e,t.innerHTML}destroy(){var e;(e=this.element)==null||e.remove(),this.element=null}}function U(r,e){let t;return(...s)=>{clearTimeout(t),t=setTimeout(()=>r(...s),e)}}class j{constructor(e,t,s){this.totalQuestions=e,this.currentIndex=t,this.answeredCount=s,this.element=null}render(){return this.element=document.createElement("div"),this.element.className="panel",this.element.innerHTML=this.renderHtml(),this.element}renderHtml(){const e=this.totalQuestions>0?Math.round((this.currentIndex+1)/this.totalQuestions*100):0;return`
      <div class="progress-bar" role="progressbar" aria-valuenow="${e}" aria-valuemin="0" aria-valuemax="100" aria-label="Progreso del quiz">
        <div class="progress-fill" style="width: ${e}%"></div>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--color-text-muted);">
        <span>Pregunta ${this.currentIndex+1} de ${this.totalQuestions}</span>
        <span>${this.answeredCount}/${this.totalQuestions} respondidas</span>
      </div>
    `}update(e,t,s){if(this.totalQuestions=e,this.currentIndex=t,this.answeredCount=s,this.element){const n=this.totalQuestions>0?Math.round((this.currentIndex+1)/this.totalQuestions*100):0,o=this.element.querySelector(".progress-fill"),a=this.element.querySelectorAll("span");o&&(o.style.width=`${n}%`),a[0]&&(a[0].textContent=`Pregunta ${this.currentIndex+1} de ${this.totalQuestions}`),a[1]&&(a[1].textContent=`${this.answeredCount}/${this.totalQuestions} respondidas`),this.element.querySelector(".progress-bar").setAttribute("aria-valuenow",n)}}destroy(){var e;(e=this.element)==null||e.remove(),this.element=null}}class I{static scoreAnswer(e,t){switch(e.type){case"multiple_choice":return this.scoreMultipleChoice(e,t);case"multiple_select":return this.scoreMultipleSelect(e,t);case"open_ended":return this.scoreOpenEnded(e,t);default:return{correct:!1,points:0,details:{}}}}static scoreMultipleChoice(e,t){const s=t===e.correct;return{correct:s,points:s?e.points:0,details:{userAnswer:t,correctAnswer:e.correct,type:"multiple_choice"}}}static scoreMultipleSelect(e,t){Array.isArray(t)||(t=[]);const s=new Set(e.correct),n=new Set(t),o=e.correct.every(m=>n.has(m)),a=t.every(m=>s.has(m)),l=o&&a,c=e.correct.length,d=e.correct.filter(m=>n.has(m)).length,v=t.filter(m=>!s.has(m)).length,h=c>0?(d-v)/c:0;return{correct:l,partial:Math.max(0,h),points:l?e.points:Math.round(e.points*Math.max(0,h)),details:{userAnswer:t,correctAnswer:e.correct,correctSelected:d,incorrectSelected:v,type:"multiple_select"}}}static scoreOpenEnded(e,t){const{matched:s,missing:n}=_(t||"",e.expected_keywords),o=e.expected_keywords.length,a=s.length,l=o>0?a/o:0;return{correct:l>=.6,partial:l,points:Math.round(e.points*l),details:{userAnswer:t||"",matched:s,missing:n,totalKeywords:o,matchedCount:a,ratio:l,type:"open_ended"}}}static scoreQuiz(e,t){const s=e.questions.map(c=>{const d=t[c.id],v=this.scoreAnswer(c,d);return{questionId:c.id,...v}}),n=e.questions.reduce((c,d)=>c+d.points,0),o=s.reduce((c,d)=>c+(d.points||0),0),a=s.filter(c=>c.correct).length,l=s.filter(c=>c.details.userAnswer===void 0||c.details.userAnswer===""||Array.isArray(c.details.userAnswer)&&c.details.userAnswer.length===0).length;return{results:s,totalPoints:n,earnedPoints:o,correctCount:a,incorrectCount:s.length-a-l,skippedCount:l,percentage:b(o,n),passed:b(o,n)>=70}}}class Z{constructor(e,t,s,n){this.quiz=e,this.answers=t,this.onRestart=s,this.onLoadNew=n,this.scoredResult=I.scoreQuiz(e,t),this.element=null}render(){return this.element=document.createElement("section"),this.element.className="card",this.element.innerHTML=this.renderResults(),this.bindEvents(),this.element}renderResults(){const{correctCount:e,incorrectCount:t,skippedCount:s,percentage:n,passed:o,totalPoints:a,earnedPoints:l}=this.scoredResult;return`
      <div class="results-header">
        <h1 style="font-size: 1.5rem; margin-bottom: 0.5rem;">${this.quiz.title}</h1>
        <p class="text-muted">${this.quiz.description||""}</p>
        <div class="results-score">${n}%</div>
        <div class="mt-2" style="font-size: 1rem;">
          <span class="${o?"summary-correct":"summary-incorrect"}" style="font-weight: 600;">
            ${o?"✅ Aprobado":"❌ No aprobado"} (mínimo 70%)
          </span>
        </div>
      </div>

      <div class="results-summary">
        <div class="summary-item summary-correct">
          <div class="summary-value">${e}</div>
          <div class="summary-label">Correctas</div>
        </div>
        <div class="summary-item summary-incorrect">
          <div class="summary-value">${t}</div>
          <div class="summary-label">Incorrectas</div>
        </div>
        <div class="summary-item summary-skipped">
          <div class="summary-value">${s}</div>
          <div class="summary-label">Sin responder</div>
        </div>
        <div class="summary-item">
          <div class="summary-value">${l}/${a}</div>
          <div class="summary-label">Puntos</div>
        </div>
      </div>

      <div class="mt-3" style="display: flex; gap: 0.75rem; flex-wrap: wrap; justify-content: center;">
        <button class="btn btn-primary" id="btnRestart" type="button">🔄 Reintentar este quiz</button>
        <button class="btn btn-secondary" id="btnNewQuiz" type="button">📂 Cargar otro quiz</button>
      </div>

      <hr style="margin: 2rem 0; border-color: var(--color-border);">

      <h2 style="margin-bottom: 1.5rem; font-size: 1.25rem;">📋 Revisión detallada</h2>

      <div id="questionsReview">
        ${this.scoredResult.results.map((c,d)=>this.renderQuestionReview(c,d)).join("")}
      </div>
    `}renderQuestionReview(e,t){const s=this.quiz.questions.find(d=>d.id===e.questionId);if(!s)return"";const n=e.correct?"correct":e.details.userAnswer===void 0||e.details.userAnswer===""||Array.isArray(e.details.userAnswer)&&e.details.userAnswer.length===0?"skipped":"incorrect",o=e.correct?"✓":n==="skipped"?"⊘":"✗",a={multiple_choice:"Opción única",multiple_select:"Múltiple selección",open_ended:"Respuesta abierta"},c=new $({...s,_index:t+1},e.details.userAnswer,()=>{},{showFeedback:!0,isReview:!0}).render().outerHTML;return`
      <article class="question-review" data-question-id="${s.id}">
        <div class="question-review-header">
          <div class="review-status ${n}" aria-label="${n}">${o}</div>
          <h3 style="flex: 1; font-size: 1rem;">${this.escapeHtml(s.question)}</h3>
          <span class="review-type-badge">${a[s.type]}</span>
        </div>
        ${c}
      </article>
    `}bindEvents(){var e,t;(e=this.element.querySelector("#btnRestart"))==null||e.addEventListener("click",()=>{this.onRestart()}),(t=this.element.querySelector("#btnNewQuiz"))==null||t.addEventListener("click",()=>{this.onLoadNew()})}escapeHtml(e){const t=document.createElement("div");return t.textContent=e,t.innerHTML}destroy(){var e;(e=this.element)==null||e.remove(),this.element=null}}const i={quiz:null,questions:[],currentIndex:0,answers:{},settings:{},mode:"loading",components:{}},w=document.getElementById("app");function B(){const r=document.createElement("header");return r.className="app-header",r.innerHTML=`
    <div class="header-content">
      <h1 class="app-title">📝 Repasos Simulator</h1>
      <div id="headerActions" style="display: flex; gap: 0.5rem; align-items: center;"></div>
    </div>
  `,r}function J(){const r=document.createElement("main");return r.className="app-main",r.id="mainContent",r}function D(){const r=document.createElement("footer");return r.className="app-footer",r.innerHTML=`
    <p>Repasos Simulator — Lightweight quiz app for exam prep. Built with vanilla JS + Vite.</p>
  `,r}function G(){w.innerHTML="",w.appendChild(B()),w.appendChild(J()),w.appendChild(D())}function z(){const r=document.getElementById("mainContent");r.innerHTML="";const e=new F(V);i.components.loader=e,r.appendChild(e.render()),S([])}function y(){const r=document.getElementById("mainContent");r.innerHTML="";const e=Object.keys(i.answers).length,t=new j(i.questions.length,i.currentIndex,e);i.components.progressBar=t,r.appendChild(t.render());const s=i.questions[i.currentIndex],n=new $({...s,_index:i.currentIndex+1},i.answers[s.id],Y,{showFeedback:i.settings.showExplanationImmediately});i.components.questionCard=n,r.appendChild(n.render());const o=document.createElement("div");o.className="quiz-nav",o.innerHTML=`
    <div class="nav-progress">
      ${i.settings.showExplanationImmediately?'<span style="color: var(--color-accent);">💡 Modo estudio: explicación inmediata</span>':""}
    </div>
    <div class="nav-actions">
      <button class="btn btn-secondary btn-sm" id="btnPrev" type="button" ${i.currentIndex===0?"disabled":""}>
        ← Anterior
      </button>
      <button class="btn btn-primary btn-sm" id="btnNext" type="button">
        ${i.currentIndex===i.questions.length-1?"Finalizar":"Siguiente →"}
      </button>
    </div>
  `,r.appendChild(o),K(o),S([{label:"🔀 Reiniciar",variant:"secondary",onClick:k},{label:"📂 Cambiar quiz",variant:"ghost",onClick:E}])}function W(){const r=document.getElementById("mainContent");r.innerHTML="";const e=new Z(i.quiz,i.answers,k,E);i.components.resultsView=e,r.appendChild(e.render()),S([{label:"📂 Cargar otro quiz",variant:"ghost",onClick:E}]),f.saveResult({quizTitle:i.quiz.title,score:i.scoredResult.percentage,correct:i.scoredResult.correctCount,total:i.questions.length,date:new Date().toISOString()})}function V(r){i.quiz=r,i.questions=r.questions,i.settings=f.loadSettings(),i.settings.shuffleQuestions&&(i.questions=q(i.questions));const e=f.loadProgress(),t=f.loadAnswers();e&&e.totalQuestions===i.questions.length?(i.currentIndex=e.currentQuestionIndex,i.answers=t):(i.currentIndex=0,i.answers={}),i.mode="quiz",y()}function Y(r,e){var s,n;i.answers[r]=e,f.saveAnswers(i.answers),f.saveProgress(i.currentIndex,i.questions.length);const t=Object.keys(i.answers).length;if((s=i.components.progressBar)==null||s.update(i.questions.length,i.currentIndex,t),i.settings.showExplanationImmediately){const o=i.questions[i.currentIndex];(n=i.components.questionCard)==null||n.update({...o,_index:i.currentIndex+1},i.answers[o.id],{showFeedback:!0})}}function K(r){var e,t;(e=r.querySelector("#btnPrev"))==null||e.addEventListener("click",()=>{i.currentIndex>0&&(i.currentIndex--,y())}),(t=r.querySelector("#btnNext"))==null||t.addEventListener("click",()=>{i.currentIndex<i.questions.length-1?(i.currentIndex++,y()):Q()})}function Q(){i.scoredResult=I.scoreQuiz(i.quiz,i.answers),i.mode="results",W()}function k(){i.currentIndex=0,i.answers={},f.clearQuiz(),i.mode="quiz",y()}function E(){Object.values(i.components).forEach(r=>{var e;return(e=r==null?void 0:r.destroy)==null?void 0:e.call(r)}),i.components={},i.quiz=null,i.questions=[],i.currentIndex=0,i.answers={},i.mode="loading",z()}function S(r){const e=document.querySelector("#headerActions");e&&(e.innerHTML=r.map(t=>`
    <button class="btn btn-${t.variant} btn-sm" type="button">${t.label}</button>
  `).join(""),e.querySelectorAll("button").forEach((t,s)=>{t.addEventListener("click",r[s].onClick)}))}function X(){G(),z(),document.addEventListener("keydown",r=>{i.mode==="quiz"&&(r.key==="ArrowLeft"&&i.currentIndex>0?(r.preventDefault(),i.currentIndex--,y()):r.key==="ArrowRight"&&i.currentIndex<i.questions.length-1?(r.preventDefault(),i.currentIndex++,y()):r.key==="Enter"&&i.currentIndex===i.questions.length-1&&r.target.tagName!=="TEXTAREA"&&(r.preventDefault(),Q()))}),console.log("🎯 Repasos Simulator initialized")}X();
//# sourceMappingURL=index-BgSlOON7.js.map
