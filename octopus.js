(function(){

// === CREATE DOM ===
var css=document.createElement('style');
css.textContent=`
#octoWrap{position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:9990}
#octoCV{width:100%;height:100%;display:block}
#octoBub{position:fixed;background:#fff;border-radius:16px 16px 4px 16px;padding:13px 17px;font-family:'Outfit',system-ui,sans-serif;font-size:13px;color:#111118;line-height:1.55;max-width:220px;box-shadow:0 8px 28px rgba(0,0,0,.08);border:1px solid rgba(79,70,229,.06);display:none;pointer-events:auto;z-index:9995;opacity:0;transition:opacity .4s}
#octoBub.show{display:block;opacity:1}
#octoBub::after{content:'';position:absolute;right:-7px;top:50%;transform:translateY(-50%);border-left:7px solid #fff;border-top:6px solid transparent;border-bottom:6px solid transparent}
#octoBub.left::after{right:auto;left:-7px;border-left:none;border-right:7px solid #fff}
.oct-btn{display:inline-block;margin-top:8px;padding:7px 16px;background:#4f46e5;color:#fff;border-radius:100px;font-size:11px;font-weight:700;text-decoration:none;font-family:'Outfit',sans-serif;transition:background .2s}
.oct-btn:hover{background:#10B981}
@media(max-width:768px){#octoWrap{display:none!important}}
`;
document.head.appendChild(css);

var wrap=document.createElement('div');wrap.id='octoWrap';
var cv=document.createElement('canvas');cv.id='octoCV';
wrap.appendChild(cv);document.body.appendChild(wrap);

var bub=document.createElement('div');bub.id='octoBub';
document.body.appendChild(bub);

var ctx=cv.getContext('2d');
var W,H,dpr;

function resize(){
  dpr=window.devicePixelRatio||1;
  W=window.innerWidth;H=window.innerHeight;
  cv.width=W*dpr;cv.height=H*dpr;
  ctx.setTransform(dpr,0,0,dpr,0,0);
}
resize();window.addEventListener('resize',resize);

// === FLOATING WORDS (background) ===
var words=['Docker','Python','1С','API','VPN','Telegram','AI','Cloud','CRM','FastAPI','n8n','DeepSeek','OData','AES-256','WhatsApp','PostgreSQL','Ubuntu','ВЭД','Автопилот','Агенты'];
var floats=[];
for(var i=0;i<18;i++){
  floats.push({
    word:words[i%words.length],
    x:Math.random()*2000,
    y:Math.random()*8000,
    speed:0.15+Math.random()*0.3,
    alpha:0.04+Math.random()*0.03,
    size:11+Math.random()*6,
    drift:Math.random()*2-1
  });
}

// === OCTOPUS STATE ===
var ox,oy,ovx=0,ovy=0;
var targetX,targetY;
var bodyR=28;
var breath=0,tentPhase=0,blink=0,blinkTimer=0;
var emotion='happy'; // neutral, happy, thinking, excited, sleeping
var phase='hero'; // hero, scrolling, resting, jumping
var currentSection=-1;
var bubTimer=0,idleTime=0,lastScrollTime=Date.now();
var clickCount=0,lastClickTime=0;
var jumpTarget=null,jumpProgress=0;
var restTimer=0,restSection=null;

// Start in hero center
ox=W*0.75;oy=H*0.4;
targetX=ox;targetY=oy;

// === SECTIONS ===
var sections=[
  {pct:0,   msg:'Привет! 👋 Я ваш гид по КОДАНЕТ. Листайте — покажу всё!',emot:'happy'},
  {pct:.07, msg:'Стартап или компания с процессами? Выбирайте свой путь!',emot:'thinking'},
  {pct:.16, msg:'9 специализаций! Кликайте вкладки — там живые анимации 🎨',emot:'happy'},
  {pct:.30, msg:'Аудит → Архитектура → Запуск → Автопилот. Всего 4 шага!',emot:'thinking'},
  {pct:.45, msg:'Мы не аутсорс. Своя сеть магазинов, 5 ИП. Знаем бизнес изнутри 🏭',emot:'happy'},
  {pct:.55, msg:'До и После — чувствуете разницу? Хаос → Контроль',emot:'excited'},
  {pct:.67, msg:'Феликс, щит безопасности, живой дашборд — всё работает 24/7 ⚡',emot:'happy'},
  {pct:.80, msg:'Частые вопросы — кликайте, ответы раскроются!',emot:'thinking'},
  {pct:.90, msg:'Готовы? Первый аудит бесплатно! 🚀',emot:'excited',cta:true}
];

function scrollPct(){
  var h=Math.max(1,document.documentElement.scrollHeight-window.innerHeight);
  return window.scrollY/h;
}

function findSection(p){
  for(var i=sections.length-1;i>=0;i--)if(p>=sections[i].pct)return i;
  return 0;
}

// === BUBBLE ===
function showBubble(text,dur){
  bub.innerHTML=text;
  bub.classList.add('show');
  clearTimeout(bubTimer);
  bubTimer=setTimeout(function(){bub.classList.remove('show')},dur||6000);
}

function updateBubblePos(){
  if(!bub.classList.contains('show'))return;
  var bx=ox+bodyR+18,by=oy-30;
  var flip=bx+220>W;
  if(flip){bx=ox-bodyR-230;bub.classList.add('left')}
  else{bub.classList.remove('left')}
  bub.style.left=Math.max(8,Math.min(bx,W-230))+'px';
  bub.style.top=Math.max(8,Math.min(by,H-100))+'px';
}

// === FIND HEADINGS ON PAGE ===
function findNearestHeading(){
  var headings=document.querySelectorAll('h1,h2,h3');
  var scrollTop=window.scrollY;
  var best=null,bestDist=Infinity;
  for(var i=0;i<headings.length;i++){
    var rect=headings[i].getBoundingClientRect();
    if(rect.top>50&&rect.top<H-100){
      var dist=Math.abs(rect.top-H*0.4);
      if(dist<bestDist){bestDist=dist;best=headings[i]}
    }
  }
  return best;
}

// === SCROLL HANDLER ===
window.addEventListener('scroll',function(){
  lastScrollTime=Date.now();idleTime=0;
  var p=scrollPct();
  var idx=findSection(p);

  if(idx!==currentSection){
    currentSection=idx;
    var s=sections[idx];
    emotion=s.emot||'neutral';

    // Jump to nearest heading
    var heading=findNearestHeading();
    if(heading){
      var rect=heading.getBoundingClientRect();
      var side=rect.left>W/2?-1:1;
      jumpTarget={x:rect.left+rect.width*0.5+side*(rect.width*0.5+bodyR+30),y:rect.top+rect.height*0.5};
      jumpProgress=0;
      phase='jumping';
    }else{
      // Default: right side, mid-screen
      targetX=W-80;
      targetY=H*0.35+p*H*0.3;
    }

    // Show message with delay
    setTimeout(function(){
      var html=s.msg;
      if(s.cta)html+='<br><a href="#cta" class="oct-btn">Записаться на аудит →</a>';
      showBubble(html,7000);
      setTimeout(function(){if(emotion!=='sleeping')emotion='neutral'},4000);
    },800);
  }

  if(phase==='hero'&&p>0.03)phase='scrolling';
},{passive:true});

// === CLICK ===
cv.addEventListener('click',function(e){
  var dx=e.clientX-ox,dy=e.clientY-oy;
  if(Math.sqrt(dx*dx+dy*dy)>bodyR*2.5)return;
  var n=Date.now();
  clickCount=n-lastClickTime<500?clickCount+1:1;
  lastClickTime=n;

  if(clickCount>=3){
    clickCount=0;emotion='excited';
    showBubble('🎉 Секрет! Промокод: <b>KODANET2026</b> — скидка 10% на первый месяц!',10000);
    setTimeout(function(){emotion='neutral'},6000);
  }else{
    emotion='happy';
    var tips=['Пишите @kodanet в Telegram — ответим за 30 мин!','Знаете, что аудит бесплатный? 😉','Листайте дальше — впереди самое вкусное!','Я умею анализировать 1С быстрее любого менеджера!','У нас 9 специализаций. Найдите свою!','Хотите промокод? Кликните по мне 3 раза быстро!'];
    showBubble(tips[Math.random()*tips.length|0],4500);
    setTimeout(function(){emotion='neutral'},2500);
  }
},{passive:true});
// Make canvas clickable on octopus area only
cv.style.pointerEvents='none';
cv.addEventListener('mousedown',function(e){
  var dx=e.clientX-ox,dy=e.clientY-oy;
  if(Math.sqrt(dx*dx+dy*dy)<bodyR*2.5){
    cv.style.pointerEvents='auto';
    setTimeout(function(){cv.style.pointerEvents='none'},100);
  }
});
// Use document click instead for reliability
document.addEventListener('click',function(e){
  var dx=e.clientX-ox,dy=e.clientY-oy;
  if(Math.sqrt(dx*dx+dy*dy)<bodyR*2.5){
    var n=Date.now();
    clickCount=n-lastClickTime<500?clickCount+1:1;
    lastClickTime=n;
    if(clickCount>=3){
      clickCount=0;emotion='excited';
      showBubble('🎉 Промокод: <b>KODANET2026</b> — скидка 10%!',10000);
      setTimeout(function(){emotion='neutral'},6000);
    }else{
      emotion='happy';
      var tips=['Пишите @kodanet!','Аудит бесплатный 😉','Листайте дальше!','9 направлений!','3 клика = секрет!'];
      showBubble(tips[Math.random()*tips.length|0],4000);
      setTimeout(function(){emotion='neutral'},2500);
    }
  }
});

// === IDLE ===
setInterval(function(){
  idleTime=Date.now()-lastScrollTime;
  if(idleTime>20000&&!bub.classList.contains('show')){
    emotion='thinking';
    showBubble('Задумались? Могу помочь!<br><a href="#cta" class="oct-btn">Обсудить проект</a>',8000);
    lastScrollTime=Date.now();
    setTimeout(function(){emotion='neutral'},4000);
  }
  if(idleTime>60000){emotion='sleeping'}
},5000);

// === TENTACLES ===
var tents=[];
for(var t=0;t<6;t++){
  var segs=[];
  for(var s=0;s<8;s++)segs.push({x:0,y:0});
  tents.push({segs:segs,baseAngle:(t/5)*Math.PI*0.7+Math.PI*0.65,phase:t*1.2});
}

// === MAIN DRAW LOOP ===
function draw(time){
  ctx.clearRect(0,0,W,H);
  breath+=0.04;tentPhase+=0.03;
  blinkTimer++;
  if(blinkTimer>180+Math.random()*120){blink=1;blinkTimer=0}
  if(blink>0)blink-=0.1;

  // --- Floating words background ---
  var scrollTop=window.scrollY;
  ctx.font='600 14px "IBM Plex Mono",monospace';
  for(var i=0;i<floats.length;i++){
    var f=floats[i];
    var fy=f.y-scrollTop*f.speed*0.5;
    // Wrap vertically
    var pageH=document.documentElement.scrollHeight;
    fy=((fy%pageH)+pageH)%pageH-scrollTop;
    if(fy<-50||fy>H+50)continue;
    var fx=f.x%W+Math.sin(time*0.0003+i)*20*f.drift;
    ctx.globalAlpha=f.alpha;
    ctx.font='600 '+f.size+'px "IBM Plex Mono",monospace';
    ctx.fillStyle='#4f46e5';
    ctx.fillText(f.word,fx,fy);
  }
  ctx.globalAlpha=1;

  // --- Movement ---
  if(phase==='jumping'&&jumpTarget){
    jumpProgress=Math.min(1,jumpProgress+0.025);
    var ease=jumpProgress<0.5?2*jumpProgress*jumpProgress:1-Math.pow(-2*jumpProgress+2,2)/2;
    // Arc jump
    var startX=ox,startY=oy;
    targetX=jumpTarget.x;targetY=jumpTarget.y;
    var midY=Math.min(oy,jumpTarget.y)-80-Math.random()*40;
    // Bezier
    var t2=ease;
    var ix=startX;var iy=startY;
    ox+=(targetX-ox)*0.08;
    oy+=(targetY-oy)*0.08+Math.sin(jumpProgress*Math.PI)*(-2);
    if(jumpProgress>=1){phase='resting';restTimer=0;jumpTarget=null}
  }else if(phase==='hero'){
    // Float gently in hero
    targetX=W*0.72+Math.sin(time*0.0005)*30;
    targetY=H*0.38+Math.cos(time*0.0004)*20;
    ox+=(targetX-ox)*0.015;oy+=(targetY-oy)*0.015;
  }else if(phase==='resting'){
    // Slight hover at current position
    restTimer++;
    ox+=Math.sin(time*0.002)*0.3;
    oy+=Math.cos(time*0.0015)*0.25;
    if(restTimer>300)phase='scrolling';
  }else{
    // Follow scroll on right side
    var sp=scrollPct();
    targetX=W-75+Math.sin(time*0.001)*10;
    targetY=H*0.25+sp*H*0.45+Math.cos(time*0.0008)*15;
    ox+=(targetX-ox)*0.03;oy+=(targetY-oy)*0.03;
  }

  // Keep in bounds
  ox=Math.max(bodyR+10,Math.min(W-bodyR-10,ox));
  oy=Math.max(bodyR+10,Math.min(H-bodyR-10,oy));

  var bScale=1+Math.sin(breath)*(emotion==='sleeping'?0.06:0.025);
  var R=bodyR*bScale;

  // --- Tentacles ---
  for(var t=0;t<tents.length;t++){
    var tent=tents[t];var segs=tent.segs;
    var bA=tent.baseAngle+Math.sin(time*0.001+tent.phase)*0.12;
    segs[0].x=ox+Math.cos(bA)*R;
    segs[0].y=oy+Math.sin(bA)*R;
    for(var s=1;s<segs.length;s++){
      var prev=segs[s-1];
      var waveAmp=emotion==='sleeping'?10:emotion==='excited'?7:4;
      var w=Math.sin(time*0.003+s*0.8+tent.phase)*waveAmp*(s/segs.length);
      var sA=bA+w*0.04;
      segs[s].x=prev.x+Math.cos(sA+s*0.1)*(5+s*1.8);
      segs[s].y=prev.y+Math.sin(sA+s*0.1)*(5+s*1.8)+w;
    }
    ctx.beginPath();ctx.moveTo(segs[0].x,segs[0].y);
    for(var s=1;s<segs.length;s++){
      if(s<segs.length-1){
        var cpx=(segs[s].x+segs[s+1].x)/2,cpy=(segs[s].y+segs[s+1].y)/2;
        ctx.quadraticCurveTo(segs[s].x,segs[s].y,cpx,cpy);
      }else ctx.lineTo(segs[s].x,segs[s].y);
    }
    ctx.strokeStyle='#4f46e5';ctx.lineWidth=4-t*0.35;
    ctx.lineCap='round';ctx.globalAlpha=0.4+t*0.06;ctx.stroke();ctx.globalAlpha=1;
  }

  // --- Body ---
  ctx.beginPath();ctx.arc(ox,oy,R,0,Math.PI*2);
  ctx.fillStyle='#4f46e5';ctx.fill();
  // Highlight
  var gr=ctx.createRadialGradient(ox-R*0.3,oy-R*0.3,0,ox-R*0.3,oy-R*0.3,R*0.7);
  gr.addColorStop(0,'rgba(255,255,255,0.14)');gr.addColorStop(1,'rgba(255,255,255,0)');
  ctx.beginPath();ctx.arc(ox,oy,R,0,Math.PI*2);ctx.fillStyle=gr;ctx.fill();

  // --- Headband ---
  ctx.beginPath();ctx.ellipse(ox,oy-R*0.55,R*0.9,3,0,0,Math.PI*2);
  ctx.fillStyle='rgba(16,185,129,0.35)';ctx.fill();
  for(var d=0;d<3;d++){
    ctx.beginPath();ctx.arc(ox-8+d*8,oy-R*0.55,1.8,0,Math.PI*2);
    ctx.fillStyle='rgba(255,255,255,'+(0.4+Math.sin(time*0.004+d)*0.3)+')';ctx.fill();
  }

  // --- Eyes ---
  var eOff=R*0.32,eY=oy-R*0.08,eR=R*0.15;
  var blinkS=Math.max(0,1-blink);
  var lx=0,ly=0;
  if(emotion==='thinking'){lx=-2;ly=-2}
  else if(emotion==='happy'){ly=-1.5}
  else if(emotion==='excited'){lx=Math.sin(time*0.01)*3}
  else if(emotion==='sleeping'){blinkS=0.1}

  // Left eye
  ctx.beginPath();ctx.ellipse(ox-eOff+lx,eY+ly,eR,eR*blinkS,0,0,Math.PI*2);
  ctx.fillStyle='#10B981';ctx.fill();
  if(blinkS>0.4){ctx.beginPath();ctx.arc(ox-eOff+lx-1,eY-2+ly,eR*0.35,0,Math.PI*2);ctx.fillStyle='rgba(255,255,255,0.7)';ctx.fill()}
  ctx.beginPath();ctx.arc(ox-eOff+lx,eY+ly,eR*2.5,0,Math.PI*2);ctx.fillStyle='rgba(16,185,129,0.06)';ctx.fill();

  // Right eye
  ctx.beginPath();ctx.ellipse(ox+eOff+lx,eY+ly,eR,eR*blinkS,0,0,Math.PI*2);
  ctx.fillStyle='#10B981';ctx.fill();
  if(blinkS>0.4){ctx.beginPath();ctx.arc(ox+eOff+lx-1,eY-2+ly,eR*0.35,0,Math.PI*2);ctx.fillStyle='rgba(255,255,255,0.7)';ctx.fill()}
  ctx.beginPath();ctx.arc(ox+eOff+lx,eY+ly,eR*2.5,0,Math.PI*2);ctx.fillStyle='rgba(16,185,129,0.06)';ctx.fill();

  // --- Mouth ---
  ctx.beginPath();
  if(emotion==='happy'||emotion==='excited'){
    ctx.arc(ox,oy+R*0.2,R*0.22,0.1,Math.PI-0.1);
    ctx.strokeStyle='rgba(255,255,255,0.45)';ctx.lineWidth=2;ctx.stroke();
  }else if(emotion==='sleeping'){
    ctx.moveTo(ox-R*0.15,oy+R*0.22);ctx.lineTo(ox+R*0.15,oy+R*0.22);
    ctx.strokeStyle='rgba(255,255,255,0.15)';ctx.lineWidth=1.5;ctx.stroke();
    // Zzz
    ctx.font='bold 10px system-ui';ctx.fillStyle='rgba(79,70,229,0.15)';
    ctx.fillText('z',ox+R+5+Math.sin(time*0.002)*3,oy-R-5);
    ctx.fillText('Z',ox+R+15+Math.sin(time*0.002+1)*3,oy-R-18);
  }else if(emotion==='thinking'){
    ctx.arc(ox+R*0.1,oy+R*0.25,R*0.12,0,Math.PI);
    ctx.strokeStyle='rgba(255,255,255,0.2)';ctx.lineWidth=1.5;ctx.stroke();
  }else{
    ctx.moveTo(ox-R*0.15,oy+R*0.22);ctx.quadraticCurveTo(ox,oy+R*0.35,ox+R*0.15,oy+R*0.22);
    ctx.strokeStyle='rgba(255,255,255,0.2)';ctx.lineWidth=1.5;ctx.stroke();
  }

  // --- Excited sparkles ---
  if(emotion==='excited'){
    for(var sp=0;sp<4;sp++){
      var sa=time*0.007+sp*1.6,sr=R+14+Math.sin(time*0.005+sp)*6;
      ctx.beginPath();ctx.arc(ox+Math.cos(sa)*sr,oy+Math.sin(sa)*sr,2.5,0,Math.PI*2);
      ctx.fillStyle='rgba(16,185,129,'+(0.3+Math.sin(time*0.01+sp)*0.2)+')';ctx.fill();
    }
  }

  // Update bubble position
  updateBubblePos();

  requestAnimationFrame(draw);
}
requestAnimationFrame(draw);

// Initial greeting
setTimeout(function(){
  emotion='happy';
  showBubble('Привет! 👋 Я ваш гид по КОДАНЕТ. Листайте — покажу что умеем!',6000);
  setTimeout(function(){emotion='neutral'},4000);
},1500);

})();
