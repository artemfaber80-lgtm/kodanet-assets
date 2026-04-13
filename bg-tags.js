(function(){
var css=document.createElement('style');
// Исправлено: z-index: 9990, чтобы теги были поверх фона Framer, но под осьминогом
css.textContent='#bgTags{position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:9990}#bgCV{width:100%;height:100%;display:block}@media(max-width:768px){#bgTags{opacity:.5}}';
document.head.appendChild(css);

var wrap=document.createElement('div');wrap.id='bgTags';
var cv=document.createElement('canvas');cv.id='bgCV';
wrap.appendChild(cv);
// Исправлено: добавляем в конец body
document.body.appendChild(wrap);

var ctx=cv.getContext('2d');
var W,H,dpr;
function resize(){
  dpr=window.devicePixelRatio||1;
  W=innerWidth;H=innerHeight;
  cv.width=W*dpr;cv.height=H*dpr;
  ctx.setTransform(dpr,0,0,dpr,0,0);
}
resize();addEventListener('resize',resize);

var words=[
  '1С','Docker','Python','API','VPN','Telegram','AI','Cloud',
  'CRM','FastAPI','n8n','DeepSeek','OData','AES-256','WhatsApp',
  'PostgreSQL','Ubuntu','ВЭД','Автопилот','Агенты','LLM',
  'Webhook','КОДМАСШТАБ','BRIDGE','Server','Bubble','Framer',
  'Linux','JWT','REST','GraphQL','Redis','Nginx','SSL',
  'OAuth','USDT','ЭДО','УСН','Bitrix','Make'
];

var colors=[
  {r:79,g:70,b:229},   
  {r:16,g:185,b:129},  
  {r:78,g:141,b:245},  
  {r:255,g:140,b:66}   
];

var particles=[];
var count=45;

function seed(){
  var s=12345;
  function rnd(){s=(s*16807)%2147483647;return(s-1)/2147483646}
  
  particles=[];
  var pageH=Math.max(document.documentElement.scrollHeight,5000);
  
  for(var i=0;i<count;i++){
    var col=colors[i%colors.length];
    particles.push({
      word: words[i%words.length],
      x: rnd()*W*1.2-W*0.1,
      y: rnd()*pageH,
      vx: (rnd()-0.5)*0.15,
      vy: (rnd()-0.5)*0.08,
      parallax: 0.05+rnd()*0.4,
      size: 14+rnd()*10, // Исправлено: текст чуть крупнее
      alpha: 0.1+rnd()*0.15, // Исправлено: видимость 10-25%
      color: col,
      rot: (rnd()-0.5)*0.15,
      rotSpeed: (rnd()-0.5)*0.0003,
      wave: rnd()*Math.PI*2,
      waveAmp: 8+rnd()*15,
      waveSpeed: 0.0002+rnd()*0.0004
    });
  }
}
seed();

addEventListener('resize',function(){setTimeout(seed,100)});

var scrollY2=0;
addEventListener('scroll',function(){scrollY2=scrollY},{passive:true});

function draw(time){
  ctx.clearRect(0,0,W,H);
  
  for(var i=0;i<particles.length;i++){
    var p=particles[i];
    
    p.wave+=p.waveSpeed;
    p.rot+=p.rotSpeed;
    
    var screenY=p.y-scrollY2*p.parallax;
    var pageH=Math.max(document.documentElement.scrollHeight,5000);
    screenY=((screenY%H)+H+200)%(H+400)-200;
    
    var screenX=p.x+Math.sin(p.wave)*p.waveAmp;
    
    p.x+=p.vx;
    if(p.x<-100)p.x=W+50;
    if(p.x>W+100)p.x=-50;
    
    if(screenY<-30||screenY>H+30)continue;
    
    ctx.save();
    ctx.translate(screenX,screenY);
    ctx.rotate(p.rot);
    ctx.globalAlpha=p.alpha;
    ctx.font='600 '+p.size+'px "IBM Plex Mono","Courier New",monospace';
    ctx.fillStyle='rgb('+p.color.r+','+p.color.g+','+p.color.b+')';
    ctx.fillText(p.word,0,0);
    ctx.restore();
  }
  
  requestAnimationFrame(draw);
}
requestAnimationFrame(draw);
})();
requestAnimationFrame(dr);
})();
