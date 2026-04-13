(function(){
var css=document.createElement('style');
css.textContent='#bgTags{position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:0}#bgCV{width:100%;height:100%;display:block}@media(max-width:768px){#bgTags{opacity:.5}}';
document.head.appendChild(css);

var wrap=document.createElement('div');wrap.id='bgTags';
var cv=document.createElement('canvas');cv.id='bgCV';
wrap.appendChild(cv);
// Insert as first child of body so it's behind everything
document.body.insertBefore(wrap,document.body.firstChild);

var ctx=cv.getContext('2d');
var W,H,dpr;
function resize(){
  dpr=window.devicePixelRatio||1;
  W=innerWidth;H=innerHeight;
  cv.width=W*dpr;cv.height=H*dpr;
  ctx.setTransform(dpr,0,0,dpr,0,0);
}
resize();addEventListener('resize',resize);

// Tags data
var words=[
  '1С','Docker','Python','API','VPN','Telegram','AI','Cloud',
  'CRM','FastAPI','n8n','DeepSeek','OData','AES-256','WhatsApp',
  'PostgreSQL','Ubuntu','ВЭД','Автопилот','Агенты','LLM',
  'Webhook','INFRA','BRIDGE','Server','Bubble','Framer',
  'Linux','JWT','REST','GraphQL','Redis','Nginx','SSL',
  'OAuth','USDT','ЭДО','УСН','Bitrix','Make'
];

// 4 brand colors with very low opacity
var colors=[
  {r:79,g:70,b:229},   // indigo
  {r:16,g:185,b:129},  // mint
  {r:78,g:141,b:245},  // blue
  {r:255,g:140,b:66}   // orange
];

// Generate particles
var particles=[];
var count=45;

function seed(){
  // Use deterministic-ish random for consistent feel
  var s=12345;
  function rnd(){s=(s*16807)%2147483647;return(s-1)/2147483646}
  
  particles=[];
  var pageH=Math.max(document.documentElement.scrollHeight,5000);
  
  for(var i=0;i<count;i++){
    var col=colors[i%colors.length];
    particles.push({
      word: words[i%words.length],
      // Spread across entire page height
      x: rnd()*W*1.2-W*0.1,
      y: rnd()*pageH,
      // Movement
      vx: (rnd()-0.5)*0.15,
      vy: (rnd()-0.5)*0.08,
      // Parallax speed (0.1 = slow, 0.5 = medium)
      parallax: 0.05+rnd()*0.4,
      // Visual
      size: 10+rnd()*6,
      alpha: 0.025+rnd()*0.025,
      color: col,
      // Rotation (slight)
      rot: (rnd()-0.5)*0.15,
      rotSpeed: (rnd()-0.5)*0.0003,
      // Drift wave
      wave: rnd()*Math.PI*2,
      waveAmp: 8+rnd()*15,
      waveSpeed: 0.0002+rnd()*0.0004
    });
  }
}
seed();

// Redraw on resize with new positions
addEventListener('resize',function(){setTimeout(seed,100)});

var scrollY2=0;
addEventListener('scroll',function(){scrollY2=scrollY},{passive:true});

function draw(time){
  ctx.clearRect(0,0,W,H);
  
  for(var i=0;i<particles.length;i++){
    var p=particles[i];
    
    // Update position
    p.wave+=p.waveSpeed;
    p.rot+=p.rotSpeed;
    
    // Parallax: subtract scroll * parallax factor
    var screenY=p.y-scrollY2*p.parallax;
    
    // Wrap vertically (show on screen)
    var pageH=Math.max(document.documentElement.scrollHeight,5000);
    screenY=((screenY%H)+H+200)%(H+400)-200;
    
    // Horizontal drift
    var screenX=p.x+Math.sin(p.wave)*p.waveAmp;
    
    // Slow horizontal movement
    p.x+=p.vx;
    if(p.x<-100)p.x=W+50;
    if(p.x>W+100)p.x=-50;
    
    // Skip if not visible
    if(screenY<-30||screenY>H+30)continue;
    
    // Draw
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
