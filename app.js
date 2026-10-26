// Unlock animation frames: put PNGs named 001.png, 002.png... in the folders below, then set count.
const CFG={frames:{lift:{dir:'assets/unlock/lift/',count:0,fps:24},open:{dir:'assets/unlock/open/',count:0,fps:24}},covers:['sky','coral','mint','sun','rose']};
const COL={sky:['#5aa0e6','#2b64b3'],coral:['#f58a74','#c9473a'],mint:['#5cc4a6','#2a8672'],sun:['#f6c453','#d08a1a'],rose:['#ea8cb0','#b84d7a'],ink:['#27396a','#0e1626'],oxblood:['#74222f','#2a0b11'],forest:['#2a5444','#0d1d17'],graphite:['#454955','#17181c'],umber:['#7a5532','#2b1b0e']};
const $=s=>document.querySelector(s),sleep=t=>new Promise(r=>setTimeout(r,t));
const h=(t,a={},...c)=>{const e=document.createElement(t);for(const k in a){if(k==='class')e.className=a[k];else if(k.startsWith('on'))e.addEventListener(k.slice(2),a[k]);else if(k==='html')e.innerHTML=a[k];else e.setAttribute(k,a[k])}c.flat().forEach(x=>e.append(x));return e};
const deb=(f,t)=>{let i;return()=>{clearTimeout(i);i=setTimeout(f,t)}};
const IC={plus:'M12 5v14M5 12h14',left:'M15 5l-7 7 7 7',menu:'M4 7h16M4 12h16M4 17h16',pen:'M4 20l4-1 11-11-3-3L5 16zM14 7l3 3',down:'M12 4v11M7 11l5 5 5-5M5 20h14',up:'M12 16V5M7 9l5-5 5 5M5 20h14',lock:'M6 11h12v9H6zM8 11V8a4 4 0 018 0v3',key:'M8 14a4 4 0 110-8 4 4 0 010 8zM11 11l9 9M16 16l-2 2',book:'M5 4h12a2 2 0 012 2v14H7a2 2 0 01-2-2zM5 18a2 2 0 012-2h12',trash:'M5 7h14M9 7V4h6v3M7 7l1 13h8l1-13',img:'M4 5h16v14H4zM4 16l5-5 4 4 3-3 4 4M15 9h.01',paper:'M12 3a9 9 0 109 9 7 7 0 01-9-9z',lines:'M4 8h16M4 12h16M4 16h16',topic:'M5 6h14M12 6v13M9 19h6',file:'M7 3h7l4 4v14H7zM14 3v5h5',sound:'M4 9v6h4l5 4V5L8 9H4zM16.5 8.5a5 5 0 010 7',search:'M11 18a7 7 0 100-14 7 7 0 000 14zM21 21l-5-5',sun:'M12 17a5 5 0 100-10 5 5 0 000 10zM12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.4 1.4M17.6 17.6L19 19M5 19l1.4-1.4M17.6 6.4L19 5'};
const ico=n=>h('span',{class:'ic',html:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="${IC[n]}"/></svg>`});
const mount=n=>{const f=()=>$('#app').replaceChildren(n);document.startViewTransition?document.startViewTransition(f):f()};
const writer=()=>localStorage.getItem('writer_name')||'';
const cap=s=>s.replace(/(^|[\s-])(\p{L})/gu,(m,a,b)=>a+b.toUpperCase());
const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const FIX={i:'I',im:"I'm",ive:"I've",dont:"don't",cant:"can't",wont:"won't",didnt:"didn't",doesnt:"doesn't",isnt:"isn't",wasnt:"wasn't",couldnt:"couldn't",shouldnt:"shouldn't",wouldnt:"wouldn't",arent:"aren't",havent:"haven't",thats:"that's",whats:"what's",teh:'the',recieve:'receive',definately:'definitely',becuase:'because',tommorow:'tomorrow',untill:'until',thier:'their'};
const TAG={B:'b',STRONG:'b',I:'i',EM:'i',U:'u',S:'s',STRIKE:'s',DEL:'s',MARK:'mark'};
const tpl=html=>{const t=document.createElement('template');t.innerHTML=html;return t.content};
function san(n){let o='';n.childNodes.forEach(c=>{if(c.nodeType===3)o+=esc(c.textContent);else if(c.nodeName==='BR')o+='<br>';else if(c.nodeType===1){let t=TAG[c.nodeName];const inner=san(c),bg=c.nodeName==='SPAN'&&c.style&&c.style.backgroundColor;if(bg&&!/^(transparent|rgba\(0, 0, 0, 0\))$/.test(bg))t='mark';if(t)o+=`<${t}>${inner}</${t}>`;else if(c.nodeName==='DIV'||c.nodeName==='P')o+=`<div${c.classList.contains('tp')?' class="tp"':''}>${inner||'<br>'}</div>`;else o+=inner}});return o}
const fmtD=d=>new Date(d+'T12:00').toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});
document.body.append(h('div',{class:'made',html:'made with <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-8-5.3-8-11a4.5 4.5 0 018-2.8A4.5 4.5 0 0120 10c0 5.700-8 11-8 11z"/></svg> by <a href="https://parth27.vercel.app" target="_blank" rel="noopener">Parth Rajpurohit</a>'}));
const SPR={idle:[24,12,1],wave:[24,16,1],cheer:[30,24,0],sad:[20,20,0],sleep:[24,10,1]},COLS=6;
Object.keys(SPR).forEach(n=>{new Image().src='assets/mascot/'+n+'.png'});
function mascot(px=160,first='idle'){const el=h('div',{class:'mas'});el.style.width=el.style.height=px+'px';let raf,gen=0,seen=0;
 const set=(n,f)=>{const rows=Math.ceil(SPR[n][0]/COLS),c=f%COLS,r=Math.floor(f/COLS);el.style.backgroundImage=`url(assets/mascot/${n}.png)`;el.style.backgroundSize=`${COLS*100}% ${rows*100}%`;el.style.backgroundPosition=`${c/(COLS-1)*100}% ${rows>1?r/(rows-1)*100:0}%`};
 el.play=(n,back='idle',once)=>{cancelAnimationFrame(raf);const id=++gen,[N,fps,lp]=SPR[n],loop=lp&&!once;let f=0,t0=performance.now();set(n,0);
  const tick=now=>{if(id!==gen)return;if(el.isConnected)seen=1;else if(seen)return;const nf=Math.floor((now-t0)/1000*fps);if(nf!==f){f=nf;if(f>=N){if(loop){t0=now;f=0}else{if(back)el.play(back);return}}set(n,f)}raf=requestAnimationFrame(tick)};raf=requestAnimationFrame(tick)};
 el.play(first);return el}
let AC,mute=localStorage.getItem('mute')==='1';
function sfx(k){if(mute)return;try{AC=AC||new AudioContext();const t=AC.currentTime,N={pop:[[700,0,.07]],tap:[[520,0,.04]],flip:[[380,0,.05],[300,.04,.06]],ok:[[523,0,.1],[659,.09,.1],[784,.18,.2]],bad:[[240,0,.12],[190,.12,.22]]}[k];N.forEach(([f,s,d])=>{const o=AC.createOscillator(),g=AC.createGain();o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(.0001,t+s);g.gain.exponentialRampToValueAtTime(.1,t+s+.01);g.gain.exponentialRampToValueAtTime(.0001,t+s+d);o.connect(g);g.connect(AC.destination);o.start(t+s);o.stop(t+s+d+.02)})}catch{}}
addEventListener('pointerdown',e=>{if(e.target.closest&&e.target.closest('.pill,.mi,.sb,.chip,.tbb,.sty,.nx,.ib'))sfx('tap')});
function toast(t){const e=h('div',{class:'toast'},t);document.body.append(e);setTimeout(()=>e.remove(),2400)}
function confetti(x=innerWidth/2,y=innerHeight/2){const c=['#111113','#e8272d','#8a8a8e','#ffffff','#c9c9c2'];for(let i=0;i<34;i++){const p=h('i',{class:'cf'}),a=Math.random()*6.28,d=80+Math.random()*170;p.style.cssText=`left:${x}px;top:${y}px;background:${c[i%5]};--dx:${Math.cos(a)*d}px;--dy:${Math.sin(a)*d-70}px;--r:${Math.random()*720}deg`;document.body.append(p);setTimeout(()=>p.remove(),1150)}}
function modal(title,...body){const m=h('div',{class:'mask',onclick:e=>{if(e.target===m)x()}},h('div',{class:'card'},h('h3',{},title),body));document.body.append(m);const x=()=>{m.classList.add('out');setTimeout(()=>m.remove(),250)};return x}
async function type(el,t,sp=42){el.textContent='';for(const ch of t){el.textContent+=ch;await sleep(sp)}}
const loadJs=u=>new Promise((res,rej)=>{const s=h('script',{src:u});s.onload=res;s.onerror=rej;document.head.append(s)});
// storage + crypto
const LS='diaries_v1',list=()=>JSON.parse(localStorage.getItem(LS)||'[]'),put=l=>localStorage.setItem(LS,JSON.stringify(l));
const b64=b=>{let s='';new Uint8Array(b).forEach(x=>s+=String.fromCharCode(x));return btoa(s)},ub=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
async function kd(pw,salt){const m=await crypto.subtle.importKey('raw',new TextEncoder().encode(pw),'PBKDF2',false,['deriveKey']);return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:250000,hash:'SHA-256'},m,{name:'AES-GCM',length:256},false,['encrypt','decrypt'])}
async function seal(){if(!S)return;const iv=crypto.getRandomValues(new Uint8Array(12));const ct=await crypto.subtle.encrypt({name:'AES-GCM',iv},S.key,new TextEncoder().encode(JSON.stringify(S.data)));S.rec.iv=b64(iv);S.rec.ct=b64(ct);const l=list(),i=l.findIndex(x=>x.id===S.rec.id);i<0?l.push(S.rec):l[i]=S.rec;try{put(l)}catch{toast('Storage is full. Remove a background image.')}}
async function openRec(r,pw){const key=await kd(pw,ub(r.salt));const pt=await crypto.subtle.decrypt({name:'AES-GCM',iv:ub(r.iv)},key,ub(r.ct));S={rec:r,key,data:JSON.parse(new TextDecoder().decode(pt)),i:0,edit:false}}
const newPage=()=>({id:crypto.randomUUID(),date:new Date().toISOString().slice(0,10),chapter:'',html:'<div><br></div>'});
let S=null;
// cover artwork
const cover=r=>h('div',{class:'cv c-'+r.cover},h('i',{class:'hinge'}),h('i',{class:'stitch'}),['tl','tr','bl','br'].map(c=>h('i',{class:'cn '+c})),h('div',{class:'plate'},h('b',{},r.name),h('u')),h('i',{class:'rib'}));
// welcome
async function Welcome(){const line=h('h2',{class:'wl'}),m=mascot(250,'wave'),f=h('div',{class:'wf',hidden:''});
const inp=h('input',{placeholder:'your good name',maxlength:24,onkeydown:e=>{if(e.key==='Enter')ok()}});f.append(inp,h('button',{class:'pill',onclick:ok},'That is me'));
mount(h('div',{class:'welc'},m,h('div',{class:'bub up'},line),f));
async function ok(){const v=cap(inp.value.trim());if(!v){f.classList.add('shake');m.play('sad','idle');sfx('bad');setTimeout(()=>f.classList.remove('shake'),450);return}localStorage.setItem('writer_name',v);f.hidden=true;m.play('cheer','idle');sfx('ok');confetti();await type(line,'Nice to meet you, '+v+'.');await sleep(1700);Lib()}
await sleep(300);await type(line,'Hey there. Before we begin');await sleep(500);await type(line,'what should I call you?');m.play('idle');f.hidden=false;inp.focus()}
function sndBtn(){const b=h('button',{class:'pill ghost',onclick:()=>{mute=!mute;localStorage.setItem('mute',mute?'1':'0');b.lastChild.textContent=mute?'Sound off':'Sound on';sfx('pop')}},ico('sound'),h('span',{},mute?'Sound off':'Sound on'));return b}
function nameDlg(){const i=h('input',{value:writer(),maxlength:24});const c=modal('Your name',i,h('small',{},'This shows up on the first page of your PDF.'),h('button',{class:'pill',onclick:()=>{if(i.value.trim()){localStorage.setItem('writer_name',cap(i.value.trim()));c();Lib()}}},'Save'));i.focus()}
// library
function lhead(l){const m=mascot(160,justLocked?'sleep':'idle'),hr=new Date().getHours(),msg=justLocked?'Zzz… I locked up while you were away.':!l.length?'Let’s make your very first diary.':hr<5?'Burning the midnight oil?':hr<12?'Good morning. What’s on your mind?':hr<18?'Hey! Ready to write something?':'Good evening. How was your day?';justLocked=0;
m.onclick=()=>{m.play('wave','idle',1);sfx('pop')};return h('div',{class:'lhead'},m,h('div',{class:'bub lf'},h('b',{},'Hi, '+cap(writer())),h('span',{},msg),h('button',{class:'ib sm',title:'Change name',onclick:nameDlg},ico('pen'))))}
function Lib(){S=null;const shelf=h('div',{class:'shelf'}),l=list();
l.forEach((r,i)=>shelf.append(h('button',{class:'sb',style:'--i:'+i,title:r.name,onclick:()=>Cover(r)},h('i',{class:'pe'}),h('i',{class:'pf'}),cover(r))));
shelf.append(h('button',{class:'sb nw',style:'--i:'+l.length,onclick:newDlg},ico('plus'),h('span',{},'New diary')));
mount(h('div',{class:'lib'},lhead(l),h('h1',{},'Your diaries'),shelf,h('div',{class:'lrow'},installBtn(),sndBtn(),h('button',{class:'pill ghost',onclick:importDlg},ico('up'),'Import a backup'))))}
function newDlg(){let cv='sky';const name=h('input',{placeholder:'Diary name',maxlength:26}),p1=h('input',{type:'password',placeholder:'Secret word (6+ characters)'}),p2=h('input',{type:'password',placeholder:'Repeat it'}),err=h('small',{style:'color:#e08a8a'});
const sw=h('div',{class:'sw'},CFG.covers.map(c=>h('button',{class:'c-'+c+(c===cv?' on':''),onclick:e=>{cv=c;sw.querySelectorAll('button').forEach(b=>b.classList.remove('on'));e.currentTarget.classList.add('on')}})));
const close=modal('New diary',name,sw,p1,p2,h('small',{},'There is no recovery. If the secret word is lost, the diary stays locked.'),err,h('button',{class:'pill',onclick:async()=>{
 if(!name.value.trim())return err.textContent='Give the diary a name.';if(p1.value.length<6)return err.textContent='The secret word needs 6 or more characters.';if(p1.value!==p2.value)return err.textContent='The two words do not match.';
 const salt=crypto.getRandomValues(new Uint8Array(16));S={rec:{id:crypto.randomUUID(),name:cap(name.value.trim()),cover:cv,salt:b64(salt)},key:await kd(p1.value,salt),data:{pages:[newPage()],set:{paper:'light',rule:'lines',auto:true}},i:0};
 await seal();S=null;close();confetti();sfx('ok');Lib()}},'Create diary'));name.focus()}
function importDlg(){const f=h('input',{type:'file',accept:'.json'});f.onchange=async()=>{try{const r=JSON.parse(await f.files[0].text());if(r.fmt!=='diary-v1'||!r.salt||!r.iv||!r.ct)throw 0;delete r.fmt;const l=list();if(l.some(x=>x.id===r.id))r.id=crypto.randomUUID();l.push(r);put(l);toast('Imported. Open it with its original secret word.');Lib()}catch{toast('That file is not a diary backup.')}};f.click()}
// cover + unlock
async function frames(k,img,b3){const c=CFG.frames[k];if(!c.count)return false;img.hidden=false;b3.style.visibility='hidden';for(let i=1;i<=c.count;i++){img.src=c.dir+String(i).padStart(3,'0')+'.png';await sleep(1000/c.fps)}return true}
function Cover(r){const b3=h('div',{class:'b3'},h('i',{class:'pe'}),h('i',{class:'pf'}),h('div',{class:'inner'}),h('div',{class:'cov'},h('div',{class:'ft'},cover(r)),h('div',{class:'bk'}),h('div',{class:'strap',html:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 018 0v3"/></svg>'})));
const cm=mascot(140,'idle'),fr=h('img',{class:'fr',hidden:'',alt:''}),msg=h('p',{class:'msg'},'Tap the diary to open it up'),pw=h('input',{type:'password',placeholder:'secret word',autocomplete:'off',onkeydown:e=>{if(e.key==='Enter')go()}});
const form=h('div',{class:'pwf',hidden:''},pw,h('button',{class:'pill',onclick:go},ico('key'),'Unlock'));let st=0;
const stage=h('div',{class:'stage',onpointermove:e=>{if(st>1)return;const q=stage.getBoundingClientRect();b3.style.setProperty('--tx',((e.clientX-q.left)/q.width-.5)*14);b3.style.setProperty('--ty',-((e.clientY-q.top)/q.height-.5)*10)}},h('button',{class:'pill ghost sm back',onclick:Lib},ico('left'),'Library'),b3,fr,h('div',{class:'mrow'},cm,h('div',{class:'bub lf'},msg)),form);
b3.onclick=async()=>{if(st)return;st=1;b3.classList.add('lift');sfx('pop');cm.play('wave','idle',1);await frames('lift',fr,b3);await sleep(700);msg.textContent='Say the secret word';form.hidden=false;pw.focus()};
async function go(){if(st>1)return;try{await openRec(r,pw.value)}catch{form.classList.add('shake');setTimeout(()=>form.classList.remove('shake'),500);msg.textContent='Not quite. Try again.';cm.play('sad','idle');sfx('bad');return}
st=2;form.hidden=true;msg.textContent='Welcome back!';cm.play('cheer','idle');sfx('ok');confetti();b3.style.setProperty('--tx',0);b3.style.setProperty('--ty',0);if(!await frames('open',fr,b3)){b3.classList.add('open');await sleep(1600)}stage.classList.add('zoom');await sleep(750);Reader()}
mount(stage)}
// reader
function Reader(){const D=S.data,set=D.set;let busy=0;const cur=()=>D.pages[S.i],sv=h('small',{},'Saved'),tt=h('div',{class:'t'},h('b',{},S.rec.name),sv),wc=()=>{const t=tpl(cur().html).textContent.trim();return t?t.split(/\s+/).length:0},dp=deb(async()=>{await seal();tt.classList.remove('sv');sv.textContent='Saved · '+wc()+' words'},700),persist=()=>{tt.classList.add('sv');sv.textContent='Saving…';dp()};
D.pages.forEach(p=>{if(p.html==null)p.html=(p.lines||[['',0]]).map(l=>`<div${l[1]?' class="tp"':''}>${l[0]?esc(l[0]):'<br>'}</div>`).join('')});if(set.auto==null)set.auto=true;
const ed=h('div',{class:'ed',contenteditable:'false',spellcheck:'false'}),dt=h('span',{class:'dt',onclick:()=>{if(S.edit&&dti.showPicker)dti.showPicker()}}),dti=h('input',{type:'date',class:'dti',onchange:()=>{if(dti.value){cur().date=dti.value;dt.firstChild.textContent=fmtD(dti.value);persist()}}}),chap=h('div',{class:'chap'}),pn=h('div',{class:'pn'}),bgi=h('img',{class:'bgi',alt:'',hidden:''});
dt.append(h('span'),ico('pen'));
const sheet=h('div',{class:'sheet'},bgi,h('div',{class:'pg'},h('div',{class:'mt'},dt,dti),chap,ed,pn)),pg=sheet.lastChild;
let sx=0;sheet.addEventListener('pointerdown',e=>{sx=e.clientX});sheet.addEventListener('pointerup',e=>{if(S.edit)return;const dx=e.clientX-sx;if(Math.abs(dx)>60)dx<0?next():flip(S.i-1)});
const read=()=>san(ed),hasText=()=>cur().html.replace(/<[^>]*>/g,'').trim();
const blk=()=>{const s=getSelection();let n=s.anchorNode;if(!n||!ed.contains(n)||n===ed)return null;while(n.parentNode!==ed)n=n.parentNode;return n.nodeType===1?n:null};
const caret=n=>{const r=document.createRange();r.selectNodeContents(n);r.collapse(true);const s=getSelection();s.removeAllRanges();s.addRange(r)};
const fix=()=>{if(!ed.childNodes.length)ed.append(h('div',{},h('br')));[...ed.childNodes].forEach(n=>{if(n.nodeType===3||n.nodeName==='BR'){const d=h('div');n.replaceWith(d);d.append(n)}})};
ed.oninput=()=>{fix();cur().html=read();persist()};
ed.onpaste=e=>{e.preventDefault();document.execCommand('insertText',false,e.clipboardData.getData('text/plain'))};
ed.addEventListener('beforeinput',e=>{if(set.auto===false||e.inputType!=='insertText'||!e.data||e.data.length!==1||e.isComposing)return;const b=blk(),s=getSelection();if(!b||!s.isCollapsed)return;const r=document.createRange();r.selectNodeContents(b);r.setEnd(s.anchorNode,s.anchorOffset);const before=r.toString();
 if(/^[a-z]$/.test(e.data)&&(!before.trim()||/[.!?…]["'”)]*\s+$/.test(before))){e.preventDefault();document.execCommand('insertText',false,e.data.toUpperCase());return}
 if(/^[\s.,!?;:)]$/.test(e.data)){const m=/([A-Za-z]+)$/.exec(before);if(!m)return;const w=m[1];let f=FIX[w.toLowerCase()];if(!f)return;if(w[0]===w[0].toUpperCase()&&f[0]!=='I')f=f[0].toUpperCase()+f.slice(1);if(w===f)return;for(let k=0;k<w.length;k++)s.modify('extend','backward','character');document.execCommand('insertText',false,f)}});
ed.onkeydown=e=>{const b=blk();if(e.key==='Enter'&&b&&b.classList.contains('tp')){e.preventDefault();const d=h('div',{},h('br'));b.after(d);caret(d);ed.oninput()}};
function topic(){let b=blk(),t;if(b&&!b.textContent.trim())t=b;else{t=h('div');b?b.after(t):ed.append(t)}t.className='tp';t.replaceChildren();ed.focus();caret(t);ed.oninput()}
const fi=h('input',{type:'file',accept:'image/*',hidden:'',onchange:()=>{const f=fi.files[0];if(!f)return;const im=new Image();im.onload=()=>{const k=Math.min(1,800/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=im.width*k;c.height=im.height*k;c.getContext('2d').drawImage(im,0,0,c.width,c.height);cur().img={src:c.toDataURL(f.type==='image/png'?'image/png':'image/jpeg',.82),o:30,s:60,x:50,y:50};img();persist()};im.src=URL.createObjectURL(f);fi.value=''}});
function img(){const m=cur().img;bgi.hidden=!m;sl.hidden=!m;if(!m)return;bgi.src=m.src;bgi.style.cssText=`left:${m.x}%;top:${m.y}%;width:${m.s}%;opacity:${m.o/100}`;sl.querySelectorAll('input').forEach(i=>i.value=m[i.dataset.k])}
const bt=(ic,f)=>{const s=h('span'),b=h('button',{class:'tbb',onpointerdown:e=>e.preventDefault(),onclick:f},ico(ic),s);b.s=s;return b};
const tp=bt('topic',topic),ib=bt('img',()=>fi.click());tp.s.textContent='Topic';ib.s.textContent='Image';
const pb=bt('paper',()=>{set.paper=set.paper==='dark'?'light':'dark';look();persist()}),rb=bt('lines',()=>{set.rule=set.rule==='plain'?'lines':'plain';look();persist()});
const rm=bt('trash',()=>{delete cur().img;img();persist()});rm.s.textContent='Remove';
const sl=h('div',{class:'sl',hidden:''},[['o','Fade',5,100],['s','Image size',10,150],['x','Left / right',0,100],['y','Up / down',0,100]].map(a=>{const i=h('input',{type:'range',min:a[2],max:a[3],oninput:()=>{cur().img[a[0]]=+i.value;img();persist()}});i.dataset.k=a[0];return h('label',{},a[1],i)}),rm);
const sty=(cmd,label,cls)=>{const b=h('button',{class:'sty',title:cmd,onpointerdown:e=>e.preventDefault(),onclick:()=>{if(cmd==='hiliteColor'){const v=document.queryCommandValue('hiliteColor');document.execCommand('hiliteColor',false,v&&!/^(transparent|rgba\(0, 0, 0, 0\))$/.test(v)?'transparent':'#ffe27a')}else document.execCommand(cmd);ed.oninput();upd()}},h('span',{class:cls||''},label));b.cmd=cmd;return b};
const sbt=[sty('bold','B'),sty('italic','I','it'),sty('underline','U','un'),sty('strikeThrough','S','st'),sty('hiliteColor','A','hl')],au=h('button',{class:'sty',title:'Auto capital letters and small fixes',onpointerdown:e=>e.preventDefault(),onclick:()=>{set.auto=set.auto===false;upd();persist()}},h('span',{},'Aa'));
function upd(){sbt.forEach(b=>{let on=false;try{on=b.cmd==='hiliteColor'?!/^(transparent|rgba\(0, 0, 0, 0\)|)$/.test(document.queryCommandValue('hiliteColor')):document.queryCommandState(b.cmd)}catch{}b.classList.toggle('on',!!on)});au.classList.toggle('on',set.auto!==false)}
document.onselectionchange=()=>{if(S&&S.edit)upd()};
const tb=h('div',{class:'tb'},h('div',{class:'sr'},sbt,au),tp,ib,pb,rb,sl,fi);
function look(){sheet.className='sheet '+(set.paper==='dark'?'p-dark':'p-light');pg.className='pg '+(set.rule==='plain'?'r-plain':'r-lines');pb.s.textContent=set.paper==='dark'?'Dark paper':'Light paper';rb.s.textContent=set.rule==='plain'?'Plain':'Lines'}
function edit(){rd.classList.toggle('edit',S.edit);ed.contentEditable=S.edit?'true':'false';ed.spellcheck=!!S.edit;upd();wb.lastChild.textContent=S.edit?'Done':'Write'}
function fill(){const p=cur();ed.innerHTML=san(tpl(p.html))||'<div><br></div>';dt.firstChild.textContent=fmtD(p.date);dti.value=p.date;chap.textContent=p.chapter?'Chapter: '+p.chapter:'';chap.hidden=!p.chapter;pn.textContent=S.i+1;prev.disabled=S.i===0;img();look();edit();sv.textContent='Saved · '+wc()+' words'}
async function flip(n){if(busy||n<0||n>=D.pages.length)return;busy=1;navigator.vibrate&&navigator.vibrate(6);sfx('flip');const d=n>S.i?1:-1,o={fill:'forwards'};await sheet.animate([{transform:'none',opacity:1},{transform:`rotateY(${-78*d}deg)`,opacity:.1}],{duration:300,easing:'ease-in',...o}).finished;S.i=n;fill();await sheet.animate([{transform:`rotateY(${78*d}deg)`,opacity:.1},{transform:'none',opacity:1}],{duration:480,easing:'cubic-bezier(.34,1.4,.64,1)',...o}).finished;sheet.getAnimations().forEach(a=>a.cancel());busy=0}
const add=async(c)=>{const p=newPage();p.chapter=c||'';D.pages.splice(S.i+1,0,p);await seal();await flip(S.i+1)};
const next=()=>S.i<D.pages.length-1?flip(S.i+1):hasText()?add():toast('Write something first.');
const arrow=d=>h('button',{class:'nx '+(d<0?'pv':'nxt'),title:d<0?'Previous page':'Next page',onclick:()=>d<0?flip(S.i-1):next(),html:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="${d<0?'M13 6l-6 6 6 6M19 6l-6 6 6 6':'M5 6l6 6-6 6M11 6l6 6-6 6'}"/></svg>`});
const prev=arrow(-1),wb=h('button',{class:'pill sm',onclick:()=>{S.edit=!S.edit;edit();if(S.edit)ed.focus();else seal()}},ico('pen'),h('span'));
function chapDlg(){const t=h('input',{placeholder:'Chapter title'});const c=modal('New chapter',t,h('button',{class:'pill',onclick:()=>{if(t.value.trim()){c();add(t.value.trim())}}},'Start chapter'));t.focus()}
function del(){if(!confirm('Delete this page for good?'))return;D.pages.splice(S.i,1);if(!D.pages.length)D.pages.push(newPage());S.i=Math.min(S.i,D.pages.length-1);fill();seal()}
function exp(){h('a',{href:URL.createObjectURL(new Blob([JSON.stringify({fmt:'diary-v1',...S.rec})],{type:'application/json'})),download:S.rec.name.replace(/\W+/g,'_')+'.diary.json'}).click();toast('Encrypted backup saved')}
function search(){const q=h('input',{placeholder:'Search your pages'}),res=h('div',{class:'res'});const c=modal('Search',q,res);
q.oninput=()=>{const t=q.value.trim().toLowerCase();res.replaceChildren();if(t.length<2)return;D.pages.forEach((p,i)=>{const tx=tpl(p.html).textContent,k=tx.toLowerCase().indexOf(t);if(k<0)return;res.append(h('button',{class:'rs',onclick:()=>{c();flip(i)}},h('b',{},'Page '+(i+1)+' · '+fmtD(p.date)),h('small',{},(k>24?'…':'')+tx.slice(Math.max(0,k-24),k+60))))});if(!res.children.length)res.append(h('small',{},'Nothing found.'))};q.focus()}
function today(){const d=new Date().toISOString().slice(0,10),i=D.pages.findIndex(p=>p.date===d);i>=0?flip(i):add()}
function delDiary(){if(!confirm('Delete the whole diary from this device? Make a backup first if you want to keep it.'))return;put(list().filter(x=>x.id!==S.rec.id));S=null;Lib()}
function menu(){const m=h('div',{class:'mask drw',onclick:e=>{if(e.target===m)x()}}),x=()=>{m.classList.add('out');setTimeout(()=>m.remove(),260)};
const act=(ic,t,s,f)=>h('button',{class:'mi',onclick:()=>{x();setTimeout(f,280)}},ico(ic),h('span',{},h('b',{},t),h('small',{},s)));
m.append(h('aside',{class:'dr'},h('h3',{},'Menu'),act('search','Search','Find words across your pages',search),act('sun','Today’s page','Jump to today, or start it',today),act('plus','New page','Add a page after this one',()=>add()),act('book','New chapter','Begin a chapter on a fresh page',chapDlg),act('file','Export as PDF','Cover, every page, thank you',pdf),act('down','Save a backup','Encrypted file you can import later',exp),act('lock','Lock the diary','Back to the library',()=>{S=null;Lib()}),act('trash','Delete this page','This cannot be undone',del),act('trash','Delete this diary','Removes it from this device',delDiary),h('h4',{},'Jump to a page'),h('div',{class:'chips'},D.pages.map((p,i)=>h('button',{class:'chip'+(i===S.i?' on':'')+(p.chapter?' ch':''),title:p.chapter,onclick:()=>{x();flip(i)}},i+1)))));document.body.append(m)}
// PDF
function fit(x,t,max,size,font){do{x.font=font(size);size-=4}while(x.measureText(t).width>max&&size>20);}
function cvCanvas(W,H,end){const c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d'),[a,b]=COL[S.rec.cover],g=x.createLinearGradient(0,0,W,H);g.addColorStop(0,a);g.addColorStop(1,b);x.fillStyle=g;x.fillRect(0,0,W,H);
x.strokeStyle='#fff3cfcc';x.lineWidth=3;x.setLineDash([16,12]);x.strokeRect(W*.08,H*.05,W*.84,H*.9);x.setLineDash([]);x.fillStyle='#fff6dc';x.textAlign='center';
if(end){x.font='600 190px Caveat, cursive';x.fillText('Thank you',W/2,H*.5);x.font='italic 50px Inter, sans-serif';x.fillText('for reading',W/2,H*.5+90)}
else{x.font='italic 56px Inter, sans-serif';x.fillText('Welcome to',W/2,H*.34);fit(x,S.rec.name,W*.68,130,s=>`600 ${s}px Inter, sans-serif`);x.fillText(S.rec.name,W/2,H*.34+150);x.font='italic 56px Inter, sans-serif';x.fillText('diary',W/2,H*.34+230);x.font='600 84px Caveat, cursive';x.fillText('written by '+(cap(writer())||'Me'),W/2,H*.68)}
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
for(const bl of blocks(p.html)){const tpc=bl.tp,fz=tpc?fs*1.4:fs,hh=tpc?lh*2:lh,fnt=s=>`${s.i?'italic ':''}${s.b?700:tpc?600:400} ${fz}px Caveat, cursive`;let lines=[[]],wd=0;
for(const r of bl.runs){if(r.br){lines.push([]);wd=0;continue}for(const tk of r.t.split(/(\s+)/)){if(!tk)continue;x.font=fnt(r);const w=x.measureText(tk).width,sp=!tk.trim(),L0=lines[lines.length-1];if(wd+w>mw&&!sp&&L0.length){lines.push([]);wd=0}if(sp&&!lines[lines.length-1].length)continue;lines[lines.length-1].push({tk,w,r});wd+=w}}
for(const ln of lines){if(y+hh>B+1)mk();const tot=ln.reduce((a,t)=>a+t.w,0),by=y+hh*(tpc?.66:.72);let px=tpc?L+(mw-tot)/2:L;
for(const t of ln){x.font=fnt(t.r);if(t.r.m){x.fillStyle='rgba(255,214,90,.55)';x.fillRect(px,by-fz*.8,t.w,fz*1.05)}x.fillStyle=C.ink;x.textAlign='left';x.fillText(t.tk,px,by);if(t.r.u)x.fillRect(px,by+fz*.1,t.w,Math.max(2,fz*.05));if(t.r.s)x.fillRect(px,by-fz*.28,t.w,Math.max(2,fz*.05));px+=t.w}y+=hh}}
return out}
function runsOf(n,st,out){n.childNodes.forEach(c=>{if(c.nodeType===3)out.push({t:c.textContent,...st});else if(c.nodeName==='BR')out.push({br:1});else if(c.nodeType===1){const s={...st};({B:'b',I:'i',U:'u',S:'s',MARK:'m'})[c.nodeName]&&(s[({B:'b',I:'i',U:'u',S:'s',MARK:'m'})[c.nodeName]]=1);runsOf(c,s,out)}})}
function blocks(html){return [...tpl(html).childNodes].map(n=>{const o=[];if(n.nodeType===3)o.push({t:n.textContent});else runsOf(n,{},o);return{tp:n.classList&&n.classList.contains('tp'),runs:o}})}
const DD=()=>S.data;
async function pdf(){toast('Building your PDF…');try{if(!window.jspdf)await loadJs('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');await document.fonts.load('40px Caveat');await document.fonts.load('600 40px Caveat');await document.fonts.load('700 40px Caveat');await document.fonts.load('600 40px Inter');
const W=1240,H=1754,doc=new window.jspdf.jsPDF({unit:'px',format:[W,H],orientation:'portrait',compress:true});let first=1;
const add=c=>{if(!first)doc.addPage([W,H],'portrait');first=0;doc.addImage(c.toDataURL('image/jpeg',.9),'JPEG',0,0,W,H)};
add(cvCanvas(W,H,0));for(let i=0;i<DD().pages.length;i++)for(const c of await pgCanvas(DD().pages[i],i+1,W,H))add(c);add(cvCanvas(W,H,1));
doc.save(S.rec.name.replace(/\W+/g,'_')+'.pdf');toast('PDF saved')}catch(e){console.error(e);toast('Could not build the PDF. Check your internet and try again.')}}
const rd=h('div',{class:'rd'},h('div',{class:'bar'},h('button',{class:'ib',title:'Lock',onclick:()=>{if(S.edit)seal();S=null;Lib()}},ico('lock')),tt,wb,h('button',{class:'ib',title:'Menu',onclick:menu},ico('menu'))),h('div',{class:'desk'},prev,sheet,arrow(1)),tb);
document.onkeydown=e=>{if(!S||S.edit)return;if(e.key==='ArrowRight')next();if(e.key==='ArrowLeft')flip(S.i-1)};
mount(rd);fill()}
let ip=null;const standalone=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone;
addEventListener('beforeinstallprompt',e=>{e.preventDefault();ip=e;if($('.lib'))Lib()});addEventListener('appinstalled',()=>{ip=null;toast('Installed. Open it from your home screen.');if($('.lib'))Lib()});
function installBtn(){if(standalone())return '';const ios=/iphone|ipad|ipod/i.test(navigator.userAgent);if(!ip&&!ios)return '';return h('button',{class:'pill',onclick:async()=>{if(ip){ip.prompt();await ip.userChoice;ip=null;Lib()}else modal('Add to Home Screen',h('small',{},'In Safari, tap the Share button, then choose Add to Home Screen.'))}},ico('down'),'Install app')}
let justLocked=0;let idle;const bump=()=>{clearTimeout(idle);idle=setTimeout(()=>{if(S){seal();S=null;justLocked=1;Lib();toast('Locked after 5 quiet minutes')}},300000)};['pointerdown','keydown','touchstart'].forEach(e=>addEventListener(e,bump,{passive:true}));bump();
if('serviceWorker' in navigator&&location.protocol.startsWith('http'))addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
writer()?Lib():Welcome();
