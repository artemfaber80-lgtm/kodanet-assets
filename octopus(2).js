(function(){
// === DOM SETUP ===
var css=document.createElement('style');
css.textContent=`
#ow{position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:9990}
#oC{width:100%;height:100%;display:block}
#oB{position:fixed;background:#fff;border-radius:16px 16px 4px 16px;padding:13px 17px;font-family:'Outfit',system-ui,sans-serif;font-size:13px;color:#111;line-height:1.55;max-width:220px;box-shadow:0 8px 24px rgba(0,0,0,.08);border:1px solid rgba(79,70,229,.06);display:none;pointer-events:auto;z-index:9995;opacity:0;transition:opacity .4s}
#oB.sh{display:block;opacity:1}
#oB::after{content:'';position:absolute;right:-7px;top:50%;transform:translateY(-50%);border-left:7px solid #fff;border-top:6px solid transparent;border-bottom:6px solid transparent}
#oB.lf::after{right:auto;left:-7px;border-left:none;border-right:7px solid #fff}
.oBtn{display:inline-block;margin-top:8px;padding:7px 16px;background:#4f46e5;color:#fff;border-radius:100px;font-size:11px;font-weight:700;text-decoration:none;font-family:'Outfit',sans-serif;transition:background .2s}
.oBtn:hover{background:#10B981}
#oHUD{position:fixed;top:20px;left:50%;transform:translateX(-50%);display:none;background:rgba(17,17,24,.92);backdrop-filter:blur(8px);border-radius:100px;padding:10px 28px;font-family:'IBM Plex Mono',monospace;font-size:13px;color:#fff;z-index:9996;gap:16px;align-items:center;border:1px solid rgba(79,70,229,.2)}
#oHUD.sh{display:flex}
#oAnn{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);display:none;font-family:'Outfit',sans-serif;font-weight:900;color:#4f46e5;text-align:center;z-index:9997;pointer-events:none}
#oAnn.sh{display:block}
@media(max-width:768px){#ow{display:none!important}#oB{display:none!important}}
`;
document.head.appendChild(css);
var ow=document.createElement('div');ow.id='ow';
var oC=document.createElement('canvas');oC.id='oC';
ow.appendChild(oC);document.body.appendChild(ow);
var oB=document.createElement('div');oB.id='oB';document.body.appendChild(oB);
var oHUD=document.createElement('div');oHUD.id='oHUD';document.body.appendChild(oHUD);
var oAnn=document.createElement('div');oAnn.id='oAnn';document.body.appendChild(oAnn);

var ctx=oC.getContext('2d');
var W,H,dpr;
function resize(){dpr=window.devicePixelRatio||1;W=innerWidth;H=innerHeight;oC.width=W*dpr;oC.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0)}
resize();addEventListener('resize',resize);

// === FLOATING WORDS ===
var wds=['Docker','Python','1С','API','VPN','Telegram','AI','Cloud','CRM','FastAPI','n8n','DeepSeek','OData','AES-256','WhatsApp','PostgreSQL','Ubuntu','ВЭД','Автопилот','Агенты'];
var fl=[];for(var i=0;i<20;i++)fl.push({w:wds[i%wds.length],x:Math.random()*2000,y:Math.random()*10000,sp:.12+Math.random()*.25,a:.035+Math.random()*.025,sz:11+Math.random()*6,dr:Math.random()*2-1});

// === STATE ===
var ox,oy,ovx=0,ovy=0,tX,tY;
var R=30,br=0,tP=0,bk=0,bkT=0,em='happy';
var phase='hero',curSec=-1,bT=0,idT=Date.now(),lsT=Date.now();
var cc=0,lcT=0,jT=null,jP=0,rT=0;
// Game
var gMode=false,gRun=false,gScore=0,gTime=60,orbs=[];

ox=W*.73;oy=H*.38;tX=ox;tY=oy;

// === SECTIONS ===
var S=[
{p:0,m:'Привет! 👋 Я ваш гид. Листайте — покажу всё!',e:'happy'},
{p:.07,m:'Стартап или компания? Выбирайте свой путь!',e:'thinking'},
{p:.16,m:'9 специализаций! Кликайте вкладки 🎨',e:'happy'},
{p:.30,m:'Аудит → Автопилот за 4 шага. Аудит бесплатно!',e:'thinking'},
{p:.45,m:'Мы практики. Своя сеть магазинов и 5 ИП 🏭',e:'happy'},
{p:.55,m:'До и После — чувствуете разницу?',e:'excited'},
{p:.67,m:'Феликс, щит, дашборд — всё 24/7 ⚡',e:'happy'},
{p:.80,m:'Кликайте по вопросам — ответы раскроются!',e:'thinking'},
{p:.90,m:'Готовы? Аудит бесплатно! 🚀',e:'excited',cta:1}
];

function sp(){return scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight)}
function fs(p){for(var i=S.length-1;i>=0;i--)if(p>=S[i].p)return i;return 0}

// Bubble
function sB(h,d){oB.innerHTML=h;oB.classList.add('sh');clearTimeout(bT);bT=setTimeout(function(){oB.classList.remove('sh')},d||6e3)}
function uB(){if(!oB.classList.contains('sh'))return;var bx=ox+R+18,by=oy-30,flip=bx+230>W;if(flip){bx=ox-R-240;oB.classList.add('lf')}else oB.classList.remove('lf');oB.style.left=Math.max(8,Math.min(bx,W-240))+'px';oB.style.top=Math.max(8,Math.min(by,H-100))+'px'}

// Find heading
function fH(){var hs=document.querySelectorAll('h1,h2,h3');var best=null,bd=1e9;for(var i=0;i<hs.length;i++){var r=hs[i].getBoundingClientRect();if(r.top>40&&r.top<H-80){var d=Math.abs(r.top-H*.4);if(d<bd){bd=d;best=hs[i]}}}return best}

// Scroll
addEventListener('scroll',function(){lsT=idT=Date.now();var p=sp(),idx=fs(p);if(phase==='hero'&&p>.03)phase='scroll';
if(idx!==curSec){curSec=idx;em=S[idx].e||'neutral';
var h=fH();if(h){var r=h.getBoundingClientRect();var side=r.left>W/2?-1:1;jT={x:r.left+r.width/2+side*(r.width/2+R+35),y:r.top+r.height/2};jP=0;phase='jump'}else{tX=W-80;tY=H*.3+p*H*.4}
setTimeout(function(){var s=S[idx];var html=s.m;if(s.cta)html+='<br><a href="#cta" class="oBtn">Записаться →</a>';sB(html,7e3);setTimeout(function(){if(!gMode)em='neutral'},4e3)},700)}},{passive:1});

// Click
document.addEventListener('click',function(e){
var dx=e.clientX-ox,dy=e.clientY-oy;
if(Math.sqrt(dx*dx+dy*dy)>R*2.5)return;
var n=Date.now();cc=n-lcT<500?cc+1:1;lcT=n;
if(cc>=5&&!gMode){startGame();return}
if(cc>=3&&!gMode){cc=0;em='excited';sB('🎉 Промокод: <b>KODANET2026</b> — скидка 10%!<br><small>Ещё 2 клика = секретная игра!</small>',8e3);setTimeout(function(){em='neutral'},5e3);return}
em='happy';var tips=['Пишите @kodanet в Telegram!','Аудит бесплатный 😉','Листайте дальше!','У нас 9 направлений!','5 кликов = секретная игра 🎮','Я анализирую 1С быстрее человека!'];
sB(tips[Math.random()*tips.length|0],4e3);setTimeout(function(){em='neutral'},2500)});

// Idle
setInterval(function(){idT=Date.now()-lsT;if(idT>25e3&&!oB.classList.contains('sh')&&!gMode){em='thinking';sB('Задумались?<br><a href="#cta" class="oBtn">Обсудить проект</a>',8e3);lsT=Date.now();setTimeout(function(){em='neutral'},4e3)}if(idT>6e4&&!gMode)em='sleeping'},5e3);

// === GAME ===
function startGame(){
gMode=true;gRun=true;gScore=0;gTime=60;orbs=[];em='excited';
oHUD.innerHTML='<span style="color:#10B981">⚡ CHAOS HUNTER</span><span id="gS">Счёт: 0</span><span id="gT">60 сек</span>';
oHUD.classList.add('sh');
oAnn.innerHTML='<div style="font-size:28px;letter-spacing:-1px">CHAOS HUNTER MODE</div><div style="font-size:14px;color:#10B981;margin-top:4px">Наведите осьминога на красные точки!</div>';
oAnn.classList.add('sh');setTimeout(function(){oAnn.classList.remove('sh')},2500);
var gi=setInterval(function(){if(!gRun){clearInterval(gi);return}gTime--;var t=document.getElementById('gT');if(t)t.textContent=gTime+' сек';if(gTime<=0){endGame();clearInterval(gi)}},1e3);
spawnOrb();
}
function spawnOrb(){
if(!gRun)return;
var side=Math.random()*4|0,cx,cy,vx,vy,spd=.4+Math.random()*.8;
if(side===0){cx=-15;cy=Math.random()*H;vx=spd;vy=(Math.random()-.5)*spd}
else if(side===1){cx=W+15;cy=Math.random()*H;vx=-spd;vy=(Math.random()-.5)*spd}
else if(side===2){cx=Math.random()*W;cy=-15;vx=(Math.random()-.5)*spd;vy=spd}
else{cx=Math.random()*W;cy=H+15;vx=(Math.random()-.5)*spd;vy=-spd}
orbs.push({x:cx,y:cy,vx:vx,vy:vy,r:7+Math.random()*5,ph:Math.random()*6.28});
setTimeout(spawnOrb,600+Math.random()*1e3);
}
function endGame(){
gRun=false;gMode=false;orbs=[];oHUD.classList.remove('sh');
var msg=gScore>=15?'<div style="font-size:22px;font-weight:900">🏆 Отлично!</div><div style="font-size:14px;color:#555;margin:8px 0">Вы уничтожили '+gScore+' ошибок!<br>Представьте, что мы сделаем с вашим бизнесом</div>':'<div style="font-size:22px;font-weight:900">Хаос сопротивляется!</div><div style="font-size:14px;color:#555;margin:8px 0">Счёт: '+gScore+'. Не беда —<br>мы знаем, как навести порядок</div>';
oAnn.innerHTML=msg+'<a href="#cta" class="oBtn" style="pointer-events:auto;font-size:14px;padding:10px 24px">Записаться на аудит →</a>';
oAnn.style.pointerEvents='auto';oAnn.classList.add('sh');
setTimeout(function(){oAnn.classList.remove('sh');oAnn.style.pointerEvents='none';em='neutral'},12e3);
}

// === TENTACLES ===
var tn=[];for(var t=0;t<6;t++){var sg=[];for(var s=0;s<8;s++)sg.push({x:0,y:0});tn.push({sg:sg,ba:(t/5)*Math.PI*.7+Math.PI*.65,ph:t*1.2})}

// === DRAW ===
function draw(time){
ctx.clearRect(0,0,W,H);br+=.04;tP+=.03;bkT++;
if(bkT>180+Math.random()*120){bk=1;bkT=0}
if(bk>0)bk-=.1;

// Floating words
var sT=scrollY;ctx.textBaseline='middle';
for(var i=0;i<fl.length;i++){var f=fl[i];var fy=((f.y-sT*f.sp*.5)%(document.documentElement.scrollHeight||5e3)+1e4)%1e4-sT;
if(fy<-50||fy>H+50)continue;var fx=f.x%W+Math.sin(time*3e-4+i)*20*f.dr;
ctx.globalAlpha=f.a;ctx.font='600 '+f.sz+'px "IBM Plex Mono",monospace';ctx.fillStyle='#4f46e5';ctx.fillText(f.w,fx,fy)}
ctx.globalAlpha=1;

// Movement
if(phase==='jump'&&jT){
jP=Math.min(1,jP+.025);ox+=(jT.x-ox)*.07;oy+=(jT.y-oy)*.07+Math.sin(jP*Math.PI)*(-2.5);
if(jP>=1){phase='rest';rT=0;jT=null}
}else if(phase==='hero'){
tX=W*.72+Math.sin(time*5e-4)*35;tY=H*.38+Math.cos(time*4e-4)*25;
ox+=(tX-ox)*.012;oy+=(tY-oy)*.012;
}else if(phase==='rest'){
rT++;ox+=Math.sin(time*.002)*.4;oy+=Math.cos(time*.0015)*.3;
if(rT>250)phase='scroll';
}else{
var p=sp();tX=W-80+Math.sin(time*.001)*12;tY=H*.25+p*H*.45+Math.cos(time*8e-4)*18;
ox+=(tX-ox)*.03;oy+=(tY-oy)*.03;
}
if(gMode){ox+=(tX-ox)*.06;oy+=(tY-oy)*.06}// Faster in game mode - follow mouse
ox=Math.max(R+5,Math.min(W-R-5,ox));oy=Math.max(R+5,Math.min(H-R-5,oy));

var bS=1+Math.sin(br)*(em==='sleeping'?.06:.025);var cR=R*bS;

// Tentacles
for(var t=0;t<tn.length;t++){var tent=tn[t],sg=tent.sg;var bA=tent.ba+Math.sin(time*.001+tent.ph)*.12;
sg[0].x=ox+Math.cos(bA)*cR;sg[0].y=oy+Math.sin(bA)*cR;
for(var s=1;s<sg.length;s++){var prev=sg[s-1];var wA=em==='sleeping'?10:em==='excited'?7:4;
var w=Math.sin(time*.003+s*.8+tent.ph)*wA*(s/sg.length);
sg[s].x=prev.x+Math.cos(bA+w*.04+s*.1)*(5+s*1.8);sg[s].y=prev.y+Math.sin(bA+w*.04+s*.1)*(5+s*1.8)+w}
ctx.beginPath();ctx.moveTo(sg[0].x,sg[0].y);
for(var s=1;s<sg.length;s++){if(s<sg.length-1){var cpx=(sg[s].x+sg[s+1].x)/2,cpy=(sg[s].y+sg[s+1].y)/2;ctx.quadraticCurveTo(sg[s].x,sg[s].y,cpx,cpy)}else ctx.lineTo(sg[s].x,sg[s].y)}
ctx.strokeStyle='#4f46e5';ctx.lineWidth=4.5-t*.4;ctx.lineCap='round';ctx.globalAlpha=.4+t*.06;ctx.stroke();ctx.globalAlpha=1}

// Body
ctx.beginPath();ctx.arc(ox,oy,cR,0,Math.PI*2);ctx.fillStyle='#4f46e5';ctx.fill();
var gr=ctx.createRadialGradient(ox-cR*.3,oy-cR*.3,0,ox-cR*.3,oy-cR*.3,cR*.7);
gr.addColorStop(0,'rgba(255,255,255,.14)');gr.addColorStop(1,'rgba(255,255,255,0)');
ctx.beginPath();ctx.arc(ox,oy,cR,0,Math.PI*2);ctx.fillStyle=gr;ctx.fill();

// Headband
ctx.beginPath();ctx.ellipse(ox,oy-cR*.55,cR*.9,3,0,0,Math.PI*2);ctx.fillStyle='rgba(16,185,129,.35)';ctx.fill();
for(var d=0;d<3;d++){ctx.beginPath();ctx.arc(ox-8+d*8,oy-cR*.55,1.8,0,Math.PI*2);ctx.fillStyle='rgba(255,255,255,'+(0.4+Math.sin(time*.004+d)*.3)+')';ctx.fill()}

// Eyes
var eO=cR*.32,eY=oy-cR*.08,eR=cR*.15,bkS=Math.max(0,1-bk);
var lx=0,ly=0;
if(em==='thinking'){lx=-2;ly=-2}else if(em==='happy'){ly=-1.5}else if(em==='excited'){lx=Math.sin(time*.01)*3}else if(em==='sleeping')bkS=.1;

ctx.beginPath();ctx.ellipse(ox-eO+lx,eY+ly,eR,eR*bkS,0,0,Math.PI*2);ctx.fillStyle='#10B981';ctx.fill();
if(bkS>.4){ctx.beginPath();ctx.arc(ox-eO+lx-1,eY-2+ly,eR*.35,0,Math.PI*2);ctx.fillStyle='rgba(255,255,255,.7)';ctx.fill()}
ctx.beginPath();ctx.arc(ox-eO+lx,eY+ly,eR*2.5,0,Math.PI*2);ctx.fillStyle='rgba(16,185,129,.06)';ctx.fill();

ctx.beginPath();ctx.ellipse(ox+eO+lx,eY+ly,eR,eR*bkS,0,0,Math.PI*2);ctx.fillStyle='#10B981';ctx.fill();
if(bkS>.4){ctx.beginPath();ctx.arc(ox+eO+lx-1,eY-2+ly,eR*.35,0,Math.PI*2);ctx.fillStyle='rgba(255,255,255,.7)';ctx.fill()}
ctx.beginPath();ctx.arc(ox+eO+lx,eY+ly,eR*2.5,0,Math.PI*2);ctx.fillStyle='rgba(16,185,129,.06)';ctx.fill();

// Mouth
ctx.beginPath();
if(em==='happy'||em==='excited'){ctx.arc(ox,oy+cR*.2,cR*.22,.1,Math.PI-.1);ctx.strokeStyle='rgba(255,255,255,.45)';ctx.lineWidth=2;ctx.stroke()}
else if(em==='sleeping'){ctx.moveTo(ox-cR*.15,oy+cR*.22);ctx.lineTo(ox+cR*.15,oy+cR*.22);ctx.strokeStyle='rgba(255,255,255,.15)';ctx.lineWidth=1.5;ctx.stroke();
ctx.font='bold 10px system-ui';ctx.fillStyle='rgba(79,70,229,.15)';ctx.fillText('z',ox+cR+5+Math.sin(time*.002)*3,oy-cR-5);ctx.fillText('Z',ox+cR+15+Math.sin(time*.002+1)*3,oy-cR-18)}
else if(em==='thinking'){ctx.arc(ox+cR*.1,oy+cR*.25,cR*.12,0,Math.PI);ctx.strokeStyle='rgba(255,255,255,.2)';ctx.lineWidth=1.5;ctx.stroke()}
else{ctx.moveTo(ox-cR*.15,oy+cR*.22);ctx.quadraticCurveTo(ox,oy+cR*.35,ox+cR*.15,oy+cR*.22);ctx.strokeStyle='rgba(255,255,255,.2)';ctx.lineWidth=1.5;ctx.stroke()}

// Game mode: glasses
if(gMode){ctx.save();ctx.strokeStyle='rgba(255,255,255,.85)';ctx.lineWidth=2.5;
ctx.beginPath();ctx.roundRect(ox-eO-7+lx,oy-cR*.2+ly,14,12,3);ctx.stroke();
ctx.beginPath();ctx.roundRect(ox+eO-7+lx,oy-cR*.2+ly,14,12,3);ctx.stroke();
ctx.beginPath();ctx.moveTo(ox-eO+7+lx,oy-cR*.14+ly);ctx.lineTo(ox+eO-7+lx,oy-cR*.14+ly);ctx.stroke();
ctx.restore()}

// Excited sparkles
if(em==='excited'){for(var sp2=0;sp2<4;sp2++){var sa=time*.007+sp2*1.6,sr=cR+14+Math.sin(time*.005+sp2)*6;ctx.beginPath();ctx.arc(ox+Math.cos(sa)*sr,oy+Math.sin(sa)*sr,2.5,0,Math.PI*2);ctx.fillStyle='rgba(16,185,129,'+(0.3+Math.sin(time*.01+sp2)*.2)+')';ctx.fill()}}

// === CHAOS ORBS ===
if(gMode){
for(var i=orbs.length-1;i>=0;i--){var o=orbs[i];o.x+=o.vx;o.y+=o.vy;o.ph+=.1;
if(o.x<-60||o.x>W+60||o.y<-60||o.y>H+60){orbs.splice(i,1);continue}
var cd=Math.sqrt((o.x-ox)*(o.x-ox)+(o.y-oy)*(o.y-oy));
if(cd<cR+o.r){orbs.splice(i,1);gScore++;var gs=document.getElementById('gS');if(gs)gs.textContent='Счёт: '+gScore;continue}
var pR=o.r+Math.sin(o.ph)*2;
ctx.beginPath();ctx.arc(o.x,o.y,pR,0,Math.PI*2);ctx.fillStyle='rgba(239,68,68,.55)';ctx.fill();
ctx.beginPath();ctx.arc(o.x,o.y,pR+5,0,Math.PI*2);ctx.fillStyle='rgba(239,68,68,.08)';ctx.fill();
ctx.save();ctx.strokeStyle='rgba(255,255,255,.5)';ctx.lineWidth=1.5;
ctx.beginPath();ctx.moveTo(o.x-3,o.y-3);ctx.lineTo(o.x+3,o.y+3);ctx.stroke();
ctx.beginPath();ctx.moveTo(o.x+3,o.y-3);ctx.lineTo(o.x-3,o.y+3);ctx.stroke();ctx.restore()}
}

// Game mode: follow mouse
if(gMode){tX=mx;tY=my}

uB();requestAnimationFrame(draw)}

// Mouse tracking for game
var mx=W/2,my=H/2;
addEventListener('mousemove',function(e){mx=e.clientX;my=e.clientY});
addEventListener('touchmove',function(e){mx=e.touches[0].clientX;my=e.touches[0].clientY},{passive:1});

requestAnimationFrame(draw);
setTimeout(function(){if(innerWidth>=768){curSec=0;sB(S[0].m,6e3)}},1500);
})();
