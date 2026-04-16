/* NIKHIL & PRACHI — script.js */
'use strict';

function el(id){ return document.getElementById(id); }
function safe(fn){ try{ return fn(); }catch(e){ console.warn(e); } }

document.addEventListener('DOMContentLoaded', function(){

  // ── CANVAS PARTICLES ──
  function mkCanvas(id,n,cols){
    const cv=el(id); if(!cv)return;
    const ctx=cv.getContext('2d');
    function resize(){ cv.width=cv.offsetWidth||window.innerWidth; cv.height=cv.offsetHeight||window.innerHeight; }
    resize(); window.addEventListener('resize',resize);
    const pts=Array.from({length:n},()=>({x:Math.random()*cv.width,y:Math.random()*cv.height,r:Math.random()*1.8+0.3,dx:(Math.random()-.5)*.28,dy:(Math.random()-.5)*.28,a:Math.random()*.45+.08,ph:Math.random()*Math.PI*2,c:cols[Math.floor(Math.random()*cols.length)]}));
    (function draw(){ctx.clearRect(0,0,cv.width,cv.height);pts.forEach(p=>{p.ph+=.018;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle=p.c;ctx.globalAlpha=p.a*(.7+.3*Math.sin(p.ph));ctx.fill();p.x+=p.dx;p.y+=p.dy;if(p.x<0||p.x>cv.width)p.dx*=-1;if(p.y<0||p.y>cv.height)p.dy*=-1;});ctx.globalAlpha=1;requestAnimationFrame(draw);})();
  }

  // ── PETALS ──
  function mkPetals(id,n){
    const c=el(id); if(!c)return;
    const em=['🌹','🌸','🌺','🌷','✿','❀'];
    for(let i=0;i<n;i++){const p=document.createElement('div');p.className='ep';p.textContent=em[Math.floor(Math.random()*em.length)];p.style.left=(Math.random()*100)+'%';p.style.fontSize=(Math.random()*.8+.6)+'rem';p.style.animationDuration=(Math.random()*5+5)+'s';p.style.animationDelay=(Math.random()*4)+'s';c.appendChild(p);}
  }

  // ── SHOW MAIN ──
  function showMain(){
    const main=el('main'); if(!main)return;
    main.style.display='block'; main.style.opacity='0'; main.style.transition='opacity 0.7s';
    main.classList.remove('hidden');
    requestAnimationFrame(()=>requestAnimationFrame(()=>{ main.style.opacity='1'; }));
    initMain();
  }

  // ── INVITATION CARD ──
  function showPhoto(){
    const screen=el('photo-reveal');
    if(!screen){ showMain(); return; }
    screen.style.display='flex'; screen.style.opacity='1'; screen.style.visibility='visible';
    screen.classList.remove('hidden');
    // Show guest name on card immediately
    initGuestName();
    requestAnimationFrame(()=>safe(()=>mkCanvas('pc',60,['#C9A84C','#C41E3A','#8B1A2A','#E8C97A'])));
    const pp=el('pp');
    if(pp){ const em=['🌹','🌸','🌺','🌷','✿']; for(let i=0;i<12;i++){const p=document.createElement('div');p.className='ep';p.textContent=em[Math.floor(Math.random()*em.length)];p.style.left=(Math.random()*100)+'%';p.style.fontSize=(Math.random()*.6+.5)+'rem';p.style.animationDuration=(Math.random()*6+6)+'s';p.style.animationDelay=(Math.random()*5)+'s';pp.appendChild(p);} }
    const btn=el('photo-cta-btn');
    if(btn) btn.addEventListener('click',startEnvelope);
  }

  // ── ENVELOPE ──
  function startEnvelope(){
    const photo=el('photo-reveal'), env=el('envelope');
    if(!env){ showMain(); return; }
    safe(()=>playMusic());
    if(photo){ photo.style.transition='opacity 0.5s'; photo.style.opacity='0'; }
    setTimeout(()=>{
      if(photo) photo.style.display='none';
      env.style.display='flex'; env.style.opacity='0'; env.style.transition='opacity 0.5s';
      env.classList.remove('hidden');
      safe(()=>mkCanvas('envc',45,['#C9A84C','#C41E3A']));
      safe(()=>mkPetals('envp',14));
      setTimeout(()=>{ env.style.opacity='1'; },50);
      setTimeout(()=>{ safe(()=>el('eflap').classList.add('open')); safe(()=>el('eseal').classList.add('gone')); },700);
      setTimeout(()=>safe(()=>el('ecrev').classList.add('up')),1900);
      setTimeout(()=>safe(()=>el('eburst').classList.add('on')),2700);
      setTimeout(()=>{ env.style.opacity='0'; setTimeout(()=>{ env.style.display='none'; showMain(); },600); },3700);
    },500);
  }

  // ── LOADER ──
  function initLoader(){
    const loader=el('loader');
    if(!loader){ showPhoto(); return; }
    safe(()=>mkCanvas('lc',50,['#C9A84C','#C41E3A','#E8C97A','#8B1A2A']));
    let done=false;
    function exitNow(){
      if(done)return; done=true;
      loader.style.transition='opacity 0.6s'; loader.style.opacity='0';
      setTimeout(()=>{ loader.style.display='none'; showPhoto(); },650);
    }
    setTimeout(exitNow,2500);
    setTimeout(exitNow,4500);
  }

  // ── MAIN INIT ──
  function initMain(){
    safe(()=>mkCanvas('hc',60,['#C9A84C','#C41E3A','#8B1A2A']));
    initCountdown(); initReveal(); initNav(); initGallery();
    initGuestName();
  }

  // ── GUEST NAME — reads ?guest=Name from URL ──
  function initGuestName(){
    try{
      const params = new URLSearchParams(window.location.search);
      const raw = params.get('guest');
      if(!raw || !raw.trim()) return;
      const name = decodeURIComponent(raw.trim())
        .replace(/\+/g,' ')
        .replace(/\b\w/g, c => c.toUpperCase());

      // Show in nav top-left
      const navG = el('nav-guest');
      if(navG){ navG.textContent='Welcome, '+name; navG.classList.add('visible'); }

      // Show on invitation card
      const cardWrap = el('inv-guest-wrap');
      const cardName = el('inv-guest-name');
      if(cardWrap && cardName){
        cardName.textContent = name;
        cardWrap.classList.remove('hidden');
      }
    }catch(e){}
  }

  // ── COUNTDOWN ──
  function initCountdown(){
    const target=new Date('2026-05-10T11:00:00+05:30').getTime();
    function tick(){
      const diff=target-Date.now(); if(diff<=0)return;
      const set=(id,v)=>{ const e=el(id); if(e) e.textContent=String(v).padStart(2,'0'); };
      set('cd-d',Math.floor(diff/86400000)); set('cd-h',Math.floor((diff%86400000)/3600000));
      set('cd-m',Math.floor((diff%3600000)/60000)); set('cd-s',Math.floor((diff%60000)/1000));
    }
    tick(); setInterval(tick,1000);
  }

  // ── SCROLL REVEAL ──
  function initReveal(){
    const obs=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');obs.unobserve(e.target);}});},{threshold:.07});
    document.querySelectorAll('.reveal,.reveal-child').forEach(e=>obs.observe(e));
  }

  // ── NAV ──
  function initNav(){
    window.addEventListener('scroll',()=>{
      safe(()=>el('nav').classList.toggle('solid',window.scrollY>50));
      const fab=el('fab-top-btn');
      if(fab) fab.style.display=window.scrollY>300?'flex':'none';
    });
    document.querySelectorAll('a[href^="#"]').forEach(a=>{
      a.addEventListener('click',e=>{ const t=document.querySelector(a.getAttribute('href')); if(t){e.preventDefault();t.scrollIntoView({behavior:'smooth'});} });
    });
  }
  window.openNav  = function(){ safe(()=>{ el('nav-panel').classList.add('open');    document.body.style.overflow='hidden'; }); };
  window.closeNav = function(){ safe(()=>{ el('nav-panel').classList.remove('open'); document.body.style.overflow=''; }); };

  // ── GALLERY ──
  function initGallery(){
    document.querySelectorAll('.gt').forEach(btn=>{
      btn.addEventListener('click',function(){
        document.querySelectorAll('.gt').forEach(b=>b.classList.remove('active'));
        this.classList.add('active');
        const cat=this.dataset.c;
        document.querySelectorAll('.gi').forEach(i=>{ i.style.display=(cat==='all'||i.dataset.c===cat)?'':'none'; });
      });
    });
    document.querySelectorAll('.gi').forEach((e,i)=>e.addEventListener('click',()=>openLb(i)));
  }

  const lbBg=['#3d0808','#1a0303','#3d2d0d','#0d1a3d','#0d3d0d','#2d0d3d'];
  const lbLbl=['Pre-Wedding 1','Pre-Wedding 2','Engagement','Pre-Wedding 3','Celebration','Joy'];
  let lbI=0;
  function openLb(i){ lbI=i; showLb(); safe(()=>{ el('lb').classList.remove('hidden'); el('lb').style.display='flex'; }); }
  function showLb(){
    const e=el('lb-img'); if(!e)return;
    e.style.cssText='background:'+lbBg[lbI]+';display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.4);font-size:.8rem;letter-spacing:1px;';
    e.textContent=lbLbl[lbI];
    const cap=el('lb-caption'); if(cap) cap.textContent=lbLbl[lbI];
    const ctr=el('lb-counter'); if(ctr) ctr.textContent=(lbI+1)+' / '+lbBg.length;
  }
  window.closeLb = function(){ const l=el('lb'); if(l){l.classList.add('hidden');l.style.display='none';} };
  window.lbP     = function(){ lbI=(lbI-1+lbBg.length)%lbBg.length; showLb(); };
  window.lbN     = function(){ lbI=(lbI+1)%lbBg.length; showLb(); };
  window.openLb  = openLb;

  // ── TIMELINE TOGGLE ──
  window.switchTimeline = function(side){
    const tg=el('timeline-groom'), tb=el('timeline-bride');
    const bg=el('btn-groom'), bb=el('btn-bride');
    if(!tg||!tb) return;
    const hideEl=side==='groom'?tb:tg;
    const showEl=side==='groom'?tg:tb;
    hideEl.classList.add('tl-exit');
    setTimeout(()=>{
      hideEl.classList.add('hidden'); hideEl.classList.remove('tl-exit');
      showEl.classList.remove('hidden'); showEl.classList.add('tl-enter');
      requestAnimationFrame(()=>requestAnimationFrame(()=>{
        showEl.classList.remove('tl-enter');
      }));
    },280);
    if(bg) bg.classList.toggle('active',side==='groom');
    if(bb) bb.classList.toggle('active',side==='bride');
  };

  // ── EVENT MODAL ──
  const AMRAVATI='Nikhil\'s Home, Rajapeth Chatrapati Sahu Nagar, Near Shitla Mata Mandir, Amravati – 444607';
  const AMAP='https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3723.0!2d77.7523!3d20.9374!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bd6a9e4b7c3b1a1%3A0xabc!2sRajapeth%2C+Amravati!5e0!3m2!1sen!2sin!4v1680000000000';
  const AURL='https://maps.google.com/?q=Rajapeth+Chatrapati+Sahu+Nagar+Amravati';
  const PUNE='Sweta Lawn, Mata Amritanandamayi Math, Nigdi, Pune – 411044';
  const PMAP='https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3781.0!2d73.7700!3d18.6500!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2b9e4b7c3b1a1%3A0xabc!2sNigdi%2C+Pune!5e0!3m2!1sen!2sin!4v1680000000000';
  const PURL='https://maps.google.com/?q=Mata+Amritanandamayi+Math+Nigdi+Pune';
  const EVDATA={
    g_gondhal: {icon:'🪔',title:'Gondhal Ceremony',      date:'5 May 2026', time:'Evening',         venue:AMRAVATI,dress:'Traditional Attire',        mapSrc:AMAP,mapUrl:AURL,calUrl:'https://calendar.google.com/calendar/render?action=TEMPLATE&text=Gondhal+Ceremony&dates=20260505T180000/20260505T220000'},
    g_mehendi: {icon:'🌿',title:'Mehendi Ceremony',      date:'6 May 2026', time:'Afternoon',        venue:AMRAVATI,dress:'Casual / Traditional',       mapSrc:AMAP,mapUrl:AURL,calUrl:'https://calendar.google.com/calendar/render?action=TEMPLATE&text=Mehendi+Ceremony&dates=20260506T140000/20260506T200000'},
    g_haldi:   {icon:'🌼',title:'Haldi & Devkundi',      date:'7 May 2026', time:'Morning',          venue:AMRAVATI,dress:'Yellow / White Traditional', mapSrc:AMAP,mapUrl:AURL,calUrl:'https://calendar.google.com/calendar/render?action=TEMPLATE&text=Haldi+%26+Devkundi&dates=20260507T090000/20260507T140000'},
    g_travel:  {icon:'🚂',title:'Departure to Pune',     date:'8 May 2026', time:'Morning',          venue:'Amravati → Pune',dress:'Comfortable',       mapSrc:AMAP,mapUrl:AURL,calUrl:'https://calendar.google.com/calendar/render?action=TEMPLATE&text=Travel+to+Pune&dates=20260508T080000/20260508T200000'},
    g_wedding: {icon:'💍',title:'Wedding Ceremony 💍',   date:'10 May 2026',time:'11:00 AM',         venue:PUNE,   dress:'Sherwani / Formal',           mapSrc:PMAP,mapUrl:PURL,calUrl:'https://calendar.google.com/calendar/render?action=TEMPLATE&text=Nikhil+%26+Prachi+Wedding&dates=20260510T110000/20260510T180000&location=Sweta+Lawn,+Nigdi,+Pune'},
    g_reception:{icon:'🥂',title:'Reception & Satyanarayan',date:'12 May 2026',time:'Evening',       venue:AMRAVATI,dress:'Ethnic / Formal Elegant',    mapSrc:AMAP,mapUrl:AURL,calUrl:'https://calendar.google.com/calendar/render?action=TEMPLATE&text=Reception+%26+Satyanarayan&dates=20260512T170000/20260512T235900'},
    b_mehndi:  {icon:'🌿',title:'Mehndi Ceremony',       date:'8 May 2026', time:'4:00 PM onwards',  venue:PUNE,   dress:'Yellow / Green Traditional',  mapSrc:PMAP,mapUrl:PURL,calUrl:'https://calendar.google.com/calendar/render?action=TEMPLATE&text=Mehndi+Ceremony&dates=20260508T160000/20260508T210000&location=Sweta+Lawn,+Nigdi,+Pune'},
    b_haldi:   {icon:'🌼',title:'Haldi Ceremony',        date:'9 May 2026', time:'11:00 AM',         venue:PUNE,   dress:'Yellow / Floral Traditional', mapSrc:PMAP,mapUrl:PURL,calUrl:'https://calendar.google.com/calendar/render?action=TEMPLATE&text=Haldi+Ceremony&dates=20260509T110000/20260509T140000&location=Sweta+Lawn,+Nigdi,+Pune'},
    b_sangeet: {icon:'🎶',title:'Sangeet Night',         date:'9 May 2026', time:'7:00 PM onwards',  venue:PUNE,   dress:'Cocktail / Festive Colourful',mapSrc:PMAP,mapUrl:PURL,calUrl:'https://calendar.google.com/calendar/render?action=TEMPLATE&text=Sangeet+Night&dates=20260509T190000/20260509T235900&location=Sweta+Lawn,+Nigdi,+Pune'},
    b_wedding: {icon:'💍',title:'Wedding Ceremony 💍',   date:'10 May 2026',time:'11:00 AM',         venue:PUNE,   dress:'Bridal Lehenga / Traditional',mapSrc:PMAP,mapUrl:PURL,calUrl:'https://calendar.google.com/calendar/render?action=TEMPLATE&text=Wedding+Ceremony&dates=20260510T110000/20260510T140000&location=Sweta+Lawn,+Nigdi,+Pune'},
    b_vidaai:  {icon:'🌸',title:'Vidaai',                date:'10 May 2026',time:'2:00 PM',          venue:PUNE,   dress:'Bridal Attire',               mapSrc:PMAP,mapUrl:PURL,calUrl:'https://calendar.google.com/calendar/render?action=TEMPLATE&text=Vidaai&dates=20260510T140000/20260510T160000&location=Sweta+Lawn,+Nigdi,+Pune'},
  };
  window.openEventModal = function(key){
    const d=EVDATA[key]; if(!d)return;
    const m=el('event-modal'); if(!m)return;
    el('em-icon').textContent=d.icon; el('em-title').textContent=d.title;
    el('em-date').textContent=d.date; el('em-time').textContent=d.time;
    el('em-venue').textContent=d.venue; el('em-dress').textContent=d.dress;
    el('em-map').src=d.mapSrc; el('em-dir-btn').href=d.mapUrl; el('em-cal-btn').href=d.calUrl;
    m.classList.remove('hidden'); m.style.display='flex';
    document.body.style.overflow='hidden';
  };
  window.closeEventModal = function(){
    const m=el('event-modal'); if(!m)return;
    m.classList.add('hidden'); m.style.display='none';
    document.body.style.overflow='';
  };

  // ── RSVP ──
  window.doRSVP = function(e){
    e.preventDefault();
    safe(()=>{ el('rf').classList.add('hidden'); el('rsvp-ok').classList.remove('hidden'); });
  };

  // ── WISHES ──
  window.toggleWF = function(){ safe(()=>el('wf').classList.toggle('hidden')); };
  window.addWish  = function(){
    const n=el('wn').value.trim(), m=el('wm').value.trim(); if(!n||!m)return;
    const c=document.createElement('div'); c.className='wc';
    c.innerHTML='<span class="wq">"</span><p>'+m+'</p><span class="wa">— '+n+'</span>';
    safe(()=>el('wl').prepend(c));
    el('wn').value=''; el('wm').value='';
    safe(()=>el('wf').classList.add('hidden'));
  };

  // ── MUSIC ──
  let mOn=false;
  function playMusic(){
    const a=el('aud'); if(!a)return;
    a.volume=.35;
    a.play().then(()=>{ mOn=true; updateMusicUI(); }).catch(()=>{});
  }
  window.toggleMusic = function(){
    const a=el('aud'); if(!a)return;
    if(mOn){ a.pause(); mOn=false; } else { a.play().catch(()=>{}); mOn=true; }
    updateMusicUI();
  };
  function updateMusicUI(){
    const wrap=el('np-music'), title=el('npm-title'), toggle=el('npm-toggle');
    if(wrap)   wrap.classList.toggle('playing',mOn);
    if(title)  title.textContent=mOn?'Stop Music':'Play Music';
    if(toggle) toggle.textContent=mOn?'⏸':'▶';
    const fabIcon=el('music-fab-icon'), fabLabel=el('music-fab-label'), fabBtn=el('music-fab');
    if(fabIcon)  fabIcon.textContent=mOn?'⏸':'🎵';
    if(fabLabel) fabLabel.textContent=mOn?'Stop Music':'Play Music';
    if(fabBtn)   fabBtn.style.borderColor=mOn?'rgba(201,168,76,0.5)':'rgba(201,168,76,0.25)';
  }

  // ── SHARE ──
  window.doShare = function(){
    const d={title:'Nikhil & Prachi Wedding',text:"You're invited! 10 May 2026 💍",url:window.location.href};
    if(navigator.share) navigator.share(d);
    else navigator.clipboard.writeText(window.location.href).then(()=>alert('Link copied!')).catch(()=>{});
  };

  // ── START ──
  initLoader();

});
