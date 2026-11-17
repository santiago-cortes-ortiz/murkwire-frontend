
(function(){
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion:reduce)").matches;

  // ---- degrade demo ----
  var SOURCE = [
    '<span class="c">// clean source, pre-protection</span>',
    '<span class="k">public</span> Receipt charge(Card card, <span class="k">long</span> cents) {',
    '    <span class="k">if</span> (cents <= <span class="k">0</span>)',
    '        <span class="k">throw new</span> InvalidAmount(<span class="s">"amount must be positive"</span>);',
    '    Token t = vault.tokenize(card.pan());',
    '    gateway.authorize(t, cents, <span class="s">"USD"</span>);',
    '    <span class="k">return</span> Receipt.of(t, cents, <span class="s">"captured"</span>);',
    '}'
  ];
  var CHAFF = [
    '<span class="c">// decompiled after Murkwire — CFR 0.152</span>',
    '<span class="k">public</span> a c(a var1, <span class="k">long</span> var2) {',
    '    <span class="k">int</span> var4 = <span class="g">b.l[7] ^ 0x3F9</span>;',
    '    <span class="k">while</span>(true){ <span class="k">switch</span>(var4){',
    '    <span class="k">case</span> 182: var4 = var2>0L? <span class="g">0x5E1</span>:91; <span class="k">break</span>;',
    '    <span class="k">case</span> 91: <span class="k">throw</span> (a)<span class="g">d.z(b.m(0x11))</span>;',
    '    <span class="k">default</span>: <span class="k">return</span> (a)<span class="g">e.q(var1,var2,b.m(0x1C))</span>; }}',
    '}'
  ];
  var CHARS = "ABCDEFxy01z#&%$@/\\<>{}[]*^~kqwЖλ∑";
  var codeEl = document.getElementById("demoCode");
  var stateEl = document.getElementById("demoState");
  var runBtn = document.getElementById("runBtn");
  var resetBtn = document.getElementById("resetBtn");
  var timer = null, busy = false;

  function render(lines){ codeEl.innerHTML = lines.join("\n"); }
  function plain(html){ var d=document.createElement("div"); d.innerHTML=html; return d.textContent||""; }

  function setClean(){ render(SOURCE); stateEl.textContent="source"; stateEl.className="state clean"; }
  function setMurkwireed(){ render(CHAFF); stateEl.textContent="murkwireed"; stateEl.className="state murkwireed"; }

  function scrambleTo(target){
    if(busy) return;
    if(reduce){ setMurkwireed(); return; }
    busy = true;
    stateEl.textContent="…"; stateEl.className="state clean";
    var targets = target.map(plain);
    var frame = 0, total = 16;
    clearInterval(timer);
    timer = setInterval(function(){
      frame++;
      var out = targets.map(function(line){
        var s="";
        for(var i=0;i<line.length;i++){
          var ch=line[i];
          if(ch===" "||ch==="\t"){ s+=ch; continue; }
          var settle = (i/Math.max(line.length,1)) < (frame/total);
          s += settle ? ch : CHARS[Math.floor(Math.random()*CHARS.length)];
        }
        return s;
      });
      codeEl.textContent = out.join("\n");
      if(frame>=total){
        clearInterval(timer);
        setMurkwireed();
        busy=false;
      }
    }, 45);
  }

  setClean();
  runBtn.addEventListener("click", function(){ scrambleTo(CHAFF); });
  resetBtn.addEventListener("click", function(){ clearInterval(timer); busy=false; setClean(); });

  // ---- benchmark meter: animate when scrolled into view ----
  var meter = document.getElementById("meter");
  if(meter){
    if("IntersectionObserver" in window && !reduce){
      var io = new IntersectionObserver(function(ents){
        ents.forEach(function(e){ if(e.isIntersecting){ meter.classList.add("live"); io.disconnect(); } });
      },{threshold:.4});
      io.observe(meter);
    } else { meter.classList.add("live"); }
  }

  // ---- signup preview ----
  var signup = document.getElementById("signupPreview");
  var ok = document.getElementById("formOk");
  document.getElementById("previewSignup").addEventListener("click", function(){
    signup.hidden = true;
    ok.classList.add("show");
    ok.focus();
  });

  // ---- smooth anchor scroll ----
  document.querySelectorAll('a[href^="#"]').forEach(function(a){
    a.addEventListener("click", function(e){
      var id=a.getAttribute("href"); if(id==="#"||id.length<2) return;
      var t=document.querySelector(id); if(!t) return;
      e.preventDefault(); t.scrollIntoView({behavior:reduce?"auto":"smooth",block:"start"});
    });
  });
})();
