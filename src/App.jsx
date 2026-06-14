import { useState, useEffect, useRef, useCallback } from "react";

// ============================================================
// CUSTOM CURSOR
// ============================================================
function CustomCursor() {
  const cursorDot = useRef(null);
  const cursorRing = useRef(null);
  const pos = useRef({ x: 0, y: 0 });
  const ringPos = useRef({ x: 0, y: 0 });
  const rafRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  useEffect(() => {
    const move = (e) => { pos.current = { x: e.clientX, y: e.clientY }; };
    const down = () => setIsClicking(true);
    const up = () => setIsClicking(false);

    const addHover = () => {
      document.querySelectorAll("a, button, [data-cursor]").forEach(el => {
        el.addEventListener("mouseenter", () => setIsHovering(true));
        el.addEventListener("mouseleave", () => setIsHovering(false));
      });
    };

    const animate = () => {
      ringPos.current.x += (pos.current.x - ringPos.current.x) * 0.12;
      ringPos.current.y += (pos.current.y - ringPos.current.y) * 0.12;
      if (cursorDot.current) {
        cursorDot.current.style.left = pos.current.x + "px";
        cursorDot.current.style.top = pos.current.y + "px";
      }
      if (cursorRing.current) {
        cursorRing.current.style.left = ringPos.current.x + "px";
        cursorRing.current.style.top = ringPos.current.y + "px";
      }
      rafRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);
    addHover();
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <>
      <div ref={cursorDot} style={{
        position: "fixed", pointerEvents: "none", zIndex: 99999,
        width: isClicking ? "6px" : "8px", height: isClicking ? "6px" : "8px",
        background: "#a78bfa", borderRadius: "50%",
        transform: "translate(-50%, -50%)",
        transition: "width 0.15s, height 0.15s, background 0.2s",
        mixBlendMode: "difference",
      }} />
      <div ref={cursorRing} style={{
        position: "fixed", pointerEvents: "none", zIndex: 99998,
        width: isHovering ? "50px" : isClicking ? "20px" : "36px",
        height: isHovering ? "50px" : isClicking ? "20px" : "36px",
        border: `1.5px solid ${isHovering ? "#60a5fa" : "#a78bfa88"}`,
        borderRadius: "50%",
        transform: "translate(-50%, -50%)",
        transition: "width 0.3s cubic-bezier(.175,.885,.32,1.275), height 0.3s cubic-bezier(.175,.885,.32,1.275), border-color 0.3s",
        background: isHovering ? "rgba(96,165,250,0.06)" : "transparent",
      }} />
    </>
  );
}

// ============================================================
// MOUSE TRAIL
// ============================================================
function MouseTrail() {
  const canvasRef = useRef(null);
  const points = useRef([]);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const onResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    const onMove = (e) => { mouse.current = { x: e.clientX, y: e.clientY }; };

    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMove);

    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      points.current.push({ ...mouse.current, life: 1 });
      if (points.current.length > 20) points.current.shift();
      points.current.forEach((p, i) => {
        p.life -= 0.05;
        if (p.life <= 0) return;
        const size = p.life * 5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(167,139,250,${p.life * 0.25})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { window.removeEventListener("resize", onResize); window.removeEventListener("mousemove", onMove); cancelAnimationFrame(raf); };
  }, []);

  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9990 }} />;
}

// ============================================================
// CINEMATIC LOADER
// ============================================================
function Loader({ onDone }) {
  const [phase, setPhase] = useState(0); // 0=count, 1=reveal, 2=exit
  const [count, setCount] = useState(0);

  useEffect(() => {
    const t1 = setInterval(() => {
      setCount(c => {
        if (c >= 100) { clearInterval(t1); setTimeout(() => setPhase(1), 200); return 100; }
        return c + Math.floor(Math.random() * 8) + 2;
      });
    }, 40);
    return () => clearInterval(t1);
  }, []);

  useEffect(() => {
    if (phase === 1) setTimeout(() => { setPhase(2); setTimeout(onDone, 900); }, 800);
  }, [phase, onDone]);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 99997,
      background: "#050508",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      transition: phase === 2 ? "opacity 0.8s ease, transform 0.8s ease" : "none",
      opacity: phase === 2 ? 0 : 1,
      transform: phase === 2 ? "scale(1.05)" : "scale(1)",
      pointerEvents: phase === 2 ? "none" : "all",
    }}>
      {/* Animated grid */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(124,58,237,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.04) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

      {/* Glowing orb */}
      <div style={{ position: "absolute", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)" }} />

      <div style={{ position: "relative", textAlign: "center" }}>
        {/* Logo letters */}
        <div style={{ display: "flex", gap: "4px", justifyContent: "center", marginBottom: "24px" }}>
          {"HABIBA".split("").map((ch, i) => (
            <span key={i} style={{
              fontFamily: "'Syne', sans-serif", fontSize: "clamp(32px,6vw,64px)", fontWeight: 800,
              color: phase >= 1 ? "#a78bfa" : "#ffffff",
              transition: `color 0.4s ease ${i * 0.06}s`,
              display: "inline-block",
              animation: `letterPop 0.5s ${i * 0.08}s both`,
            }}>{ch}</span>
          ))}
        </div>

        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", color: "rgba(255,255,255,0.35)", letterSpacing: "4px", marginBottom: "40px" }}>
          FULL STACK DEVELOPER
        </div>

        {/* Progress bar */}
        <div style={{ width: "200px", height: "2px", background: "rgba(255,255,255,0.08)", borderRadius: "2px", overflow: "hidden", margin: "0 auto 16px" }}>
          <div style={{ height: "100%", width: `${Math.min(count, 100)}%`, background: "linear-gradient(90deg, #7c3aed, #60a5fa, #34d399)", borderRadius: "2px", transition: "width 0.1s linear", boxShadow: "0 0 10px rgba(124,58,237,0.8)" }} />
        </div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "rgba(255,255,255,0.25)" }}>
          {Math.min(count, 100)}%
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SCROLL PROGRESS BAR
// ============================================================
function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setProgress((window.scrollY / total) * 100);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: "3px", zIndex: 99996, background: "rgba(255,255,255,0.05)" }}>
      <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg, #7c3aed, #60a5fa, #34d399)", transition: "width 0.1s linear", boxShadow: "0 0 8px rgba(124,58,237,0.8)" }} />
    </div>
  );
}

// ============================================================
// TILT CARD
// ============================================================
function TiltCard({ children, style, className }) {
  const ref = useRef(null);
  const onMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 16;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -16;
    ref.current.style.transform = `perspective(800px) rotateX(${y}deg) rotateY(${x}deg) translateZ(10px)`;
  };
  const onLeave = () => { ref.current.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg) translateZ(0px)"; };
  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave}
      style={{ transition: "transform 0.1s ease", ...style }} className={className}>
      {children}
    </div>
  );
}

// ============================================================
// GLITCH TEXT
// ============================================================
function GlitchText({ text, style }) {
  return (
    <span style={{ position: "relative", display: "inline-block", ...style }}>
      <style>{`
        .glitch { animation: glitch-main 4s infinite; }
        .glitch::before, .glitch::after {
          content: attr(data-text);
          position: absolute; top: 0; left: 0;
          clip-path: polygon(0 0, 100% 0, 100% 35%, 0 35%);
        }
        .glitch::before { animation: glitch-top 4s infinite; color: #60a5fa; left: 2px; }
        .glitch::after { clip-path: polygon(0 65%, 100% 65%, 100% 100%, 0 100%); animation: glitch-bot 4s infinite; color: #f472b6; left: -2px; }
        @keyframes glitch-main { 0%,90%,100%{transform:none} 92%{transform:skewX(1deg)} 94%{transform:skewX(-1deg)} 96%{transform:none} }
        @keyframes glitch-top { 0%,90%,100%{opacity:0;transform:none} 92%{opacity:0.8;transform:translate(3px,-2px)} 94%{opacity:0;} }
        @keyframes glitch-bot { 0%,90%,100%{opacity:0;transform:none} 93%{opacity:0.8;transform:translate(-3px,2px)} 95%{opacity:0;} }
      `}</style>
      <span className="glitch" data-text={text}>{text}</span>
    </span>
  );
}

// ============================================================
// DATA
// ============================================================
const NAV_LINKS = ["Home", "About", "Skills", "Projects", "Contact"];

const SKILLS = [
  { name: "React.js", icon: "⚛️", level: 90, color: "#61DAFB" },
  { name: "Node.js", icon: "🟢", level: 85, color: "#68A063" },
  { name: "MongoDB", icon: "🍃", level: 80, color: "#4EA94B" },
  { name: "Express.js", icon: "🚂", level: 85, color: "#aaaaaa" },
  { name: "JavaScript", icon: "⚡", level: 92, color: "#F7DF1E" },
  { name: "Tailwind CSS", icon: "🎨", level: 88, color: "#38BDF8" },
  { name: "HTML5", icon: "🌐", level: 95, color: "#E34F26" },
  { name: "CSS3", icon: "💅", level: 90, color: "#1572B6" },
  { name: "Git & GitHub", icon: "🔀", level: 85, color: "#F05032" },
  { name: "REST APIs", icon: "🔗", level: 82, color: "#FF6C37" },
  { name: "Bootstrap", icon: "🅱️", level: 88, color: "#7952B3" },
  { name: "Vercel", icon: "▲", level: 80, color: "#ffffff" },
];

const PROJECTS = [
  {
    title: "MERN Task Manager",
    desc: "Full-featured task management app with user authentication, CRUD operations, priority levels, and real-time updates.",
    tech: ["React", "Node.js", "Express", "MongoDB", "JWT"],
    github: "https://github.com/habibanadeemhere/ToDo-application-frontend.git",
    live: "https://to-do-application-frontend-phi.vercel.app",
    emoji: "📋", featured: true,
  },
  {
    title: "Expense Tracker",
    desc: "A simple and intuitive expense tracking app to manage your daily expenses.",
    tech: ["React", "Node.js", "MongoDB", "REST API"],
    github: "https://github.com/habibanadeemhere/Expense-Tracker.git",
    live: "https://expense-tracker-1dob.vercel.app/#",
    emoji: "💰", featured: true,
  },
  {
    title: "Weather Application",
    desc: "Real-time weather app using OpenWeather API. Shows current conditions, forecasts, humidity, and wind speed.",
    tech: ["HTML", "CSS", "JavaScript", "API"],
    github: "https://github.com/habibanadeemhere/Weather-Application.git",
    live: "https://habibanadeemhere.github.io/Weather-Application/",
    emoji: "🌤️", featured: false,
  },
  {
    title: "Scentra Website",
    desc: "Beautifully crafted perfume e-commerce website showcasing creative UI design and responsive layouts.",
    tech: ["HTML", "CSS"],
    github: "https://github.com/habibanadeemhere/scentra-website",
    live: "https://github.com/habibanadeemhere/scentra-website",
    emoji: "🌸", featured: false,
  },
  {
    title: "SMIT Connect Portal",
    desc: "A dynamic portal for SMIT Connect, featuring interactive UI, seamless navigation, and responsive design.",
    tech: ["HTML", "CSS", "JavaScript", "React"],
    github: "https://github.com/habibanadeemhere/SMIT-Connect-Portal.git",
    live: "https://smit-connect-portal-five.vercel.app/",
    emoji: "🧠", featured: false,
  },
  {
    title: "Rock Paper Scissors",
    desc: "Classic game with smooth animations, score tracking, and a clean modern UI using vanilla JavaScript.",
    tech: ["HTML", "CSS", "JavaScript"],
    github: "https://github.com/habibanadeemhere/rock-paper-scissor-game.git",
    live: "https://habibanadeemhere.github.io/rock-paper-scissor-game/",
    emoji: "✂️", featured: false,
  },
];

// ============================================================
// MAIN APP
// ============================================================
function App() {
  const [loaded, setLoaded] = useState(false);
  const [activeSection, setActiveSection] = useState("Home");
  const [scrolled, setScrolled] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [cursorVis, setCursorVis] = useState(true);
  const [filter, setFilter] = useState("All");
  const [skillsVisible, setSkillsVisible] = useState(false);
  const skillsRef = useRef(null);

  const roles = ["Full Stack Developer", "MERN Stack Developer", "React Developer", "UI/UX Enthusiast"];
  const roleIdx = useRef(0); const charIdx = useRef(0); const deleting = useRef(false);

  useEffect(() => {
    const c = setInterval(() => setCursorVis(v => !v), 500);
    const t = setInterval(() => {
      const cur = roles[roleIdx.current];
      if (!deleting.current) {
        if (charIdx.current < cur.length) { setTypedText(cur.slice(0, ++charIdx.current)); }
        else setTimeout(() => { deleting.current = true; }, 1600);
      } else {
        if (charIdx.current > 0) { setTypedText(cur.slice(0, --charIdx.current)); }
        else { deleting.current = false; roleIdx.current = (roleIdx.current + 1) % roles.length; }
      }
    }, 75);
    return () => { clearInterval(c); clearInterval(t); };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!skillsRef.current) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setSkillsVisible(true); }, { threshold: 0.1 });
    obs.observe(skillsRef.current);
    return () => obs.disconnect();
  }, [loaded]);

  const scrollTo = (id) => {
    document.getElementById(id.toLowerCase())?.scrollIntoView({ behavior: "smooth" });
    setActiveSection(id);
  };

  const filtered = filter === "All" ? PROJECTS : filter === "Featured" ? PROJECTS.filter(p => p.featured) : PROJECTS.filter(p => !p.featured);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500&family=JetBrains+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { cursor: none !important; }
        a, button { cursor: none !important; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0a0a0f; }
        ::-webkit-scrollbar-thumb { background: linear-gradient(#7c3aed, #5b21b6); border-radius: 2px; }
        body { background: #050508; overflow-x: hidden; }
        @keyframes letterPop { from{opacity:0;transform:translateY(20px) scale(0.8)} to{opacity:1;transform:none} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(40px)} to{opacity:1;transform:none} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes spinSlow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes pulseGlow { 0%,100%{opacity:0.4} 50%{opacity:1} }
        @keyframes scanline { 0%{transform:translateY(-100%)} 100%{transform:translateY(100vh)} }
        @keyframes borderGlow {
          0%,100%{border-color:rgba(124,58,237,0.3)}
          50%{border-color:rgba(124,58,237,0.8)}
        }
        .fade-up { animation: fadeUp 0.8s ease both; }
        .gradient-text {
          background: linear-gradient(135deg, #a78bfa 0%, #60a5fa 50%, #34d399 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .glass {
          background: rgba(255,255,255,0.025);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.07);
        }
        .glass-purple {
          background: rgba(124,58,237,0.05);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(124,58,237,0.2);
        }
        .nav-item { transition: color 0.2s; cursor: none; }
        .nav-item:hover { color: #a78bfa !important; }
        .btn { transition: all 0.3s ease; cursor: none; }
        .btn:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(124,58,237,0.4); }
        .btn-outline:hover { background: rgba(124,58,237,0.15) !important; }
        .skill-card { transition: all 0.3s ease; }
        .skill-card:hover { transform: translateY(-6px) scale(1.02); border-color: rgba(124,58,237,0.4) !important; }
        .proj-card { transition: all 0.4s cubic-bezier(.175,.885,.32,1.1); }
        .proj-card:hover { transform: translateY(-10px); box-shadow: 0 30px 70px rgba(124,58,237,0.2); border-color: rgba(124,58,237,0.5) !important; }
        .social-btn { transition: all 0.25s ease; cursor: none; }
        .social-btn:hover { transform: translateY(-5px); color: #a78bfa !important; }
        .filter-btn { transition: all 0.2s ease; cursor: none; }
        .filter-btn:hover { background: rgba(124,58,237,0.15) !important; }
        .tag {
          background: rgba(124,58,237,0.12); color: #a78bfa;
          border: 1px solid rgba(124,58,237,0.2);
          padding: 3px 10px; border-radius: 20px;
          font-size: 11px; font-family: 'JetBrains Mono', monospace;
        }
        .section-label {
          font-family: 'JetBrains Mono', monospace; font-size: 11px;
          color: #7c3aed; letter-spacing: 3px; text-transform: uppercase;
        }
        input, textarea {
          background: rgba(255,255,255,0.04) !important;
          border: 1px solid rgba(255,255,255,0.08) !important;
          border-radius: 10px !important;
          padding: 14px 16px !important;
          color: #e2e8f0 !important;
          font-size: 14px !important;
          font-family: 'DM Sans', sans-serif !important;
          outline: none !important;
          width: 100%;
          transition: border-color 0.2s !important;
        }
        input:focus, textarea:focus { border-color: rgba(124,58,237,0.5) !important; }
        textarea { resize: vertical; }
        .scanline-effect {
          position: absolute; inset: 0; overflow: hidden; pointer-events: none;
        }
        .scanline-effect::after {
          content: '';
          position: absolute; left: 0; right: 0; height: 2px;
          background: linear-gradient(transparent, rgba(124,58,237,0.08), transparent);
          animation: scanline 6s linear infinite;
        }
      `}</style>

      {!loaded && <Loader onDone={() => setLoaded(true)} />}
      {loaded && (
        <>
          <CustomCursor />
          <MouseTrail />
          <ScrollProgress />

          <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#050508", color: "#e2e8f0", minHeight: "100vh" }}>

            {/* BG mesh */}
            <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
              <div style={{ position: "absolute", top: "-20%", left: "-10%", width: "55%", height: "55%", background: "radial-gradient(ellipse, rgba(124,58,237,0.07) 0%, transparent 70%)" }} />
              <div style={{ position: "absolute", bottom: 0, right: "-10%", width: "45%", height: "45%", background: "radial-gradient(ellipse, rgba(59,130,246,0.05) 0%, transparent 70%)" }} />
              <div style={{ position: "absolute", top: "50%", left: "30%", width: "30%", height: "30%", background: "radial-gradient(ellipse, rgba(52,211,153,0.03) 0%, transparent 70%)" }} />
              {/* Grid */}
              <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(124,58,237,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.025) 1px, transparent 1px)", backgroundSize: "80px 80px" }} />
            </div>

            {/* ─── NAVBAR ─── */}
            <nav style={{
              position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
              height: "68px", padding: "0 6%",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              background: scrolled ? "rgba(5,5,8,0.85)" : "transparent",
              backdropFilter: scrolled ? "blur(24px)" : "none",
              borderBottom: scrolled ? "1px solid rgba(124,58,237,0.12)" : "none",
              transition: "all 0.3s ease",
            }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "22px", display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "linear-gradient(135deg, #7c3aed, #5b21b6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 800, color: "#fff", animation: "borderGlow 3s infinite" }}>H</div>
                <span className="gradient-text">Habiba</span>
                <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "14px", fontWeight: 300 }}>Nadeem</span>
              </div>
              <div style={{ display: "flex", gap: "28px", alignItems: "center" }}>
                {NAV_LINKS.map(l => (
                  <span key={l} className="nav-item" onClick={() => scrollTo(l)}
                    style={{ fontSize: "13px", fontWeight: 500, letterSpacing: "0.3px", color: activeSection === l ? "#a78bfa" : "rgba(255,255,255,0.5)", position: "relative" }}>
                    {l}
                    {activeSection === l && <div style={{ position: "absolute", bottom: "-4px", left: 0, right: 0, height: "2px", background: "linear-gradient(90deg,#7c3aed,#60a5fa)", borderRadius: "1px" }} />}
                  </span>
                ))}
                <a href="https://github.com/habibanadeemhere" target="_blank" rel="noreferrer"
                  style={{ background: "linear-gradient(135deg,#7c3aed,#5b21b6)", color: "#fff", padding: "9px 22px", borderRadius: "8px", fontSize: "13px", fontWeight: 700, textDecoration: "none", letterSpacing: "0.3px", fontFamily: "'Syne',sans-serif" }}
                  className="btn">
                  Hire Me ✦
                </a>
              </div>
            </nav>

            {/* ─── HERO ─── */}
            <section id="home" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "100px 6% 60px", position: "relative", zIndex: 1 }}>
              <div className="scanline-effect" />
              <div style={{ maxWidth: "960px", width: "100%", textAlign: "center" }}>

                {/* Status badge */}
                <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.25)", borderRadius: "30px", padding: "7px 18px", marginBottom: "32px", animation: "fadeIn 0.6s 0.2s both" }}>
                  <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#34d399", display: "block", animation: "pulseGlow 2s infinite" }} />
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "12px", color: "#34d399", fontWeight: 500 }}>Available for opportunities</span>
                </div>

                {/* Headline */}
                <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(44px,7vw,88px)", fontWeight: 800, lineHeight: 1.02, letterSpacing: "-3px", marginBottom: "20px", animation: "fadeUp 0.7s 0.3s both" }}>
                  <GlitchText text="Full Stack" style={{ color: "#fff" }} />
                  <br />
                  <span className="gradient-text">Developer</span>
                </h1>

                {/* Typing */}
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "clamp(14px,2vw,18px)", color: "#60a5fa", marginBottom: "28px", animation: "fadeUp 0.7s 0.4s both", minHeight: "30px" }}>
                  <span style={{ color: "rgba(255,255,255,0.25)" }}>const role = "</span>
                  {typedText}
                  <span style={{ opacity: cursorVis ? 1 : 0, color: "#a78bfa" }}>|</span>
                  <span style={{ color: "rgba(255,255,255,0.25)" }}>";</span>
                </div>

                {/* Bio */}
                <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.45)", maxWidth: "580px", margin: "0 auto 44px", lineHeight: 1.9, fontWeight: 300, animation: "fadeUp 0.7s 0.5s both" }}>
                  Hi, I'm <span style={{ color: "#a78bfa", fontWeight: 500 }}>Habiba Nadeem</span> — a passionate MERN Stack developer from Karachi 🇵🇰 who loves building scalable, beautiful web apps.
                </p>

                {/* CTAs */}
                <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap", marginBottom: "64px", animation: "fadeUp 0.7s 0.6s both" }}>
                  <button className="btn" onClick={() => scrollTo("Projects")}
                    style={{ background: "linear-gradient(135deg,#7c3aed,#5b21b6)", color: "#fff", padding: "15px 36px", borderRadius: "10px", fontSize: "14px", fontWeight: 700, border: "none", letterSpacing: "0.3px", fontFamily: "'Syne',sans-serif" }}>
                    View Projects →
                  </button>
                  <button className="btn btn-outline" onClick={() => scrollTo("Contact")}
                    style={{ background: "transparent", color: "#a78bfa", padding: "15px 36px", borderRadius: "10px", fontSize: "14px", fontWeight: 700, border: "1px solid rgba(124,58,237,0.4)", fontFamily: "'Syne',sans-serif" }}>
                    Let's Connect
                  </button>
                </div>

                {/* Stats */}
                <div style={{ display: "flex", gap: "0", justifyContent: "center", animation: "fadeUp 0.7s 0.7s both" }}>
                  {[["166+", "Repositories", "#a78bfa"], ["55+", "GitHub Followers", "#60a5fa"], ["3.6K+", "Profile Views", "#34d399"], ["2+", "Years Building", "#fb923c"]].map(([n, l, c], i) => (
                    <div key={l} style={{ textAlign: "center", padding: "0 28px", borderRight: i < 3 ? "1px solid rgba(255,255,255,0.07)" : "none" }}>
                      <div style={{ fontFamily: "'Syne',sans-serif", fontSize: "28px", fontWeight: 800, color: c }}>{n}</div>
                      <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", marginTop: "3px", letterSpacing: "0.5px" }}>{l}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating orbs */}
              <div style={{ position: "absolute", top: "20%", right: "8%", width: "80px", height: "80px", borderRadius: "50%", background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)", animation: "float 4s ease-in-out infinite" }} />
              <div style={{ position: "absolute", bottom: "25%", left: "6%", width: "50px", height: "50px", borderRadius: "50%", background: "rgba(96,165,250,0.06)", border: "1px solid rgba(96,165,250,0.15)", animation: "float 5s ease-in-out infinite 1s" }} />
            </section>

            {/* ─── ABOUT ─── */}
            <section id="about" style={{ padding: "110px 6%", position: "relative", zIndex: 1 }}>
              <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
                <div style={{ textAlign: "center", marginBottom: "64px" }}>
                  <div className="section-label" style={{ marginBottom: "12px" }}>Who I Am</div>
                  <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(30px,5vw,50px)", fontWeight: 800, letterSpacing: "-1.5px" }}>
                    About <span className="gradient-text">Me</span>
                  </h2>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: "64px", alignItems: "center" }}>
                  <div>
                    {/* Avatar card */}
                    <TiltCard style={{ marginBottom: "24px" }}>
                      <div className="glass-purple" style={{ borderRadius: "20px", padding: "32px", textAlign: "center", position: "relative", overflow: "hidden" }}>
                        <div style={{ position: "absolute", top: "-30px", right: "-30px", width: "120px", height: "120px", borderRadius: "50%", background: "rgba(124,58,237,0.08)", animation: "spinSlow 12s linear infinite", border: "1px dashed rgba(124,58,237,0.2)" }} />
                        <div style={{ fontSize: "80px", marginBottom: "12px", animation: "float 3s ease-in-out infinite" }}>👩‍💻</div>
                        <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "18px", marginBottom: "4px" }}>Habiba Nadeem</div>
                        <div style={{ fontSize: "12px", color: "#a78bfa", fontFamily: "'JetBrains Mono',monospace" }}>MERN Stack Developer</div>
                        <div style={{ marginTop: "16px", display: "flex", justifyContent: "center", gap: "8px" }}>
                          <span className="tag">Open to Work</span>
                          <span className="tag">Karachi 🇵🇰</span>
                        </div>
                      </div>
                    </TiltCard>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                      {[["📍", "Karachi, Pakistan"], ["🎓", "SMIT Student"], ["💼", "Freelance Ready"], ["🚀", "166+ Projects"]].map(([icon, text]) => (
                        <div key={text} className="glass" style={{ borderRadius: "10px", padding: "12px 14px", display: "flex", alignItems: "center", gap: "8px" }}>
                          <span>{icon}</span>
                          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", fontFamily: "'DM Sans',sans-serif" }}>{text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p style={{ fontSize: "15px", lineHeight: 1.9, color: "rgba(255,255,255,0.55)", fontWeight: 300, marginBottom: "20px" }}>
                      I'm a <span style={{ color: "#a78bfa", fontWeight: 500 }}>passionate Full Stack Developer</span> specializing in the MERN Stack. Currently studying at SMIT, I've built 166+ projects ranging from simple HTML/CSS websites to complex full-stack applications.
                    </p>
                    <p style={{ fontSize: "15px", lineHeight: 1.9, color: "rgba(255,255,255,0.55)", fontWeight: 300, marginBottom: "32px" }}>
                      I love transforming ideas into digital experiences — <span style={{ color: "#60a5fa" }}>clean code, great UX, and strong architecture</span> are what I strive for in every project.
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "36px" }}>
                      {["Building scalable MERN Stack applications", "Crafting responsive, accessible UI/UX", "RESTful API design and integration", "Always exploring new technologies"].map(item => (
                        <div key={item} style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "14px", color: "rgba(255,255,255,0.6)" }}>
                          <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#60a5fa)", flexShrink: 0 }} />
                          {item}
                        </div>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: "12px" }}>
                      <a href="https://www.linkedin.com/in/habiba-nadeem-4b63412b9" target="_blank" rel="noreferrer" className="btn"
                        style={{ background: "linear-gradient(135deg,#7c3aed,#5b21b6)", color: "#fff", padding: "12px 24px", borderRadius: "8px", fontSize: "13px", fontWeight: 700, textDecoration: "none", fontFamily: "'Syne',sans-serif" }}>
                        LinkedIn →
                      </a>
                      <a href="https://github.com/habibanadeemhere" target="_blank" rel="noreferrer" className="btn btn-outline"
                        style={{ background: "transparent", color: "#a78bfa", padding: "12px 24px", borderRadius: "8px", fontSize: "13px", fontWeight: 700, textDecoration: "none", border: "1px solid rgba(124,58,237,0.4)", fontFamily: "'Syne',sans-serif" }}>
                        GitHub →
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ─── SKILLS ─── */}
            <section id="skills" ref={skillsRef} style={{ padding: "110px 6%", position: "relative", zIndex: 1 }}>
              <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
                <div style={{ textAlign: "center", marginBottom: "64px" }}>
                  <div className="section-label" style={{ marginBottom: "12px" }}>What I Know</div>
                  <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(30px,5vw,50px)", fontWeight: 800, letterSpacing: "-1.5px" }}>
                    Tech <span className="gradient-text">Arsenal</span>
                  </h2>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: "14px" }}>
                  {SKILLS.map((s, i) => (
                    <div key={s.name} className="glass skill-card" style={{ borderRadius: "14px", padding: "20px", animationDelay: `${i * 0.05}s`, animation: skillsVisible ? `fadeUp 0.5s ${i * 0.05}s both` : "none" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                        <span style={{ fontSize: "20px" }}>{s.icon}</span>
                        <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 600, fontSize: "13px", flex: 1 }}>{s.name}</span>
                        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "11px", color: s.color, fontWeight: 500 }}>{s.level}%</span>
                      </div>
                      <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "8px", height: "5px", overflow: "hidden" }}>
                        <div style={{ height: "100%", background: `linear-gradient(90deg,${s.color}66,${s.color})`, borderRadius: "8px", width: skillsVisible ? `${s.level}%` : "0%", transition: `width 1.4s cubic-bezier(.4,0,.2,1) ${i * 0.06}s`, boxShadow: `0 0 6px ${s.color}66` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ─── PROJECTS ─── */}
            <section id="projects" style={{ padding: "110px 6%", position: "relative", zIndex: 1 }}>
              <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
                <div style={{ textAlign: "center", marginBottom: "50px" }}>
                  <div className="section-label" style={{ marginBottom: "12px" }}>What I've Built</div>
                  <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(30px,5vw,50px)", fontWeight: 800, letterSpacing: "-1.5px" }}>
                    Featured <span className="gradient-text">Projects</span>
                  </h2>
                </div>
                <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginBottom: "44px" }}>
                  {["All", "Featured", "Other"].map(f => (
                    <button key={f} className="filter-btn" onClick={() => setFilter(f)}
                      style={{ padding: "9px 22px", borderRadius: "20px", border: "1px solid", fontSize: "13px", fontWeight: 600, fontFamily: "'Syne',sans-serif", background: filter === f ? "rgba(124,58,237,0.25)" : "transparent", borderColor: filter === f ? "rgba(124,58,237,0.6)" : "rgba(255,255,255,0.1)", color: filter === f ? "#a78bfa" : "rgba(255,255,255,0.4)" }}>
                      {f}
                    </button>
                  ))}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(340px,1fr))", gap: "18px" }}>
                  {filtered.map((p, i) => (
                    <TiltCard key={p.title}>
                      <div className="glass proj-card" style={{ borderRadius: "18px", padding: "28px", border: p.featured ? "1px solid rgba(124,58,237,0.2)" : "1px solid rgba(255,255,255,0.05)", position: "relative", overflow: "hidden", height: "100%" }}>
                        {p.featured && (
                          <div style={{ position: "absolute", top: "0", right: "0", background: "linear-gradient(135deg,#7c3aed,#5b21b6)", padding: "5px 14px", borderRadius: "0 18px 0 14px", fontSize: "10px", fontWeight: 700, color: "#fff", fontFamily: "'JetBrains Mono',monospace" }}>
                            ★ FEATURED
                          </div>
                        )}
                        <div style={{ fontSize: "38px", marginBottom: "16px" }}>{p.emoji}</div>
                        <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: "17px", fontWeight: 700, marginBottom: "10px", color: "#f1f5f9" }}>{p.title}</h3>
                        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", lineHeight: 1.7, marginBottom: "18px", fontWeight: 300 }}>{p.desc}</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "22px" }}>
                          {p.tech.map(t => <span key={t} className="tag">{t}</span>)}
                        </div>
                        <div style={{ display: "flex", gap: "10px", marginTop: "auto" }}>
                          <a href={p.github} target="_blank" rel="noreferrer" className="btn btn-outline"
                            style={{ flex: 1, textAlign: "center", padding: "9px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.5)", textDecoration: "none", fontFamily: "'Syne',sans-serif", background: "rgba(255,255,255,0.02)" }}>
                            GitHub ↗
                          </a>
                          <a href={p.live} target="_blank" rel="noreferrer" className="btn"
                            style={{ flex: 1, textAlign: "center", padding: "9px", borderRadius: "8px", background: "linear-gradient(135deg,#7c3aed,#5b21b6)", fontSize: "12px", fontWeight: 700, color: "#fff", textDecoration: "none", fontFamily: "'Syne',sans-serif" }}>
                            Live ↗
                          </a>
                        </div>
                      </div>
                    </TiltCard>
                  ))}
                </div>
                <div style={{ textAlign: "center", marginTop: "44px" }}>
                  <a href="https://github.com/habibanadeemhere?tab=repositories" target="_blank" rel="noreferrer" className="btn btn-outline"
                    style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "#a78bfa", fontSize: "14px", fontWeight: 700, textDecoration: "none", border: "1px solid rgba(124,58,237,0.3)", borderRadius: "10px", padding: "14px 28px", fontFamily: "'Syne',sans-serif", background: "transparent" }}>
                    View All 166+ Repos on GitHub →
                  </a>
                </div>
              </div>
            </section>

            {/* ─── CONTACT ─── */}
            <section id="contact" style={{ padding: "110px 6%", position: "relative", zIndex: 1 }}>
              <div style={{ maxWidth: "680px", margin: "0 auto", textAlign: "center" }}>
                <div className="section-label" style={{ marginBottom: "12px" }}>Get In Touch</div>
                <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(30px,5vw,50px)", fontWeight: 800, letterSpacing: "-1.5px", marginBottom: "16px" }}>
                  Let's <span className="gradient-text">Build Together</span>
                </h2>
                <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.4)", lineHeight: 1.9, marginBottom: "48px", fontWeight: 300 }}>
                  Open to new opportunities, collaborations, and exciting projects. Let's create something amazing!
                </p>
                <TiltCard>
                  <div className="glass-purple" style={{ borderRadius: "20px", padding: "40px", marginBottom: "36px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
                      <input placeholder="Your Name" />
                      <input placeholder="Your Email" />
                    </div>
                    <input placeholder="Subject" style={{ marginBottom: "14px" }} />
                    <textarea placeholder="Your message..." rows={5} style={{ marginBottom: "20px" }} />
                    <button className="btn"
                      style={{ width: "100%", background: "linear-gradient(135deg,#7c3aed,#5b21b6)", color: "#fff", padding: "15px", borderRadius: "10px", fontSize: "15px", fontWeight: 700, border: "none", fontFamily: "'Syne',sans-serif", letterSpacing: "0.3px" }}>
                      Send Message ✉️
                    </button>
                  </div>
                </TiltCard>
                <div style={{ display: "flex", gap: "28px", justifyContent: "center" }}>
                  {[{ l: "GitHub", icon: "🐙", h: "https://github.com/habibanadeemhere" }, { l: "LinkedIn", icon: "💼", h: "https://www.linkedin.com/in/habiba-nadeem-4b63412b9" }, { }].map(s => (
                    <a key={s.l} href={s.h} target="_blank" rel="noreferrer" className="social-btn"
                      style={{ display: "flex", alignItems: "center", gap: "8px", color: "rgba(255,255,255,0.4)", fontSize: "14px", fontWeight: 500, textDecoration: "none" }}>
                      <span style={{ fontSize: "18px" }}>{s.icon}</span>{s.l}
                    </a>
                  ))}
                </div>
              </div>
            </section>

            {/* ─── FOOTER ─── */}
            <footer style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "28px 6%", textAlign: "center", position: "relative", zIndex: 1 }}>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.2)", fontFamily: "'DM Sans',sans-serif" }}>
                Designed & Coded with ❤️ by <span style={{ color: "#a78bfa", fontWeight: 600 }}>Habiba Nadeem</span> · {new Date().getFullYear()}
              </p>
            </footer>

          </div>
        </>
      )}
    </>
  );
}

export default App;
