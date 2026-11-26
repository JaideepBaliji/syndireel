const video=document.querySelector('video'),control=document.querySelector('#motion'),opening=document.querySelector('.opening'),caption=document.querySelector('.hero-caption'),portal=document.querySelector('.portal'),stage=document.querySelector('.portal-sticky'),orbit=document.querySelector('.orbit'),cards=[...document.querySelectorAll('.ticket')];
const preference=matchMedia('(prefers-reduced-motion: reduce)');
let paused=preference.matches,frame=0,last=0,current=scrollY,target=scrollY,px=0,py=0,tx=0,ty=0;
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),lerp=(a,b,t)=>a+(b-a)*t,smooth=t=>t*t*(3-2*t);
let geometry={};
function measure(){geometry={openTop:opening.offsetTop,openRange:Math.max(1,opening.offsetHeight-innerHeight),portalTop:portal.offsetTop,portalRange:Math.max(1,portal.offsetHeight-innerHeight)};wake()}
function render(){const p=clamp((current-geometry.openTop)/geometry.openRange),q=clamp((current-geometry.portalTop)/geometry.portalRange);const mobile=innerWidth<700;const eased=smooth(q);
caption.style.transform=`translate3d(0,${-p*100}px,0) scale(${1-p*.08})`;caption.style.opacity=1-smooth(clamp(p*1.3));
video.parentElement.style.transform=`translate3d(${px*8}px,${-p*90+py*6}px,0) scale(${1+p*.16})`;video.parentElement.style.opacity=1-p*.85;
stage.style.setProperty('--travel',q);stage.style.setProperty('--glow-x',`${50+px*10}%`);
orbit.style.transform=`rotateX(${py*-3}deg) rotateY(${px*4}deg)`;
cards.forEach((card,i)=>{const side=i-1,entry=smooth(clamp((q-i*.045)/.4)),exit=smooth(clamp((q-.78)/.22));const spread=mobile?110:340;
const x=side*lerp(mobile?35:90,spread,entry);const y=lerp(230+i*65,side===0?-18:26,entry)-exit*(side===0?90:35);const z=lerp(-700-i*180,side===0?90:-50,entry)+exit*120;
const yaw=lerp(side*-62,side*-14,entry)+side*exit*18;const roll=lerp(side*18,side*4,entry);
card.style.transform=`translate(-50%,-50%) translate3d(${x}px,${y}px,${z}px) rotateX(${lerp(32,0,entry)}deg) rotateY(${yaw}deg) rotateZ(${roll}deg)`;
card.style.opacity=clamp(entry*3);card.style.setProperty('--shine',`${lerp(-50,160,eased)}%`);
});document.querySelector('.portal-copy').style.transform=`translate3d(0,${lerp(35,0,smooth(clamp(q*3)))}px,0)`;
document.querySelector('.scroll-progress').style.transform=`scaleX(${clamp(current/(document.documentElement.scrollHeight-innerHeight))})`;
}
function tick(now){const dt=Math.min(64,now-(last||now-16));last=now;const alpha=1-Math.exp(-dt/95);current=lerp(current,target,alpha);px=lerp(px,tx,alpha);py=lerp(py,ty,alpha);render();if(Math.abs(current-target)>.05||Math.abs(px-tx)>.001||Math.abs(py-ty)>.001){frame=requestAnimationFrame(tick)}else{frame=0;last=0}}
function wake(){if(!paused&&!frame)frame=requestAnimationFrame(tick)}
function setMotion(){document.body.classList.toggle('motion-off',paused);control.textContent=paused?'Play motion':'Pause motion';control.setAttribute('aria-pressed',String(paused));if(paused){cancelAnimationFrame(frame);frame=0;video.pause();[caption,video.parentElement,orbit,...cards,document.querySelector('.portal-copy')].forEach(el=>{el.style.transform='';el.style.opacity=''})}else{video.play().catch(()=>{});current=target=scrollY;wake()}}
control.addEventListener('click',()=>{paused=!paused;setMotion()});preference.addEventListener('change',e=>{paused=e.matches;setMotion()});addEventListener('scroll',()=>{target=scrollY;wake()},{passive:true});addEventListener('resize',measure);stage.addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;tx=(e.clientX/innerWidth-.5)*2;ty=(e.clientY/innerHeight-.5)*2;wake()});stage.addEventListener('pointerleave',()=>{tx=ty=0;wake()});
const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('revealed');observer.unobserve(e.target)}}),{threshold:.12});document.querySelectorAll('.manifesto h2,.manifesto-bottom,.sectionhead,.screening,.detailrows article,.join h2').forEach(el=>{el.classList.add('reveal');observer.observe(el)});document.querySelector('#year').textContent=new Date().getFullYear();measure();setMotion();
