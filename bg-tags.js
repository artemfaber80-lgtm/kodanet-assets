(function(){
// Create and inject styles + canvas
var s=document.createElement('style');
s.textContent='#bgT{position:fixed!important;top:0!important;left:0!important;width:100vw!important;height:100vh!important;pointer-events:none!important;z-index:9980!important;opacity:1!important}#bgC{width:100%!important;height:100%!important;display:block!important}@media(max-width:768px){#bgT{opacity:.6!important}}';
document.head.appendChild(s);
 
var w=document.createElement('div');
w.id='bgT';
var v=document.createElement('canvas');
v.id='bgC';
w.appendChild(v);
document.body.appendChild(w);
 
var c=v.getContext('2d'),W,H,dp;
function rs(){
  dp=window.devicePixelRatio||1;
  W=window.innerWidth;
  H=window.innerHeight;
  v.width=W*dp;
  v.height=H*dp;
  c.setTransform(dp,0,0,dp,0,0);
}
rs();
window.addEventListener('resize',rs);
 
// Words
var wd=['1С','Docker','Python','API','VPN','Telegram','AI','Cloud','CRM','FastAPI','n8n','DeepSeek','OData','AES-256','WhatsApp','PostgreSQL','Ubuntu','ВЭД','Автопилот','Агенты','LLM','Webhook','INFRA','BRIDGE','Server','Framer','Linux','REST','Redis','Nginx','SSL','USDT','ЭДО','Make','JWT','Bubble','УСН','Масштаб'];
 
// Brand colors
var cl=[
  {r:79,g:70,b:229},
  {r:16,g:185,b:129},
  {r:78,g:141,b:245},
  {r:255,g:140,b:66}
];
 
// Seeded random
var sd=54321;
function rn(){sd=(sd*16807)%2147483647;return(sd-1)/2147483646}
 
// Particles
var P=[],N=55;
function mk(){
  sd=54321;P=[];
  for(var i=0;i<N;i++){
    var co=cl[i%cl.length];
    P.push({
      w:wd[i%wd.length],
      x:rn()*W*1.3-W*.15,
      y:rn()*10000,
      vx:(rn()-.5)*.2,
      px:.05+rn()*.4,
      sz:14+rn()*10,
      a:.08+rn()*.07,
      c:co,
      r:(rn()-.5)*.1,
      rs:(rn()-.5)*.0002,
      wv:rn()*6.28,
      wa:12+rn()*20,
      ws:.0003+rn()*.0005
    });
  }
}
mk();
window.addEventListener('resize',function(){setTimeout(mk,100)});
 
var sY=0;
window.addEventListener('scroll',function(){sY=window.scrollY},{passive:true});
 
function draw(){
  c.clearRect(0,0,W,H);
  var t=performance.now();
  for(var i=0;i<P.length;i++){
    var p=P[i];
    p.wv+=p.ws;
    p.r+=p.rs;
    p.x+=p.vx;
    if(p.x<-130)p.x=W+70;
    if(p.x>W+130)p.x=-70;
 
    var sy=p.y-sY*p.px;
    sy=((sy%(H+500))+(H+500))%(H+500)-250;
    if(sy<-50||sy>H+50)continue;
 
    var sx=p.x+Math.sin(p.wv)*p.wa;
 
    c.save();
    c.translate(sx,sy);
    c.rotate(p.r);
    c.globalAlpha=p.a;
    c.font='600 '+p.sz+'px "IBM Plex Mono","Courier New",monospace';
    c.fillStyle='rgb('+p.c.r+','+p.c.g+','+p.c.b+')';
    c.fillText(p.w,0,0);
    c.restore();
  }
  requestAnimationFrame(draw);
}
requestAnimationFrame(draw);
 
// Debug: confirm loaded
console.log('[KODMASSHTAB] bg-tags loaded, '+N+' particles, z-index:9980');
})();
 
