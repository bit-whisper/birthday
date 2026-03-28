import { useState, useEffect, useRef, useCallback } from "react";

/* ── Google Fonts injected at runtime ── */
const injectFonts = () => {
  if (document.getElementById("bday-fonts")) return;
  const l = document.createElement("link");
  l.id = "bday-fonts";
  l.rel = "stylesheet";
  l.href =
    "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,600;1,300;1,600&family=Great+Vibes&family=Tenor+Sans&display=swap";
  document.head.appendChild(l);
};

/* ══════════════════════════════════════
   PARTICLE SYSTEM
══════════════════════════════════════ */
function ParticleCanvas({ type = "stars", active = true }) {
  const ref = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    if (!active) return;
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W = (canvas.width = window.innerWidth);
    let H = (canvas.height = window.innerHeight);

    const onResize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    let particles = [];

    if (type === "stars") {
      for (let i = 0; i < 220; i++)
        particles.push({
          x: Math.random() * W, y: Math.random() * H,
          r: Math.random() * 1.8 + 0.2, a: Math.random(),
          da: (Math.random() - 0.5) * 0.02,
        });
      const draw = () => {
        ctx.clearRect(0, 0, W, H);
        particles.forEach((p) => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,240,200,${Math.max(0.05, Math.min(1, p.a))})`;
          ctx.fill();
          p.a += p.da;
          if (p.a > 1 || p.a < 0) p.da *= -1;
        });
        animRef.current = requestAnimationFrame(draw);
      };
      draw();
    }

    if (type === "confetti") {
      const colors = ["#ff4e8b","#f5c842","#c8a8e9","#a8e6cf","#fff","#ff85b3","#7ecfff","#ffb347"];
      for (let i = 0; i < 200; i++)
        particles.push({
          x: Math.random() * W, y: Math.random() * H - H,
          w: Math.random() * 14 + 5, h: Math.random() * 8 + 3,
          r: Math.random() * Math.PI * 2, vr: (Math.random() - 0.5) * 0.15,
          vx: (Math.random() - 0.5) * 4, vy: Math.random() * 4 + 2,
          c: colors[Math.floor(Math.random() * colors.length)], a: 1,
          shape: Math.random() > 0.5 ? "rect" : "circle",
        });
      const draw = () => {
        ctx.clearRect(0, 0, W, H);
        particles.forEach((p) => {
          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r);
          ctx.globalAlpha = p.a; ctx.fillStyle = p.c;
          if (p.shape === "circle") { ctx.beginPath(); ctx.arc(0,0,p.w/2,0,Math.PI*2); ctx.fill(); }
          else ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx.restore();
          p.x += p.vx; p.y += p.vy; p.r += p.vr;
          if (p.y > H + 20) { p.y = -20; p.x = Math.random() * W; p.a = 1; }
        });
        animRef.current = requestAnimationFrame(draw);
      };
      draw();
    }

    if (type === "petals") {
      const petalColors = ["#ff85b3","#ffb3cc","#ff4e8b","#ffd6e7","#ff6fa0"];
      for (let i = 0; i < 60; i++)
        particles.push({
          x: Math.random() * W, y: Math.random() * H - H,
          size: Math.random() * 18 + 8, r: Math.random() * Math.PI * 2,
          vr: (Math.random() - 0.5) * 0.04, vx: (Math.random() - 0.5) * 1.5,
          vy: Math.random() * 1.5 + 0.5, c: petalColors[Math.floor(Math.random() * petalColors.length)],
          a: Math.random() * 0.7 + 0.3, swing: Math.random() * 0.02, phase: Math.random() * Math.PI * 2,
        });
      let t = 0;
      const draw = () => {
        ctx.clearRect(0, 0, W, H);
        t += 0.01;
        particles.forEach((p) => {
          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r);
          ctx.globalAlpha = p.a; ctx.fillStyle = p.c;
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size / 2, p.size, 0, 0, Math.PI * 2);
          ctx.fill(); ctx.restore();
          p.x += p.vx + Math.sin(t + p.phase) * p.swing * 10;
          p.y += p.vy; p.r += p.vr;
          if (p.y > H + 30) { p.y = -30; p.x = Math.random() * W; }
        });
        animRef.current = requestAnimationFrame(draw);
      };
      draw();
    }

    if (type === "shooting") {
      for (let i = 0; i < 180; i++)
        particles.push({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.5, a: Math.random(), da: (Math.random()-0.5)*0.02 });
      let shoots = [];
      const addShoot = () => { shoots.push({ x: Math.random()*W*0.6, y: Math.random()*H*0.4, vx:5+Math.random()*4, vy:2+Math.random()*3, a:1, len:140 }); };
      const si = setInterval(addShoot, 1200);
      const draw = () => {
        ctx.clearRect(0, 0, W, H);
        particles.forEach((p) => {
          ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
          ctx.fillStyle=`rgba(255,240,200,${Math.max(0,p.a)})`; ctx.fill();
          p.a+=p.da; if(p.a>1||p.a<0)p.da*=-1;
        });
        shoots.forEach((s,i) => {
          const g=ctx.createLinearGradient(s.x,s.y,s.x-s.len*(s.vx/8),s.y-s.len*(s.vy/8));
          g.addColorStop(0,`rgba(255,240,180,${s.a})`); g.addColorStop(1,"rgba(255,240,180,0)");
          ctx.beginPath(); ctx.moveTo(s.x,s.y); ctx.lineTo(s.x-s.len*(s.vx/8),s.y-s.len*(s.vy/8));
          ctx.strokeStyle=g; ctx.lineWidth=2.5; ctx.stroke();
          s.x+=s.vx; s.y+=s.vy; s.a-=0.012;
          if(s.a<=0||s.x>W||s.y>H)shoots.splice(i,1);
        });
        animRef.current = requestAnimationFrame(draw);
      };
      draw();
      return () => { clearInterval(si); cancelAnimationFrame(animRef.current); window.removeEventListener("resize",onResize); };
    }

    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener("resize", onResize); };
  }, [type, active]);

  return <canvas ref={ref} style={{ position:"fixed",inset:0,pointerEvents:"none",zIndex:0 }} />;
}

/* ══════════════════════════════════════
   SPARKLE CURSOR
══════════════════════════════════════ */
function useCursorSparkle() {
  useEffect(() => {
    const handler = (e) => {
      const colors = ["#ff4e8b","#f5c842","#c8a8e9","#a8e6cf","#fff","#ffb3cc"];
      for (let i = 0; i < 8; i++) {
        const el = document.createElement("div");
        const angle = Math.random() * Math.PI * 2, d = Math.random() * 50 + 10;
        Object.assign(el.style, {
          position:"fixed", pointerEvents:"none", zIndex:99999,
          width:"8px", height:"8px", borderRadius:"50%",
          background: colors[Math.floor(Math.random()*colors.length)],
          left: e.clientX + Math.cos(angle)*d + "px",
          top:  e.clientY + Math.sin(angle)*d + "px",
          animation:"sparkleOut 0.9s forwards",
          boxShadow:`0 0 6px ${colors[Math.floor(Math.random()*colors.length)]}`,
        });
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 900);
      }
    };
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, []);
}

/* ══════════════════════════════════════
   ANIMATED TEXT (letter by letter)
══════════════════════════════════════ */
function AnimText({ text, style, charStyle, delay = 0 }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), delay); return () => clearTimeout(t); }, [delay]);
  return (
    <span style={style}>
      {text.split("").map((ch, i) => (
        <span key={i} style={{
          display:"inline-block",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0) scale(1)" : "translateY(30px) scale(0.8)",
          transition: `opacity 0.5s ${i*0.05}s, transform 0.5s ${i*0.05}s`,
          ...charStyle,
        }}>{ch === " " ? "\u00A0" : ch}</span>
      ))}
    </span>
  );
}

/* ══════════════════════════════════════
   SVG CAKE (detailed)
══════════════════════════════════════ */
function BirthdayCake({ blownOut, onBlow }) {
  const [flickerOffset, setFlickerOffset] = useState(0);
  useEffect(() => {
    if (blownOut) return;
    const id = setInterval(() => setFlickerOffset(Math.random() * 4 - 2), 80);
    return () => clearInterval(id);
  }, [blownOut]);
  return (
    <div style={{ cursor:"pointer", filter:"drop-shadow(0 20px 60px rgba(255,78,139,0.5))" }} onClick={onBlow}>
      <svg width="280" height="320" viewBox="0 0 280 320">
        {/* Shadow */}
        <ellipse cx="140" cy="305" rx="120" ry="14" fill="rgba(0,0,0,0.35)" />
        {/* Bottom tier */}
        <rect x="15" y="195" width="250" height="100" rx="16" fill="#ff6fa0"/>
        <ellipse cx="140" cy="195" rx="125" ry="20" fill="#ff85b3"/>
        <ellipse cx="140" cy="295" rx="125" ry="14" fill="#cc3d70"/>
        {/* frosting drips bottom */}
        {[30,60,90,120,150,180,210,240,260].map((x,i)=>(
          <ellipse key={i} cx={x} cy={200} rx={10} ry={15} fill="rgba(255,255,255,0.9)"/>
        ))}
        {/* decorations bottom */}
        {[50,95,140,185,230].map((x,i)=>(
          <g key={i}><circle cx={x} cy={245} r={6} fill="#f5c842"/><circle cx={x} cy={245} r={3} fill="#fff"/></g>
        ))}
        <text x="60" y="275" fontSize="28" fill="rgba(255,255,255,0.5)">♥ Chiku ♥</text>
        {/* Middle tier */}
        <rect x="45" y="125" width="190" height="75" rx="13" fill="#c8a8e9"/>
        <ellipse cx="140" cy="125" rx="95" ry="16" fill="#d8b8f9"/>
        <ellipse cx="140" cy="200" rx="95" ry="12" fill="#a880d0"/>
        {[60,95,130,165,200,225].map((x,i)=>(
          <ellipse key={i} cx={x} cy={130} rx={9} ry={13} fill="rgba(255,255,255,0.88)"/>
        ))}
        {[75,110,145,185,210].map((x,i)=>(
          <circle key={i} cx={x} cy={163} r={5} fill="#f5c842" opacity={0.8}/>
        ))}
        {/* Top tier */}
        <rect x="80" y="70" width="120" height="60" rx="12" fill="#a8e6cf"/>
        <ellipse cx="140" cy="70" rx="60" ry="12" fill="#b8f6df"/>
        <ellipse cx="140" cy="130" rx="60" ry="10" fill="#78c8a8"/>
        {[90,115,140,165,190].map((x,i)=>(
          <ellipse key={i} cx={x} cy={74} rx={7} ry={11} fill="rgba(255,255,255,0.88)"/>
        ))}
        {/* Candles */}
        {[105,140,175].map((x,i) => (
          <g key={i} style={{transformOrigin:`${x}px 68px`}}>
            <rect x={x-5} y={30+(i===1?-5:0)} width={10} height={42-(i===1?-5:0)} rx={4}
              fill={["#ff6fa0","#c8a8e9","#a8e6cf"][i]}/>
            <ellipse cx={x} cy={30+(i===1?-5:0)} rx={5} ry={3} fill="rgba(255,255,255,0.7)"/>
            {!blownOut && <>
              {/* outer flame */}
              <ellipse cx={x+flickerOffset*0.3} cy={22+(i===1?-5:0)+flickerOffset*0.4}
                rx={6+Math.abs(flickerOffset*0.3)} ry={10+flickerOffset*0.2}
                fill="#f5c842" opacity={0.9}
                style={{filter:"blur(0.5px)"}}/>
              {/* inner flame */}
              <ellipse cx={x+flickerOffset*0.2} cy={24+(i===1?-5:0)+flickerOffset*0.3}
                rx={3} ry={6} fill="#fff" opacity={0.85}/>
              {/* glow */}
              <ellipse cx={x} cy={20+(i===1?-5:0)} rx={14} ry={14}
                fill="#f5c842" opacity={0.15} style={{filter:"blur(4px)"}}/>
            </>}
            {blownOut && <text x={x-5} y={18+(i===1?-5:0)} fontSize={10}>💨</text>}
          </g>
        ))}
        {/* sparkle stars */}
        {["✦","✧","✦","✧"].map((s,i)=>(
          <text key={i} x={[20,240,30,245][i]} y={[110,120,220,210][i]}
            fontSize={[14,12,16,10][i]} fill={["#f5c842","#ffb3cc","#c8a8e9","#a8e6cf"][i]} opacity={0.7}>{s}</text>
        ))}
      </svg>
    </div>
  );
}

/* ══════════════════════════════════════
   HEART PULSE
══════════════════════════════════════ */
function HeartPulse() {
  return (
    <div style={{ fontSize:"5rem", animation:"heartbeat 1.2s ease-in-out infinite", display:"inline-block" }}>
      💗
    </div>
  );
}

/* ══════════════════════════════════════
   FLOATING EMOJI FIELD
══════════════════════════════════════ */
function FloatingEmojis({ emojis }) {
  const items = Array.from({ length: 22 }, (_, i) => ({
    e: emojis[i % emojis.length],
    left: Math.random() * 100,
    dur: 7 + Math.random() * 8,
    delay: Math.random() * 6,
    size: 1.2 + Math.random() * 1.5,
  }));
  return (
    <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:1, overflow:"hidden" }}>
      {items.map((it, i) => (
        <div key={i} style={{
          position:"absolute", bottom:"-60px", left:`${it.left}%`,
          fontSize:`${it.size}rem`,
          animation:`floatUp ${it.dur}s ${it.delay}s ease-in infinite`,
          opacity:0,
        }}>{it.e}</div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════
   PROGRESS DOTS
══════════════════════════════════════ */
function Dots({ total, current }) {
  return (
    <div style={{
      position:"fixed", bottom:"1.5rem", left:"50%", transform:"translateX(-50%)",
      display:"flex", gap:"0.5rem", zIndex:1000,
    }}>
      {Array.from({length:total},(_,i)=>(
        <div key={i} style={{
          width: i+1===current ? "24px" : "8px",
          height:"8px", borderRadius:"4px",
          background: i+1===current ? "#ff4e8b" : "rgba(255,255,255,0.2)",
          boxShadow: i+1===current ? "0 0 12px #ff4e8b" : "none",
          transition:"all 0.4s cubic-bezier(.34,1.56,.64,1)",
        }}/>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════
   GLOBAL STYLES
══════════════════════════════════════ */
const GlobalStyles = () => (
  <style>{`
    @keyframes sparkleOut {
      from { transform:scale(1); opacity:1; }
      to   { transform:scale(0) translateY(-25px); opacity:0; }
    }
    @keyframes heartbeat {
      0%,100%{transform:scale(1);}
      14%{transform:scale(1.15);}
      28%{transform:scale(1);}
      42%{transform:scale(1.08);}
      70%{transform:scale(1);}
    }
    @keyframes floatUp {
      0%  {transform:translateY(0) rotate(-10deg); opacity:0.9;}
      100%{transform:translateY(-110vh) rotate(10deg); opacity:0;}
    }
    @keyframes revealUp {
      from{opacity:0;transform:translateY(50px);}
      to{opacity:1;transform:translateY(0);}
    }
    @keyframes revealScale {
      from{opacity:0;transform:scale(0.7);}
      to{opacity:1;transform:scale(1);}
    }
    @keyframes glowPulse {
      0%,100%{text-shadow:0 0 30px #ff4e8b,0 0 60px #ff4e8b44;}
      50%{text-shadow:0 0 60px #ff4e8b,0 0 120px #ff4e8b88,0 0 180px #ff4e8b33;}
    }
    @keyframes goldGlow {
      0%,100%{text-shadow:0 0 20px #f5c842,0 0 40px #f5c84244;}
      50%{text-shadow:0 0 40px #f5c842,0 0 80px #f5c84266;}
    }
    @keyframes floatBob {
      0%,100%{transform:translateY(0);}
      50%{transform:translateY(-16px);}
    }
    @keyframes rotateSlow {
      from{transform:rotate(0deg);}
      to{transform:rotate(360deg);}
    }
    @keyframes fadeIn {
      from{opacity:0;} to{opacity:1;}
    }
    @keyframes slideInLeft {
      from{opacity:0;transform:translateX(-80px);}
      to{opacity:1;transform:translateX(0);}
    }
    @keyframes slideInRight {
      from{opacity:0;transform:translateX(80px);}
      to{opacity:1;transform:translateX(0);}
    }
    @keyframes popIn {
      0%{opacity:0;transform:scale(0) rotate(-20deg);}
      80%{transform:scale(1.1) rotate(3deg);}
      100%{opacity:1;transform:scale(1) rotate(0deg);}
    }
    @keyframes shimmer {
      0%{background-position:-200% center;}
      100%{background-position:200% center;}
    }
    * { box-sizing:border-box; margin:0; padding:0; }
    body { overflow:hidden; }
    ::-webkit-scrollbar { display:none; }
  `}</style>
);

/* ══════════════════════════════════════
   ══ PAGE COMPONENTS ══
══════════════════════════════════════ */

/* PAGE 1 — LOCKED ENVELOPE */
function PageLock({ onNext }) {
  const [open, setOpen] = useState(false);
  const handleOpen = () => { setOpen(true); setTimeout(onNext, 1400); };
  return (
    <div style={{
      minHeight:"100vh", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      background:"radial-gradient(ellipse at 40% 60%, #1a0030 0%, #0a0018 55%, #06000e 100%)",
      fontFamily:"'Tenor Sans',sans-serif",
    }}>
      <ParticleCanvas type="stars" active />
      <FloatingEmojis emojis={["✨","💌","🌸","⭐"]} />

      {/* Envelope SVG */}
      <div onClick={!open ? handleOpen : undefined} style={{
        cursor: open ? "default" : "pointer",
        animation:"floatBob 3s ease-in-out infinite",
        filter:"drop-shadow(0 20px 60px rgba(255,78,139,0.6))",
        transition:"transform 0.4s",
        transform: open ? "scale(1.1) rotate(5deg)" : "scale(1)",
        zIndex:2, position:"relative",
      }}>
        <svg width="200" height="160" viewBox="0 0 200 160">
          <defs>
            <linearGradient id="envGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff85b3"/>
              <stop offset="100%" stopColor="#c860a0"/>
            </linearGradient>
          </defs>
          <rect x="5" y="30" width="190" height="125" rx="10" fill="url(#envGrad)" />
          <rect x="5" y="30" width="190" height="125" rx="10" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
          {/* flap open animation */}
          <path d={open
            ? "M5 30 L100 60 L195 30 L195 32 L100 62 L5 32 Z"
            : "M5 30 L100 100 L195 30 Z"}
            fill="#e060a0"
            style={{ transition:"all 0.6s ease", transformOrigin:"100px 30px", transform: open ? "rotateX(180deg)" : "rotateX(0)" }}
          />
          <path d="M5 155 L100 95 L195 155 Z" fill="rgba(0,0,0,0.15)"/>
          <text x="100" y="130" textAnchor="middle" fontFamily="'Great Vibes',cursive" fontSize="24" fill="rgba(255,255,255,0.9)">For Chiku</text>
          {!open && <text x="100" y="75" textAnchor="middle" fontSize="28">💌</text>}
          {open && <text x="100" y="75" textAnchor="middle" fontSize="28" style={{animation:"popIn 0.5s 0.3s both"}}>💗</text>}
        </svg>
      </div>

      <div style={{ zIndex:2, textAlign:"center", marginTop:"2rem", animation:"revealUp 1s 0.3s both" }}>
        <div style={{
          fontFamily:"'Great Vibes',cursive", fontSize:"clamp(3rem,8vw,5rem)",
          color:"#fff", animation:"glowPulse 3s ease-in-out infinite",
          marginBottom:"0.5rem",
        }}>A Secret Awaits You</div>
        <div style={{ color:"#ff9ec4", letterSpacing:"0.35em", fontSize:"0.75rem", textTransform:"uppercase", marginBottom:"1.5rem" }}>
          Something made with all my heart
        </div>
        <button onClick={!open ? handleOpen : undefined} style={{
          background:"linear-gradient(135deg,#ff4e8b,#c8399a)",
          color:"#fff", border:"none", borderRadius:"50px",
          padding:"1rem 3rem", fontSize:"0.95rem", letterSpacing:"0.2em",
          cursor:"pointer", fontFamily:"'Tenor Sans',sans-serif",
          boxShadow:"0 0 40px rgba(255,78,139,0.6)",
          transition:"transform 0.2s,box-shadow 0.2s",
          textTransform:"uppercase",
        }}
          onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.07)";e.currentTarget.style.boxShadow="0 0 60px rgba(255,78,139,0.9)";}}
          onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";e.currentTarget.style.boxShadow="0 0 40px rgba(255,78,139,0.6)";}}
        >Open Your Gift 💝</button>
      </div>
    </div>
  );
}

/* PAGE 2 — CINEMATIC REVEAL */
function PageReveal({ onNext }) {
  return (
    <div style={{
      minHeight:"100vh", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      background:"radial-gradient(ellipse at 30% 40%, #200030 0%, #0d0020 60%, #05000f 100%)",
      fontFamily:"'Cormorant Garamond',serif", overflow:"hidden", position:"relative",
    }}>
      <ParticleCanvas type="confetti" active />

      {/* Big radial glow */}
      <div style={{
        position:"absolute", inset:0, zIndex:0,
        background:"radial-gradient(ellipse 60% 50% at 50% 50%, rgba(255,78,139,0.15) 0%, transparent 70%)",
        animation:"glowPulse 2s ease-in-out infinite",
      }}/>

      <div style={{ zIndex:2, textAlign:"center", padding:"0 2rem" }}>
        {/* Date badge */}
        <div style={{
          display:"inline-block", border:"1px solid rgba(245,200,66,0.5)",
          borderRadius:"50px", padding:"0.4rem 1.5rem",
          color:"#f5c842", fontSize:"0.85rem", letterSpacing:"0.3em",
          fontFamily:"'Tenor Sans',sans-serif",
          animation:"revealUp 0.8s 0.1s both",
          background:"rgba(245,200,66,0.08)", marginBottom:"1.5rem",
        }}>29 · MARCH · 2026</div>

        {/* Main title */}
        <div style={{ lineHeight:1, marginBottom:"1rem" }}>
          <AnimText text="Happy" style={{
            display:"block", fontFamily:"'Great Vibes',cursive",
            fontSize:"clamp(4rem,14vw,10rem)", color:"#ffb3cc",
            animation:"goldGlow 2s ease-in-out infinite",
          }} delay={200}/>
          <AnimText text="Birthday" style={{
            display:"block", fontFamily:"'Great Vibes',cursive",
            fontSize:"clamp(4.5rem,16vw,12rem)", color:"#ff4e8b",
            animation:"glowPulse 2s ease-in-out infinite",
          }} delay={400}/>
        </div>

        {/* Name */}
        <div style={{
          fontFamily:"'Great Vibes',cursive",
          fontSize:"clamp(3rem,10vw,7rem)",
          background:"linear-gradient(135deg,#f5c842,#ffb347,#f5c842)",
          backgroundSize:"200% auto",
          WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
          animation:"shimmer 3s linear infinite, revealScale 1s 0.8s both",
          marginBottom:"1.5rem",
        }}>Chiku ✨</div>

        <div style={{
          color:"rgba(255,220,235,0.8)", fontSize:"clamp(1rem,2.5vw,1.2rem)",
          fontStyle:"italic", marginBottom:"2.5rem",
          animation:"revealUp 1s 1s both",
          maxWidth:"500px", margin:"0 auto 2.5rem",
        }}>
          Today the universe paused, just to celebrate you 🌸
        </div>

        <button onClick={onNext} style={{
          background:"transparent", border:"2px solid #f5c842",
          color:"#f5c842", borderRadius:"50px",
          padding:"1rem 2.8rem", fontSize:"0.9rem", letterSpacing:"0.2em",
          cursor:"pointer", fontFamily:"'Tenor Sans',sans-serif",
          textTransform:"uppercase", transition:"all 0.3s",
          animation:"revealUp 1s 1.2s both",
        }}
          onMouseEnter={e=>{e.currentTarget.style.background="#f5c842";e.currentTarget.style.color="#1a0020";}}
          onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="#f5c842";}}
        >Read My Letter →</button>
      </div>
    </div>
  );
}

/* PAGE 3 — LOVE LETTER */
function PageLetter({ onNext }) {
  const lines = [
    { icon:"🌸", text:"From the very first time I saw you, I knew — you were something the universe had been keeping secret just for me." },
    { icon:"💫", text:"Every laugh you share, every quiet moment, every silly thing you do — it all adds up to my favourite story." },
    { icon:"🌙", text:"On your 19th birthday, I want you to know: being loved by you is the greatest thing that has ever happened to me." },
    { icon:"✨", text:"You deserve every star in the sky, every flower in bloom, every beautiful thing this world has to offer — and so much more." },
  ];
  return (
    <div style={{
      minHeight:"100vh", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      background:"radial-gradient(ellipse at 70% 30%, #001428 0%, #000a1a 70%, #020005 100%)",
      fontFamily:"'Cormorant Garamond',serif", padding:"2rem 1.5rem",
    }}>
      <ParticleCanvas type="petals" active />
      <FloatingEmojis emojis={["💕","🌷","💌","🌸","💖"]} />

      <div style={{ zIndex:2, maxWidth:"640px", width:"100%", textAlign:"center" }}>
        <div style={{
          fontFamily:"'Great Vibes',cursive",
          fontSize:"clamp(2.5rem,7vw,4.5rem)",
          color:"#ff85b3", animation:"glowPulse 3s ease-in-out infinite, revealUp 0.8s both",
          marginBottom:"2rem",
        }}>A Letter from My Heart</div>

        <div style={{
          background:"rgba(255,255,255,0.04)",
          border:"1px solid rgba(255,150,180,0.2)",
          borderRadius:"24px", padding:"2.5rem 2rem",
          backdropFilter:"blur(20px)",
          boxShadow:"0 20px 80px rgba(255,78,139,0.15), inset 0 1px 0 rgba(255,255,255,0.1)",
        }}>
          <div style={{ color:"#ffb3cc", fontStyle:"italic", fontSize:"1.1rem", marginBottom:"1.5rem", letterSpacing:"0.05em" }}>
            My dearest Chiku,
          </div>
          {lines.map((l,i)=>(
            <div key={i} style={{
              display:"flex", gap:"1rem", alignItems:"flex-start",
              marginBottom:"1.2rem", textAlign:"left",
              animation:`slideInLeft 0.7s ${0.2+i*0.2}s both`,
            }}>
              <span style={{ fontSize:"1.4rem", flexShrink:0, marginTop:"2px" }}>{l.icon}</span>
              <p style={{ color:"#f0d8e8", fontStyle:"italic", fontSize:"clamp(0.95rem,2vw,1.05rem)", lineHeight:1.9 }}>{l.text}</p>
            </div>
          ))}
          <div style={{
            fontFamily:"'Great Vibes',cursive", fontSize:"2.5rem",
            color:"#ff85b3", marginTop:"1.5rem", textAlign:"right",
            animation:"revealUp 1s 1s both",
          }}>Forever yours 💕</div>
        </div>

        <button onClick={onNext} style={{
          marginTop:"2rem", background:"linear-gradient(135deg,#ff4e8b,#c8399a)",
          color:"#fff", border:"none", borderRadius:"50px",
          padding:"1rem 2.8rem", fontSize:"0.9rem", letterSpacing:"0.2em",
          cursor:"pointer", fontFamily:"'Tenor Sans',sans-serif",
          textTransform:"uppercase", boxShadow:"0 0 30px rgba(255,78,139,0.5)",
          transition:"transform 0.2s,box-shadow 0.2s",
          animation:"revealUp 1s 1.4s both",
        }}
          onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.06)";}}
          onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";}}
        >Our Memories 📸 →</button>
      </div>
    </div>
  );
}

/* PAGE 4 — MEMORY GALLERY */
function PageMemories({ onNext }) {
  const cards = [
    { emoji:"🌸", label:"First Smile", color:["#ffd6e7","#ffe4f0"], rot:-5, delay:0.1 },
    { emoji:"🌙", label:"Late Nights", color:["#d6eeff","#e4f4ff"], rot:3,  delay:0.2 },
    { emoji:"🎵", label:"Our Song",   color:["#e7d6ff","#f0e4ff"], rot:-2, delay:0.3 },
    { emoji:"✨", label:"Magic Moments",color:["#d6ffe7","#e4fff0"], rot:4,  delay:0.4 },
    { emoji:"☕", label:"Cozy Days",  color:["#fff3d6","#fff8e4"], rot:-4, delay:0.5 },
    { emoji:"💫", label:"Always Us",  color:["#ffe7d6","#fff0e4"], rot:2,  delay:0.6 },
  ];
  const [hovered, setHovered] = useState(null);
  return (
    <div style={{
      minHeight:"100vh", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      background:"radial-gradient(ellipse at 50% 50%, #001820 0%, #000c10 70%, #030005 100%)",
      fontFamily:"'Cormorant Garamond',serif", padding:"2rem 1rem",
    }}>
      <ParticleCanvas type="stars" active />
      <div style={{ zIndex:2, textAlign:"center" }}>
        <div style={{
          fontFamily:"'Great Vibes',cursive",
          fontSize:"clamp(2.5rem,7vw,4.5rem)",
          color:"#c8a8e9", marginBottom:"0.5rem",
          animation:"revealUp 0.8s both, goldGlow 3s ease-in-out infinite",
        }}>Our Little World 📸</div>
        <div style={{ color:"rgba(200,168,233,0.6)", letterSpacing:"0.25em", fontSize:"0.75rem", textTransform:"uppercase", marginBottom:"2rem", fontFamily:"'Tenor Sans',sans-serif" }}>
          Moments I'll treasure forever
        </div>

        <div style={{ display:"flex", flexWrap:"wrap", gap:"1.2rem", justifyContent:"center", maxWidth:"700px" }}>
          {cards.map((c,i)=>(
            <div key={i}
              onMouseEnter={()=>setHovered(i)}
              onMouseLeave={()=>setHovered(null)}
              style={{
                background:`linear-gradient(135deg,${c.color[0]},${c.color[1]})`,
                padding:"1rem 1rem 2.5rem",
                boxShadow: hovered===i
                  ? "0 30px 70px rgba(0,0,0,0.8), 0 0 40px rgba(255,78,139,0.4)"
                  : "0 15px 50px rgba(0,0,0,0.6)",
                transform: hovered===i
                  ? "scale(1.1) rotate(0deg) translateY(-8px)"
                  : `rotate(${c.rot}deg)`,
                transition:"all 0.35s cubic-bezier(.34,1.56,.64,1)",
                cursor:"pointer", borderRadius:"4px",
                animation:`popIn 0.6s ${c.delay}s both`,
              }}>
              <div style={{
                width:"130px", height:"130px", fontSize:"3.5rem",
                display:"flex", alignItems:"center", justifyContent:"center",
                background:`linear-gradient(135deg,${c.color[1]},${c.color[0]})`,
                borderRadius:"2px",
              }}>{c.emoji}</div>
              <div style={{
                fontFamily:"'Great Vibes',cursive", fontSize:"1.4rem",
                color:"#555", textAlign:"center", marginTop:"0.8rem",
              }}>{c.label}</div>
            </div>
          ))}
        </div>

        <button onClick={onNext} style={{
          marginTop:"2rem", background:"transparent",
          border:"2px solid rgba(200,168,233,0.6)", color:"#c8a8e9",
          borderRadius:"50px", padding:"1rem 2.8rem", fontSize:"0.9rem",
          letterSpacing:"0.2em", cursor:"pointer", fontFamily:"'Tenor Sans',sans-serif",
          textTransform:"uppercase", transition:"all 0.3s",
          animation:"revealUp 1s 0.8s both",
        }}
          onMouseEnter={e=>{e.currentTarget.style.background="rgba(200,168,233,0.15)";e.currentTarget.style.borderColor="#c8a8e9";}}
          onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.borderColor="rgba(200,168,233,0.6)";}}
        >Your Birthday Cake 🎂 →</button>
      </div>
    </div>
  );
}

/* PAGE 5 — CAKE */
function PageCake({ onNext }) {
  const [blown, setBlown] = useState(false);
  const [showWish, setShowWish] = useState(false);
  const handleBlow = () => {
    if (blown) return;
    setBlown(true);
    setTimeout(() => setShowWish(true), 1200);
  };
  return (
    <div style={{
      minHeight:"100vh", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      background:"radial-gradient(ellipse at 50% 80%, #280020 0%, #0e0010 60%, #060003 100%)",
      fontFamily:"'Cormorant Garamond',serif", padding:"2rem 1rem",
    }}>
      {blown && <ParticleCanvas type="confetti" active />}
      <FloatingEmojis emojis={["🎂","🎉","🎈","✨","🌸"]} />

      <div style={{ zIndex:2, textAlign:"center" }}>
        <div style={{
          fontFamily:"'Great Vibes',cursive",
          fontSize:"clamp(2.5rem,7vw,4.5rem)",
          color:"#ffb3cc", marginBottom:"0.3rem",
          animation:"glowPulse 3s ease-in-out infinite, revealUp 0.8s both",
        }}>{blown ? "Yayyy! 🎉" : "Make a Wish, Chiku! 🎂"}</div>
        <div style={{
          color:"rgba(255,180,200,0.7)", fontStyle:"italic", fontSize:"1rem",
          marginBottom:"1.5rem", fontFamily:"'Cormorant Garamond',serif",
          animation:"revealUp 0.8s 0.2s both",
        }}>
          {blown ? "Your wish just flew to the stars ✨" : "Click the cake to blow out the candles..."}
        </div>

        <div style={{ animation:`floatBob 3s ease-in-out infinite`, marginBottom:"1.5rem" }}>
          <BirthdayCake blownOut={blown} onBlow={handleBlow} />
        </div>

        {showWish && (
          <div style={{
            maxWidth:"420px", margin:"0 auto",
            background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,180,200,0.2)",
            borderRadius:"20px", padding:"1.5rem 2rem",
            backdropFilter:"blur(15px)",
            animation:"revealScale 0.6s both",
          }}>
            <p style={{ color:"#f0d0e8", fontStyle:"italic", fontSize:"1.1rem", lineHeight:1.8 }}>
              "May all your dreams soar as high as you deserve, and may this year be your most magical yet" 💫
            </p>
          </div>
        )}

        {showWish && (
          <button onClick={onNext} style={{
            marginTop:"1.5rem", background:"linear-gradient(135deg,#ff4e8b,#c8399a)",
            color:"#fff", border:"none", borderRadius:"50px",
            padding:"1rem 2.8rem", fontSize:"0.9rem", letterSpacing:"0.2em",
            cursor:"pointer", fontFamily:"'Tenor Sans',sans-serif",
            textTransform:"uppercase", boxShadow:"0 0 30px rgba(255,78,139,0.6)",
            transition:"transform 0.2s",
            animation:"revealUp 0.8s both",
          }}
            onMouseEnter={e=>e.currentTarget.style.transform="scale(1.06)"}
            onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}
          >My Wishes for You 🌟 →</button>
        )}
      </div>
    </div>
  );
}

/* PAGE 6 — WISHES / SHOOTING STARS */
function PageWishes({ onNext }) {
  const wishes = [
    { icon:"🌟", text:"May every morning feel like a fresh miracle just for you" },
    { icon:"💕", text:"May love follow you into every room you walk into" },
    { icon:"🦋", text:"May your wildest dreams feel too small for what you actually achieve" },
    { icon:"🌸", text:"May you always know how irreplaceable and truly beautiful you are" },
    { icon:"✨", text:"And may you always, always feel this deeply, endlessly loved" },
  ];
  return (
    <div style={{
      minHeight:"100vh", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      background:"radial-gradient(ellipse at 50% 20%, #000d28 0%, #000510 70%, #020003 100%)",
      fontFamily:"'Cormorant Garamond',serif", padding:"2rem 1.5rem",
    }}>
      <ParticleCanvas type="shooting" active />

      <div style={{ zIndex:2, textAlign:"center", maxWidth:"600px", width:"100%" }}>
        <div style={{
          fontFamily:"'Great Vibes',cursive",
          fontSize:"clamp(3rem,9vw,6rem)",
          color:"#fff", marginBottom:"0.5rem",
          animation:"goldGlow 3s ease-in-out infinite, revealUp 0.8s both",
        }}>My Wishes for You</div>
        <div style={{
          color:"rgba(200,220,255,0.5)", letterSpacing:"0.25em", fontSize:"0.75rem",
          textTransform:"uppercase", marginBottom:"2rem", fontFamily:"'Tenor Sans',sans-serif",
          animation:"revealUp 0.8s 0.2s both",
        }}>Written in the stars, just for you</div>

        {wishes.map((w,i)=>(
          <div key={i} style={{
            display:"flex", alignItems:"center", gap:"1rem",
            background:"rgba(255,255,255,0.04)", border:"1px solid rgba(200,220,255,0.1)",
            borderRadius:"16px", padding:"1rem 1.5rem", marginBottom:"0.8rem",
            backdropFilter:"blur(10px)",
            animation:`slideInRight 0.7s ${0.3+i*0.15}s both`,
            textAlign:"left",
          }}>
            <span style={{ fontSize:"1.6rem", flexShrink:0 }}>{w.icon}</span>
            <p style={{ color:"#d4e8ff", fontStyle:"italic", fontSize:"clamp(0.95rem,2vw,1.05rem)", lineHeight:1.7 }}>{w.text}</p>
          </div>
        ))}

        <button onClick={onNext} style={{
          marginTop:"2rem",
          background:"linear-gradient(135deg,#f5c842,#ff8c42)",
          color:"#1a0020", border:"none", borderRadius:"50px",
          padding:"1.1rem 3rem", fontSize:"1rem", letterSpacing:"0.15em",
          cursor:"pointer", fontFamily:"'Tenor Sans',sans-serif", fontWeight:"bold",
          textTransform:"uppercase",
          boxShadow:"0 0 40px rgba(245,200,66,0.6)",
          transition:"transform 0.2s,box-shadow 0.2s",
          animation:"revealUp 1s 1.2s both",
        }}
          onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.07)";e.currentTarget.style.boxShadow="0 0 60px rgba(245,200,66,0.9)";}}
          onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";e.currentTarget.style.boxShadow="0 0 40px rgba(245,200,66,0.6)";}}
        >Feel the Love 💖</button>
      </div>
    </div>
  );
}

/* PAGE 7 — GRAND FINALE */
function PageFinale({ onRestart }) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(()=>setStep(1), 400);
    const t2 = setTimeout(()=>setStep(2), 1200);
    const t3 = setTimeout(()=>setStep(3), 2200);
    return ()=>{clearTimeout(t1);clearTimeout(t2);clearTimeout(t3);};
  }, []);

  return (
    <div style={{
      minHeight:"100vh", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      background:"radial-gradient(ellipse at 50% 50%, #1e0030 0%, #0a0018 60%, #04000c 100%)",
      fontFamily:"'Cormorant Garamond',serif", padding:"2rem",
      overflow:"hidden",
    }}>
      <ParticleCanvas type="confetti" active />
      <FloatingEmojis emojis={["💗","🌸","✨","💕","🎉","⭐","🌷","💫"]} />

      {/* Radial glow rings */}
      {[1,2,3].map(n=>(
        <div key={n} style={{
          position:"absolute", borderRadius:"50%",
          border:`1px solid rgba(255,78,139,${0.15/n})`,
          width:`${n*250}px`, height:`${n*250}px`,
          animation:`rotateSlow ${20+n*5}s linear infinite`,
          top:"50%", left:"50%", transform:"translate(-50%,-50%)",
          zIndex:1,
        }}/>
      ))}

      <div style={{ zIndex:2, textAlign:"center" }}>
        {step>=1 && (
          <div style={{
            fontFamily:"'Great Vibes',cursive",
            fontSize:"clamp(5rem,18vw,13rem)",
            color:"#ff4e8b", lineHeight:0.9,
            animation:"glowPulse 1.5s ease-in-out infinite, revealScale 0.8s both",
            filter:"drop-shadow(0 0 40px rgba(255,78,139,0.8))",
          }}>Chiku</div>
        )}
        {step>=2 && (
          <div style={{
            fontFamily:"'Great Vibes',cursive",
            fontSize:"clamp(2rem,6vw,4rem)",
            color:"#fff", marginTop:"0.5rem",
            animation:"revealUp 0.8s both",
          }}>Happy 20th Birthday 🎂</div>
        )}
        {step>=3 && <>
          <div style={{
            fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic",
            color:"rgba(255,220,235,0.8)", fontSize:"clamp(1rem,2.5vw,1.2rem)",
            margin:"0.8rem 0 1.5rem",
            animation:"revealUp 0.8s both",
          }}>
            29 March 2006 · The day you lit up the world 🌍
          </div>

          {/* Heart pulse */}
          <div style={{ margin:"1rem 0", animation:"revealScale 0.6s 0.3s both" }}>
            <HeartPulse />
          </div>

          <div style={{
            fontSize:"2rem", letterSpacing:"0.5rem", margin:"1rem 0",
            animation:"revealUp 0.8s 0.4s both",
          }}>🌸 💕 ✨ 💖 🌙 ⭐ 🌷</div>

          <div style={{
            maxWidth:"440px", margin:"0 auto 2rem",
            background:"rgba(255,255,255,0.05)",
            border:"1px solid rgba(255,150,180,0.2)",
            borderRadius:"20px", padding:"1.5rem 2rem",
            backdropFilter:"blur(20px)",
            animation:"revealUp 0.8s 0.5s both",
          }}>
            <p style={{
              fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic",
              color:"#f0d8e8", fontSize:"1.1rem", lineHeight:1.9,
            }}>
              You are my favourite adventure, my greatest joy, and the best part of every single day. I love you endlessly 💗
            </p>
          </div>

          <button onClick={onRestart} style={{
            background:"transparent", border:"1px solid rgba(255,150,180,0.4)",
            color:"#ff9ec4", borderRadius:"50px",
            padding:"0.7rem 2rem", fontSize:"0.8rem", letterSpacing:"0.2em",
            cursor:"pointer", fontFamily:"'Tenor Sans',sans-serif",
            textTransform:"uppercase", transition:"all 0.3s",
            animation:"revealUp 0.8s 0.8s both",
          }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor="#ff4e8b";e.currentTarget.style.color="#fff";}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,150,180,0.4)";e.currentTarget.style.color="#ff9ec4";}}
          >↩ Replay the Magic</button>
        </>}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   ROOT APP
══════════════════════════════════════ */
const TOTAL = 7;

export default function BirthdayApp() {
  const [page, setPage] = useState(1);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => { injectFonts(); }, []);
  useCursorSparkle();

  const goTo = useCallback((n) => {
    if (transitioning) return;
    setTransitioning(true);
    setTimeout(() => { setPage(n); setTransitioning(false); }, 80);
  }, [transitioning]);

  const pages = [
    <PageLock    onNext={()=>goTo(2)} />,
    <PageReveal  onNext={()=>goTo(3)} />,
    <PageLetter  onNext={()=>goTo(4)} />,
    <PageMemories onNext={()=>goTo(5)} />,
    <PageCake    onNext={()=>goTo(6)} />,
    <PageWishes  onNext={()=>goTo(7)} />,
    <PageFinale  onRestart={()=>goTo(1)} />,
  ];

  return (
    <div style={{
      width:"100vw", height:"100vh", overflow:"hidden", position:"relative",
      cursor:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='12' r='5' fill='%23ff4e8b' opacity='0.8'/%3E%3C/svg%3E") 12 12, auto`,
    }}>
      <GlobalStyles />

      {/* Page render with fade transition */}
      <div style={{
        opacity: transitioning ? 0 : 1,
        transition:"opacity 0.3s ease",
        height:"100%", overflow:"hidden auto",
      }}>
        {pages[page - 1]}
      </div>

      <Dots total={TOTAL} current={page} />
    </div>
  );
}