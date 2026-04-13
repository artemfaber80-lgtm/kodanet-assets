(function(){
var css=document.createElement('style');
css.textContent='#bgT{position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:0}#bgC{width:100%;height:100%}@media(max-width:768px){#bgT{opacity:.7}}';
document.head.appendChild(css);
var w=document.createElement('div');w.id='bgT';
var v=document.createElement('canvas');v.id='bgC';
w.appendChild(v);document.body.insertBefore(w,document.body.firstChild);
var c=v.getContext('2d'),W,H,d;
function rs(){d=devicePixelRatio||1;W=innerWidth;H=innerHeight;v.width=W*d;v.height=H*d;c.setTransform(d,0,0,d,0,0)}
rs();addEventListener('resize',rs);

var wd=['1С','Docker','Python','API','VPN','Telegram','AI','Cloud','CRM','FastAPI','n8n','DeepSeek','OData','AES-256','WhatsApp','PostgreSQL','Ubuntu','ВЭД','Автопилот','Агенты','LLM','Webhook','INFRA','BRIDGE','Server','Framer','Linux','REST','Redis','Nginx','SSL','OAuth','USDT','ЭДО','Make','Bitrix','JWT','GraphQL','Bubble','УСН'];
var cl=[{r:79,g:70,b:229},{r:16,g:185,b:129},{r:78,g:141,b:245},{r:255,g:140,b:66}];
var P=[],N=60;
var s=12345;function rn(){s=(s*16807)%2147483647;return(s-1)/2147483646}

function mk(){
  P=[];
  for(var i=0;i<N;i++){
    var co=cl[i%cl.length];
    P.push({
      w:wd[i%wd.length],
      x:rn()*W*1.3-W*.15,
      y:rn()*Math.max(document.documentElement.scrollHeight,5000),
      vx:(rn()-.5)*.2,
      px:.05+rn()*.45,
      sz:12+rn()*10,
      a:.06+rn()*.08,
      c:co,
      r:(rn()-.5)*.12,
      rs:(rn()-.5)*.0003,
      wv:rn()*Math.PI*2,
      wa:10+rn()*20,
      ws:.0003+rn()*.0005
    })
  }
}
mk();addEventListener('resize',function(){setTimeout(mk,100)});

var sY=0;addEventListener('scroll',function(){sY=scrollY},{passive:1});

function dr(t){
  c.clearRect(0,0,W,H);
  for(var i=0;i<P.length;i++){
    var p=P[i];
    p.wv+=p.ws;p.r+=p.rs;p.x+=p.vx;
    if(p.x<-120)p.x=W+60;if(p.x>W+120)p.x=-60;
    var sy=p.y-sY*p.px;
    sy=((sy%(H+400))+(H+400))%(H+400)-200;
    if(sy<-40||sy>H+40)continue;
    var sx=p.x+Math.sin(p.wv)*p.wa;
    c.save();c.translate(sx,sy);c.rotate(p.r);
    c.globalAlpha=p.a;
    c.font='600 '+p.sz+'px "IBM Plex Mono","Courier New",monospace';
    c.fillStyle='rgb('+p.c.r+','+p.c.g+','+p.c.b+')';
    c.fillText(p.w,0,0);c.restore();
  }
  requestAnimationFrame(dr);
}
requestAnimationFrame(dr);
})();
