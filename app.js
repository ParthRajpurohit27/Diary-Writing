// Unlock animation frames: put PNGs named 001.png, 002.png... in the folders below, then set count.
const CFG={frames:{lift:{dir:'assets/unlock/lift/',count:0,fps:24},open:{dir:'assets/unlock/open/',count:0,fps:24}},covers:['ink','oxblood','forest','graphite','umber']};
const COL={ink:['#27396a','#0e1626'],oxblood:['#74222f','#2a0b11'],forest:['#2a5444','#0d1d17'],graphite:['#454955','#17181c'],umber:['#7a5532','#2b1b0e']};
const $=s=>document.querySelector(s),sleep=t=>new Promise(r=>setTimeout(r,t));
const h=(t,a={},...c)=>{const e=document.createElement(t);for(const k in a){if(k==='class')e.className=a[k];else if(k.startsWith('on'))e.addEventListener(k.slice(2),a[k]);else if(k==='html')e.innerHTML=a[k];else e.setAttribute(k,a[k])}c.flat().forEach(x=>e.append(x));return e};
const deb=(f,t)=>{let i;return()=>{clearTimeout(i);i=setTimeout(f,t)}};
const IC={plus:'M12 5v14M5 12h14',left:'M15 5l-7 7 7 7',menu:'M4 7h16M4 12h16M4 17h16',pen:'M4 20l4-1 11-11-3-3L5 16zM14 7l3 3',down:'M12 4v11M7 11l5 5 5-5M5 20h14',up:'M12 16V5M7 9l5-5 5 5M5 20h14',lock:'M6 11h12v9H6zM8 11V8a4 4 0 018 0v3',key:'M8 14a4 4 0 110-8 4 4 0 010 8zM11 11l9 9M16 16l-2 2',book:'M5 4h12a2 2 0 012 2v14H7a2 2 0 01-2-2zM5 18a2 2 0 012-2h12',trash:'M5 7h14M9 7V4h6v3M7 7l1 13h8l1-13',img:'M4 5h16v14H4zM4 16l5-5 4 4 3-3 4 4M15 9h.01',paper:'M12 3a9 9 0 109 9 7 7 0 01-9-9z',lines:'M4 8h16M4 12h16M4 16h16',topic:'M5 6h14M12 6v13M9 19h6',file:'M7 3h7l4 4v14H7zM14 3v5h5'};
const ico=n=>h('span',{class:'ic',html:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="${IC[n]}"/></svg>`});
const mount=n=>$('#app').replaceChildren(n);
const writer=()=>localStorage.getItem('writer_name')||'';
const fmtD=d=>new Date(d+'T12:00').toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});
document.body.append(h('div',{class:'made',html:'made with <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-8-5.3-8-11a4.5 4.5 0 018-2.8A4.5 4.5 0 0120 10c0 5.700-8 11-8 11z"/></svg> by <a href="https://parth27.vercel.app" target="_blank" rel="noopener">Parth Rajpurohit</a>'}));
function toast(t){const e=h('div',{class:'toast'},t);document.body.append(e);setTimeout(()=>e.remove(),2400)}
function confetti(x=innerWidth/2,y=innerHeight/2){const c=['#c9a961','#efe6d0','#d96b6b','#5fb3a1','#7a9be0'];for(let i=0;i<34;i++){const p=h('i',{class:'cf'}),a=Math.random()*6.28,d=80+Math.random()*170;p.style.cssText=`left:${x}px;top:${y}px;background:${c[i%5]};--dx:${Math.cos(a)*d}px;--dy:${Math.sin(a)*d-70}px;--r:${Math.random()*720}deg`;document.body.append(p);setTimeout(()=>p.remove(),1150)}}
function modal(title,...body){const m=h('div',{class:'mask',onclick:e=>{if(e.target===m)x()}},h('div',{class:'card'},h('h3',{},title),body));document.body.append(m);const x=()=>{m.classList.add('out');setTimeout(()=>m.remove(),250)};return x}
async function type(el,t,sp=42){el.textContent='';for(const ch of t){el.textContent+=ch;await sleep(sp)}}
const loadJs=u=>new Promise((res,rej)=>{const s=h('script',{src:u});s.onload=res;s.onerror=rej;document.head.append(s)});
// storage + crypto
const LS='diaries_v1',list=()=>JSON.parse(localStorage.getItem(LS)||'[]'),put=l=>localStorage.setItem(LS,JSON.stringify(l));
const b64=b=>{let s='';new Uint8Array(b).forEach(x=>s+=String.fromCharCode(x));return btoa(s)},ub=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
async function kd(pw,salt){const m=await crypto.subtle.importKey('raw',new TextEncoder().encode(pw),'PBKDF2',false,['deriveKey']);return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:250000,hash:'SHA-256'},m,{name:'AES-GCM',length:256},false,['encrypt','decrypt'])}
async function seal(){if(!S)return;const iv=crypto.getRandomValues(new Uint8Array(12));const ct=await crypto.subtle.encrypt({name:'AES-GCM',iv},S.key,new TextEncoder().encode(JSON.stringify(S.data)));S.rec.iv=b64(iv);S.rec.ct=b64(ct);const l=list(),i=l.findIndex(x=>x.id===S.rec.id);i<0?l.push(S.rec):l[i]=S.rec;try{put(l)}catch{toast('Storage is full. Remove a background image.')}}
async function openRec(r,pw){const key=await kd(pw,ub(r.salt));const pt=await crypto.subtle.decrypt({name:'AES-GCM',iv:ub(r.iv)},key,ub(r.ct));S={rec:r,key,data:JSON.parse(new TextDecoder().decode(pt)),i:0,edit:false}}
const newPage=()=>({id:crypto.randomUUID(),date:new Date().toISOString().slice(0,10),chapter:'',lines:[['',0]]});
let S=null;
// cover artwork
const cover=r=>h('div',{class:'cv c-'+r.cover},h('i',{class:'hinge'}),h('i',{class:'stitch'}),['tl','tr','bl','br'].map(c=>h('i',{class:'cn '+c})),h('div',{class:'plate'},h('b',{},r.name),h('u')),h('i',{class:'rib'}));
// welcome
async function Welcome(){const line=h('h2',{class:'wl'}),f=h('div',{class:'wf',hidden:''});
const inp=h('input',{placeholder:'your good name',maxlength:24,onkeydown:e=>{if(e.key==='Enter')ok()}});f.append(inp,h('button',{class:'pill',onclick:ok},'That is me'));
mount(h('div',{class:'welc'},line,f));
async function ok(){const v=inp.value.trim();if(!v){f.classList.add('shake');setTimeout(()=>f.classList.remove('shake'),450);return}localStorage.setItem('writer_name',v);f.hidden=true;confetti();await type(line,'Nice to meet you, '+v+'.');await sleep(1400);Lib()}
await type(line,'Hey there. Before we begin');await sleep(500);await type(line,'what should I call you?');f.hidden=false;inp.focus()}
function nameDlg(){const i=h('input',{value:writer(),maxlength:24});const c=modal('Your name',i,h('small',{},'This shows up on the first page of your PDF.'),h('button',{class:'pill',onclick:()=>{if(i.value.trim()){localStorage.setItem('writer_name',i.value.trim());c();Lib()}}},'Save'));i.focus()}
// library
function Lib(){S=null;const shelf=h('div',{class:'shelf'}),l=list();
l.forEach((r,i)=>shelf.append(h('button',{class:'sb',style:'--i:'+i,title:r.name,onclick:()=>Cover(r)},h('i',{class:'pe'}),h('i',{class:'pf'}),cover(r))));
shelf.append(h('button',{class:'sb nw',style:'--i:'+l.length,onclick:newDlg},ico('plus'),h('span',{},'New diary')));
mount(h('div',{class:'lib'},h('p',{class:'hi'},'Welcome back, ',h('b',{},writer()),h('button',{class:'ib sm',title:'Change name',onclick:nameDlg},ico('pen'))),h('h1',{},'Your diaries'),shelf,h('button',{class:'pill ghost',onclick:importDlg},ico('up'),'Import a backup')))}
function newDlg(){let cv='ink';const name=h('input',{placeholder:'Diary name',maxlength:26}),p1=h('input',{type:'password',placeholder:'Secret word (6+ characters)'}),p2=h('input',{type:'password',placeholder:'Repeat it'}),err=h('small',{style:'color:#e08a8a'});
const sw=h('div',{class:'sw'},CFG.covers.map(c=>h('button',{class:'c-'+c+(c===cv?' on':''),onclick:e=>{cv=c;sw.querySelectorAll('button').forEach(b=>b.classList.remove('on'));e.currentTarget.classList.add('on')}})));
const close=modal('New diary',name,sw,p1,p2,h('small',{},'There is no recovery. If the secret word is lost, the diary stays locked.'),err,h('button',{class:'pill',onclick:async()=>{
 if(!name.value.trim())return err.textContent='Give the diary a name.';if(p1.value.length<6)return err.textContent='The secret word needs 6 or more characters.';if(p1.value!==p2.value)return err.textContent='The two words do not match.';
 const salt=crypto.getRandomValues(new Uint8Array(16));S={rec:{id:crypto.randomUUID(),name:name.value.trim(),cover:cv,salt:b64(salt)},key:await kd(p1.value,salt),data:{pages:[newPage()],set:{paper:'light',rule:'lines'}},i:0};
 await seal();S=null;close();confetti();Lib()}},'Create diary'));name.focus()}
function importDlg(){const f=h('input',{type:'file',accept:'.json'});f.onchange=async()=>{try{const r=JSON.parse(await f.files[0].text());if(r.fmt!=='diary-v1'||!r.salt||!r.iv||!r.ct)throw 0;delete r.fmt;const l=list();if(l.some(x=>x.id===r.id))r.id=crypto.randomUUID();l.push(r);put(l);toast('Imported. Open it with its original secret word.');Lib()}catch{toast('That file is not a diary backup.')}};f.click()}
// cover + unlock
async function frames(k,img,b3){const c=CFG.frames[k];if(!c.count)return false;img.hidden=false;b3.style.visibility='hidden';for(let i=1;i<=c.count;i++){img.src=c.dir+String(i).padStart(3,'0')+'.png';await sleep(1000/c.fps)}return true}
function Cover(r){const b3=h('div',{class:'b3'},h('i',{class:'pe'}),h('i',{class:'pf'}),h('div',{class:'inner'}),h('div',{class:'cov'},h('div',{class:'ft'},cover(r)),h('div',{class:'bk'}),h('div',{class:'strap',html:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 018 0v3"/></svg>'})));
const fr=h('img',{class:'fr',hidden:'',alt:''}),msg=h('p',{class:'msg'},'Tap the diary to unbuckle it'),pw=h('input',{type:'password',placeholder:'secret word',autocomplete:'off',onkeydown:e=>{if(e.key==='Enter')go()}});
const form=h('div',{class:'pwf',hidden:''},pw,h('button',{class:'pill',onclick:go},ico('key'),'Unlock'));let st=0;
const stage=h('div',{class:'stage',onpointermove:e=>{if(st>1)return;const q=stage.getBoundingClientRect();b3.style.setProperty('--tx',((e.clientX-q.left)/q.width-.5)*14);b3.style.setProperty('--ty',-((e.clientY-q.top)/q.height-.5)*10)}},h('button',{class:'pill ghost sm back',onclick:Lib},ico('left'),'Library'),b3,fr,msg,form);
b3.onclick=async()=>{if(st)return;st=1;b3.classList.add('lift');await frames('lift',fr,b3);await sleep(700);msg.textContent='Say the secret word';form.hidden=false;pw.focus()};
async function go(){if(st>1)return;try{await openRec(r,pw.value)}catch{form.classList.add('shake');setTimeout(()=>form.classList.remove('shake'),500);msg.textContent='Not quite. Try again.';return}
st=2;form.hidden=true;msg.textContent='Welcome back.';confetti();b3.style.setProperty('--tx',0);b3.style.setProperty('--ty',0);if(!await frames('open',fr,b3)){b3.classList.add('open');await sleep(1600)}stage.classList.add('zoom');await sleep(750);Reader()}
mount(stage)}
// reader
function Reader(){const D=S.data,set=D.set;let busy=0;const cur=()=>D.pages[S.i],persist=deb(seal,700);
D.pages.forEach(p=>{if(!p.lines)p.lines=(p.text||'').split('\n').map(t=>[t,0])});
const ed=h('div',{class:'ed',contenteditable:'false',spellcheck:'false'}),dt=h('span',{class:'dt',onclick:()=>{if(S.edit&&dti.showPicker)dti.showPicker()}}),dti=h('input',{type:'date',class:'dti',onchange:()=>{if(dti.value){cur().date=dti.value;dt.firstChild.textContent=fmtD(dti.value);persist()}}}),chap=h('div',{class:'chap'}),pn=h('div',{class:'pn'}),bgi=h('img',{class:'bgi',alt:'',hidden:''});
dt.append(h('span'),ico('pen'));
const sheet=h('div',{class:'sheet'},bgi,h('div',{class:'pg'},h('div',{class:'mt'},dt,dti),chap,ed,pn)),pg=sheet.lastChild;
const read=()=>[...ed.childNodes].map(n=>[n.textContent,n.classList&&n.classList.contains('tp')?1:0]);
const blk=()=>{const s=getSelection();let n=s.anchorNode;if(!n||!ed.contains(n)||n===ed)return null;while(n.parentNode!==ed)n=n.parentNode;return n.nodeType===1?n:null};
const caret=n=>{const r=document.createRange();r.selectNodeContents(n);r.collapse(true);const s=getSelection();s.removeAllRanges();s.addRange(r)};
const fix=()=>{if(!ed.childNodes.length)ed.append(h('div',{},h('br')));[...ed.childNodes].forEach(n=>{if(n.nodeType===3||n.nodeName==='BR'){const d=h('div');n.replaceWith(d);d.append(n)}})};
ed.oninput=()=>{fix();cur().lines=read();persist()};
ed.onpaste=e=>{e.preventDefault();document.execCommand('insertText',false,e.clipboardData.getData('text/plain'))};
ed.onkeydown=e=>{const b=blk();if(e.key==='Enter'&&b&&b.classList.contains('tp')){e.preventDefault();const d=h('div',{},h('br'));b.after(d);caret(d);ed.oninput()}};
function topic(){let b=blk(),t;if(b&&!b.textContent.trim())t=b;else{t=h('div');b?b.after(t):ed.append(t)}t.className='tp';t.replaceChildren();ed.focus();caret(t);ed.oninput()}
const fi=h('input',{type:'file',accept:'image/*',hidden:'',onchange:()=>{const f=fi.files[0];if(!f)return;const im=new Image();im.onload=()=>{const k=Math.min(1,800/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=im.width*k;c.height=im.height*k;c.getContext('2d').drawImage(im,0,0,c.width,c.height);cur().img={src:c.toDataURL(f.type==='image/png'?'image/png':'image/jpeg',.82),o:30,s:60,x:50,y:50};img();persist()};im.src=URL.createObjectURL(f);fi.value=''}});
function img(){const m=cur().img;bgi.hidden=!m;sl.hidden=!m;if(!m)return;bgi.src=m.src;bgi.style.cssText=`left:${m.x}%;top:${m.y}%;width:${m.s}%;opacity:${m.o/100}`;sl.querySelectorAll('input').forEach(i=>i.value=m[i.dataset.k])}
const bt=(ic,f)=>{const s=h('span'),b=h('button',{class:'tbb',onpointerdown:e=>e.preventDefault(),onclick:f},ico(ic),s);b.s=s;return b};
const tp=bt('topic',topic),ib=bt('img',()=>fi.click());tp.s.textContent='Topic';ib.s.textContent='Image';
const pb=bt('paper',()=>{set.paper=set.paper==='dark'?'light':'dark';look();persist()}),rb=bt('lines',()=>{set.rule=set.rule==='plain'?'lines':'plain';look();persist()});
const rm=bt('trash',()=>{delete cur().img;img();persist()});rm.s.textContent='Remove';
const sl=h('div',{class:'sl',hidden:''},[['o','Fade',5,100],['s','Size',10,150],['x','Left / right',0,100],['y','Up / down',0,100]].map(a=>{const i=h('input',{type:'range',min:a[2],max:a[3],oninput:()=>{cur().img[a[0]]=+i.value;img();persist()}});i.dataset.k=a[0];return h('label',{},a[1],i)}),rm);
const tb=h('div',{class:'tb'},tp,ib,pb,rb,sl,fi);
function look(){sheet.className='sheet '+(set.paper==='dark'?'p-dark':'p-light');pg.className='pg '+(set.rule==='plain'?'r-plain':'r-lines');pb.s.textContent=set.paper==='dark'?'Dark paper':'Light paper';rb.s.textContent=set.rule==='plain'?'Plain':'Lines'}
function edit(){rd.classList.toggle('edit',S.edit);ed.contentEditable=S.edit?'true':'false';wb.lastChild.textContent=S.edit?'Done':'Write'}
function fill(){const p=cur();ed.replaceChildren(...(p.lines.length?p.lines:[['',0]]).map(l=>{const d=h('div');if(l[1])d.className='tp';if(l[0])d.textContent=l[0];else if(!l[1])d.append(h('br'));return d}));dt.firstChild.textContent=fmtD(p.date);dti.value=p.date;chap.textContent=p.chapter?'Chapter: '+p.chapter:'';chap.hidden=!p.chapter;pn.textContent=S.i+1;prev.disabled=S.i===0;img();look();edit()}
async function flip(n){if(busy||n<0||n>=D.pages.length)return;busy=1;const d=n>S.i?1:-1,o={fill:'forwards'};await sheet.animate([{transform:'none',opacity:1},{transform:`rotateY(${-78*d}deg)`,opacity:.1}],{duration:300,easing:'ease-in',...o}).finished;S.i=n;fill();await sheet.animate([{transform:`rotateY(${78*d}deg)`,opacity:.1},{transform:'none',opacity:1}],{duration:480,easing:'cubic-bezier(.34,1.4,.64,1)',...o}).finished;sheet.getAnimations().forEach(a=>a.cancel());busy=0}
const add=async(c)=>{const p=newPage();p.chapter=c||'';D.pages.splice(S.i+1,0,p);await seal();await flip(S.i+1)};
const arrow=d=>h('button',{class:'nx '+(d<0?'pv':'nxt'),title:d<0?'Previous page':'Next page',onclick:()=>d<0?flip(S.i-1):S.i<D.pages.length-1?flip(S.i+1):cur().lines.some(l=>l[0])?add():toast('Write something first.'),html:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="${d<0?'M13 6l-6 6 6 6M19 6l-6 6 6 6':'M5 6l6 6-6 6M11 6l6 6-6 6'}"/></svg>`});
const prev=arrow(-1),wb=h('button',{class:'pill sm',onclick:()=>{S.edit=!S.edit;edit();if(S.edit)ed.focus();else seal()}},ico('pen'),h('span'));
function chapDlg(){const t=h('input',{placeholder:'Chapter title'});const c=modal('New chapter',t,h('button',{class:'pill',onclick:()=>{if(t.value.trim()){c();add(t.value.trim())}}},'Start chapter'));t.focus()}
function del(){if(!confirm('Delete this page for good?'))return;D.pages.splice(S.i,1);if(!D.pages.length)D.pages.push(newPage());S.i=Math.min(S.i,D.pages.length-1);fill();seal()}
function exp(){h('a',{href:URL.createObjectURL(new Blob([JSON.stringify({fmt:'diary-v1',...S.rec})],{type:'application/json'})),download:S.rec.name.replace(/\W+/g,'_')+'.diary.json'}).click();toast('Encrypted backup saved')}
function menu(){const m=h('div',{class:'mask drw',onclick:e=>{if(e.target===m)x()}}),x=()=>{m.classList.add('out');setTimeout(()=>m.remove(),260)};
const act=(ic,t,s,f)=>h('button',{class:'mi',onclick:()=>{x();setTimeout(f,280)}},ico(ic),h('span',{},h('b',{},t),h('small',{},s)));
m.append(h('aside',{class:'dr'},h('h3',{},'Menu'),act('plus','New page','Add a page after this one',()=>add()),act('book','New chapter','Begin a chapter on a fresh page',chapDlg),act('file','Export as PDF','Cover, every page, thank you',pdf),act('down','Save a backup','Encrypted file you can import later',exp),act('lock','Lock the diary','Back to the library',()=>{S=null;Lib()}),act('trash','Delete this page','This cannot be undone',del),h('h4',{},'Jump to a page'),h('div',{class:'chips'},D.pages.map((p,i)=>h('button',{class:'chip'+(i===S.i?' on':'')+(p.chapter?' ch':''),title:p.chapter,onclick:()=>{x();flip(i)}},i+1)))));document.body.append(m)}
// PDF
function fit(x,t,max,size,font){do{x.font=font(size);size-=4}while(x.measureText(t).width>max&&size>20);}
function cvCanvas(W,H,end){const c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d'),[a,b]=COL[S.rec.cover],g=x.createLinearGradient(0,0,W,H);g.addColorStop(0,a);g.addColorStop(1,b);x.fillStyle=g;x.fillRect(0,0,W,H);
x.strokeStyle='#d8bd7f99';x.lineWidth=3;x.setLineDash([16,12]);x.strokeRect(W*.08,H*.05,W*.84,H*.9);x.setLineDash([]);x.fillStyle='#e9d398';x.textAlign='center';
if(end){x.font='600 190px Caveat, cursive';x.fillText('Thank you',W/2,H*.5);x.font='italic 50px "Cormorant Garamond", serif';x.fillText('for reading',W/2,H*.5+90)}
else{x.font='italic 56px "Cormorant Garamond", serif';x.fillText('Welcome to',W/2,H*.34);fit(x,S.rec.name,W*.68,130,s=>`600 ${s}px "Cormorant Garamond", serif`);x.fillText(S.rec.name,W/2,H*.34+150);x.font='italic 56px "Cormorant Garamond", serif';x.fillText('diary',W/2,H*.34+230);x.font='600 84px Caveat, cursive';x.fillText('written by '+(writer()||'me'),W/2,H*.68)}
return c}
async function pgCanvas(p,n,W,H){const dk=DD().set.paper==='dark',pl=DD().set.rule!=='plain',C={bg:dk?'#1b1e27':'#efe6d0',ink:dk?'#ddd6c4':'#26272f',rl:dk?'rgba(255,255,255,.09)':'rgba(111,138,160,.35)',bd:dk?'rgba(201,169,97,.35)':'rgba(138,122,90,.4)'};
const im=p.img?await new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.onerror=()=>r(null);i.src=p.img.src}):null;
const fs=W*.06,lh=fs*1.65,L=W*.12,R=W*.09,T=W*.12+W*.05,B=H-W*.11,mw=W-L-R,out=[];let c,x,y;
const mk=()=>{c=document.createElement('canvas');c.width=W;c.height=H;x=c.getContext('2d');x.fillStyle=C.bg;x.fillRect(0,0,W,H);
if(im){x.globalAlpha=p.img.o/100;const w=W*p.img.s/100,hh=w*im.height/im.width;x.drawImage(im,W*p.img.x/100-w/2,H*p.img.y/100-hh/2,w,hh);x.globalAlpha=1}
x.strokeStyle=C.bd;x.lineWidth=2;x.strokeRect(W*.036,W*.036,W*.928,H-W*.072);
if(pl){x.strokeStyle=C.rl;x.lineWidth=2;for(let yy=T+lh;yy<=B;yy+=lh){x.beginPath();x.moveTo(L-W*.02,yy);x.lineTo(W-R+W*.01,yy);x.stroke()}x.fillStyle='rgba(192,80,80,.3)';x.fillRect(W*.095,W*.036,2,H-W*.072)}
x.fillStyle=C.ink;x.globalAlpha=.8;x.textAlign='right';x.font=`${W*.038}px Caveat, cursive`;x.fillText(fmtD(p.date),W-R,W*.12);
if(p.chapter){x.textAlign='center';x.font=`${W*.042}px Caveat, cursive`;x.fillText('Chapter: '+p.chapter,W/2,W*.12+W*.05)}
x.globalAlpha=.5;x.textAlign='center';x.font=`${W*.036}px Caveat, cursive`;x.fillText(n,W/2,H-W*.055);x.globalAlpha=1;y=T;out.push(c)};
mk();
for(const [txt,tpc] of p.lines){const fz=tpc?fs*1.4:fs,hh=tpc?lh*2:lh,f=`${tpc?600:400} ${fz}px Caveat, cursive`;x.font=f;let cur='',ls=[];for(const w of (txt||'').split(' ')){const t=cur?cur+' '+w:w;if(x.measureText(t).width>mw&&cur){ls.push(cur);cur=w}else cur=t}ls.push(cur);
for(const ln of ls){if(y+hh>B+1)mk();x.font=f;x.fillStyle=C.ink;x.textAlign=tpc?'center':'left';x.fillText(ln,tpc?L+mw/2:L,y+hh*(tpc?.66:.72));y+=hh}}
return out}
const DD=()=>S.data;
async function pdf(){toast('Building your PDF…');try{if(!window.jspdf)await loadJs('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');await document.fonts.load('40px Caveat');await document.fonts.load('600 40px Caveat');
const W=1240,H=1754,doc=new window.jspdf.jsPDF({unit:'px',format:[W,H],orientation:'portrait',compress:true});let first=1;
const add=c=>{if(!first)doc.addPage([W,H],'portrait');first=0;doc.addImage(c.toDataURL('image/jpeg',.9),'JPEG',0,0,W,H)};
add(cvCanvas(W,H,0));for(let i=0;i<DD().pages.length;i++)for(const c of await pgCanvas(DD().pages[i],i+1,W,H))add(c);add(cvCanvas(W,H,1));
doc.save(S.rec.name.replace(/\W+/g,'_')+'.pdf');toast('PDF saved')}catch(e){console.error(e);toast('Could not build the PDF. Check your internet and try again.')}}
const rd=h('div',{class:'rd'},h('div',{class:'bar'},h('button',{class:'ib',title:'Lock',onclick:()=>{if(S.edit)seal();S=null;Lib()}},ico('lock')),h('div',{class:'t'},S.rec.name),wb,h('button',{class:'ib',title:'Menu',onclick:menu},ico('menu'))),h('div',{class:'desk'},prev,sheet,arrow(1)),tb);
document.onkeydown=e=>{if(!S||S.edit)return;if(e.key==='ArrowRight')arrow(1).click();if(e.key==='ArrowLeft')flip(S.i-1)};
mount(rd);fill()}
writer()?Lib():Welcome();
